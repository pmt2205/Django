import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MyStyles from "../../../styles/MyStyles";
import CompanyForm from "./CompanyForm";
import CreateJob from "./CreateJob";
import MessagesList from "./MessagesList"; // 👈 Thêm dòng này

const ManageCompany = () => {
  const [activeTab, setActiveTab] = useState("Công ty");

  const renderTabMenu = () => {
    const tabs = ["Công ty", "Tạo việc làm", "Tin nhắn"]; // 👈 Thêm "Tin nhắn"
    return (
      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              marginRight: 10,
              borderBottomWidth: activeTab === tab ? 2 : 0,
              borderBottomColor: "#fa6666",
            }}
          >
            <Text
              style={{
                fontWeight: activeTab === tab ? "bold" : "normal",
                color: activeTab === tab ? "#fa6666" : "#444",
                fontSize: 16,
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Công ty":
        return <CompanyForm />;
      case "Tạo việc làm":
        return <CreateJob />;
      case "Tin nhắn":
        return <MessagesList />; // 👈 Gọi component tin nhắn
      default:
        return null;
    }
  };

  return (
    <View style={MyStyles.container}>
      {renderTabMenu()}
      {renderContent()}
    </View>
  );
};

export default ManageCompany;
