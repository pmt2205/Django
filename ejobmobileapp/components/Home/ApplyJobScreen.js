import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import Apis, { endpoints } from "../../configs/Apis";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyStyles from "../../styles/MyStyles";
import { TextInput } from 'react-native-paper';

const ApplyJob = ({ route, navigation }) => {
    const { job } = route.params;
    const [coverLetter, setCoverLetter] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState(null);

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
                setMsg(null);
            }
        } catch (err) {
            setMsg('Không thể chọn file CV.');
        }
    };

    const submitApplication = async () => {
        if (!cvFile) {
            setMsg('Bạn chưa chọn file CV.');
            return;
        }

        setUploading(true);
        setMsg(null);

        try {
            const token = await AsyncStorage.getItem('token');

            const formData = new FormData();
            formData.append('job', job.id);
            formData.append('cover_letter', coverLetter);
            formData.append('cv_custom', {
                uri: cvFile.uri,
                name: cvFile.name,
                type: cvFile.type || 'application/pdf'
            });

            await Apis.post(endpoints['apply-job'], formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMsg('Bạn đã ứng tuyển thành công!');
            setTimeout(() => navigation.goBack(), 1500);

        } catch (error) {
            console.error(error);
            setMsg('Ứng tuyển thất bại. Vui lòng thử lại.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
        >
            <View style={MyStyles.authWrapper}>
                <View style={MyStyles.authCard}>
                    <Text style={MyStyles.authTitle}>
                        {job.title}
                    </Text>
                    <Text style={{ color: '#f87d7d', fontSize: 14, marginBottom: 20 }}>
                        {job.company.name}
                    </Text>


                    <TouchableOpacity
                        onPress={pickCV}
                        activeOpacity={0.7}
                    >
                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: cvFile ? '#4caf50' : '#ff8888',
                                borderRadius: 4,
                                paddingHorizontal: 12,
                                paddingVertical: 14,
                                backgroundColor: '#fff',
                                justifyContent: 'center',
                                minHeight: 56,
                                marginBottom: 12
                            }}
                        >
                            <Text style={{ color: '#000' }}>
                                {cvFile ? `Đã chọn: ${cvFile.name}` : 'Chọn file CV (pdf, doc, docx)'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TextInput
                        label="Thư mời"
                        mode="outlined"
                        value={coverLetter}
                        onChangeText={setCoverLetter}
                        style={MyStyles.formInput}
                        outlineColor="#ffcccc"
                        activeOutlineColor="#ff8888"
                        multiline
                        numberOfLines={4}
                    />

                    {msg && (
                        <Text style={{
                            color: msg.includes('thành công') ? 'green' : 'red',
                            marginVertical: 8,
                            textAlign: 'center'
                        }}>
                            {msg}
                        </Text>
                    )}

                    <TouchableOpacity
                        onPress={submitApplication}
                        disabled={uploading}
                        style={MyStyles.formButton}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={MyStyles.formButtonLabel}>Ứng tuyển</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default ApplyJob;
