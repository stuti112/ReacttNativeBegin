import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Dimensions } from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from './environment.js';
import SelectDropdown from 'react-native-select-dropdown';
import Toast from 'react-native-root-toast';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { Alert } from 'react-native';


const Chart = () => {
  const [defaultButtonText, setDefaultButtonText] = useState('Chart');
  const [historyData, setHistoryData] = useState([]);
  const [inform, setInform] = useState(false);
  const [apply, setApply] = useState('false');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [chartType, setChartType] = useState(''); // Default chart type is 'bar'
  const [labelWidth,setLabelWidth] = useState(60);

  const navigation = useNavigation();
  
 
  
  useEffect(() => {
    fetchHistoryData();
  }, [startDate, endDate, deviceName, chartType]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setDeviceName('');
    setChartType('');
    setDefaultButtonText('Chart');
    setInform(false);

  };
  const onSelectChart1 = (itemValue) => {
    setChartType(itemValue.toLowerCase().replace(' ', ''));
    // setShowBar(false);
    console.log(itemValue);
  };
  const showToast = (message) => {
    Toast.show(message, {
      position: Toast.positions.BOTTOM,
      containerStyle: { backgroundColor: 'red' },
      textStyle: { color: 'white' },
    });
  };
  const fetchHistoryData = async () => {
    const d = [];
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

      const response = await axios.post(
        BACKEND_URL + '/history',
        {
          device_name: deviceName,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          chart_type: chartType,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        console.log("History Data:", JSON.stringify(response.data, null, 2));
        if (response.data && response.data.length === 0) {
          setHistoryData([]);
          showToast("No data to display for the selected filter");

        } else {
          // Updated: Format the response data for the chart
          if(deviceName=="Blood Pressure Monitor"){
            setLabelWidth(160);
       
          response.data.map((item) => {
            d.push({
              date:item.date,
              measurement: parseFloat(item.measurement.split(":")[1]),
              spacing: 2,

            });

            d.push({ measurement: item.measurement.split(":")[2] });
          });
          }
          else{
          response.data.map((item) => {
            d.push({
              date: item.date,
              measurement: item.measurement.split(":")[1],
            });

          } );

        }
          
          // const filledData = d.slice(0, 16);
          const filteredData = d.filter((item) => !isNaN(item.measurement));
          setHistoryData(filteredData);
          console.log("formatted", historyData);
          console.log("width", labelWidth);

         
        }
      } else {
        console.error("Failed to fetch history data:", response.status);
      }
    } catch (err) {
      console.error("Error in Fetching History Data:", err);
      if (err.response) {
        console.error("Response Data:", err.response.data);
        console.error("Response Status:", err.response.status);
      }
    }
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
  const showChart = () => {


    if (historyData.length === 0) {
      setShowBar(false);
      setInform(true);
    }
    else {
    
      setShowBar(true);
      setInform(false);
    }
    console.log(showBar)
    console.log(historyData.length)
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const onSelectDevice = (itemValue) => {
    setDeviceName(itemValue);
    setShowBar(false);
    setInform(false);
    hideModal();
  };
  const onSelectChart = (itemValue) => {
    setChartType(itemValue);
    console.log(itemValue)
  };

  const devices = ['Blood Pressure Monitor', 'Oximeter', 'Glucometer', 'Thermometer'];
  const chartTypes = ['Bar Chart', 'Line Chart'];
  const propsForBars = historyData.map((item, index) => ({
    colors: [`rgba(${index * 20}, ${index * 40}, ${index * 60}, 1)`],
  }));
  return (
    <View style={styles.container}>
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

        <SelectDropdown
          data={chartTypes}
          defaultButtonText="Select Chart"
          defaultIndex={chartType} // Index of 'Bar Chart' in the chartTypes array
          onSelect={(selectedItem, index) => {
            onSelectChart1(selectedItem.toLowerCase().replace(' ', ''));
          }}
          buttonTextAfterSelection={() => (
            <View style={styles.dropdownButtonTextContainer}>
              <Text style={styles.filterItemText}>Chart</Text>
              <Text style={styles.dateText}>{chartType}</Text>
            </View>
          )}
          rowTextForSelection={(item) => item}
          renderCustomizedButtonChild={(selectedItem, index) => (
            <View style={styles.dropdownButtonTextContainer}>
              <Text style={styles.filterItemText}>Chart</Text>
              <Text style={styles.dateText}>{chartType}</Text>
            </View>
          )}
          buttonStyle={styles.filterItem3}
          buttonTextStyle={{
            fontSize: 11,
            color: '#fff',
            fontWeight: 'bold',

          }}
          dropdownStyle
          rowStyle
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.commonButton} onPress={clearFilters}>
          <Text style={styles.filterItemText}>Clear Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={showChart}
          style={[
            styles.commonButton,
            {
              backgroundColor: !startDate || !endDate || !deviceName || !chartType || showStartDatePicker || showEndDatePicker
                ? '#8e8e8e' // Color when disabled
                : '#2ecc71', // Color when enabled
            },
          ]}
          disabled={!startDate || !endDate || !deviceName || !chartType || showStartDatePicker || showEndDatePicker}
        >
          <Text style={styles.filterItemText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={handleStartDateChange}
          minimumDate={endDate || undefined}  // Minimum date is today

          maximumDate={new Date()}  // Maximum date is the selected end date
        />
      )}

      {showEndDatePicker && startDate && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate || undefined}
          maximumDate={new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)} 
         
        />
      )}
      {inform && (
        <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 23, textAlign: 'center', textAlignVertical: 'center', flex: 1 }}>
          No Data To Display
        </Text>
      )}
      {chartType === 'barchart' && showBar && (
        <BarChart
          barWidth={60}
          noOfSections={4}
          barBorderRadius={4}
          frontColor="lightgray"
          data={historyData.map((item, index) => ({
            value: parseFloat(item.measurement),
            label: item.date,
           
            dataPointText: parseFloat(item.measurement),
            frontColor: `rgba(${index * 20}, ${index * 40}, ${index * 30}, 1)`,
          }))}
          // xAxisLabelsHeight={18}
          yAxisThickness={0}
          xAxisThickness={0}
          // Correct placement for rotating X-axis labels
          isAnimated
          showLine
          labelWidth={labelWidth}
          // xAxisLabelsVerticalShift={100}
        />
      )}
      {chartType === 'linechart' && showBar && (
        <LineChart
       
          data={historyData.map((item, index) => ({
            value: parseFloat(item.measurement),
            dataPointText: parseFloat(item.measurement),
            label: item.date,
          }))}
          // data2={lineData2}
          height={250}
          showVerticalLines
          spacing={84}
          initialSpacing={50}
          dataPointText
          // color1="skyblue"
          color1="orange"
          textColor="green"
          dataPointsHeight={6}
          dataPointsWidth={6}
          dataPointsColor="blue"
          // dataPointsColor2="red"
          textShiftY={0}
          textShiftX={0}
          textFontSize={13}
         
          // rotateLabel={90} 
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Choose Device</Text>
            {devices.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.deviceButton}
                onPress={() => onSelectDevice(item)}
              >
                <Text style={styles.deviceButtonText}>{item}</Text>
              </TouchableOpacity>
            ))}
            <Pressable style={styles.buttonClose} onPress={hideModal}>
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
  filterItem2: {
    backgroundColor: '#2ecc71',
    paddingVertical: 6.5,
    paddingHorizontal: 20,
    borderRadius: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  filterItem3: {
    backgroundColor: '#2ecc71',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 5,
    marginHorizontal: 0,
    height: 34,
    borderRadius: 0,
    width: 80,
  },
  filterItem1: {
    backgroundColor: '#2ecc71',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 215,
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 26,
  },
  filterItem4: {
    backgroundColor: '#2ecc71',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 5,
    marginHorizontal: 195,
    alignItems: 'center',
    marginTop: -30.5,
    marginRight: 83,
  },
  filterItemText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12, // Adjust the font size based on your preference
  },
  icon: {
    marginLeft: 5,
  },
  chartTypeDropdown: {
    backgroundColor: '#2ecc71',
    paddingVertical: 9,
    paddingHorizontal: 3,
    borderRadius: 5,
    marginHorizontal: 12,
    height: 39,
    width: 120,
  },
  dropdownButtonTextContainer: {
    
    flexDirection: 'column', // Arrange text components vertically
    alignItems: 'center', // Center horizontally
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  commonButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
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
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
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
    backgroundColor: '#3498db',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  deviceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  customYAxisLabel: {
    position: 'absolute',
    top: 100, // Adjust the top position based on your preference
    left: 80, // Adjust the left position based on your preference
    fontWeight: 'bold',
    color: 'black',
  },

  customXAxisLabel: {
    position: 'absolute',
    bottom: 10, // Adjust the bottom position based on your preference
    left: Dimensions.get('window').width / 2 - 40, // Centered horizontally
    fontWeight: 'bold',
  },
  dateText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText1: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  dateAndDeviceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    alignItems: 'center',
  },
  dateAndDeviceText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default Chart;