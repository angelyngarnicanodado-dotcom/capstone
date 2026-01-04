import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, Redirect } from "expo-router";
import loadingOverlay from "./components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import logo from "../assets/images/logo.png";

const ProfileTab =()=>{
    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const handleSubmit=async()=>{
        setIsLoading(true);

        if(!confirmNewPassword || confirmNewPassword.length<1){
              Toast.show({
                type: 'error',
                text1: '❌ Invalid Password Confirmation!',
                text2: 'Please Confirm your Password'
              });
              setIsLoading(false);
              return;
        }
        if(newPassword !== confirmNewPassword ){
              Toast.show({
                type: 'error',
                text1: '❌ Invalid Password!',
                text2: 'Password mismatched! please confirm your password again'
              });
              setIsLoading(false);
              return;
        }
        if(!newPassword || newPassword.length<1){
              Toast.show({
                type: 'error',
                text1: '❌ Invalid Password!',
                text2: 'Please input your Password'
              });
              setIsLoading(false);
              return;
        }else if(newPassword.length<8){
              Toast.show({
                type: 'error',
                text1: '❌ Invalid Password!',
                text2: 'Password should be atleast 8 characters long'
              });
              setIsLoading(false);
              return;
        }

        try{
        const data={
            "password": newPassword,
            "confirmPassword": confirmNewPassword
        }
        const response = await axiosInstance.post("/user/change-password", data, {withCredentials: true});
            if(!response.data.success){
                Toast.show({
                type: 'error',
                text1: '❌ Error while changing your password!',
                text2: response.data.message
                });
            }else{
                Toast.show({
                type: 'success',
                text1: '✅ Password Changed successfully!',
                text2: ""
                });
                router.push("/(tabs)/Profile");
            }
        }catch(error){
        console.log("Error while changing your password! - "+error.message);
        Toast.show({
            type: 'error',
            text1: '❌ Error while changing your password!',
            text2: error.message
        });
        }
        setIsLoading(false);
    }

    

    return(
        <SafeAreaView className="flex-1 bg-gray-100">
            {isLoading && loadingOverlay()}
            <ScrollView
                      showsVerticalScrollIndicator={false}
                      className="flex flex-col"
            >
                
                <View className="flex flex-row  items-center gap-5 px-5 py-4 bg-white shadow-sm border-b border-gray-100 pt-10">
                    <Image source={logo} style={{ width: 50, height: 50 }} />
                    <Text className="text-3xl font-extrabold text-green-700">Profile</Text>
                </View>

                <View className="px-7 py-10 mx-5 my-5 bg-white shadow-sm border-b border-gray-100 rounded-lg">
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
                            />
                        </View>
                    </View>
                    

                    <TouchableOpacity
                                onPress={handleSubmit}
                                className="bg-blue-600 py-4 rounded-lg mt-4 mb-6"
                              >
                                <Text className="text-white text-center font-semibold text-lg">
                                  Submit
                                </Text>
                    </TouchableOpacity>

                    <View className="flex flex-col relative self-start items-center mt-10">
                        <Link href="/(tabs)/Profile" asChild>
                            <TouchableOpacity>
                                <Text className="text-blue-600 font-semibold">
                                    Back
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>

            </ScrollView>

            
        </SafeAreaView>
    );
}

export default ProfileTab;
