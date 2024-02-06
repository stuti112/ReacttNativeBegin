import React from 'react';
import { View, ImageBackground } from 'react-native';

const Background = ({ children }) => {
  return (
    <View>
      <ImageBackground source={require("./assets/leaves.jpg")} style={{ height: '100%', backgroundColor: 'white' }}>
        <View style={{ position: "absolute" }}>
          {children}
        </View>
      </ImageBackground>
    </View>
  );
}

export default Background;
