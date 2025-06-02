import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Button, Alert } from 'react-native';
import { MyUserContext } from '../../../configs/MyContexts';
import { endpoints, authApis } from '../../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManageApplications = () => {
  const user = useContext(MyUserContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setApplications([]);
        setLoading(false);
        return;
      }
      const res = await authApis(token).get(endpoints['my-applications']);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const updateStatus = async (appId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await authApis(token).patch(`/applications/${appId}/`, { status: newStatus });
      Alert.alert('Thành công', `Đã cập nhật trạng thái: ${newStatus}`);
      await loadApplications(); // Reload
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'blue';
      case 'viewed': return 'orange';
      case 'interview': return 'purple';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  if (applications.length === 0)
    return <Text style={{ padding: 20 }}>Không có hồ sơ ứng tuyển nào.</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      {applications.map((app) => (
        <View
          key={app.id}
          style={{
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            backgroundColor: '#fff'
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{app.candidate.username}</Text>
          <Text>Email: {app.candidate.email}</Text>
          <Text>Việc làm: {app.job.title}</Text>
          <Text style={{
            fontWeight: 'bold',
            color: getStatusColor(app.status)
          }}>
            Trạng thái: {app.status_display || app.status}
          </Text>
          <Text>Ngày ứng tuyển: {new Date(app.applied_date).toLocaleDateString()}</Text>

          {/* Nếu trạng thái là "applied" hoặc "viewed" thì cho phép chuyển trạng thái */}
          {(app.status === 'applied' || app.status === 'viewed') && (
            <View style={{ flexDirection: 'row', marginTop: 10, flexWrap: 'wrap', gap: 10 }}>
              <Button title="Đánh dấu đã xem" onPress={() => updateStatus(app.id, 'viewed')} color="orange" />
              <Button title="Phỏng vấn" onPress={() => updateStatus(app.id, 'interview')} color="purple" />
              <Button title="Nhận" onPress={() => updateStatus(app.id, 'accepted')} color="green" />
              <Button title="Từ chối" onPress={() => updateStatus(app.id, 'rejected')} color="red" />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default ManageApplications;
