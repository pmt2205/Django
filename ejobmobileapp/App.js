import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./components/Home/Home";
import Login from "./components/User/Login";
import { Icon } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import JobDetail from "./components/Home/JobDetail";
import CompanyDetail from "./components/Home/CompanyDetail";
import Register from "./components/User/Register";
import { MyDispatchContext, MyUserContext } from "./configs/MyContexts";
import { useContext, useReducer } from "react";
import Profile from "./components/User/Profile";
import MyUserReducer from "./reducers/MyUserReducer";
import ApplyJobScreen from "./components/Home/ApplyJobScreen";
import SearchResult from "./components/Home/SearchResult";
import { Provider as PaperProvider } from 'react-native-paper';
import MyApplications from "./components/Home/MyApplications";
import ManageApplications from "./components/User/Employer/ManageApplications";
import ManageCompany from "./components/User/Employer/ManageCompany";

const Stack = createNativeStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="SearchResult" component={SearchResult} options={{ title: "Kết quả tìm kiếm" }} />
      <Stack.Screen name="jobDetail" component={JobDetail} options={{ title: 'Chi tiết việc làm' }} />
      <Stack.Screen name="companyDetail" component={CompanyDetail} options={{ title: 'Chi tiết công ty' }} />
      <Stack.Screen name="ApplyJob" component={ApplyJobScreen} options={{ title: "Ứng tuyển việc làm" }} />
    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  const user = useContext(MyUserContext);

  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="home"
        component={StackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: () => <Icon size={30} source="home" />
        }}
      />

      {user === null ? (
        <>
          <Tab.Screen
            name="login"
            component={Login}
            options={{ headerShown: false, tabBarIcon: () => <Icon size={30} source="account" /> }}
          />
          <Tab.Screen
            name="register"
            component={Register}
            options={{ title: 'Đăng ký', tabBarIcon: () => <Icon size={30} source="account-plus" /> }}
          />
        </>
      ) : user.role === "employer" ? (
        <>
          <Tab.Screen
            name="ManageCompany"
            component={ManageCompany}
            options={{ title: 'Quản lý công ty', tabBarIcon: () => <Icon size={30} source="file-cog" /> }}
          />
          <Tab.Screen
            name="ManageApplications"
            component={ManageApplications}
            options={{ title: 'Quản lý hồ sơ', tabBarIcon: () => <Icon size={30} source="file-cog" /> }}
          />
          <Tab.Screen
            name="profile"
            component={Profile}
            options={{ title: 'Tài khoản', tabBarIcon: () => <Icon size={30} source="account" /> }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="MyApplications"
            component={MyApplications}
            options={{ title: 'Ứng tuyển', tabBarIcon: () => <Icon size={30} source="file-document" /> }}
          />
          <Tab.Screen
            name="profile"
            component={Profile}
            options={{ title: 'Tài khoản', tabBarIcon: () => <Icon size={30} source="account" /> }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <PaperProvider>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <NavigationContainer>
            <TabNavigator />
          </NavigationContainer>
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </PaperProvider>
  );
}

export default App;
