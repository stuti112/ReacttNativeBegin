import React, { useState } from 'react';
import { View, Modal, Text, Button, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

const Dashboard = () => {
    const navigation = useNavigation(); // Initialize navigation
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileSelectedMessage, setFileSelectedMessage] = useState('');

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync();

        if (result.type === 'success') {
            setSelectedFile(result);
            setFileSelectedMessage('File selected: ' + result.name);

            // Upload the selected file using FormData
            const formData = new FormData();
            formData.append('file', {
                uri: result.uri,
                name: result.name,
                type: result.type,
            });

            axios
                .post('YOUR_UPLOAD_URL', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then((response) => {
                    console.log('File uploaded successfully');
                    // Handle the server response as needed

                    // Navigate back to the dashboard
                    navigation.goBack();
                })
                .catch((error) => {
                    console.error('File upload error:', error);
                    // Handle the error
                });
        }
    };

    return (
        <View>
            <Button title="Upload Your Image" onPress={() => setModalVisible(true)} />

            <Modal visible={isModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Choose a file to upload</Text>
                        <Button title="Select File" onPress={pickDocument} />

                        {selectedFile && (
                            <View>
                                <Text style={styles.fileSelectedMessage}>{fileSelectedMessage}</Text>
                                {/* You can add more UI components for user interaction */}
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: 300, // Set the width of the modal
    },
    modalText: {
        fontSize: 18,
        marginBottom: 10,
    },
    fileSelectedMessage: {
        fontSize: 16,
        marginTop: 10,
    },
});

export default Dashboard;
