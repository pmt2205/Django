import React, { useState, useEffect } from "react";
import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import Apis, { endpoints } from "../../configs/Apis";
import AsyncStorage from '@react-native-async-storage/async-storage';


const ApplyJob = ({ route, navigation }) => {
    const { job } = route.params;
    const [coverLetter, setCoverLetter] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Chọn file CV
    const pickCV = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            });

            if (res.assets && res.assets.length > 0 && res.assets[0].uri) {
                setCvFile({
                    uri: res.assets[0].uri,
                    name: res.assets[0].name,
                    type: res.assets[0].mimeType
                });
            }
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể chọn file CV.');
        }
    };


    const submitApplication = async () => {
        if (!cvFile) {
            Alert.alert('Lỗi', 'Bạn chưa chọn file CV.');
            return;
        }

        setUploading(true);

        try {
            const token = await AsyncStorage.getItem('token'); // <- thêm dòng này

            const formData = new FormData();
            formData.append('job', job.id);
            formData.append('cover_letter', coverLetter);
            formData.append('cv_custom', {
                uri: cvFile.uri,
                name: cvFile.name,
                type: cvFile.type || 'application/pdf'
            });

            const res = await Apis.post(endpoints['apply-job'], formData, {
                headers: {
                    'Authorization': `Bearer ${token}`, // <- thêm dòng này
                    'Content-Type': 'multipart/form-data'
                }
            });

            Alert.alert('Thành công', 'Bạn đã ứng tuyển thành công!');
            navigation.goBack();

        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Ứng tuyển thất bại. Vui lòng thử lại.');
        } finally {
            setUploading(false);
        }
    };


    return (
        <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
                Ứng tuyển: {job.title} - {job.company.name}
            </Text>

            <TouchableOpacity
                onPress={pickCV}
                style={{
                    backgroundColor: '#eee',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: cvFile ? '#4caf50' : '#ccc',
                }}
            >
                <Text>{cvFile ? `Đã chọn: ${cvFile.name}` : 'Chọn file CV (pdf, doc, docx)'}</Text>
            </TouchableOpacity>

            <TextInput
                placeholder="Thư mời (Cover Letter)"
                multiline
                numberOfLines={5}
                value={coverLetter}
                onChangeText={setCoverLetter}
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 12,
                    textAlignVertical: 'top',
                    marginBottom: 24,
                }}
            />

            <TouchableOpacity
                onPress={submitApplication}
                disabled={uploading}
                style={{
                    backgroundColor: '#ff5e5e',
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                }}
            >
                {uploading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Ứng tuyển</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

export default ApplyJob;
