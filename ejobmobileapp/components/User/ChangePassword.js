import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangePassword = () => {
  const [form, setForm] = useState({
    new_password: "",
    confirm_password: ""
  });

  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const setField = (value, field) => {
    setForm({ ...form, [field]: value });
  };

  const validate = () => {
    if (!form.new_password || !form.confirm_password) {
      setMsg("Vui lòng nhập đầy đủ mật khẩu mới và xác nhận.");
      return false;
    }
    if (form.new_password !== form.confirm_password) {
      setMsg("Mật khẩu mới và xác nhận không trùng khớp!");
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      // Tạo formData tương tự login
      const formData = new FormData();
      formData.append("password", form.new_password);

      let res = await authApis(token).patch(endpoints["current-user"], formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        setMsg("Đổi mật khẩu thành công!");
        setForm({ new_password: "", confirm_password: "" });
      } else {
        setMsg("❌ Đổi mật khẩu thất bại, lỗi server.");
      }
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);

      if (err.response) {
        setMsg("❌ " + JSON.stringify(err.response.data));
      } else if (err.request) {
        setMsg("❌ Không nhận được phản hồi từ server.");
      } else {
        setMsg("❌ Lỗi khi gửi yêu cầu: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={MyStyles.container} contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled">
        <Text style={MyStyles.sectionTitle}>Đổi mật khẩu</Text>

        {msg && <Text style={MyStyles.errorText}>{msg}</Text>}

        <TextInput
          label="Mật khẩu mới"
          mode="outlined"
          value={form.new_password}
          onChangeText={(t) => setField(t, "new_password")}
          style={MyStyles.formInput}
          outlineColor="#ffcccc"
          activeOutlineColor="#ff8888"
          right={<TextInput.Icon icon="lock" />}
        />

        <TextInput
          label="Xác nhận mật khẩu"
          mode="outlined"
          value={form.confirm_password}
          onChangeText={(t) => setField(t, "confirm_password")}
          style={MyStyles.formInput}
          outlineColor="#ffcccc"
          activeOutlineColor="#ff8888"
          right={<TextInput.Icon icon="lock-check" />}
        />

        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={loading}
          mode="contained"

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
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Cập nhật mật khẩu</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;
