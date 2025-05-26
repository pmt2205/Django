import { Image, ScrollView, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { useContext, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatchContext } from "../../configs/MyContexts";

const Login = () => {
  const info = [
    {
      label: "Tên đăng nhập",
      field: "username",
      secureTextEntry: false,
      icon: "text"
    },
    {
      label: "Mật khẩu",
      field: "password",
      secureTextEntry: true,
      icon: "eye"
    }
  ];

  const [user, setUser] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();
  const dispatch = useContext(MyDispatchContext);

  const setState = (value, field) => {
    setUser({ ...user, [field]: value });
  };

  const validate = () => {
    for (let i of info) {
      if (!(i.field in user) || user[i.field] === '') {
        setMsg(`Vui lòng nhập ${i.label}!`);
        return false;
      }
    }
    return true;
  };

  const login = async () => {
    if (validate() === true) {
      try {
        setLoading(true);

        const formData = new FormData();
        formData.append('username', user.username);
        formData.append('password', user.password);
        formData.append('client_id', 'SAuXt4asBLMJxSBNpqlOqGBRjQvxWyIG8HxIGXBy');
        formData.append('client_secret', 'PbJBF7nxc05ApQRjOBtHY4IzOXmLs3EfbeCqlZ2Ry5nDCOfp3f8ywSDcjBzhatHvtZnOP2LS3j6JXIakYH2Tj43sNRL9QHA4tXIxioChze4kxV7GUqnF95ADIK8Hf1oy');
        formData.append('grant_type', 'password');

        let res = await Apis.post(endpoints['login'], formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        await AsyncStorage.setItem('token', res.data.access_token);

        let u = await authApis(res.data.access_token).get(endpoints['current-user']);

        dispatch({
          type: "login",
          payload: u.data
        });
        nav.navigate("home");
      } catch (ex) {
        console.error(ex);
        setMsg("Đăng nhập thất bại, vui lòng kiểm tra lại thông tin!");
      } finally {
        setLoading(false);
      }
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
            <Text style={MyStyles.authTitle}>Chào mừng bạn trở lại!</Text>

            {msg && <Text style={MyStyles.errorText}>{msg}</Text>}

            {info.map(i => (
              <TextInput
                key={`${i.label}${i.field}`}
                value={user[i.field]}
                onChangeText={t => setState(t, i.field)}
                label={i.label}
                secureTextEntry={i.secureTextEntry}
                mode="outlined"
                style={MyStyles.formInput}
                outlineColor="#ffcccc"
                activeOutlineColor="#ff8888"
                right={<TextInput.Icon icon={i.icon} />}
              />
            ))}

            <Button
              onPress={login}
              disabled={loading}
              loading={loading}
              mode="contained"
              style={MyStyles.formButton}
              labelStyle={MyStyles.formButtonLabel}
            >
              Đăng nhập
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
