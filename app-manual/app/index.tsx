import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, Alert } from 'react-native';
import { 
  Thermometer, 
  Droplets, 
  Clock, 
  Egg, 
  ShieldCheck, 
  Calendar,
  ToggleLeft, // Icon for 'Off' state
  ToggleRight  // Icon for 'On' state
} from 'lucide-react-native';

import axiosInstance from '../axiosConfig.js'; 

// --- Utility Components ---

/**
 * Renders a card for a single incubator metric.
 */
const StatCard = ({ title, value, unit, icon: Icon, colorClass, hideUnit = false }: any) => (
  <View className="bg-amber-900/40 p-5 rounded-3xl border border-amber-800 mb-4 w-[48%] shadow-lg shadow-amber-950/50">
    <View className={`p-2 rounded-xl self-start mb-3 ${colorClass}`}>
      <Icon size={24} color="white" />
    </View>
    <Text className="text-amber-300 text-xs font-medium uppercase tracking-wider">{title}</Text>
    <View className="flex-row items-baseline mt-1">
      <Text className="text-white text-2xl font-bold">{value}</Text>
      {!hideUnit && <Text className="text-amber-300 text-sm ml-1">{unit}</Text>}
    </View>
  </View>
);

// Helper component for the banner notification
const NotificationBanner = ({ message, Icon, colorClass }: any) => (
  <View className={`mx-4 p-4 rounded-xl mb-6 flex-row items-center ${colorClass}`}>
    <Icon size={24} color="white" className="mr-3" />
    <Text className="text-white text-sm font-semibold flex-1">{message}</Text>
  </View>
);

// --- Main Application Component ---
export default function EggIncubatorApp() {
  const [data,setData]=useState();
  const totalIncubationDays = 21;
  const turningStopDay = 16;
  
  // State for metrics and the turning status
  const [metrics, setMetrics] = useState({
    dayStatus: 15, // Current day
    currentTemp: 37.5,
    currentHumidity: 65,
    stepsUntilTurn: 3300, // Steps remaining until next turn
  });
  const [isTurningActive, setIsTurningActive] = useState(true); // New state for turning ON/OFF

  useEffect(()=>{
  const func=async()=>{
 try{
  const response = await axiosInstance.get("/device/get");
  if (!response.data.success){
    console.log(JSON.stringify(response.data.message));
    setData([]);
     }else{
      setData(response.data.data);
      console.log(JSON.stringify(response.data)); 
  }
 }catch(error){
   console.error("Data retrieval error:", error.message); 
 }
}

  func();
},[]);

  // --- Logic 1: Stop Turning on Day 16 (Lockdown) ---
  useEffect(() => {
    // Check if turning is still active AND we've reached the stop day
    if (isTurningActive && metrics.dayStatus >= turningStopDay) {
      setIsTurningActive(false);
      Alert.alert(
        "🛑 Lockdown Alert!",
        `Day ${turningStopDay} reached. AUTOMATICALLY stopping egg turning. Do not resume turning until hatching is complete.`,
        [{ text: "OK" }]
      );
    }
  }, [metrics.dayStatus, turningStopDay, isTurningActive]);


  // --- Logic 2: Hatching Notification (Day 21 Check) ---
  useEffect(() => {
    if (metrics.dayStatus >= totalIncubationDays) {
      Alert.alert(
        "🎉 Hatching Alert!",
        "The 21-day incubation period is complete. Eggs are ready for hatching!",
        [{ text: "OK" }]
      );
    }
  }, [metrics.dayStatus, totalIncubationDays]);

  // --- Logic 3: Turning Status Message ---
  const getTurningStatusMessage = () => {
    if (!isTurningActive) {
      return `🛑 TURNING STOPPED (Day ${metrics.dayStatus}/${turningStopDay}). Enter Lockdown.`;
    }
    if (metrics.stepsUntilTurn <= 100) {
      return "🚨 ACTION REQUIRED: Turning is IMIMINENT or IN PROGRESS!";
    }
    // Display the remaining steps.
    return `⏳ Next Turn: ${metrics.stepsUntilTurn} steps remaining.`;
  };
 
  // Get the appropriate icon for the turning status card
  const TurningIcon = isTurningActive ? ToggleRight : ToggleLeft;
 
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        
        {/* Header */}
        <View className="px-6 pt-10 pb-6 flex-row justify-between items-center bg-amber-950/20">
          <View>
            <Text className="text-amber-400 text-sm font-medium">System Status: Monitoring</Text>
            <Text className="text-white text-3xl font-bold tracking-tight">
              Egg Incubator
            </Text>
          </View>
          <View className="h-12 w-12 rounded-full bg-yellow-600 items-center justify-center border-2 border-yellow-400">
            <Egg color="white" size={24} />
          </View>
        </View>

        {/* Hatching Ready Notification Banner */}
        {metrics.dayStatus >= turningStopDay ? (
          <NotificationBanner
            message={metrics.dayStatus >= totalIncubationDays ? "HATCHING READY! Final day." : "LOCKDOWN ACTIVE. Prepare for hatching."}
            Icon={ShieldCheck}
            colorClass={metrics.dayStatus >= totalIncubationDays ? "bg-red-600" : "bg-purple-600"}
          />
        ) : (
          <NotificationBanner
            message={`Optimal Incubation: ${totalIncubationDays - metrics.dayStatus} days remaining.`}
            Icon={Calendar}
            colorClass="bg-green-600"
          />
        )}

        {/* Turning Status Message */}
        <View className="mx-4 mb-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
             <Text className="text-amber-200 text-sm font-medium">{getTurningStatusMessage()}</Text>
        </View>

        {/* Main Stats Grid */}
        <View className="px-4 flex-row flex-wrap justify-between">
          
          {/* Day Status Card */}
          <StatCard 
            title="Day Status" 
            value={metrics.dayStatus} 
            unit={`/ ${totalIncubationDays} Days`} 
            icon={Calendar} 
            colorClass="bg-emerald-600"
          />
          
          {/* --- Turning ON/OFF Status Card --- */}
          <StatCard 
            title="Turning System" 
            value={isTurningActive ? "ON" : "OFF"} 
            unit={`(${metrics.stepsUntilTurn} steps)`} 
            icon={TurningIcon} 
            colorClass={isTurningActive ? "bg-indigo-600" : "bg-gray-600"}
            hideUnit={false}
          />
          
          {/* Temperature Card */}
          <StatCard 
            title="Temperature" 
            value={metrics.currentTemp} 
            unit="°C" 
            icon={Thermometer} 
            colorClass="bg-orange-600" 
          />
          
          {/* Humidity Card */}
          <StatCard 
            title="Humidity" 
            value={metrics.currentHumidity} 
            unit="%" 
            icon={Droplets} 
            colorClass="bg-sky-600" 
          />
                  
        </View>
        
        {/* Placeholder for Data Graph/History */}
        <View className="px-4 mt-6">
            <Text className="text-slate-500 text-lg font-bold mb-3">Monitoring History</Text>
            <View className="h-48 bg-slate-800/50 rounded-xl items-center justify-center border border-slate-700">
                <Text className="text-slate-600">Placeholder for Graph: Needs Charting Library</Text>
            </View>
        </View>

        </ScrollView>
      
    </SafeAreaView>
  );
}