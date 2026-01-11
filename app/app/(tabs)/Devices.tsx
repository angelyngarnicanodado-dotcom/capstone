import React, { useState, useEffect } from "react";
import { useIsFocused } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Image
} from "react-native";
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import DeviceCard from "../components/DeviceCard";
import logo from "../../assets/images/logo.png";

const DevicesTab = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [devices, setDevices] = useState([]);
    const [showNewDeviceModal, setShowNewDeviceModal] = useState(false);
    const [newDeviceID, setNewDeviceID] = useState("");

    const isFocused = useIsFocused();

    useEffect(() => {
        const interval = setInterval(() => {
            setIsLoading(true);
            reloadData();
            setIsLoading(false);
        }, 20000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isFocused) {
            setIsLoading(true);
            reloadData();
            setIsLoading(false);
        }
    }, [isFocused]);

    const pressEventHandler = async (device) => {
        router.push({
            pathname: "/device/[deviceID]",
            params: { deviceID: device.deviceID },
        });
        setDevices([]);
    };

    const reloadData = async () => {
        try {
            const response = await axiosInstance.get(
                "/device/get-my-devices",
                { withCredentials: true }
            );
            if (!response.data.success) {
                Toast.show({
                    type: 'error',
                    text1: '❌ Error while retrieving your Devices!',
                    text2: response.data.message
                });
                setDevices([]);
            } else {
                setDevices(response.data.data);
            }
        } catch (error) {
            console.log("Error while retrieving your Devices! - " + error.message);
            Toast.show({
                type: 'error',
                text1: '❌ Error while retrieving your Devices!',
                text2: error.message
            });
            setDevices([]);
        }
    };

    const handleAddDeviceEvent = async () => {
        setShowNewDeviceModal(true);
    };

    const handleOpenCam = () => {
        Toast.show({
            type: 'info',
            text1: '📷 Open cam',
            text2: 'Camera feature coming soon'
        });
    };

    const confirmAddNewDevice = async () => {
        setShowNewDeviceModal(false);
        setIsLoading(true);
        try {
            const data = { deviceID: newDeviceID };
            const response = await axiosInstance.post(
                "/device/register",
                data,
                { withCredentials: true }
            );
            if (!response.data.success) {
                Toast.show({
                    type: 'error',
                    text1: '❌ Device Registration Failed!',
                    text2: response.data.message
                });
                setShowNewDeviceModal(true);
            } else {
                setNewDeviceID("");
                await reloadData();
            }
        } catch (error) {
            console.log("Error while retrieving your User Account! - " + error.message);
            Toast.show({
                type: 'error',
                text1: '❌ Error while retrieving your User Account!',
                text2: error.message
            });
            setNewDeviceID("");
        }
        setIsLoading(false);
    };

    const cancelAddNewDevice = () => {
        setNewDeviceID("");
        setShowNewDeviceModal(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-amber-100">
            {isLoading && loadingOverlay()}

            {/* HEADER */}
            <View className="flex flex-row items-center gap-5 px-5 py-4 bg-teal-500 shadow-sm border-b border-amber-500 pt-10">
                <Image source={logo} style={{ width: 50, height: 50 }} />
                <Text className="text-3xl font-extrabold text-amber-200">
                    Devices
                </Text>
            </View>

            {/* ADD DEVICE BUTTON */}
            <View className="flex w-fit self-end my-3">
                <TouchableOpacity
                    onPress={handleAddDeviceEvent}
                    className="flex flex-row gap-2 bg-teal-500 py-3 px-4 rounded-lg mx-6"
                >
                    <MaterialIcons name="add-circle" size={15} color="white" />
                    <Text className="text-white font-semibold text-sm">
                        Device
                    </Text>
                </TouchableOpacity>
            </View>

            {/* OPEN CAM BUTTON */}
            <View className="flex items-center my-2">
                <TouchableOpacity
                    onPress={handleOpenCam}
                    className="flex flex-row items-center gap-2 bg-teal-500 py-3 px-20 rounded-lg"
                >
                    <AntDesign name="camera" size={30} color="white" />
                    <Text className="text-white font-semibold text-sm">
                        Monitoring Cam
                    </Text>
                </TouchableOpacity>
            </View>

            {/* DEVICE LIST */}
            {devices.length > 0 && (
                <FlatList
                    data={devices}
                    keyExtractor={(item) => item.deviceID}
                    renderItem={({ item }) => (
                        <DeviceCard
                            device={item}
                            pressEventHandler={pressEventHandler}
                        />
                    )}
                    contentContainerStyle={{ paddingBottom: 16 }}
                />
            )}

            {/* ADD DEVICE MODAL */}
            <Modal
                visible={showNewDeviceModal}
                transparent
                animationType="fade"
                onRequestClose={cancelAddNewDevice}
            >
                <View className="flex-1 justify-center items-center bg-black/40">
                    <View className="bg-white rounded-lg p-6 w-80 border border-teal-500">
                        <Text className="text-lg font-bold text-center mb-4">
                            Add New Device
                        </Text>
                        <Text className="text-center mb-6">
                            Input the New Device ID to add it to your account
                        </Text>

                        <View className="flex-row mb-10">
                            <View className="border border-teal-500 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                                <AntDesign name="barcode" size={28} color="green" />
                            </View>
                            <View className="flex-1 border border-teal-500 border-l-0 rounded-lg px-4 py-1">
                                <TextInput
                                    value={newDeviceID}
                                    onChangeText={setNewDeviceID}
                                    placeholder="Device ID"
                                    autoCapitalize="none"
                                    className="text-gray-800"
                                />
                            </View>
                        </View>

                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={cancelAddNewDevice}
                                className="bg-gray-300 py-2 px-4 rounded-lg border border-teal-500"
                            >
                                <Text className="text-black font-semibold">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmAddNewDevice}
                                className="bg-teal-500 py-2 px-4 rounded-lg border border-gray-300"
                            >
                                <Text className="text-white font-semibold">
                                    Submit
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default DevicesTab;