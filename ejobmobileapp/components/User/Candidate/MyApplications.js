import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MyUserContext } from '../../../configs/MyContexts';
import { endpoints, authApis, getCompanyLogo } from '../../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import MyStyles from '../../../styles/MyStyles';

const MyApplications = ({ navigation }) => {
  const user = useContext(MyUserContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setApplications([]);
          setLoading(false);
          return;
        }
        let res = await authApis(token).get(endpoints['my-applications']);
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused && user) {
      loadApplications();
    }
  }, [isFocused, user]);

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  if (applications.length === 0)
    return (
      <Text style={{ padding: 20, fontSize: 16 }}>
        Bạn chưa ứng tuyển công việc nào.
      </Text>
    );

  return (
    <ScrollView style={MyStyles.container}>
      <View style={MyStyles.industrySection}>
        {applications.map((app) => (
          <View key={app.id} style={MyStyles.listItemShadow}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('jobDetail', { job: app.job })
              }
              style={MyStyles.listItem}
              activeOpacity={0.8}
            >
              <Image source={{ uri: getCompanyLogo(app.job.company) }} style={MyStyles.avatar} />

              <View style={{ flex: 1, justifyContent: 'center', paddingRight: 10 }}>
                <Text style={MyStyles.titleText}>{app.job.title}</Text>
                <Text style={MyStyles.listDescription}>
                  {app.job.company.name}
                </Text>
                <Text style={[MyStyles.listDescription, { color: '#d40000' }]}>
                  Trạng thái: {app.status_display || app.status}
                </Text>
                <Text style={MyStyles.listDescription}>
                  Ngày ứng tuyển: {new Date(app.applied_date).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default MyApplications;
