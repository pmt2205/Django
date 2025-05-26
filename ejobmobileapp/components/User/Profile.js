import { useContext } from "react";
import { Text, View } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/MyContexts";
import { Button } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigation();

  const logout = async () => {
    await AsyncStorage.removeItem('token');  // Xóa token async
    dispatch({ type: "logout" });             // Cập nhật user = null
    nav.navigate("home");                     // Chuyển về home
  }

  return (
    <View>
      <Text style={MyStyles.subject}>Chào {user?.first_name} {user?.last_name}!</Text>
      <Button mode="contained" onPress={logout}>Đăng xuất</Button>
    </View>
  );
}

export default Profile;
