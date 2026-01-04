import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons'; 

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

const DeviceCard = ({ device, pressEventHandler }) => {
  
  return (
    <TouchableOpacity 
      className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-md border border-gray-100 active:bg-gray-50"
      onPress={() => pressEventHandler(device)} 
      activeOpacity={0.8}
    >
      {/* Header with Slate Gray-Blue ID and Online Status */}
      <View className="flex-row justify-between items-start pb-3 mb-3 border-b border-gray-100">
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-slate-500">{device.deviceID}</Text>
          <Text className="text-xs text-gray-400">
            {device.incubationStarted ? "Incubation in Progress" : "System Standby"}
          </Text>
        </View>
        <Octicons name="dot-fill" size={30} color={device.isOnline ? "green" : "red"}/>
      </View>

      {/* Main Environment Data */}
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

      {/* Incubation Progress & Door Status */}
      <View className="flex flex-col w-auto h-auto mt-2 border border-gray-100 rounded-lg bg-gray-50/50">
        <Text className="text-sm font-bold text-slate-500 mx-3 mt-2">Current Status</Text>
        <View className="flex flex-row">
            <MetricCard
              title="Day Count" 
              value={device.daysElapsed} 
              unit=" Days" 
              iconName="calendar-clock" 
              color="bg-purple-50" 
            />
            <MetricCard 
              title="Door" 
              value={device.doorSensor?.isClosed ? "Closed" : "Open"} 
              unit="" 
              iconName={device.doorSensor?.isClosed ? "door-closed" : "door-open"} 
              color={device.doorSensor?.isClosed ? "bg-green-50" : "bg-orange-50"} 
            />
          </View>
      </View>
        
      {/* System Controls */}
      <View className="flex flex-col w-auto h-auto border border-gray-100 rounded-lg mt-2 bg-gray-50/50">
        <Text className="text-sm font-bold text-slate-500 mx-3 mt-2">Active Controls</Text>
        <View className="flex flex-row">
            <MetricCard
              title="Egg Turning" 
              value={device.eggTurning?.mode} 
              unit="" 
              iconName="rotate-3d-variant" 
              color="bg-amber-50" 
            />
            <MetricCard 
              title="Internal LED" 
              value={device.ledLight?.isOn ? "ON" : "OFF"} 
              unit="" 
              iconName="lightbulb-on-outline" 
              color="bg-yellow-50" 
            />
          </View>
        </View>
    </TouchableOpacity>
  );
};

export default DeviceCard;