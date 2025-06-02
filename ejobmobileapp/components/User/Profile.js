import React, { useContext, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";

import { MyUserContext, MyDispatchContext } from "../../configs/MyContexts";
import MyStyles from "../../styles/MyStyles";

// import PersonalInfo from "./PersonalInfo";
import ChangePassword from "./ChangePassword";
import FavoriteCompanies from "./FavoriteCompanies";
// import SavedJobs from "./SavedJobs";
// import ManageCompany from "./ManageCompany";
import CreateJob from "./CreateJob";

const tabs = [
  "Thông tin cá nhân",
  "Đổi mật khẩu",
  "Công ty yêu thích",
  "Việc làm đã lưu",
];

const Profile = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigation();
  const [activeTab, setActiveTab] = useState("Thông tin cá nhân");

  const isEmployer = user?.role === "employer";

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    dispatch({ type: "logout" });
    nav.navigate("home");
  };

  const renderMenu = () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
      {tabs.map((tab) => {
        if ((tab === "Quản lý công ty" || tab === "Tạo việc làm mới") && !isEmployer) return null;
        return (  
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              padding: 10,
              marginRight: 10,
              borderBottomWidth: activeTab === tab ? 2 : 0,
              borderBottomColor: "#6200ee",
            }}
          >
            <Text style={{ fontWeight: activeTab === tab ? "bold" : "normal" }}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      // case "Thông tin cá nhân":
      //   return <PersonalInfo user={user} />;
      case "Đổi mật khẩu":
        return <ChangePassword />;
      case "Công ty yêu thích":
        return <FavoriteCompanies />;
      // case "Việc làm đã lưu":
      //   return <SavedJobs />;
      // case "Quản lý công ty":
      //   return isEmployer ? <ManageCompany /> : null;
      default:
        return null;
    }
  };

  const avatarUri = user?.avatar?.secure_url || "https://via.placeholder.com/150";

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={{ uri: avatarUri }}
          style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 10 }}
        />
        <Text style={[MyStyles.subject, { fontSize: 22 }]}>
          {user?.first_name} {user?.last_name}
        </Text>
      </View>

      {renderMenu()}
      <View>{renderContent()}</View>

      <Button mode="contained" onPress={logout} style={{ marginTop: 30 }}>
        Đăng xuất
      </Button>
    </ScrollView>
  );
};

export default Profile;
