import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, Redirect } from "expo-router";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";

const ProfileTab =()=>{
    const [isLoading, setIsLoading] = useState(false);
    const [personalData, setPersonalData] = useState({
        firstName: "",
        lastName: "",
        middleName: "",
        contactNumber: "",
        emailAddress: "",
        address: ""
    });
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    const [isPasswordValidateVisible, setIsPasswordValidateVisible] = useState(false);
    const [password, setPassword] = useState("");
    const [nexRoute, setNextRoute]=useState<string>("");
    const { logout } = useAuth();

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
                    setPersonalData({
                        firstName: "",
                        lastName: "",
                        middleName: "",
                        contactNumber: "",
                        emailAddress: "",
                        address: ""
                    });
                }else{
                    const data = response.data.data[0];
                    data._id="";
                    setPersonalData(data);
                }
            }catch(error){
                console.log("Error while retrieving your User Account! - "+error.message);
                Toast.show({
                    type: 'error',
                    text1: '❌ Error while retrieving your User Account!',
                    text2: error.message
                });
                setPersonalData({
                    firstName: "",
                    lastName: "",
                    middleName: "",
                    contactNumber: "",
                    emailAddress: "",
                    address: ""
                });
            }    
        }
        
        reloadData();
        setIsLoading(false);
    }, []);

    const handleLogoutPress = () => {
        setIsLogoutModalVisible(true);
    };

    const confirmLogout = async () => {
        setIsLogoutModalVisible(false);
        await logout();
        router.replace("/");
    };

    const cancelValidatePassword = () => {
        setIsPasswordValidateVisible(false);
        setNextRoute("");
    };


    const handleValidatePasswordPress = () => {
        setIsPasswordValidateVisible(true);
    };

    const confirmPasswordValidate = async () => {
        setIsPasswordValidateVisible(false);
        setIsLoading(true);
        try{
            const data={"password": password};
            const response = await axiosInstance.post("/user/validate-my-password", data,  {withCredentials: true});
            if(!response.data.success){
                Toast.show({
                    type: 'error',
                    text1: '❌ Wrong Password!',
                    text2: response.data.message
                });
                setIsPasswordValidateVisible(true);
            }else{
                if(nexRoute){
                    router.push(nexRoute);
                }

                setPassword("");
                setNextRoute("");
                
            }
        }catch(error){
            console.log("Error while retrieving your User Account! - "+error.message);
            Toast.show({
                    type: 'error',
                    text1: '❌ Error while retrieving your User Account!',
                    text2: error.message
            });
            setPassword("");
            setNextRoute("");
        }
        setIsLoading(false); 
    };

    const cancelLogout = () => {
        setIsLogoutModalVisible(false);
    };

    return(
        <SafeAreaView className="flex-1 bg-gray-100">
            {isLoading && loadingOverlay()}
            <ScrollView
                      showsVerticalScrollIndicator={false}
                      className="w-full flex flex-col"
            >
                
              <View className="flex flex-row  items-center gap-5 px-5 py-4 bg-amber-400 shadow-sm border-b border-gray-500 pt-10">
                             <Image source={logo} style={{ width: 50, height: 50 }} />
                    <Text className="text-3xl font-extrabold text-teal-800">Profile</Text>
                </View>

                <View className="px-7 py-10 mx-5 my-5 bg-white shadow-sm border-b border-gray-100 rounded-lg">
                    <View className="flex flex-row w-full h-auto gap-4 my-2">
                        <Text className="text-black font-bold text-xl">Email:</Text>
                        <Text className="text-gray-700 text-lg">{personalData.emailAddress}</Text>
                    </View>
                    <View className="flex flex-row w-full h-auto gap-4 my-2">
                        <Text className="text-black font-bold text-xl">Name:</Text>
                        <Text className="text-gray-700 text-lg">{personalData.lastName}, {personalData.firstName} {personalData.middleName}</Text>
                    </View>
                    <View className="flex flex-row w-full h-auto gap-4 my-2">
                        <Text className="text-black font-bold text-xl">Contact#:</Text>
                        <Text className="text-gray-700 text-lg">{personalData.contactNumber}</Text>
                    </View>
                    <View className="flex flex-row w-full h-auto gap-4 mt-2 mb-10">
                        <Text className="text-black font-bold text-xl">Address:</Text>
                        <Text className="text-gray-700 text-lg flex-1 break-words">{personalData.address}</Text>
                    </View>
                    
                    <View className="flex flex-col mx-auto w-fit h-auto gap-4 my-2">
                        
                        <TouchableOpacity
                            onPress={()=>{setNextRoute("/UpdatePersonalInfo"); handleValidatePasswordPress(); }}
                            className="flex flex-row  gap-2 bg-blue-600 py-4 px-8 rounded-lg mx-6"
                        >
                            <MaterialIcons name={"account-circle"} size={28} color="white" />
                            <Text className="text-white text-center font-semibold text-lg">
                                Update Personal Info
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={()=>{setNextRoute("/UpdatePassword"); handleValidatePasswordPress(); }}
                            className="flex flex-row gap-2 bg-blue-600 py-4 px-8 rounded-lg mx-6"
                        >
                            <MaterialIcons name={"lock"} size={28} color="white" />
                            <Text className="text-white text-center font-semibold text-lg">
                                Change Password
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 mx-auto w-full h-auto gap-4 mt-10 items-end">
                        <TouchableOpacity
                            onPress={handleLogoutPress}
                            className="flex flex-row gap-2 bg-gray-600 py-4 px-8 rounded-lg mx-6 w-fit"
                        >
                            <MaterialIcons name={"logout"} size={28} color="white" />
                            <Text className="text-white text-center font-semibold text-lg">
                                Logout
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            <Modal
                visible={isLogoutModalVisible}
                transparent
                animationType="fade"
                onRequestClose={cancelLogout}
            >
                <View className="flex-1 justify-center items-center bg-black/40">
                <View className="bg-white rounded-lg p-6 w-80">
                    <Text className="text-lg font-bold text-center mb-4">Confirm Logout</Text>
                    <Text className="text-center mb-6">Are you sure you want to logout?</Text>
                    <View className="flex-row justify-between">
                    <TouchableOpacity
                        onPress={cancelLogout}
                        className="bg-gray-300 py-2 px-4 rounded-lg"
                    >
                        <Text className="text-center text-black font-semibold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={confirmLogout}
                        className="bg-red-600 py-2 px-4 rounded-lg"
                    >
                        <Text className="text-center text-white font-semibold">Logout</Text>
                    </TouchableOpacity>
                    </View>
                </View>
                </View>
            </Modal>

            <Modal
                visible={isPasswordValidateVisible}
                transparent
                animationType="fade"
                onRequestClose={cancelValidatePassword}
            >
                <View className="flex-1 justify-center items-center bg-black/40">
                <View className="bg-white rounded-lg p-6 w-80">
                    <Text className="text-lg font-bold text-center mb-4">Verify Password</Text>
                    <Text className="text-center mb-6">Please Input your Password before continuing</Text>
                    <View className="flex-row mb-10">
                        <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                            <MaterialIcons name={"lock"} size={28} color="green" />
                        </View>
                        <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="password"
                                secureTextEntry={true}
                                keyboardType="password"
                                autoCapitalize="none"
                                className="text-gray-800"
                            />
                        </View>
                    </View>
                    <View className="flex-row justify-between">
                    <TouchableOpacity
                        onPress={cancelValidatePassword}
                        className="bg-gray-300 py-2 px-4 rounded-lg"
                    >
                        <Text className="text-center text-black font-semibold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={confirmPasswordValidate}
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

export default ProfileTab;
