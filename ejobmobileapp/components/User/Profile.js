import { useContext, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";
import { MyUserContext, MyDispatchContext } from "../../configs/MyContexts";
import { getFullMediaUrl } from "../../configs/Apis";
import ChangePassword from "./ChangePassword";
import FavoriteCompanies from "./FavoriteCompanies";
import EditProfile from "./EditProfile";


const Profile = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigation();
  const [activeTab, setActiveTab] = useState("Chỉnh sửa thông tin");

  // Tạo mảng tab tùy user.role
  const tabs = ["Chỉnh sửa thông tin", "Đổi mật khẩu"];
  if (user?.role === "candidate") {
    tabs.push("Công ty theo dõi");
  }

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    dispatch({ type: "logout" });
    nav.navigate("Trang chủ");
  };

  if (user === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fa6666" />
        <Text style={{ marginTop: 16 }}>Đang tải thông tin người dùng...</Text>
      </View>
    );
  }

  const renderUserHeader = () => {
    return (
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Image
          source={{ uri: getFullMediaUrl(user?.avatar) }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 10,
            borderWidth: 2,
            borderColor: "#fa6666",
          }}
          resizeMode="cover"
        />
        <Text style={{ fontSize: 22, fontWeight: "600", color: "#333" }}>
          {user?.first_name} {user?.last_name}
        </Text>
      </View>
    );
  };

    const renderTabs = () => (
    <View style={{
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
        backgroundColor: "#f8f8f8",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: activeTab === tab ? "#fa6666" : "transparent",
          }}
        >
          <Text
            style={{
              color: activeTab === tab ? "#fff" : "#333",
              fontWeight: "500",
            }}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );


  const renderContent = () => {
    switch (activeTab) {
      case "Chỉnh sửa thông tin":
        return <EditProfile />;
      case "Đổi mật khẩu":
        return <ChangePassword />;
      case "Công ty theo dõi":
        return <FavoriteCompanies />;
      default:
        return (
          <View style={{ padding: 16, backgroundColor: "#fff", borderRadius: 12 }}>
            <Text style={{ fontSize: 16, color: "#333" }}>
              Thông tin cá nhân sẽ được hiển thị ở đây.
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fefefe" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100, // để không bị nút "đăng xuất" che mất nội dung
        }}
      >
        {renderUserHeader()}
        {renderTabs()}
        <View style={{ marginBottom: 30 }}>{renderContent()}</View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
        }}
      >
        <Button
          mode="contained"
          onPress={logout}
          style={{
            backgroundColor: "#fa6666",
            borderRadius: 8,
            paddingVertical: 6,
          }}
          labelStyle={{ color: "#fff", fontWeight: "bold" }}
        >
          Đăng xuất
        </Button>
      </View>
    </View>
  );
};

export default Profile;
