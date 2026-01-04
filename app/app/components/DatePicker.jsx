import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

const DatePickerField = (dateSelectedHandler, labelText) => {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    dateSelectedHandler(currentDate);

    console.log("Selected Date: "+JSON.stringify(selectedDate));
  };

  

  return (
    <View className="flex-1 flex-col justify-center items-center w-fit">
      <Text className="text-slate-600 text-base">{labelText}</Text>
      <TouchableOpacity 
        onPress={() => setShow(true)}
        className="w-full bg-white border border-slate-300 rounded-xl p-4 flex-row justify-between items-center active:bg-slate-100"
      >
        <Text className="text-slate-600 text-base">
          {date.toLocaleDateString()}
        </Text>
        <MaterialIcons name='arrow-drop-down' size={25}/>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
        />
      )}
    </View>
  );
};

export default DatePickerField;