import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { authApis, endpoints } from "../../configs/Apis";
import MyStyles from "../../styles/MyStyles";

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    return await AsyncStorage.getItem("token");
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.");
        return;
      }

      const res = await authApis(token).get(endpoints["notifications"]);
      setNotifications(res.data);
    } catch (error) {
      console.error("Lỗi loadNotifications:", error);
      Alert.alert("Lỗi", "Không thể tải thông báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#fa6666"
        style={{ marginTop: 20 }}
      />
    );
  }

  return (
    <View style={MyStyles.container}>
      <View style={MyStyles.industrySection}>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={MyStyles.listItemShadow}>
              <TouchableOpacity
                onPress={() => {
                  if (item.jobId) {
                    navigation.navigate("JobDetail", { jobId: item.jobId });
                  } else {
                    Alert.alert("Thông báo", item.message);
                  }
                }}
                style={MyStyles.listItem}
              >
                <View style={{ flex: 1 }}>
                  <Text style={MyStyles.titleText}>{item.message}</Text>
                  <Text style={MyStyles.listDescription}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                fontSize: 16,
                color: "#999",
              }}
            >
              Không có thông báo nào.
            </Text>
          }
        />
      </View>
    </View>
  );
};

export default NotificationScreen;
