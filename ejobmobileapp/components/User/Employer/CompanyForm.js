import React, { useState, useEffect } from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../../configs/Apis";
import MyStyles from "../../../styles/MyStyles";

import { Image } from "react-native";
import * as ImagePicker from 'expo-image-picker'; // ✅ THAY vì react-native-image-picker



const CompanyForm = ({ navigation }) => {
    const [company, setCompany] = useState({
        name: "",
        tax_code: "",
        address: "",
        description: "",
        status: "pending",
    });
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [msg, setMsg] = useState(null);
    const [images, setImages] = useState([]);


    const pickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            setMsg("Cần cấp quyền truy cập ảnh.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5, // hỗ trợ tối đa 5 ảnh nếu thiết bị cho phép
            quality: 1,
        });

        if (!result.canceled) {
            // Trường hợp multiple
            const selected = result.assets || [];
            setImages(selected);
        }
    };



    const getToken = async () => {
        return await AsyncStorage.getItem("token");
    };

    const loadCompany = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                setMsg("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.");
                navigation.navigate("Login");
                return;
            }

            const res = await authApis(token).get(endpoints["my-company"]);
            setCompany(res.data);
            setIsEdit(true);
        } catch (error) {
            if (error.response?.status === 404) {
                setIsEdit(false);
            } else {
                console.error("Lỗi loadCompany:", error);
                setMsg("Không thể tải thông tin công ty.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompany();
    }, []);

    const handleChange = (key, value) => {
        setCompany((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (!company.name.trim()) {
            setMsg("Tên công ty không được để trống.");
            return;
        }

        if (!isEdit && images.length < 3) {
            setMsg("Vui lòng chọn ít nhất 3 hình ảnh.");
            return;
        }

        setLoading(true);
        setMsg(null);

        try {
            const token = await getToken();
            if (!token) {
                setMsg("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.");
                navigation.navigate("Login");
                return;
            }

            const formData = new FormData();
            Object.entries(company).forEach(([key, value]) =>
                formData.append(key, value)
            );

            if (!isEdit) {
                images.forEach((img, idx) => {
                    formData.append("images", {
                        uri: img.uri,
                        type: img.mimeType || "image/jpeg",
                        name: img.fileName || `image_${idx}.jpg`,
                    });
                });

            }

            const config = {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            };

            if (isEdit) {
                await authApis(token).patch(endpoints["update-company-info"], company);
                setMsg("Cập nhật công ty thành công.");
            } else {
                await Apis.post(endpoints["register-company"], formData, config);
                setMsg("Tạo công ty mới thành công.");
            }

        } catch (error) {
            console.error("Lỗi submit:", error);
            setMsg("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return <ActivityIndicator size="large" color="#fa6666" style={{ marginTop: 30 }} />;
    }

    return (
        <ScrollView style={MyStyles.container} contentContainerStyle={{ padding: 16 }}>
            <Text style={MyStyles.sectionTitle}>
                {isEdit ? "Chỉnh sửa công ty" : "Tạo công ty mới"}
            </Text>

            <TextInput
                label="Tên công ty"
                mode="outlined"
                value={company.name}
                onChangeText={(text) => handleChange("name", text)}
                style={MyStyles.formInput}
                outlineColor="#ffcccc"
                activeOutlineColor="#ff8888"
            />

            <TextInput
                label="Mã số thuế"
                mode="outlined"
                value={company.tax_code}
                onChangeText={(text) => handleChange("tax_code", text)}
                style={MyStyles.formInput}
                outlineColor="#ffcccc"
                activeOutlineColor="#ff8888"
            />

            <TextInput
                label="Địa chỉ"
                mode="outlined"
                value={company.address}
                onChangeText={(text) => handleChange("address", text)}
                style={MyStyles.formInput}
                outlineColor="#ffcccc"
                activeOutlineColor="#ff8888"
                multiline
                numberOfLines={2}
            />

            <TextInput
                label="Mô tả"
                mode="outlined"
                value={company.description}
                onChangeText={(text) => handleChange("description", text)}
                style={MyStyles.formInput}
                outlineColor="#ffcccc"
                activeOutlineColor="#ff8888"
                multiline
                numberOfLines={5}
            />

            <TouchableOpacity
                onPress={pickImages}
                style={{
                    backgroundColor: "#ccc",
                    paddingVertical: 10,
                    marginBottom: 12,
                    borderRadius: 10,
                    alignItems: "center"
                }}
            >
                <Text>Chọn ảnh công ty</Text>
            </TouchableOpacity>

            <ScrollView horizontal>
                {images.map((img, idx) => (
                    <Image
                        key={idx}
                        source={{ uri: img.uri }}
                        style={{ width: 100, height: 100, marginRight: 8, borderRadius: 8 }}
                    />
                ))}
            </ScrollView>


            {/* ✅ Hiển thị thông báo */}
            {msg && (
                <Text style={{
                    color: msg.includes("thành công") ? "green" : "red",
                    textAlign: "center",
                    marginVertical: 8,
                }}>
                    {msg}
                </Text>
            )}

            <TouchableOpacity
                onPress={handleSubmit}
                style={{
                    backgroundColor: '#fa6666',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginTop: 8
                }}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    {isEdit ? "Cập nhật công ty" : "Tạo công ty mới"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default CompanyForm;
