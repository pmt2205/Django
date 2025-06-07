import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./components/Home/Home";
import Login from "./components/User/Login";
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
import MyApplications from "./components/User/Candidate/MyApplications";
import ManageApplications from "./components/User/Employer/ManageApplications";
import ManageCompany from "./components/User/Employer/ManageCompany";
import NotificationScreen from "./components/User/NotificationScreen";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import ChatScreen from "./components/User/ChatScreen";
import MessagesList from "./components/User/Employer/MessagesList";

const RootStack = createNativeStackNavigator();

const Stack = createNativeStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="SearchResult" component={SearchResult} options={{
        title: "Kết quả tìm kiếm",
        headerBackground: () => (
          <LinearGradient
            colors={['#ff5e5e', '#fffafc']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        ),
      }} />
      <Stack.Screen name="jobDetail" component={JobDetail} options={{
        title: "Việc làm chi tiết",
        headerBackground: () => (
          <LinearGradient
            colors={['#ff5e5e', '#fffafc']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        ),
      }} />
      <Stack.Screen name="companyDetail" component={CompanyDetail} options={{
        title: "Thông tin công ty",
        headerBackground: () => (
          <LinearGradient
            colors={['#ff5e5e', '#fffafc']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        ),
      }} />
      <Stack.Screen name="ApplyJob" component={ApplyJobScreen} options={{
        title: "Kết quả tìm kiếm",
        headerBackground: () => (
          <LinearGradient
            colors={['#ff5e5e', '#fffafc']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        ),
      }} />

    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  const user = useContext(MyUserContext);

  return (
    <Tab.Navigator screenOptions={{
      headerShown: true, tabBarActiveTintColor: '#d40000',
    }}>
      <Tab.Screen
        name="Trang chủ"
        component={StackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color="#d40000" />
          ),
        }}
      />

      {user === null ? (
        <>
          <Tab.Screen
            name="Đăng nhập"
            component={Login}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Icon name="account" size={size} color="#d40000" />
              ),
            }}
          />
          <Tab.Screen
            name="Đăng ký"
            component={Register}
            options={{
              title: 'Đăng ký',
              tabBarIcon: ({ color, size }) => (
                <Icon name="account-plus" size={size} color="#d40000" />
              ),
            }}
          />
        </>
      ) : user.role === "employer" ? (
        <>
          <Tab.Screen
            name="Quản lý công ty"
            component={ManageCompany}
            options={{
              title: 'Quản lý công ty',
              tabBarIcon: ({ color, size }) => (
                <Icon name="file-cog" size={size} color="#d40000" />
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#ff5e5e', '#fffafc']}
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Quản lý tin nhắn"
            component={MessagesList}
            options={{
              title: 'Quản lý tin nhắn',
              tabBarIcon: ({ color, size }) => (
                <Icon name="file-cog" size={size} color="#d40000" />
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#ff5e5e', '#fffafc']}
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Quản lý hồ sơ"
            component={ManageApplications}
            options={{
              title: 'Quản lý hồ sơ',
              tabBarIcon: ({ color, size }) => (
                <Icon name="file-cog" size={size} color="#d40000" />
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#ff5e5e', '#fffafc']}
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              ),
            }}

          />
          <Tab.Screen
            name="Thông báo"
            component={NotificationScreen}
            options={{
              title: 'Thông báo',
              tabBarIcon: ({ color, size }) => (
                <Icon name="bell" size={size} color="#d40000" />
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#ff5e5e', '#fffafc']}
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Tài khoản"
            component={Profile}
            options={{
              title: 'Tài khoản',
              tabBarIcon: ({ color, size }) => (
                <Icon name="account" size={size} color="#d40000" />
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#ff5e5e', '#fffafc']}
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              ),

            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="MyApplications"
            component={MyApplications}
            options={{
              title: 'Ứng tuyển',
              tabBarIcon: ({ color, size }) => (
                <Icon name="file-document" size={size} color="#d40000" />
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#ff5e5e', '#fffafc']}
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Thông báo"
            component={NotificationScreen}
            options={{
              title: 'Thông báo',
              tabBarIcon: ({ color, size }) => (
                <Icon name="bell" size={size} color="#d40000" />
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#ff5e5e', '#fffafc']}
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Tài khoản"
            component={Profile}
            options={{
              title: 'Tài khoản',
              tabBarIcon: ({ color, size }) => (
                <Icon name="account" size={size} color="#d40000" />
              ),
              headerBackground: () => (
                <LinearGradient
                  colors={['#ff5e5e', '#fffafc']}
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              ),
            }}
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
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
              <RootStack.Screen name="MainTabs" component={TabNavigator} />
              <RootStack.Screen
                name="ChatScreen"
                component={ChatScreen}
                options={{
                  headerShown: true, title: 'Tin nhắn', headerBackground: () => (
                    <LinearGradient
                      colors={['#ff5e5e', '#fffafc']}
                      style={{ flex: 1 }}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                  ),
                }}
              />
            </RootStack.Navigator>
          </NavigationContainer>
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </PaperProvider>
  );
}

export default App;
