import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import loadingOverlay from "./components/LoadingOverlay.jsx";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import axiosInstance from "../axiosConfig.js";
import Toast from "react-native-toast-message";

export default function OTPRequestScreen() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async()=>{
        setIsLoading(true);
        if(!email||email.length<1){
            Toast.show({
                type: 'error',
                text1: '❌ Invalid Email Address!',
                text2: 'Please Input your Email Address'
            });
            setIsLoading(false);
            return;
        }
        try{
        const data={
            "emailAddress": email
        }
        const response = await axiosInstance.post("/user/request-password-reset-otp", data, {withCredentials: true});
            if(!response.data.success){
                Toast.show({
                type: 'error',
                text1: '❌ Error while requesting OTP codes!',
                text2: response.data.message
                });
            }else{
                Toast.show({
                type: 'success',
                text1: '✅ OTP codes were sent successfully!',
                text2: ""
                });
                router.push('/OTPPasswordResetScreen');
            }
        }catch(error){
            console.log("Error while requesting OTP codes! - "+error.message);
            Toast.show({
                type: 'error',
                text1: '❌ Error while requesting OTP codes!',
                text2: error.message
            });
        }
        setIsLoading(false);
    }

    return(
        <SafeAreaView className="flex-1 bg-white items-center justify-start">
            {isLoading && loadingOverlay()}
            <View className="flex flex-col gap-5 my-auto h-fit fititems-center justify-center rounded-lg shadow px-10 py-10 mx-10">
                <Text className="text-2xl text-center color-black font-bold mb-5">Request Password Reset OTP</Text>
                <Text className="text-gray-500 font-normal">Please Input your email address to get your password reset codes.</Text>
                <View className="flex-row mb-4">
                    <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                    <MaterialIcons name={"email"} size={28} color="green" />
                    </View>
                    <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="text-gray-800"
                    />
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-blue-600 w-fit px-5 py-4 rounded-lg"
                >
                    <Text className="text-white text-center font-semibold text-lg">
                        Submit
                    </Text>
                </TouchableOpacity>

                <View className="flex flex-col relative self-end items-end mt-10">
                    <Text className="text-gray-600">Already have OTP codes? </Text>
                    <Link href="/OTPPasswordResetScreen" asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-semibold">
                                Input My Codes
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
            
        </SafeAreaView>
    );
}