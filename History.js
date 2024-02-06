
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  Button
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from './environment.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-root-toast';

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const navigation = useNavigation();
  const [showFilterOptions, setShowFilterOptions] = useState(true);
  const [expandedItem, setExpandedItem] = useState([]);
  const [expandedMeasurement, setExpandedMeasurement] = useState(null);
  const [measurementVisibility, setMeasurementVisibility] = useState({});
  const [showAllMeasurements, setShowAllMeasurements] = useState(false);

  useEffect(() => {
    fetchHistoryData();
  }, [startDate, endDate, deviceName]);

  const fetchHistoryData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');


      const formatDate = (date) => {
        if (date) {
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        }
      };
      const showToast = (message) => {
        Toast.show(message, {
          position: Toast.positions.BOTTOM,
          containerStyle: { backgroundColor: 'red' },
          textStyle: { color: 'white' },
        });
      };

      const response = await axios.post(
        BACKEND_URL + '/history',
        {
          device_name: deviceName,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        console.log('History Data:', JSON.stringify(response.data, null, 2));
        setHistoryData(response.data || []);
        if (response.data.length === 0) {
          showToast('No data to show');
        }

      } else {
        console.error('Failed to fetch history data:', response.status);
      }
    } catch (err) {
      console.error('Error in Fetching History Data:', err);
      if (err.response) {
        console.error('Response Data:', err.response.data);
        console.error('Response Status:', err.response.status);
      }
    }
  };
  const clearFilters = () => {
    // Reset start date, end date, and device name to their default values
    setStartDate('');
    setEndDate('');
    setDeviceName('');
    // Fetch data with default filters
    // fetchHistoryData();
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const onSelectDevice = (itemValue) => {
    setDeviceName(itemValue);
    hideModal();
  };

  const devices = [
    'Blood Pressure Monitor',
    'Oximeter',
    'Thermometer',
    'Glucometer',
    'Weighing Scale',
  ];

  const toggleFilterVisibility = () => {
    setShowFilterOptions(!showFilterOptions);
  };
  const extractNumbers = (inputString) => {
    const numbers = inputString.match(/\b\d+(\.\d+)?\b/g);
    return numbers ? numbers.join('  ') : ' ';
  };
  const toggleAllMeasurements = () => {
    setShowAllMeasurements((prevShowAllMeasurements) => !prevShowAllMeasurements);
    setExpandedMeasurement(null); // Reset expanded measurement when toggling all measurements
  };

  const toggleItemExpansion = (index) => {
    setHistoryData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index].expanded = !updatedData[index].expanded;

      // Reset expandedMeasurement for all items when toggling individual items
      updatedData.forEach((item) => {
        item.expandedMeasurement = null;
      });

      return updatedData;
    });
  };
  const toggleAllMeasurementsVisibility = () => {
    setExpandedMeasurement(null); // Reset expanded measurement when toggling all measurements

    // Toggle visibility for all measurements
    setHistoryData((prevData) => {
      return prevData.map((item) => ({
        ...item,
        expanded: !showAllMeasurements,
        expandedMeasurement: null,
      }));
    });

    setShowAllMeasurements((prevShowAllMeasurements) => !prevShowAllMeasurements);
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleAllMeasurementsVisibility}>
          <MaterialCommunityIcons
            name={showAllMeasurements ? "eye" : "eye-off"}
            size={24}
            color='#0096FF'
          />
        </TouchableOpacity>
      </View>

      {showFilterOptions && (
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterItem} onPress={() => setShowStartDatePicker(true)}>
            <Text style={styles.filterItemText}>Start Date</Text>
            <Text style={styles.dateText}>
              {startDate && startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterItem} onPress={() => setShowEndDatePicker(true)}>
            <Text style={styles.filterItemText}>End Date</Text>
            <Text style={styles.dateText}>
              {endDate && endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterItem} onPress={showModal}>
            <Text style={styles.filterItemText}>Device</Text>
            <Text style={styles.dateText}>{deviceName}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterItem} onPress={clearFilters}>
            <Text style={styles.filterItemText1}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={handleStartDateChange}
          minimumDate={endDate || undefined}

          maximumDate={new Date()}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate || undefined}

          maximumDate={new Date()}
        />
      )}

      <View style={styles.container1}>
        <FlatList
          data={historyData}
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
                  {`Measurement: ${item.expanded ? extractNumbers(item.measurement) : ''
                    }`}
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



      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Choose Device</Text>
            <FlatList
              data={devices}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.deviceButton} onPress={() => onSelectDevice(item)}>
                  <Text style={styles.deviceButtonText}>{item}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <Pressable
              style={styles.buttonClose}
              onPress={hideModal}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
    alignItems: 'center',
  },
  icon: {
    marginLeft: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    alignItems: 'center',
  },
  filterItem: {
    backgroundColor: '#2ecc71',
    paddingVertical: 2,
    paddingHorizontal: 20,
    borderRadius: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  filterItem1: {
    backgroundColor: '#2ecc71',
    paddingVertical: 7.5,
    paddingHorizontal: 20,
    borderRadius: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  filterItem2: {
    backgroundColor: '#2ecc71',
    paddingVertical: 11.5,
    paddingHorizontal: 20,
    borderRadius: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  filterItemText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,

  },
  filterItemText1: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  separator1: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  dateText1: {
    color: '#fff',
    fontSize: 6,
    fontWeight: 'bold',
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    color: '#333',
    fontSize: 14,
  },
  dateText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  goBackButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 20,
    alignSelf: 'center',
  },
  goBackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 200,
    marginBottom: 200,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonClose: {
    borderRadius: 20,
    padding: 10,
    elevation: 1,
    marginTop: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deviceButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  container1: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
    marginTop: 10,
  },
  deviceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
  },
  eyeIcon: {
    marginRight: 10,
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
});

export default History;
