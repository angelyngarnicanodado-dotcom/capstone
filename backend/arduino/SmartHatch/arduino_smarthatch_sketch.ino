#include <Arduino.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <RTClib.h>
#include <Stepper.h>

// ===== LCD & DHT =====
LiquidCrystal_I2C lcd(0x27, 16, 2);
#define DHTPIN 2
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ===== RTC & PINS =====
RTC_DS3231 rtc;
#define REED_PIN 5  
#define LED_PIN 3

// ===== STEPPER MOTOR =====
#define IN1 8
#define IN2 9
#define IN3 10
#define IN4 11
#define STEPS_PER_REV 2048
// Set TILT_STEPS to 2048 for a full 360-degree rotation
const int TILT_STEPS = 2048; 
Stepper stepperMotor(STEPS_PER_REV, IN1, IN3, IN2, IN4);

// ===== LOGIC VARIABLES =====
bool ledState = false;
bool turningEnabled = true; 
bool turnRight = true;
int eggDay = 0;
bool incubationRunning = false;

unsigned long incubationStartMillis = 0;
unsigned long lastStepperMove = 0;
const unsigned long TEN_SECONDS = 10000UL;
const unsigned long SIXTEEN_DAYS = 1382400000UL;
const unsigned long ONE_DAY = 86400000UL;

void setup() {
  Serial.begin(9600);
  dht.begin();
  lcd.init();
  lcd.backlight();
  stepperMotor.setSpeed(10); // 10 RPM is good for torque

  pinMode(REED_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  if (!rtc.begin()) { while (1); }
}

void loop() {
  unsigned long currentMillis = millis();
  DateTime now = rtc.now();

  // 1. SERIAL INPUT (CONTROL FROM MOBILE)
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == '1') { ledState = true; digitalWrite(LED_PIN, HIGH); }
    if (cmd == '0') { ledState = false; digitalWrite(LED_PIN, LOW); }
    if (cmd == 'A') { turningEnabled = true; } 
    if (cmd == 'O') { turningEnabled = false; } 
  }

  // 2. INCUBATION & STEPPER LOGIC
  bool doorClosed = (digitalRead(REED_PIN) == LOW);
  if (doorClosed && !incubationRunning) {
    incubationRunning = true;
    incubationStartMillis = currentMillis;
  } else if (!doorClosed) {
    incubationRunning = false;
  }

  if (incubationRunning) {
    eggDay = (currentMillis - incubationStartMillis) / ONE_DAY + 1;
    if (eggDay > 21) eggDay = 21;

    // --- MODIFIED TURNING LOGIC ---
    // Rotates 360 degrees, then waits 10 seconds, then rotates 360 degrees the other way
    if (turningEnabled && (currentMillis - incubationStartMillis < SIXTEEN_DAYS)) {
      if (currentMillis - lastStepperMove >= TEN_SECONDS) {
        lastStepperMove = currentMillis;
        
        // This will make one full 360-degree turn
        // It will stop completely once the steps are finished
        stepperMotor.step(turnRight ? TILT_STEPS : -TILT_STEPS);
        
        // Switch direction for the next 10-second interval
        turnRight = !turnRight;
      }
    }
  } else {
    eggDay = 0;
  }

  // 3. READ SENSORS
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // 4. OUTPUT UPDATE (Every 2 Seconds)
  static unsigned long lastUpdate = 0;
  if (currentMillis - lastUpdate >= 2000) { 
    lastUpdate = currentMillis;

    Serial.print((int)h); Serial.print(",");
    Serial.print((int)t); Serial.print(",");
    Serial.print(doorClosed ? "1" : "0"); Serial.print(",");
    Serial.print(turningEnabled ? "1" : "0"); Serial.print(",");
    Serial.print(ledState ? "1" : "0"); Serial.print(",");
    Serial.println(eggDay);

    lcd.setCursor(0, 0);
    lcd.print("T:"); lcd.print(t, 1);
    lcd.print("C H:"); lcd.print(h, 0); lcd.print("%  ");
    
    lcd.setCursor(0, 1);
    lcd.print(now.hour() < 10 ? "0" : ""); lcd.print(now.hour());
    lcd.print(":");
    lcd.print(now.minute() < 10 ? "0" : ""); lcd.print(now.minute());
    lcd.print(" Day:"); lcd.print(incubationRunning ? String(eggDay) : "Off");
    lcd.print("   ");
  }
}