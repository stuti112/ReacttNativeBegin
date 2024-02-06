import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';

export default function Btn({bgColor, btnLabel, textColor, Press}) {
  return (
    <TouchableOpacity
    onPress={Press}
      style={{
        backgroundColor: "#1E90FF",
        borderRadius: 0,
        alignItems: 'center',
        width: 70,
        paddingVertical: 5,
        marginVertical: 3
      }}>
      <Text style={{color: textColor, fontSize: 14, fontWeight: 'bold'}}>
        {btnLabel}
      </Text>
    </TouchableOpacity>
  );
}