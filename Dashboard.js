import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Modal,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TouchableHighlight,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-root-toast';
import { BACKEND_URL } from './environment.js';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';

let device_name = ' ';

const Dashboard = ({ route }) => {
  const [isCameraModalVisible, setCameraModalVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const { onUploadComplete } = route.params || {};
  const [uploadedImageData, setUploadedImageData] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [expandedMeasurement, setExpandedMeasurement] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [Upload, setUpload] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [expandedItem, setExpandedItem] = useState([]);
  const [measurementVisibility, setMeasurementVisibility] = useState({});
  const [showAllMeasurements, setShowAllMeasurements] = useState(false);

  const { username } = route.params;
  const extractNumbers = (inputString) => {
    const numbers = inputString.match(/\b\d+(\.\d+)?\b/g);
    return numbers ? numbers.join('  ') : ' ';
  };

  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileSelectedMessage, setFileSelectedMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('Blood Pressure Monitor');
  const [deviceOptionsVisible, setDeviceOptionsVisible] = useState(false);
  const navigateToHistory = () => {
    // Assuming you want to navigate to the History page with some default parameters
    const defaultStartDate = '2023-01-01';
    const defaultEndDate = '2023-12-31';

    navigation.navigate('History', {
      device_name,
      start_date: defaultStartDate,
      end_date: defaultEndDate,
    });
  };

  const navigateToChart = () => {
    const defaultStartDate = '2023-01-01';
    const defaultEndDate = '2023-12-31';

    navigation.navigate('Chart', {
      device_name,
      start_date: defaultStartDate,
      end_date: defaultEndDate,
    });
  };

  const showToast = (message) => {
    Toast.show(message, {
      position: Toast.positions.BOTTOM,
      containerStyle: { backgroundColor: 'red' },
      textStyle: { color: 'white' },
    });
  };
  const handlePlusButtonPress = () => {
    setModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.navigate('Login');

      // Display a toast message
      Toast.show('You have been logged out successfully', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        containerStyle: { backgroundColor: 'green' },
        textStyle: { color: 'white' },
      });
    } catch (error) {
      console.error('Logout failed:', error.message);
      // Display an error toast message
      Toast.show('Logout failed', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        containerStyle: { backgroundColor: 'red' },
        textStyle: { color: 'white' },
      });
    }
  };
  const handleImageUpload = async () => {
    setLoading(true);
    setUploading(true);

    try {
      const result = await DocumentPicker.getDocumentAsync();
      const token = await AsyncStorage.getItem("token");

      if (result.type === "success") {
        setSelectedFile(result);
        setFileSelectedMessage("File selected: " + result.name);

        const formData = new FormData();
        formData.append("file", {
          uri: result.uri,
          name: result.name,
          type: `image/${result.type.split("/")[1]}`,
        });
        formData.append("device_name", device_name);

        await sendFormDataToBackend(formData, token);
      }
    } catch (error) {
      console.error("Document picking error:", error);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };
  const handleCameraCapture = async () => {
    try {
      setLoadingData(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const formData = new FormData();
        const { uri, name } = result.assets[0];

        formData.append("file", {
          uri: uri,
          name: name || "captured_photo.jpg",
          type: "image/jpg",
        });
        formData.append("device_name", device_name);

        const token = await AsyncStorage.getItem("token");
        await sendFormDataToBackend(formData, token);
      }
    } catch (error) {
      console.error("Camera capture error:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const sendFormDataToBackend = async (formData, token) => {
    try {
      const response = await axios.post(BACKEND_URL + "/process_image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      onUploadComplete && onUploadComplete(response.data);
      setUploadedImageData(response.data);
      setUploadComplete(true);
      setModalVisible(true);
      setSelectedDevice({ name: "" });
      device_name = "";
    } catch (error) {
      console.error("File upload error:", error);
    }
  };
  const pickDocument = async () => {
    setLoading(true);
    setUploading(true);

    try {
      console.log("outside first try")
      const result = await DocumentPicker.getDocumentAsync();
      const token = await AsyncStorage.getItem('token');
      console.log("result", result)
      console.log(result.type === 'success')
      if (true) {
        setSelectedFile(result);
        setFileSelectedMessage('File selected: ' + result.name);
        console.log("inside first try after pick INSIDE IF")

        const formData = new FormData();

        // Check if uri is available before using it
        if (result.assets[0].uri) {
          const uriParts = result.assets[0].uri.split('.');
          const fileType = uriParts[uriParts.length - 1];

          formData.append('file', {
            uri: result.assets[0].uri,
            name: result.assets[0].name,
            type: `image/${fileType}`,
          });

          formData.append('device_name', device_name);

          try {
            const response = await axios.post(BACKEND_URL + '/process_image', formData, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            });

            onUploadComplete && onUploadComplete(response.data);
            setUploadedImageData(response.data);
            setUploadComplete(true);
            setModalVisible(true);
            selectedDevice.name = '';
            device_name = '';

          } catch (error) {
            console.error('File upload error:', error);
            if (error.response) {
              console.error('Response data:', error.response.data);
              console.error('Response status:', error.response.status);
              console.error('Response headers:', error.response.headers);
            } else if (error.request) {
              console.error('Request data:', error.request);
            } else {
              console.error('Error message:', error.message);
            }
          } finally {
            setLoading(false);
            setUploading(false);
          }
        } else {
          console.error('Result object does not have a valid URI');
        }
      }
    } catch (error) {
      console.error('Document picking error:', error);
    }
  };

  const toggleDeviceOptions = () => {
    setDeviceOptionsVisible(!deviceOptionsVisible);
  };

  const selectDeviceOption = (device) => {
    setSelectedDevice(device);
    toggleDeviceOptions();
    device_name = device.name;
  };

  const closeModal = () => {
    setModalVisible(false);
    setUploadedImageData(null);
    setUploadComplete(false);
    fetchMeasurements();
    selectedDevice.name = '';
    device_name = '';
  };
  const toggleAllMeasurements = () => {
    setShowAllMeasurements((prevShowAllMeasurements) => !prevShowAllMeasurements);
    setExpandedMeasurement(null); // Reset expanded measurement when toggling all measurements
  };
  const toggleItemExpansion = (index) => {
    setMeasurements((prevData) => {
      const updatedData = [...prevData];
      updatedData[index].expanded = !updatedData[index].expanded;
      return updatedData;
    });
  };
  const toggleAllMeasurementsVisibility = () => {
    setExpandedMeasurement(null); // Reset expanded measurement when toggling all measurements

    // Toggle visibility for all measurements
    setMeasurements((prevData) => {
      return prevData.map((item) => ({
        ...item,
        expanded: !showAllMeasurements,
        expandedMeasurement: null,
      }));
    });

    setShowAllMeasurements((prevShowAllMeasurements) => !prevShowAllMeasurements);
  };



  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(BACKEND_URL + '/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log('Measurement Data:', JSON.stringify(response.data, null, 2));
        setMeasurements(response.data);
        if (response.data.length === 0) {
          showToast('No data to show');
        }
      } else {
        console.error('Failed to fetch measurements:', response.status);
      }
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dashboardHeadingContainer}>
        <FontAwesome5 name="user" size={15} color={'black'} style={styles.userIcon} />
        <Text style={styles.dashboardHeading}>{username}'s Dashboard</Text>
      </View>

      <View style={styles.headerContainer}>
        <View style={styles.iconsContainer}>
          <View style={styles.buttonContainer}>
            <FontAwesome5 name="history" size={30} color={'black'} onPress={navigateToHistory} underlayColor="transparent" />
            <Text style={{ fontSize: 14, color: 'black' }}>History</Text>

          </View>
          <View style={styles.buttonContainer}>
            <Icon name="chart-bar" size={30} color={'green'} onPress={navigateToChart} underlayColor="transparent" />
            <Text style={{ fontSize: 14, color: 'green' }}>Chart</Text>
          </View>

          <TouchableHighlight style={styles.plusButton} onPress={handlePlusButtonPress} underlayColor="transparent">
            <View style={styles.buttonContainer}>
              <Icon title="upload image" name="plus-circle" size={30} color={'blue'} style={styles.plusButtonText} />
              <Text style={{ fontSize: 14, color: 'blue' }}>Upload</Text>
            </View>
          </TouchableHighlight>


          <TouchableHighlight style={styles.logoutButton} underlayColor="transparent" onPress={handleLogout}>
            <View style={styles.buttonContainer}>
              <Icon name="logout" size={30} color={'red'} style={styles.logoutButtonText} />
              <Text style={{ fontSize: 14, color: 'red' }}>Logout</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
      <View style={styles.container1}>
        <Text style={styles.header1}>Measurements</Text>
        <TouchableOpacity onPress={toggleAllMeasurementsVisibility}>
          <MaterialCommunityIcons
            name={showAllMeasurements ? 'eye' : 'eye-off'}
            size={24}
            color='#0096FF'
          />
        </TouchableOpacity>
        <FlatList
          data={measurements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.card1}
              onPress={() => toggleItemExpansion(index)}
            >
              <Text style={styles.date1}>{`Date: ${item.date}`}</Text>
              <Text style={styles.deviceName1}>{`Device Name: ${item.device_name}`}</Text>
              <View style={styles.measurementContainer}>
                <Text style={styles.measurementText}>
                  {item.expanded ? `Measurement: ${extractNumbers(item.measurement)}` : ''}
                </Text>
                <MaterialCommunityIcons
                  name={item.expanded ? 'eye' : 'eye-off'}
                  size={24}
                  color='#777'
                  style={styles.eyeIcon}
                  onPress={() => toggleItemExpansion(index)}
                />
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator1} />}
        />
      </View>




      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        {capturedPhoto && (

          <View>
            <Text style={styles.modalText}>Captured Photo</Text>
            <Image source={{ uri: capturedPhoto }} style={{ width: 300, height: 300, alignItems: "center", }} />
            <TouchableOpacity onPress={closeModal} style={styles.goBackIcon}>
              <MaterialCommunityIcons name="arrow-left" size={30} color={"blue"} />
              <Text style={{ fontSize: 14, color: "black" }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {loadingData && <ActivityIndicator size="large" color="#0000ff" />}





            {uploading && (
              <View>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.modalText}>Uploading...</Text>
              </View>
            )}
            {uploadComplete && !isLoading && (
              <View>
                <Text style={styles.modalText}>Your Measurements</Text>
                <Text>{uploadedImageData.device_name}</Text>
                <Text>{extractNumbers(uploadedImageData.measurement)}</Text>
                <Text>Time: {new Date().toLocaleTimeString()}</Text>
                <TouchableOpacity onPress={closeModal} style={styles.goBackIcon}>
                  <MaterialCommunityIcons name="arrow-left" size={30} color={'blue'} />
                  <Text style={{ fontSize: 14, color: 'black' }}>Go Back</Text>
                </TouchableOpacity>
              </View>
            )}
            {Upload && (

              <View>

                <View style={styles.deviceContainer}>
                  <Text style={styles.deviceText}>Device</Text>
                  <TouchableOpacity onPress={toggleDeviceOptions} style={styles.dropdownButton}>
                    <Text style={styles.dropdownText}>{selectedDevice.name}</Text>
                  </TouchableOpacity>
                </View>
                {deviceOptionsVisible && (
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity onPress={() => selectDeviceOption({ name: 'Blood Pressure Monitor' })}>
                      <Text style={styles.optionText}>Blood Pressure Monitor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => selectDeviceOption({ name: 'Oximeter' })}>
                      <Text style={styles.optionText}>Oximeter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => selectDeviceOption({ name: 'Thermometer' })}>
                      <Text style={styles.optionText}>Thermometer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => selectDeviceOption({ name: 'Glucometer' })}>
                      <Text style={styles.optionText}>Glucometer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => selectDeviceOption({ name: 'Weighing Scale' })}>
                      <Text style={styles.optionText}>Weighing Scale</Text>
                    </TouchableOpacity>
                  </View>
                )}


                <View style={styles.buttonContainer}>
                  <View style={styles.uploadButton}>
                    <Button
                      title="Upload"
                      onPress={pickDocument}
                      disabled={!device_name.trim() || isLoading} />
                  </View>

                  <Text>or</Text>
                  <View style={styles.uploadButton}>
                    <Button
                      title="Capture"
                      onPress={handleCameraCapture}
                      disabled={!device_name.trim() || isLoading} />
                  </View>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginTop: 30,
    marginBottom: 10,
    marginLeft: 'auto',

    width: 200,


  },
  dropdownText: {
    fontSize: 16,
    textAlign: 'center', // Center the text horizontally
    // Allow the text to expand to the available space
  },
  deviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  deviceText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    marginBottom: -16,
  },
  optionsContainer: {
    position: 'absolute',
    top: 40,
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray',
    zIndex: 1,
  },
  optionText: {
    fontSize: 16,
    paddingVertical: 5,
  },
  uploadButtonContainer: {
    position: 'absolute',
  },
  logoutButtonContainer: {
    position: 'absolute',


  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  fileSelectedMessage: {
    fontSize: 16,
    marginTop: 10,
  },
  uploadedDataContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  uploadedDataBox: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  measurementsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  measurementsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  measurementCard: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  container1: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
    marginTop: 10,
  },
  header1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card1: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  date1: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  deviceName1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007BFF',
  },
  measurement1: {
    fontSize: 16,
    color: '#777',
  },
  separator1: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  historyIconContainer: {
    position: 'absolute',
  },
  historyButtonContainer: {
    position: 'absolute',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  dashboardHeadingContainer: {
    alignItems: 'center',
    marginBottom: 17,
    marginTop: 70,
  },
  dashboardHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userIcon: {
    marginRight: 8,
  },


  closeButton: {
    position: 'absolute',
    top: 2,
    right: 10,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  plusButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  plusButtonText: {
    color: 'blue',
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: 'red',
  },
  seeMoreIcon: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  chartIconContainer: {
    position: 'absolute',
  },
  measurementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  measurementText: {
    flex: 1,
    fontSize: 16,
    color: '#777',
  },

  eyeIcon: {
    marginLeft: 10,
  },
  iconsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default Dashboard;