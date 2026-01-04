import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import loadingOverlay from "./components/LoadingOverlay.jsx";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import axiosInstance from "../axiosConfig.js";
import Toast from "react-native-toast-message";

export default function OTPRequestScreen() {
    const [email, setEmail] = useState("");
    const [otpCode, setOTPcode] = useState("");
    const [isValidated, setIsValidated] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const handleValidate = async()=>{
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

        if(!otpCode||otpCode.length<1){
            Toast.show({
                type: 'error',
                text1: '❌ Invalid OTP codes!',
                text2: 'Please Input your OTP codes'
            });
            setIsLoading(false);
            return;
        }
        try{
        const data={
            "emailAddress": email,
            "otp": otpCode
        }
        const response = await axiosInstance.post("/user/verify-otp-codes", data, {withCredentials: true});
            if(!response.data.success){
                Toast.show({
                type: 'error',
                text1: '❌ Wrong otp codes!',
                text2: response.data.message
                });
            }else{
                Toast.show({
                type: 'success',
                text1: '✅ OTP codes are correct!',
                text2: ""
                });

                setIsValidated(true);
            }
        }catch(error){
            console.log("Error while validating OTP codes! - "+error.message);
            Toast.show({
                type: 'error',
                text1: '❌ Error while validating OTP codes!',
                text2: error.message
            });
        }
        setIsLoading(false);
    }

    const handleSubmit = async() =>{
        setIsLoading(true);
        if(!newPassword||newPassword.length<1){
            Toast.show({
                type: 'error',
                text1: '❌ Invalid New Password!',
                text2: 'Please Input your new Password'
            });
            setIsLoading(false);
            return;
        }else if(newPassword.length<8){
            Toast.show({
                type: 'error',
                text1: '❌ Invalid New Password!',
                text2: 'New Password should not be less than 8 characters.'
            });
            setIsLoading(false);
            return;
        }

        if(!confirmNewPassword||confirmNewPassword.length<1){
            Toast.show({
                type: 'error',
                text1: '❌ Invalid Confirm Password!',
                text2: 'Please Confirm your new Password'
            });
            setIsLoading(false);
            return;
        }else if(newPassword !== confirmNewPassword){
            Toast.show({
                type: 'error',
                text1: '❌ Password mismatched!',
                text2: 'Please Confirm your new Password again'
            });
            setIsLoading(false);
            return;
        }

        try{
        const data={
            "emailAddress": email,
            "otp": otpCode,
            "password": newPassword,
            "confirmPassword": confirmNewPassword
        }
        const response = await axiosInstance.post("/user/reset-password-with-otp", data, {withCredentials: true});
            if(!response.data.success){
                Toast.show({
                type: 'error',
                text1: '❌ Password reset failed!',
                text2: response.data.message
                });
            }else{
                Toast.show({
                type: 'success',
                text1: '✅ Password Reset Successfully!',
                text2: ""
                });

                setIsValidated(false);
                router.push('/');
            }
        }catch(error){
            console.log("Error while validating OTP codes! - "+error.message);
            Toast.show({
                type: 'error',
                text1: '❌ Error while validating OTP codes!',
                text2: error.message
            });
        }
        setIsLoading(false);
    }

    return(
        <SafeAreaView className="flex-1 bg-white items-center justify-start">
            {isLoading && loadingOverlay()}
            <View className="flex flex-col gap-5 my-auto h-fit fititems-center justify-center rounded-lg shadow px-10 py-10 mx-10">
                <Text className="text-2xl text-center color-black font-bold mb-5">Reset Password</Text>
                <Text className="text-gray-500 font-normal">Please Input your email address and your OTP codes to reset your password.</Text>
                <View className="flex-row">
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
                        editable={!isValidated}
                    />
                    </View>
                </View>
                <View className="flex-row mb-4">
                    <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                    <MaterialIcons name={"password"} size={28} color="green" />
                    </View>
                    <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                    <TextInput
                        value={otpCode}
                        onChangeText={setOTPcode}
                        placeholder="OTP codes"
                        keyboardType="default"
                        autoCapitalize="none"
                        className="text-gray-800"
                        editable={!isValidated}
                    />
                    </View>
                </View>

                {!isValidated ? (
                    <TouchableOpacity
                        onPress={handleValidate}
                        className="bg-blue-600 w-fit px-5 py-4 rounded-lg"
                    >
                        <Text className="text-white text-center font-semibold text-lg">
                            Validate
                        </Text>
                    </TouchableOpacity>    
                ): (
                    <>
                    <View className="flex-row mb-4">
                        <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                        <MaterialIcons name={"lock"} size={28} color="green" />
                        </View>
                        <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="New Password"
                            secureTextEntry={true}
                            keyboardType="password"
                            autoCapitalize="none"
                            className="text-gray-800"
                            editable={isValidated}
                        />
                        </View>
                    </View>
                    <View className="flex-row mb-4">
                        <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                        <MaterialIcons name={"lock-outline"} size={28} color="green" />
                        </View>
                        <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                        <TextInput
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            placeholder="Confirm Password"
                            secureTextEntry={true}
                            keyboardType="password"
                            autoCapitalize="none"
                            className="text-gray-800"
                            editable={isValidated}
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
                    </>
                )}
                
                <View className="flex flex-col relative self-end items-end mt-10">
                    <Link href="/" asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-semibold">
                                Login
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
            
        </SafeAreaView>
    );
}