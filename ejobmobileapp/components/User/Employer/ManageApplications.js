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
import MyStyles from '../../../styles/MyStyles';

const ManageApplications = () => {
  const user = useContext(MyUserContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setApplications([]);
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
    setMsg(null);
    try {
      const token = await AsyncStorage.getItem('token');
      await authApis(token).patch(`/applications/${appId}/`, { status: newStatus });
      setMsg(`Đã cập nhật trạng thái: ${newStatus}`);
      await loadApplications();
    } catch (err) {
      console.error(err);
      setMsg('Không thể cập nhật trạng thái.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return '#007bff';
      case 'viewed': return '#ffa500';
      case 'interview': return '#800080';
      case 'accepted': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading)
    return <ActivityIndicator size="large" color="#fa6666" style={{ marginTop: 20 }} />;

  if (applications.length === 0)
    return <Text style={{ padding: 20, fontSize: 16 }}>Không có hồ sơ ứng tuyển nào.</Text>;

  return (
    <ScrollView style={MyStyles.container}>
      <View style={MyStyles.industrySection}>
        {msg && (
          <Text style={{ textAlign: 'center', color: msg.includes("") ? "green" : "red", marginVertical: 10 }}>
            {msg}
          </Text>
        )}

        {applications.map((app) => (

          <View key={app.id} style={MyStyles.listItemShadow}>
            <View style={MyStyles.listItem}>
              <Image
                source={{ uri: getCompanyLogo(app.job.company) || 'https://via.placeholder.com/100' }}
                style={MyStyles.avatar}
              />
              <View style={{ flex: 1, justifyContent: 'center', paddingRight: 10 }}>
                <Text style={MyStyles.titleText}>{app.candidate.username}</Text>
                <Text style={MyStyles.listDescription}>Email: {app.candidate.email}</Text>
                <Text style={MyStyles.listDescription}>Việc làm: {app.job.title}</Text>
                <Text style={[MyStyles.listDescription, { color: getStatusColor(app.status), fontWeight: 'bold' }]}>
                  Trạng thái: {app.status_display || app.status}
                </Text>
                <Text style={MyStyles.listDescription}>
                  Ngày ứng tuyển: {new Date(app.applied_date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {(app.status === 'viewed' || app.status === 'interview') && (
              <View style={{
                flexDirection: 'row',
                flexWrap: 'nowrap',   // Không cho xuống hàng
                justifyContent: 'space-around', // Cách đều các nút
                marginBottom: 15,
                paddingHorizontal: 10, // padding 2 bên cho đẹp
              }}>
                {[
                  { label: 'Đã xem', value: 'viewed', color: '#ffcc80' },
                  { label: 'Phỏng vấn', value: 'interview', color: '#d1c4e9' },
                  { label: 'Nhận', value: 'accepted', color: '#a5d6a7' },
                  { label: 'Từ chối', value: 'rejected', color: '#ef9a9a' },
                ].map(({ label, value, color }) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => updateStatus(app.id, value)}
                    style={{
                      backgroundColor: color,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                      elevation: 3,
                      minWidth: 70,
                      alignItems: 'center',
                      marginHorizontal: 5,
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: '#333', fontWeight: '600', fontSize: 14 }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>


            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ManageApplications;
