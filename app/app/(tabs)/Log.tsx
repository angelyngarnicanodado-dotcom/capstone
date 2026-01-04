import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  Image,
  Dimensions
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingOverlay from "../components/LoadingOverlay"; 
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import DateTimePicker from '@react-native-community/datetimepicker';
import logo from "../../assets/images/logo.png";

// --- UPDATED TABLE HEADING ---
const renderTableHeading = () => {
  return (
    <View className="flex-row bg-slate-700 py-3 items-center rounded-t-lg">
      <Text className="w-24 text-center text-white text-[10px] font-bold">DATE/TIME</Text>
      <Text className="w-14 text-center text-white text-[10px] font-bold">TEMP</Text>
      <Text className="w-14 text-center text-white text-[10px] font-bold">HUM</Text>
      <Text className="w-12 text-center text-white text-[10px] font-bold">DAY</Text>
      <Text className="w-20 text-center text-white text-[10px] font-bold">TURN</Text>
      <Text className="w-14 text-center text-white text-[10px] font-bold">LED</Text>
      <Text className="w-14 text-center text-white text-[10px] font-bold">DOOR</Text>
    </View>
  );
};

// --- UPDATED TABLE DATA (Matches Mongoose Model) ---
const renderTableData = ({ item }) => {
  if (!item) return null;
  const eventDate = new Date(item.eventDate);

  return (
    <View className="flex-row py-3 items-center border-b border-amber-500 bg-white">
      {/* Date */}
      <View className="w-24 px-1">
        <Text className="text-[10px] text-gray-800 text-center font-medium">
          {eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </Text>
        <Text className="text-[9px] text-gray-400 text-center">
          {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {/* Temperature & Humidity */}
      <Text className="w-14 text-[10px] font-bold text-teal-700 text-center">{item.temperature}°C</Text>
      <Text className="w-14 text-[10px] font-bold text-blue-700 text-center">{item.humidity}%</Text>
      
      {/* Day Count */}
      <Text className="w-12 text-[10px] text-gray-700 text-center">{item.daysElapsed}</Text>

      {/* Egg Turning Status */}
      <View className="w-20 items-center">
        <Text className={`text-[9px] font-bold ${item.eggTurning?.isTurning ? 'text-green-600' : 'text-gray-400'}`}>
          {item.eggTurning?.isTurning ? "TURNING" : (item.eggTurning?.mode || "OFF")}
        </Text>
      </View>

      {/* LED Light Status */}
      <View className="w-14 items-center">
        <MaterialIcons 
          name="wb-incandescent" 
          size={16} 
          color={item.ledLight?.isOn ? "#f59e0b" : "#cbd5e1"} 
        />
      </View>

      {/* Door Sensor Status */}
      <View className="w-14 items-center">
        <MaterialIcons 
          name={item.doorSensor?.isClosed ? "door-front" : "sensor-door"} 
          size={16} 
          color={item.doorSensor?.isClosed ? "#10b981" : "#ef4444"} 
        />
      </View>
    </View>
  );
};

const LogScreen = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [deviceIDs, setDeviceIDs] = useState([]);
  const [selectedDeviceID, setSelectedDeviceID] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStartDateSelection, setShowStartDateSelection] = useState(false);
  const [showEndDateSelection, setShowEndDateSelection] = useState(false);
  const [data, setData] = useState([]);

  const reloadData = async () => {
    try {
      const response = await axiosInstance.get("/device/get-my-devices", { withCredentials: true });
      if (response.data.success) {
        setDeviceIDs(response.data.data.map(dev => dev.deviceID));
      }
    } catch (error) { console.log(error); }
  };

  useEffect(() => { reloadData(); }, []);

  const searchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/event/sensor-records", {
        deviceID: selectedDeviceID || "null",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }, { withCredentials: true });
      setData(response.data.success ? response.data.data : []);
    } catch (error) { Toast.show({ type: 'error', text1: 'Error', text2: error.message }); }
    setIsLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {isLoading && <LoadingOverlay />}

      {/* Header */}
      <View className="flex flex-row items-center gap-5 px-5 py-4 bg-amber-400 border-b border-amber-500">
        <Image source={logo} style={{ width: 50, height: 50 }} />
        <Text className="text-2xl font-black text-teal-900">Logs</Text>
      </View>

      {/* Search Filters */}
      <View className="p-4 mx-3 my-3 bg-white rounded-xl border border-gray-200">
        <View className="flex-row items-center mb-4">
          <Text className="text-gray-500 font-bold mr-2">Device:</Text>
          <View className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
            <Picker selectedValue={selectedDeviceID} onValueChange={(val) => setSelectedDeviceID(val)} style={{ height: 50 }}>
              <Picker.Item label="All Devices" value="" />
              {deviceIDs.map((id) => <Picker.Item key={id} label={id} value={id} />)}
            </Picker>
          </View>
        </View>

        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity onPress={() => setShowStartDateSelection(true)} className="flex-1 bg-gray-100 p-3 rounded-lg flex-row justify-between">
            <Text className="text-gray-700 text-xs">From: {startDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndDateSelection(true)} className="flex-1 bg-gray-100 p-3 rounded-lg flex-row justify-between">
            <Text className="text-gray-700 text-xs">To: {endDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={searchEvents} className="bg-teal-900 py-3 rounded-lg"><Text className="text-center text-white font-bold">Search</Text></TouchableOpacity>
      </View>

      {/* --- THE TABLE SECTION --- */}
      {data.length > 0 ? (
        <View className="flex-1 mx-3 mb-5 bg-white rounded-lg border border-amber-500 overflow-hidden">
          {/* CRITICAL: Horizontal ScrollView allows the 7 columns to fit without squashing */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={{ width: 550 }}> 
              <FlatList
                data={data}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={renderTableHeading}
                renderItem={renderTableData}
                stickyHeaderIndices={[0]}
              />
            </View>
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1 justify-center items-center"><Text className="text-gray-400">No records found.</Text></View>
      )}

      {/* Date Pickers */}
      {showStartDateSelection && <DateTimePicker value={startDate} mode="date" onChange={(e, d) => {setShowStartDateSelection(false); if(d) setStartDate(d);}} />}
      {showEndDateSelection && <DateTimePicker value={endDate} mode="date" onChange={(e, d) => {setShowEndDateSelection(false); if(d) setEndDate(d);}} />}
      
      <Toast />
    </SafeAreaView>
  );
};

export default LogScreen;