#include <Servo.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define PIN_RAIN_LEVEL A3


#define PIN_MAIN_SERVO 2 
#define PIN_RAIN  3
#define PIN_FOLD1_SERVO 4
#define PIN_DHT22 5
#define TYPE_DHT22 DHT22
#define PIN_PROX_SENSOR_ECHO 6
#define PIN_PROX_SENSOR_TRIG 7
#define PIN_RELAY_PUMP 9
#define PIN_BUZZER 10
#define PIN_BAROMETER_SERVO 11

int PIN_SOILMOISTURE_SENSOR = A0;

LiquidCrystal_I2C lcd(0x27, 16, 2);

#define STATE_ROOF_CLOSE 'C'
#define STATE_ROOF_OPEN 'O'

#define STATE_IRRIGATION_ON 1
#define STATE_IRRIGATION_OFF 0

Servo mainServo, fold1Servo, barometerServo;
int rainDigitalVal;
int rainLevelValue;
DHT dht(PIN_DHT22, TYPE_DHT22);
float humidity;
float temperature;

long duration;
int distance;

char currentRoofState;
int currentIrrigationState;

int waterLevel;
int soilMoisture;

unsigned long previousUpdate;
int currentDisplayedValue;

void readDHT22(){
  float rawHumidity = dht.readHumidity();
  float rawTemperature = dht.readTemperature(); // Celsius

  if (isnan(rawHumidity) || isnan(rawTemperature)) {
    //Serial.println("Failed to read from DHT sensor!");
    return;
  }

  humidity = rawHumidity;
  temperature = rawTemperature;

  //Serial.print("Humidity: ");
  //Serial.print(humidity);
  //Serial.print(" %\t");
  //Serial.print("Temperature: ");
  //Serial.print(temperature);
  //Serial.println(" °C");
}

int readHCSR04(){
  digitalWrite(PIN_PROX_SENSOR_TRIG, LOW);
  delayMicroseconds(2);

  digitalWrite(PIN_PROX_SENSOR_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_PROX_SENSOR_TRIG, LOW);

  duration = pulseIn(PIN_PROX_SENSOR_ECHO, HIGH);

  // Calculate distance in cm
  distance = duration * 0.034 / 2;

  //Serial.print("Distance: ");
  //Serial.print(distance);
  //Serial.println(" cm");

  if(distance >= 21){
    waterLevel = 0;
  }else if(distance <=3){
    waterLevel = 100;
  }else{
    float result = 18-(distance-3);
    result = (result/18)*100;
    //Serial.println(result);
    waterLevel = (int) result;
  }

  return waterLevel;
}

void closeRoof(){
  fold1Servo.attach(PIN_FOLD1_SERVO);
  delay(1000);
  fold1Servo.write(90);
  delay(1000);
  mainServo.write(0);
  currentRoofState= STATE_ROOF_CLOSE;

  barometerServo.write(180);
  delay(1000);
  barometerServo.write(0);
}

void openRoof(){
  mainServo.write(180);
  delay(1000);
  fold1Servo.write(0);
  delay(1000);
  fold1Servo.detach();
  currentRoofState= STATE_ROOF_OPEN;
}

void setup() {
  Serial.begin(9600);
  pinMode(PIN_RAIN, INPUT);
  pinMode(PIN_PROX_SENSOR_TRIG, OUTPUT);
  pinMode(PIN_PROX_SENSOR_ECHO, INPUT);
  pinMode(PIN_RELAY_PUMP, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  mainServo.attach(PIN_MAIN_SERVO);
  fold1Servo.attach(PIN_FOLD1_SERVO);
  barometerServo.attach(PIN_BAROMETER_SERVO);

  dht.begin();
  mainServo.write(0);
  fold1Servo.write(90);
  barometerServo.write(0);

  digitalWrite(PIN_RELAY_PUMP, LOW);

  lcd.init();
  lcd.backlight();

  humidity=0;
  temperature=0;

  duration =0;
  distance=0;

  waterLevel=50;

  soilMoisture = 0;

  previousUpdate = 0;
  currentDisplayedValue = 0;

  rainLevelValue = 0;

  currentRoofState = STATE_ROOF_CLOSE;
  currentIrrigationState = STATE_IRRIGATION_ON;
}

void loop() {
  rainDigitalVal = digitalRead(PIN_RAIN);
  rainLevelValue = analogRead(PIN_RAIN_LEVEL);

  //Serial.print("Raining: ");
  //Serial.println(rainDigitalVal);
  //Serial.print("Rain Level: ");
  //Serial.println(rainLevelValue);
  readDHT22();
  waterLevel = readHCSR04();
  //Serial.print("Tank Contents: ");
  //Serial.println(waterLevel);
  soilMoisture = analogRead(PIN_SOILMOISTURE_SENSOR);
  Serial.print("Soil Moisture: ");
  Serial.println(soilMoisture);

  if (rainDigitalVal == LOW && rainLevelValue > 300) {
    //Serial.println("Raining!");
    lcd.setCursor(0, 0);
    lcd.print("Raining!        ");
    if(currentRoofState == STATE_ROOF_CLOSE && waterLevel < 100){
      openRoof();
    }else if(currentRoofState == STATE_ROOF_OPEN && waterLevel >=100){
      closeRoof();
    }
    
  } else {
    //Serial.println("No Rain.");
    if(waterLevel > 5){
      lcd.setCursor(0, 0);
      lcd.print("No Rain         ");
    }
    
    if(currentRoofState == STATE_ROOF_OPEN){
      closeRoof();
    }else if(currentRoofState == STATE_ROOF_CLOSE){

    }
  }

  if(millis() - previousUpdate >= 5000){
    if(currentDisplayedValue == 0){
      lcd.setCursor(0, 1);
      lcd.print("Humidity:       ");
      lcd.setCursor(10, 1);
      lcd.print(humidity);
    }else if(currentDisplayedValue == 1){
      lcd.setCursor(0, 1);
      lcd.print("Temp:           ");
      lcd.setCursor(6, 1);
      lcd.print(temperature);
    }else if(currentDisplayedValue == 2){
      lcd.setCursor(0, 1);
      lcd.print("Tank Lvl:       ");
      lcd.setCursor(10, 1);
      lcd.print(waterLevel);
    }else if(currentDisplayedValue == 1){
      lcd.setCursor(0, 1);
      lcd.print("Is Soil Dry:    ");
      lcd.setCursor(13, 1);
      lcd.print(rainDigitalVal);
    }


    currentDisplayedValue++;
    previousUpdate = millis();

    if(currentDisplayedValue > 3){
      currentDisplayedValue = 0;
    }
  }
  

  if(soilMoisture >= 600 && currentIrrigationState == STATE_IRRIGATION_ON){
    //Serial.println("wet soil, don't need to irrigate");
    digitalWrite(PIN_RELAY_PUMP, HIGH);
    currentIrrigationState = STATE_IRRIGATION_OFF;
  }else if(soilMoisture < 600 && currentIrrigationState == STATE_IRRIGATION_OFF){
    if(waterLevel > 5){
      //Serial.println("dry soil, need to irrigate");
      digitalWrite(PIN_RELAY_PUMP, LOW);
      currentIrrigationState = STATE_IRRIGATION_ON;
    }else{
      lcd.setCursor(0, 0);
      lcd.print("Water Tank empty");
    }
  }else if(currentIrrigationState == STATE_IRRIGATION_ON && waterLevel <= 6){
    lcd.setCursor(0, 0);
    lcd.print("Water Tank empty");
    digitalWrite(PIN_RELAY_PUMP, HIGH);
    currentIrrigationState = STATE_IRRIGATION_OFF;
  }

  if(waterLevel < 7){
    for(int i=0;i<5;i++){
      tone(PIN_BUZZER, 1000);
      delay(600);
      noTone(PIN_BUZZER);
      delay(200);
    }
  }else if(waterLevel < 20){
    for(int i=0;i<3;i++){
      tone(PIN_BUZZER, 1000);
      delay(600);
      noTone(PIN_BUZZER);
      delay(400);
    }
  }
  

  delay(3000);
}