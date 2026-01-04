import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, Redirect } from "expo-router";
import loadingOverlay from "./components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/logo.png";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { token, isLoading: authLoading, login } = useAuth();

  if (authLoading) return null;

  if (token) {
    return <Redirect href="/(tabs)/Home" />;
  }

  const handleLogin = async() => {
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
        if(!password||password.length<1){
            Toast.show({
                type: 'error',
                text1: '❌ Invalid Password!',
                text2: 'Please Input your Password'
            });
            setIsLoading(false);
            return;
        }
        try{
        const data={
            "emailAddress": email,
            "password": password
        }
        const response = await axiosInstance.post("/user/login", data, {withCredentials: true});
            if(!response.data.success){
                Toast.show({
                type: 'error',
                text1: '❌ Error while trying to login!',
                text2: response.data.message
                });
            }else{
                Toast.show({
                type: 'success',
                text1: '✅ Login successfully!',
                text2: ""
                });
                await login(response.data.token);
                router.push("/(tabs)/Home");
                router.replace('/(tabs)/Home');
            }
        }catch(error){
            console.log("Error while logging in! - "+error.message);
            Toast.show({
                type: 'error',
                text1: '❌ Error while logging in!',
                text2: error.message
            });
        }
        setIsLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 w-full min-w-full bg-white">
      {isLoading && loadingOverlay()}
      <KeyboardAvoidingView
        className="flex-1 justify-center px-6"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="mb-10">
            <View className="flex w-full h-auto items-center mb-10">
              <Image source={logo} style={{ width: 150, height: 150 }} />
            </View>
            
            <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
              Smarthatch: An Arduino-Based Egg Incubator and Monitoring System
            </Text>
            
          <Text className="text-center text-gray-500 mt-2">
            Welcome Back, Login to your account
          </Text>
        </View>

        <View className="relative w-full h-auto flex flex-row mb-4">
            <View className="border border-gray-300 border-l-1 mr-[-3] rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                <MaterialIcons name="email" size={30} color="green" />
            </View>
          
          <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full mx-auto text-gray-800"
            />
          </View>
          
        </View>

        <View className="relative w-full h-auto flex flex-row mb-4">
            <View className="border border-gray-300 border-l-1 mr-[-3] rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                <MaterialIcons name="lock" size={30} color="green" />
            </View>
          <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                className="w-full mx-auto text-gray-800"
            />
          </View>
        </View>

        <Link href="/OTPRequestScreen" asChild>
          <TouchableOpacity className="self-end mb-6">
            <Text className="text-blue-600 font-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          onPress={handleLogin}
          className="bg-blue-600 py-4 rounded-lg mb-6"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Login
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-gray-600">Don’t have an account? </Text>
          <Link href="/SignupScreen" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}