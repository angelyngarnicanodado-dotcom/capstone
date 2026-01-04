import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons, AntDesign, Octicons } from '@expo/vector-icons'; 
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, Redirect, useLocalSearchParams } from "expo-router";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import { reload } from "expo-router/build/global-state/routing";

const MetricCard = ({ title, value, unit, iconName, color }) => (
  <View className={`w-1/2 p-2`}>
    <View className={`flex-row items-center p-3 rounded-xl shadow-sm border border-gray-100 ${color}`}>
      <MaterialCommunityIcons name={iconName} size={24} color="#374151" />
      <View className="ml-3">
        <Text className="text-lg font-bold text-gray-800">{value}{unit}</Text>
        <Text className="text-xs text-gray-500">{title}</Text>
      </View>
    </View>
  </View>
);

const DeviceDetails =()=>{
    const {deviceID} = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [device, setDevice] = useState({});
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [newDeviceID, setNewDeviceID] = useState("");
    
    useEffect(()=>{
        const interval = setInterval(() => {
            setIsLoading(true);
            reloadData();
            setIsLoading(false);
        }, 20000);
        
        return () => clearInterval(interval);
    },[]);

    const reloadData =async()=>{
        try {
            const response = await axiosInstance.get(`/device/get-a-device/${deviceID}`,{ withCredentials: true });
            if (!response.data.success) {
                    Toast.show({
                        type: "error",
                        text1: "❌ Failed to load device",
                        text2: response.data.message,
                    });
                    setDevice({});
            } else {
                setDevice(response.data.data[0]);
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "❌ Error loading device",
                text2: error.message,
            });
            setDevice({});
        }
    }

    const handleRenamePress = ()=>{
        setShowRenameModal(true);
    }

    const cancelRenamePress = ()=>{
        setShowRenameModal(false);
    }

    const confirmRenamePress = async () => {
        setShowRenameModal(false);
        setIsLoading(true);
        try{
            
            const data={"deviceID": newDeviceID};
            const response = await axiosInstance.put(`/device/update/${device._id}`, data,  {withCredentials: true});
            if(!response.data.success){
                Toast.show({
                    type: 'error',
                    text1: '❌ Device ID update failed!',
                    text2: response.data.message
                });
                setShowRenameModal(true);
            }else{
                Toast.show({
                    type: 'error',
                    text1: '✅ Device ID updated successfully!',
                    text2: response.data.message
                });
                setNewDeviceID("");
                setDevice(response.data.data[0]);
            }
        }catch(error){
            console.log("Error while updating the Device ID! - "+error.message);
            Toast.show({
                    type: 'error',
                    text1: '❌ Error while updating the Device ID!',
                    text2: error.message
            });
        }
        setIsLoading(false); 
    };

    return(
        <SafeAreaView className="flex-1 bg-gray-100">
            {isLoading && loadingOverlay()}
            {Object.keys(device).length > 0 && (
                <>
                    <View className="flex flex-col p-4 bg-white shadow-sm border-b border-gray-100 pt-10">
                        <View className="w-full flex flex-row items-center">
                            <Text className="flex-1 text-3xl font-extrabold text-green-700">{device.deviceID}</Text>
                            <TouchableOpacity
                                onPress={handleRenamePress}
                                className="flex flex-row gap-2 bg-blue-600 py-3 px-4 rounded-lg mx-6"
                            >
                                <MaterialIcons name={"edit-square"} size={15} color="white" />
                                <Text className="text-white text-center font-semibold text-sm">
                                    edit
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View className="w-full flex flex-row items-center">
                            <Text className="text-base text-gray-500">Current status: </Text><Octicons name="dot-fill" size={30} color={device.isOnline ? ("green"):("red")}/>
                        </View>
                         
                    </View>

                    <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-md border border-gray-100 active:bg-gray-50">

                    <View className="flex-row flex-wrap -m-2">
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
                    <View className="flex flex-col w-auto h-auto mx-3 mt-2 hover:bg-blue-200 border border-gray-200">
                        <Text className="text-lg font-extrabold text-gray-900 mx-3 my-2">Field 1</Text>
                        <View className="flex flex-row">
                            <MetricCard
                            title="Water Level" 
                            value={device.isWaterLevelLow1} 
                            unit="" 
                            iconName="water-boiler" 
                            color="bg-cyan-50" 
                            />
                            <MetricCard 
                            title="Soil Moisture" 
                            value={device.soilMoisture1} 
                            unit=" " 
                            iconName="spa" 
                            color="bg-amber-50" 
                            />
                        </View>
                        </View>
                        
                        <View className="flex flex-col w-auto h-auto mx-3 border border-gray-200 hover:bg-blue-200">
                        <Text className="text-lg font-extrabold text-gray-900 mx-3 my-2">Field 2</Text>
                        <View className="flex flex-row">
                            <MetricCard
                            title="Water Level" 
                            value={device.isWaterLevelLow2} 
                            unit="" 
                            iconName="water-boiler" 
                            color="bg-cyan-50" 
                            />
                            <MetricCard 
                            title="Soil Moisture" 
                            value={device.soilMoisture2} 
                            unit=" " 
                            iconName="spa" 
                            color="bg-amber-50" 
                            />
                        </View>
                        </View>

                        <View className="flex flex-col w-auto h-auto mx-3 border border-gray-200 hover:bg-blue-200">
                        <Text className="text-lg font-extrabold text-gray-900 mx-3 my-2">Field 3</Text>
                        <View className="flex flex-row">
                            <MetricCard
                            title="Water Level" 
                            value={device.isWaterLevelLow3} 
                            unit="" 
                            iconName="water-boiler" 
                            color="bg-cyan-50" 
                            />
                            <MetricCard 
                            title="Soil Moisture" 
                            value={device.soilMoisture3} 
                            unit=" " 
                            iconName="spa" 
                            color="bg-amber-50" 
                            />
                        </View>
                        </View>
                    </View>
                </>
            )}

            <Modal
                visible={showRenameModal}
                transparent
                animationType="fade"
                onRequestClose={cancelRenamePress}
            >
                <View className="flex-1 justify-center items-center bg-black/40">
                    <View className="bg-white rounded-lg p-6 w-80">
                        <Text className="text-lg font-bold text-center mb-4">New Device ID</Text>
                        <Text className="text-center mb-6">Please Input the new Device ID for this Device</Text>
                        <View className="flex-row mb-10">
                                    <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                                        <AntDesign name={"barcode"} size={28} color="green" />
                                    </View>
                            <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                                <TextInput
                                    value={newDeviceID}
                                    onChangeText={setNewDeviceID}
                                    placeholder="Device ID"
                                    keyboardType="default"
                                    autoCapitalize="none"
                                    className="text-gray-800"
                                />
                            </View>
                        </View>
                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={cancelRenamePress}
                                className="bg-gray-300 py-2 px-4 rounded-lg"
                            >
                                <Text className="text-center text-black font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmRenamePress}
                                className="bg-blue-600 py-2 px-4 rounded-lg"
                            >
                                <Text className="text-center text-white font-semibold">Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

export default DeviceDetails;