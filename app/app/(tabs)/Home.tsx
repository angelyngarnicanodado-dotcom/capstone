import { BackHandler, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import React, {useState, useEffect, useCallback} from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import axiosInstance from '../../axiosConfig.js';
import loadingOverlay from "../components/LoadingOverlay";
import logo from "../../assets/images/logo.png";



const IncubatorDashboard = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(0);

  const screenWidth = Dimensions.get("window").width;

  useEffect(()=>{
    setIsLoading(true);
    const func=async()=>{
      try{
        const response = await axiosInstance.get("/event/temp-summary",  {withCredentials: true});
        if(!response.data.success){
            console.log(JSON.stringify(response.data.message));
            setData([]);
        }else{
            setData(response.data.data);
            console.log(JSON.stringify(response.data.data));
        }
      }catch(error){
        console.error("Data retrieval error:", error.message);
      }
    }

    func();

    setIsLoading(false);
  },[]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );

      return () => subscription.remove();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {isLoading && loadingOverlay()}
      <View className="flex flex-row  items-center gap-5 px-5 py-4 bg-amber-400 shadow-sm border-b border-gray pt-10">
        <Image source={logo} style={{ width: 50, height: 50 }} />
        <Text className="text-3xl font-extrabold text-teal-800">Home</Text>
      </View>
     <View className="bg-white rounded-xl p-4 shadow mb-5">
  {/* Header */}
  <View className="flex-row justify-between items-center mb-2">
    <Text className="font-bold text-lg text-gray-800">
      INC-062702
    </Text>
    <Text className="text-green-600 font-semibold">
      ● Online
    </Text>
  </View>

  <Text className="text-gray-500 mb-3">
    System Standby
  </Text>

  {/* Readings */}
  <View className="flex-row justify-between mb-3">
    <Text className="text-xl">🌡 37.6 °C</Text>
    <Text className="text-xl">💧 56 %</Text>
  </View>

  {/* Progress */}
  <View className="mb-3">
    <Text className="font-semibold">🥚 Day 9 / 21</Text>
    <Text className="text-gray-500">Mode: Incubation</Text>
  </View>

  {/* Updates */}
  <View className="border-t pt-2">
    <Text className="text-sm text-gray-600">
      🔁 Last egg turn: 45 mins ago
    </Text>
    <Text className="text-sm text-gray-600">
      🚪 Door: Closed
    </Text>
  </View>
      
      </View>
    </SafeAreaView>
  );
};

export default IncubatorDashboard;