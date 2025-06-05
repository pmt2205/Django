import React, { useState, useEffect, useContext } from "react";
import {
    ScrollView,
    View,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext, MyDispatchContext } from "../../configs/MyContexts";
import MyStyles from "../../styles/MyStyles";
import { authApis, endpoints } from "../../configs/Apis";

const ROLE_LABELS = {
    admin: "Quản trị viên",
    employer: "Nhà tuyển dụng",
    candidate: "Ứng viên",
};


const EditProfile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        address: "",
        bio: "",
    });

    useEffect(() => {
        if (user) {
            setForm({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                address: user.address || "",
                bio: user.bio || "",
            });
        }
    }, [user]);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
  setLoading(true);
  setMsg(null);
  try {
    const token = await AsyncStorage.getItem("token");

    // Tạo formData
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    // Gửi formData với header đúng
    await authApis(token).patch(endpoints["current-user"], formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Reload user data
    const res = await authApis(token).get(endpoints["current-user"]);
    dispatch({ type: "update", payload: res.data });

    setMsg("Cập nhật thông tin thành công.");
  } catch (err) {
    console.error(err);
    setMsg("Có lỗi xảy ra khi cập nhật.");
  } finally {
    setLoading(false);
  }
};


    if (!user) return <Text style={{ padding: 16 }}>Đang tải thông tin người dùng...</Text>;

    return (
        <ScrollView style={MyStyles.container} contentContainerStyle={{ padding: 16 }}>
            <Text style={MyStyles.sectionTitle}>Chỉnh sửa thông tin cá nhân</Text>
            
            {/* Có thể chỉnh sửa */}
            <TextInput
                label="Họ"
                mode="outlined"
                value={form.first_name}
                onChangeText={(text) => handleChange("first_name", text)}
                style={MyStyles.formInput}
                outlineColor="#ffcccc"
                activeOutlineColor="#ff8888"
            />

            <TextInput
                label="Tên"
                mode="outlined"
                value={form.last_name}
                onChangeText={(text) => handleChange("last_name", text)}
                style={MyStyles.formInput}
                outlineColor="#ffcccc"
                activeOutlineColor="#ff8888"
            />
            

            <TextInput
                label="Địa chỉ"
                mode="outlined"
                value={form.address}
                onChangeText={(text) => handleChange("address", text)}
                style={MyStyles.formInput}
                outlineColor="#ffcccc"
                activeOutlineColor="#ff8888"
                multiline
                numberOfLines={2}
            />

            <TextInput
                label="Giới thiệu bản thân"
                mode="outlined"
                value={form.bio}
                onChangeText={(text) => handleChange("bio", text)}
                style={MyStyles.formInput}
                outlineColor="#ffcccc"
                activeOutlineColor="#ff8888"
                multiline
                numberOfLines={5}
            />

            {/* Không chỉnh sửa */}
            <TextInput
                label="Email"
                mode="outlined"
                value={user.email}
                disabled
                style={MyStyles.formInput}
            />

            <TextInput
                label="Số điện thoại"
                mode="outlined"
                value={user.phone || "Chưa cập nhật"}
                disabled
                style={MyStyles.formInput}
            />

            <TextInput
                label="Vai trò"
                mode="outlined"
                value={ROLE_LABELS[user.role] || user.role}
                disabled
                style={MyStyles.formInput}
            />

            
            {msg && (
                <Text
                    style={{
                        color: msg.includes("thành công") ? "green" : "red",
                        textAlign: "center",
                        marginVertical: 8,
                    }}
                >
                    {msg}
                </Text>
            )}

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={{
                    backgroundColor: "#fa6666",
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    alignItems: "center",
                    marginTop: 10,
                    opacity: loading ? 0.6 : 1,
                }}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Cập nhật</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

export default EditProfile;
