import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons, AntDesign, Octicons } from '@expo/vector-icons'; 
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";

// Reusable Metric Card matching the DeviceCard Style
const MetricCard = ({ title, value, unit, iconName, color }) => (
  <View className={`w-1/2 p-2`}>
    <View className={`flex-row items-center p-3 rounded-xl shadow-sm border border-gray-100 ${color}`}>
      <MaterialCommunityIcons name={iconName} size={24} color="#475569" />
      <View className="ml-3">
        <Text className="text-lg font-bold text-slate-800">{value}{unit}</Text>
        <Text className="text-xs text-slate-500 font-medium">{title}</Text>
      </View>
    </View>
  </View>
);

const DeviceDetails = () => {
  const { deviceID: initialDeviceID } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [device, setDevice] = useState<any>({});
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newDeviceID, setNewDeviceID] = useState("");

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      reloadData();
    }, 15000); // Auto-refresh every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    await reloadData();
    setIsLoading(false);
  };

  const reloadData = async () => {
    try {
      const response = await axiosInstance.get(`/device/get-a-device/${initialDeviceID}`, { withCredentials: true });
      if (response.data.success) {
        setDevice(response.data.data[0]);
      }
    } catch (error: any) {
      console.error("Error refreshing data:", error.message);
    }
  };

  const handleRenamePress = () => setShowRenameModal(true);
  const cancelRenamePress = () => {
    setShowRenameModal(false);
    setNewDeviceID("");
  };

  const confirmRenamePress = async () => {
    if (!newDeviceID) return;
    setShowRenameModal(false);
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(`/device/update/${device._id}`, { deviceID: newDeviceID }, { withCredentials: true });
      if (response.data.success) {
        Toast.show({ type: 'success', text1: '✅ Updated', text2: 'Device ID changed successfully!' });
        setDevice(response.data.data[0]);
        setNewDeviceID("");
      } else {
        Toast.show({ type: 'error', text1: '❌ Update Failed', text2: response.data.message });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: '❌ Error', text2: error.message });
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {isLoading && loadingOverlay()}

      {Object.keys(device).length > 0 && (
        <ScrollView className="flex-1">
          {/* HEADER SECTION */}
          <View className="bg-white p-6 shadow-sm border-b border-gray-100">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-3xl font-extrabold text-slate-700">{device.deviceID}</Text>
                <View className="flex-row items-center mt-1">
                  <Octicons name="dot-fill" size={16} color={device.isOnline ? "green" : "red"} />
                  <Text className={`ml-2 font-bold ${device.isOnline ? "text-green-600" : "text-red-600"}`}>
                    {device.isOnline ? "ONLINE" : "OFFLINE"}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={handleRenamePress}
                className="bg-blue-600 p-3 rounded-full shadow-lg shadow-blue-300"
              >
                <MaterialIcons name="edit" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <Text className="text-slate-500 font-semibold">
                Status: <Text className="text-slate-800">{device.incubationStarted ? "Incubation Active" : "Standby Mode"}</Text>
              </Text>
            </View>
          </View>

          {/* MAIN SENSOR DATA */}
          <View className="mx-4 mt-6">
            <Text className="text-lg font-bold text-slate-800 mb-2 ml-1">Environment</Text>
            <View className="flex-row flex-wrap -m-1">
              <MetricCard 
                title="Humidity" 
                value={device.humidity} 
                unit="%" 
                iconName="water-percent" 
                color="bg-blue-50" 
              />
              <MetricCard 
                title="Temperature" 
                value={device.temperature} 
                unit="°C" 
                iconName="temperature-celsius" 
                color="bg-red-50" 
              />
            </View>
          </View>

          {/* INCUBATION & DOOR STATUS */}
          <View className="mx-4 mt-6">
            <Text className="text-lg font-bold text-slate-800 mb-2 ml-1">Incubation Stats</Text>
            <View className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
              <View className="flex-row flex-wrap">
                <MetricCard
                  title="Day Count" 
                  value={device.daysElapsed} 
                  unit=" Days" 
                  iconName="calendar-clock" 
                  color="bg-purple-50" 
                />
                <MetricCard 
                  title="Door Sensor" 
                  value={device.doorSensor?.isClosed ? "Closed" : "Open"} 
                  unit="" 
                  iconName={device.doorSensor?.isClosed ? "door-closed" : "door-open"} 
                  color={device.doorSensor?.isClosed ? "bg-green-50" : "bg-orange-50"} 
                />
              </View>
            </View>
          </View>

          {/* CONTROL STATUS */}
          <View className="mx-4 mt-6 mb-10">
            <Text className="text-lg font-bold text-slate-800 mb-2 ml-1">Active Controls</Text>
            <View className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
              <View className="flex-row flex-wrap">
                <MetricCard
                  title="Egg Turning" 
                  value={device.eggTurning?.mode} 
                  unit="" 
                  iconName="rotate-3d-variant" 
                  color="bg-amber-50" 
                />
                <MetricCard 
                  title="Internal LED" 
                  value={device.ledLight?.manualStatus ? "ON" : "OFF"} 
                  unit="" 
                  iconName="lightbulb-on-outline" 
                  color="bg-yellow-50" 
                />
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* RENAME MODAL */}
      <Modal visible={showRenameModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <View className="items-center mb-4">
              <View className="bg-blue-100 p-3 rounded-full mb-2">
                <AntDesign name="barcode" size={28} color="#2563eb" />
              </View>
              <Text className="text-xl font-bold text-slate-800">Rename Device</Text>
              <Text className="text-slate-500 text-center mt-1">Enter a new unique ID for this incubator</Text>
            </View>

            <TextInput
              value={newDeviceID}
              onChangeText={setNewDeviceID}
              placeholder="Ex: INCUBATOR-01"
              className="bg-slate-100 p-4 rounded-xl text-slate-800 font-bold mb-6 border border-slate-200"
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={cancelRenamePress} className="flex-1 bg-slate-200 py-4 rounded-xl">
                <Text className="text-center font-bold text-slate-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmRenamePress} className="flex-1 bg-blue-600 py-4 rounded-xl">
                <Text className="text-center font-bold text-white">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DeviceDetails;