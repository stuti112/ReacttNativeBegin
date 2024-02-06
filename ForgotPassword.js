import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from './environment.js';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
 

  const validateEmail = (text) => {
    setEmail(text);
    setEmailError(!REGEX_EMAIL.test(text) ? 'Invalid email format' : null);
  };

  const handleResetPassword = async () => {
    if (!email.trim() || emailError || isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(BACKEND_URL + '/reset_password', {
        email_id: email,
      });

      if (response.data.status === 'success') {
     
        Alert.alert('Success', response.data.message, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        Alert.alert('Error', response.data.message);
      }
     }
     
catch (error) {
      if (error.response) {
        if (error.response.status === 404) {      Alert.alert('Error', "Email ID does not exist");       }
         else {      Alert.alert('Error', error.response.data.message || "An unexpected error occurred. Please try again.");       }     }
          else {     console.error('Error resetting password:', error);     
            Alert.alert('Error', "An unexpected network error occurred. Please try again.");     }   }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={validateEmail}
      />
      {emailError && <Text style={styles.errorText}>{emailError}</Text>}
      <Button title="Reset Password" onPress={handleResetPassword} disabled={isLoading} />
      {isLoading && <ActivityIndicator size="large" color="#0096FF" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default ForgotPassword;
