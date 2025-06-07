import { Image, ScrollView, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { Button, HelperText, Text, TextInput, RadioButton } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import Apis, { endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";

const Register = () => {
  const roles = [
    { value: 'candidate', label: 'Ứng viên tìm việc' },
    { value: 'employer', label: 'Nhà tuyển dụng' }
  ];

  const requiredFields = [
    { label: "Tên", field: "first_name", icon: "account" },
    { label: "Họ và tên lót", field: "last_name", icon: "account" },
    { label: "Tên đăng nhập", field: "username", icon: "account" },
    { label: "Mật khẩu", field: "password", icon: "lock", secure: true },
    { label: "Xác nhận mật khẩu", field: "confirm", icon: "lock", secure: true }
  ];

  const [user, setUser] = useState({ role: 'candidate' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();

  const setState = (value, field) => {
    setUser({ ...user, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  }

  const pick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("Permission status:", status);

    if (status !== 'granted') {
      setErrors({ ...errors, avatar: "Cần cấp quyền truy cập ảnh!" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7
    });

    console.log("Pick result:", result);

    if (!result.canceled) {
      setState(result.assets[0], "avatar");
      setErrors({ ...errors, avatar: null });
    }
  }


  const validate = () => {
    let valid = true;
    const newErrors = {};

    requiredFields.forEach(({ field, label }) => {
      if (!user[field] || user[field].trim() === '') {
        newErrors[field] = `Vui lòng nhập ${label.toLowerCase()}`;
        valid = false;
      }
    });

    if (user.password !== user.confirm) {
      newErrors.confirm = "Mật khẩu không khớp!";
      valid = false;
    }

    if (!user.avatar) {
      newErrors.avatar = "Vui lòng chọn ảnh đại diện";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  const register = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      let formData = new FormData();

      for (let key in user) {
        if (key === 'confirm') continue;

        if (key === 'avatar' && user.avatar) {
          formData.append('avatar', {
            uri: user.avatar.uri,
            name: user.avatar.fileName || `avatar_${Date.now()}.jpg`,
            type: user.avatar.mimeType || 'image/jpeg'  // <-- đổi từ user.avatar.type sang user.avatar.mimeType
          });
        } else if (typeof user[key] === 'string' || typeof user[key] === 'number') {
          formData.append(key, user[key]);
        }
      }

      const response = await Apis.post(endpoints['register'], formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
      });

      nav.navigate('Đăng nhập');

    } catch (error) {
      console.log("Register error:", error);

      setErrors({
        general: error.response?.data?.message || error.message || "Lỗi kết nối đến server"
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={MyStyles.authWrapper}>
          <View style={MyStyles.authCard}>
            <Text style={MyStyles.authTitle}>Đăng ký tài khoản</Text>

            {errors.general && (
              <Text style={MyStyles.errorText}>{errors.general}</Text>
            )}

            {requiredFields.map(({ field, label, icon, secure }) => (
              <View key={field}>
                <TextInput
                  value={user[field] || ''}
                  onChangeText={t => setState(t, field)}
                  label={label}
                  secureTextEntry={secure}
                  mode="outlined"
                  style={MyStyles.formInput}
                  outlineColor="#ffcccc"
                  activeOutlineColor="#ff8888"
                  right={<TextInput.Icon icon={icon} />}
                  error={!!errors[field]}
                />
                {errors[field] && (
                  <HelperText type="error" visible={true}>
                    {errors[field]}
                  </HelperText>
                )}
              </View>
            ))}

            <View style={MyStyles.radioGroup}>
              {roles.map(role => (
                <View key={role.value} style={MyStyles.radioItem}>
                  <RadioButton
                    value={role.value}
                    status={user.role === role.value ? 'checked' : 'unchecked'}
                    onPress={() => setState(role.value, 'role')}
                  />
                  <Text>{role.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[MyStyles.avatarButton, errors.avatar && MyStyles.errorBorder]}
              onPress={pick}
            >
              <Text style={MyStyles.avatarButtonText}>Chọn ảnh đại diện</Text>
            </TouchableOpacity>

            {errors.avatar && (
              <HelperText type="error" visible={true}>
                {errors.avatar}
              </HelperText>
            )}
            {user.avatar && (
              <Image
                source={{ uri: user.avatar.uri }}
                style={MyStyles.avatar}
                resizeMode="cover"
              />
            )}

            <Button
              mode="contained"
              onPress={register}
              loading={loading}
              disabled={loading}
              style={[MyStyles.formButton, { marginTop: 20 }]}
              labelStyle={MyStyles.formButtonLabel}
            >
              Đăng ký
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;
