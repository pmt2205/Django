import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MyUserContext } from '../../configs/MyContexts';
import { endpoints, authApis } from '../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

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

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  if (applications.length === 0)
    return <Text style={{ padding: 20 }}>Bạn chưa ứng tuyển công việc nào.</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      {applications.map((app) => (
        <TouchableOpacity
          key={app.id}
          onPress={() => navigation.navigate('jobDetail', { job: app.job })}
          style={{
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            backgroundColor: '#fff'
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>{app.job.title}</Text>
          <Text>Công ty: {app.job.company.name}</Text>
          <Text >
                Trạng thái: {app.status_display || app.status}
          </Text>
          <Text>Ngày ứng tuyển: {new Date(app.applied_date).toLocaleDateString()}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default MyApplications;
