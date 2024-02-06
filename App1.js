import React, { useState } from 'react';
import { View, Text, ImageBackground, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import Background from './Background';
import Btn from './Btn';
import axios from 'axios';
import Toast from 'react-native-root-toast';
import { BACKEND_URL } from './environment.js';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const REGEX_EMAIL = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@((([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,}))$/i;
const Signup = ({ navigation }) => {
  const [username, setFirstName] = useState('');
  const [username1, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameBorderColor, setUsernameBorderColor] = useState('gray');
  const [passwordError, setPasswordError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Function to toggle the password visibility state 
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  }; 
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const showToast = (message) => {
    Toast.show(message, {
      position: Toast.positions.TOP,
      containerStyle: { backgroundColor: 'red' },
      textStyle: { color: 'white' },
    });
  };



  const handleSignup = async () => {
    setUsernameError('');
    setUsernameBorderColor('gray');
    setPasswordError('');

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      showToast('All fields are mandatory for registration');
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords don't match");
      setPasswordsMatch(false);
      return;
    } else {
      setPasswordsMatch(true);
    }

    if (!REGEX_EMAIL.test(username)) {
      setUsernameError('Invalid email format');
      setUsernameBorderColor('red');
      return;
    }

    // Password requirements: at least 6 characters, including numbers or symbols
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError('Password must be at least 6 characters and include either number or special characters');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(BACKEND_URL + '/register', {
        username: username1,
        email_id: username,
        password: password,
        confirm_password: confirmPassword,
      });

      console.log(response.data);
      if (response.data.status === 'Success') {
        Toast.show('Registration successful', {
          position: Toast.positions.TOP,
          containerStyle: { backgroundColor: 'green' },
          textStyle: { color: 'white' },
        });
        navigation.navigate('Login', { successMessage: 'Registration successful' });
      } else if (response.data.status === 'Error' && response.data.message && response.data.message.error === 'A user with this email already exists.') {
        showToast('A user with this email already exists.');
      } else {
        showToast('Registration failed. Please try again.');
      }

    } catch (error) {
      console.error('Registration failed:', error.message);
      showToast('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setPasswordsMatch(text === password);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordError('');
  };

  return (
    <ImageBackground source={require("./assets/background.jpeg")} style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.loginTitle}>Register</Text>
        <TextInput
          style={[styles.input, { borderColor: usernameBorderColor }]}
          placeholder="User Name"
          value={username1}
          onChangeText={(text1) => setUserName(text1)}
        />
        <TextInput
          style={[styles.input, { borderColor: usernameBorderColor }]}
          placeholder="Email"
          value={username}
          onChangeText={(text) => setFirstName(text)}
        />
        {usernameError !== '' && <Text style={styles.errorText}>{usernameError}</Text>}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={handlePasswordChange}
          />
          <MaterialCommunityIcons
            name={showPassword ? 'eye' : 'eye-off'}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowPassword}
          />
        </View>
        {passwordError !== '' && <Text style={styles.errorText}>{passwordError}</Text>}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            value={confirmPassword}
            secureTextEntry={!showConfirmPassword}
            onChangeText={handleConfirmPasswordChange}
          />
          <MaterialCommunityIcons
            name={showConfirmPassword ? 'eye' : 'eye-off'}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowConfirmPassword}
          />
        </View>
        
        {!passwordsMatch && (
          <Text style={styles.errorText}>The confirm password doesn't match the password</Text>
        )}

        <Button title="Signup" onPress={handleSignup} disabled={isLoading} />

      </View>
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Already have an account ?</Text>
        <Button title="Login" onPress={handleLogin} disabled={isLoading} />
      </View>
      {isLoading && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color="#0096FF" />
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: 'white'
  },

  loginTitle: {
    color: 'black',
    fontSize: 36,
    marginBottom: 20,
  },
  inputContainer: {
    marginTop: 59,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    width: '100%',
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
  
  icon: {
    marginLeft: 7,
  
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

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  passwordInput: {
    flex: 1,
  },
});

export default Signup;