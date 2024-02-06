import React, { useState, useEffect } from 'react';
import { View, ImageBackground, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { BACKEND_URL } from './environment.js';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Function to clear input fields when navigating away
    const clearInputFields = () => {
      setUsername('');
      setPassword('');
    };

    // Add a listener to clear input fields on component unmount
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      clearInputFields();
    });

    return unsubscribe;
  }, [navigation]);

  const showToast = (message, type) => {
    Toast.show({
      type: type,
      position: 'top',
      text1: message,
    });
  };

  const validateUsername = (text) => {
    setUsername(text);
    setUsernameError(!REGEX_EMAIL.test(text) ? 'Invalid email format' : null);
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const validatePassword = (text) => {
    setPassword(text);
    setPasswordError(text.length < 4 ? 'Password must be at least 6 characters long' : null);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim() || usernameError || passwordError) {
      showToast('Invalid Username and Password', 'error');
      return;
    }

    try {
      setIsLoading(true);
      setUsernameError(null);
      setPasswordError(null);

      const response = await axios.post(BACKEND_URL + '/login', {
        email_id: username,
        password: password,
      });

      if (response?.data?.access_token) {
        const token = response.data.access_token;
        await AsyncStorage.setItem('token', token);
        setUsername('');
        setPassword('');
        const message = response.data.message;
        const loggedInUsername = response.data.username;

        showToast(`Logged In: ${message}`, 'success');
        showToast(`Username: ${loggedInUsername}`, 'success');
        navigation.navigate('Dashboard', { username: loggedInUsername });
      } else {
        showToast('Login failed: Token not found in response', 'error');
      }
    } catch (error) {
      showToast('Invalid username or password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Signup');
  };

  const isLoginButtonEnabled = username.trim() !== '' && password.trim() !== '' && usernameError == null && passwordError == null;

  return (
    <ImageBackground source={require("./assets/background.jpeg")} style={styles.container}>
      <Text style={styles.loginTitle}>Login</Text>
      <TextInput
        clearButtonMode="while-editing"
        style={styles.input}
        placeholder="Email"
        value={username}
        onChangeText={validateUsername}
      />
      {usernameError && <Text style={styles.errorText}>{usernameError}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={validatePassword}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="newPassword"
        secureTextEntry={!showPassword}
        enablesReturnKeyAutomatically
      />
      {showPassword ? (
        <MaterialCommunityIcons
          name="eye"
          size={24}
          color='#777'
          style={styles.eyeIcon}
          onPress={toggleShowPassword}
        />
      ) : (
        <MaterialCommunityIcons
          name="eye-off"
          size={24}
          color='#777'
          style={styles.eyeIcon}
          onPress={toggleShowPassword}
        />
      )}
      {passwordError && <Text style={styles.errorText1}>{passwordError}</Text>}
      <Button title="Login" onPress={handleLogin} disabled={!isLoginButtonEnabled || isLoading} />

      {isLoading && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color="#0096FF" />
        </View>
      )}

      <View>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={{ color: '#0096FF', marginTop: 10 }}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Don't have an account ?</Text>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'relative',
    top: -41,
    right: -117,
  },
  loginTitle: {
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
  errorText1: {
    color: 'red',
    marginBottom: 10,
    marginTop: -19,
  },
  buttonText: {
    color: '#0096FF',
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  loadingIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
