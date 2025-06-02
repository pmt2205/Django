import React, { useContext, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper"; 
import { MyUserContext, MyDispatchContext } from "../../../configs/MyContexts";
import MyStyles from "../../../styles/MyStyles";

import CreateJob from "../CreateJob";


const ManageCompany = () => {
  const [activeTab, setActiveTab] = useState("Công ty");

  const renderTabMenu = () => {
    const tabs = ["Công ty", "Tạo việc làm"];
    return (
      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        {tabs.map((tab) => (
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
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Công ty":
        return (
          <View>
            <Text>Form tạo hoặc cập nhật công ty ở đây</Text>
          </View>
        );
      case "Tạo việc làm":
            return  <CreateJob />;
        ;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {renderTabMenu()}
      {renderContent()}
    </View>
  );
};

export default ManageCompany;
