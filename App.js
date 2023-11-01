import React, { useState } from 'react';
import { StyleSheet, View, Text, StatusBar } from 'react-native';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen'; 
export default function App() {
  const [showLogin, setShowLogin] = useState(true); // Set the initial state to show the login screen

  return (
    <View style={styles.container}>
      {showLogin ? (
        <LoginScreen onLogin={() => setShowLogin(false)} />
      ) : (
        <RegisterScreen onRegister={() => setShowLogin(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
