import React from 'react';
import { SafeAreaView, ScrollView, View, Text, Image, StatusBar } from 'react-native';

// --- Placeholder Data & Types (Updated to be comprehensive) ---
export interface IncubatorDevice {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  daysElapsed: number; // Current incubation day
  hatchingDay: number; // Target hatching day (21)
  maxTurningDays: number; // Day turning stops (16)
  
  // Display Metrics
  timeToTurn: string; // Time until next egg turn
  liveFeedUrl: string;
  status: 'Running' | 'Heating' | 'Warning' | 'Offline';
}

// Helper function to get the required status text based on days elapsed
const getStatusDetails = (device: IncubatorDevice) => {
    const isHatchingReady = device.daysElapsed >= device.hatchingDay;
    const isTurningActive = device.daysElapsed <= device.maxTurningDays;
    
    // 1. Egg Turning Status
    const turningText = isTurningActive
      ? `Egg Turning: On (45° every hour). Next turn in ${device.timeToTurn}.`
      : 'Egg Turning: Stopped (After Day 16 limit).';

    // 2. Day Status
    const dayStatusText = isHatchingReady
      ? `Ready for Hatching (Day ${device.hatchingDay})`
      : ' -'; // Blank if not ready, as requested
      
    // 3. Notification (Will notify the user current update of all statuses)
    let notificationText = `Current Status for ${device.name} (${device.status}): Temp: ${device.temperature}°C, Humidity: ${device.humidity}%. `;
    if (isHatchingReady) {
        notificationText += `HATCHING ALERT! Eggs are ready for hatching (Day ${device.hatchingDay}). Please attend to them.`;
    } else {
        notificationText += isTurningActive ? `Turning is active. ` : `Turning has stopped. `;
        notificationText += `Day Status: Day ${device.daysElapsed}.`;
    }

    return { turningText, dayStatusText, notificationText, isHatchingReady };
};


const DEVICE_DATA: IncubatorDevice[] = [
  {
    id: 'DVC001',
    name: 'Egg Incubator',
    temperature: 37.5,
    humidity: 60,
    daysElapsed: 21, // Hatching ready
    hatchingDay: 21,
    maxTurningDays: 16,
    timeToTurn: '00:45:00',
    liveFeedUrl: 'https://picsum.photos/400/200?random=1',
    status: 'Running',
  },
  // DEVICE_DATA now only uses the first item for the single view.
];
// -----------------------------------------------------------------

// --- 1. Simple Header Component (DashboardHeader.tsx) ---
const DashboardHeader = () => (
  <View className="bg-blue-600 p-4 pt-10 shadow-lg">
    <Text className="text-white text-2xl font-bold text-center">
      Egg Incubator Monitor
    </Text>
  </View>
);
// --------------------------------------------------------------------------------------


// --- 2. Full Device Card Component (Single Column) ---
const IncubatorCard: React.FC<{ device: IncubatorDevice }> = ({ device }) => {
    const mainStatusColor = {
      'Running': 'bg-green-500',
      'Heating': 'bg-yellow-500',
      'Warning': 'bg-red-500',
      'Offline': 'bg-gray-500',
    }[device.status] || 'bg-gray-500';

    const { turningText, dayStatusText, notificationText, isHatchingReady } = getStatusDetails(device);

    return (
      <View className="m-4 p-4 bg-white rounded-xl shadow-2xl border border-gray-100">
        
        {/* --- Card Header (Name & Status) --- */}
        <View className="flex-row justify-between items-center border-b pb-3 mb-3">
          <Text className="text-2xl font-bold text-gray-800">
            {device.name}
          </Text>
          <View className={`px-3 py-1 rounded-full ${mainStatusColor}`}>
            <Text className="text-white text-xs font-semibold">
              {device.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* --- Live Feed Section --- */}
        <View className="w-full h-48 bg-gray-200 rounded-md overflow-hidden mb-4 relative">
          <Image
            source={{ uri: device.liveFeedUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <Text className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">
            LIVE FEED
          </Text>
        </View>

        {/* --- TOP METRICS (Temperature & Humidity) --- */}
        <View className="flex-row flex-wrap justify-between mb-4">
          
          {/* Temperature */}
          <View className="w-1/2 pr-2">
            <Text className="text-sm text-gray-500">Temperature</Text>
            <Text className="text-4xl font-extrabold text-blue-700">
              {device.temperature}°C
            </Text>
          </View>

          {/* Humidity */}
          <View className="w-1/2 pl-2 border-l border-gray-100">
            <Text className="text-sm text-gray-500">Humidity</Text>
            <Text className="text-4xl font-extrabold text-green-700">
              {device.humidity}%
            </Text>
          </View>
        </View>

        {/* --- INCUBATION STATUS SECTION --- */}
        <View className="border-t pt-3">
            {/* Days Elapsed */}
            <View className="mb-3">
                <Text className="text-sm text-gray-500">Days Elapsed / Hatching Target</Text>
                <Text className="text-xl font-bold text-gray-800">
                    Day {device.daysElapsed} / Day {device.hatchingDay}
                </Text>
            </View>

            {/* Egg Turning Status */}
            <View className="mb-3">
                <Text className="text-sm text-gray-500">Egg Turning Status</Text>
                <Text className="text-base font-semibold text-gray-700">
                    {turningText}
                </Text>
            </View>
            
            {/* Day Status (Hatching Ready) */}
            <View className="mb-3">
                <Text className="text-sm text-gray-500">Day Status: </Text>
                <View className={`mt-1 p-2 rounded ${isHatchingReady ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'bg-gray-50'}`}>
                    <Text className={`text-base font-medium ${isHatchingReady ? 'text-yellow-800' : 'text-gray-600'}`}>
                        {dayStatusText}
                    </Text>
                </View>
            </View>
        </View>

        {/* --- NOTIFICATION BLOCK (User Update) --- */}
        <View className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Text className="text-sm font-bold text-red-600 mb-1">
            Notification to Owner (Current Update)
          </Text>
          <Text className="text-xs text-red-500 italic">
            {notificationText}
          </Text>
        </View>
      </View>
    );
};
// ------------------------------------------------------------------


// --- 3. Main Application Component (REVISED FOR SINGLE DEVICE) ---
const App = () => {
    // Get the first (and only) device to display
    const singleDevice = DEVICE_DATA[0];

    if (!singleDevice) {
        return (
            <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
                <Text className="text-lg font-bold text-red-500">
                    No device data available to display.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
            <DashboardHeader />

            {/* ScrollView replaces FlatList for a single, tall component view */}
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <IncubatorCard device={singleDevice} />
            </ScrollView>
        </SafeAreaView>
    );
};

export default App;