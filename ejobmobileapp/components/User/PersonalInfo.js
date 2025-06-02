import React from "react";
import { View, Text } from "react-native";
import MyStyles from "../../styles/MyStyles";

const PersonalInfo = ({ user }) => {
  return (
    <View>
      <Text style={MyStyles.label}>Số điện thoại:</Text>
      <Text style={MyStyles.text}>{user?.phone || "Chưa cập nhật"}</Text>

      <Text style={MyStyles.label}>Địa chỉ:</Text>
      <Text style={MyStyles.text}>{user?.address || "Chưa cập nhật"}</Text>

      <Text style={MyStyles.label}>Tiểu sử:</Text>
      <Text style={MyStyles.text}>{user?.bio || "Chưa cập nhật tiểu sử"}</Text>

      <Text style={MyStyles.label}>Trạng thái xác thực:</Text>
      <Text style={[MyStyles.text, { color: user?.is_verified ? "green" : "red" }]}>
        {user?.is_verified ? "Đã xác thực" : "Chưa xác thực"}
      </Text>
    </View>
  );
};

export default PersonalInfo;
