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
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");

    useEffect(()=>{
        setIsLoading(true);
        const reloadData = async()=>{
            try{
                const response = await axiosInstance.get("/user/my-info", {withCredentials: true});
                if(!response.data.success){
                    Toast.show({
                        type: 'error',
                        text1: '❌ Error while retrieving your User Account!',
                        text2: response.data.message
                    });
                    setFirstName("");
                    setMiddleName("");
                    setLastName("");
                    setContact("");
                    setAddress("");
                    setEmail("");
                }else{
                    const data = response.data.data[0];
                    data._id="";
                    setFirstName(data.firstName);
                    setMiddleName(data.middleName);
                    setLastName(data.lastName);
                    setContact(data.contactNumber);
                    setAddress(data.address);
                    setEmail(data.emailAddress);
                }
            }catch(error){
                console.log("Error while retrieving your User Account! - "+error.message);
                Toast.show({
                    type: 'error',
                    text1: '❌ Error while retrieving your User Account!',
                    text2: error.message
                });
                setFirstName("");
                setMiddleName("");
                setLastName("");
                setContact("");
                setAddress("");
                setEmail("");
            }    
        }
        
        reloadData();
        setIsLoading(false);
    }, []);

    const handleSubmit=async()=>{
        setIsLoading(true);

            if(!address || address.length<1){
              Toast.show({
                type: 'error',
                text1: '❌ Invalid Address!',
                text2: 'Please Input your Address!'
              });
              setIsLoading(false);
              return;
            }
            if(!contact || contact.length<1){
              Toast.show({
                type: 'error',
                text1: '❌ Invalid Contact Number!',
                text2: 'Please input your Contact Number'
              });
              setIsLoading(false);
              return;
            }
            if(!lastName || lastName.length<1){
              Toast.show({
                type: 'error',
                text1: '❌ Invalid Last Name!',
                text2: 'Please input your Last Name'
              });
              setIsLoading(false);
              return;
            }
            if(!middleName || middleName.length<1){
              Toast.show({
                type: 'error',
                text1: '❌ Invalid Middle Name!',
                text2: 'Please input your Middle Name'
              });
              setIsLoading(false);
              return;
            }
            if(!firstName || firstName.length<1){
              Toast.show({
                type: 'error',
                text1: '❌ Invalid First Name!',
                text2: 'Please input your First Name'
              });
              setIsLoading(false);
              return;
            }
            if(!email || email.length<1){
              Toast.show({
                type: 'error',
                text1: '❌ Invalid Email!',
                text2: 'Please input your email address'
              });
              setIsLoading(false);
              return;
            }

        try{
        const data={
            "emailAddress": email,
            "lastName": lastName,
            "middleName": middleName,
            "firstName": firstName,
            "contactNumber": contact,
            "address": address
        }
        const response = await axiosInstance.put("/user/update", data, {withCredentials: true});
            if(!response.data.success){
                Toast.show({
                type: 'error',
                text1: '❌ Error while updating your Personal Info!',
                text2: response.data.message
                });
            }else{
                Toast.show({
                type: 'success',
                text1: '✅ Personal Info updated successfully!',
                text2: ""
                });
                router.push("/(tabs)/Profile");
            }
        }catch(error){
        console.log("Error while changing your password! - "+error.message);
        Toast.show({
            type: 'error',
            text1: '❌ Error while updating your Personal Info!',
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
                      className="w-full flex flex-col"
            >
                
                <View className="flex flex-row  items-center gap-5 px-5 py-4 bg-white shadow-sm border-b border-gray-100 pt-10">
                    <Image source={logo} style={{ width: 50, height: 50 }} />
                    <Text className="text-3xl font-extrabold text-green-700">Profile</Text>
                </View>

                <View className="px-7 py-10 mx-5 my-5 bg-white shadow-sm border-b border-gray-100 rounded-lg">
                    
                    <View className="my-8 gap-3">
                        <Text className="border border-gray-300 px-5 py-3">Your email address will be used as your User name for logging in</Text>
                        <View className="flex-row mb-4">
                            <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                                <MaterialIcons name={"email"} size={28} color="green" />
                            </View>
                            <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Email Address"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="text-gray-800"
                                />
                            </View>
                        </View>
                    </View>
                    <Text className="text-xl font-bold text-center text-gray-800 mb-5">
                        Your Personal Info
                    </Text>
                    <View className="flex-row mb-4">
                        <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                            <MaterialIcons name={"person"} size={28} color="green" />
                        </View>
                        <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                            <TextInput
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="First Name"
                                keyboardType="default"
                                autoCapitalize="none"
                                className="text-gray-800"
                            />
                        </View>
                    </View>
                    <View className="flex-row mb-4">
                        <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                            <MaterialIcons name={"person-outline"} size={28} color="green" />
                        </View>
                        <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                            <TextInput
                                value={middleName}
                                onChangeText={setMiddleName}
                                placeholder="Middle Name"
                                keyboardType="default"
                                autoCapitalize="none"
                                className="text-gray-800"
                            />
                        </View>
                    </View>
                    <View className="flex-row mb-4">
                        <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                            <MaterialIcons name={"person-outline"} size={28} color="green" />
                        </View>
                        <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                            <TextInput
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Last Name"
                                keyboardType="default"
                                autoCapitalize="none"
                                className="text-gray-800"
                            />
                        </View>
                    </View>
                    <View className="flex-row mb-4">
                        <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                            <MaterialIcons name={"phone"} size={28} color="green" />
                        </View>
                        <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                            <TextInput
                                value={contact}
                                onChangeText={setContact}
                                placeholder="Contact#"
                                secureTextEntry={true}
                                keyboardType="phone-pad"
                                autoCapitalize="none"
                                className="text-gray-800"
                            />
                        </View>
                    </View>

                              <View className="my-8">
                                <Text className="text-xl font-bold text-center text-gray-800 mb-5">
                                  Your Address
                                </Text>
                                <View className="flex-row mb-4">
                                  <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                                    <MaterialIcons name="home" size={28} color="green" />
                                  </View>
                                  <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                                    <TextInput
                                      multiline
                                      numberOfLines={4}
                                      value={address}
                                      onChangeText={setAddress}
                                      placeholder="Street / Block / House No. , Barangay, Municipality, Province"
                                      autoCapitalize="none"
                                      className="text-gray-800"
                                      textAlignVertical="top"
                                    />
                                  </View>
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
