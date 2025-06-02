import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View, Image, Linking } from "react-native";
import { Text, Card } from "react-native-paper";
import Apis, { endpoints } from "../../configs/Apis";
import MyStyles from "../../styles/MyStyles";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatToMillions } from '../../utils/format'
import { TouchableOpacity, Share } from 'react-native';

const getCompanyImage = (company) => {
    if (!company) return '';
    if (Array.isArray(company.images)) {
        return company.images[0]?.image || '';
    }
    if (Array.isArray(company.image)) {
        return company.image[0]?.image || '';
    }
    return company.image || '';
};

const JobDetail = ({ route, navigation }) => {
    const jobId = route.params?.jobId;
    const [job, setJob] = useState(null);

    const loadJob = async () => {
        try {
            let res = await Apis.get(endpoints['job-detail'](jobId));
            setJob(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadJob();
    }, [jobId]);

    return (
        <ScrollView style={MyStyles.container} contentContainerStyle={{ padding: 16 }}>
            {job === null ? (
                <ActivityIndicator size="large" color="#fa6666" />
            ) : (
                <View style={{ alignItems: 'center' }}>
                    {/* Logo Công ty */}
                    <Image source={{ uri: getCompanyImage(job.company) || getCompanyImage(company) }}

                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 10,
                            marginBottom: -40, // Nửa chiều cao để box trùm lên
                            zIndex: 2,
                            backgroundColor: '#fff',
                            elevation: 12, // Android
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                        }}
                    />

                    {/* Box trắng chồng lên dưới logo */}
                    <Card style={{
                        width: '100%',
                        backgroundColor: '#ffffff',
                        borderRadius: 16,
                        paddingTop: 40,
                        elevation: 4,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        marginTop: -10, // đẩy lên dưới logo
                        zIndex: 1
                    }}>
                        <Card.Content style={{ alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: 18 }}>{job.title}</Text>
                            <Text style={{ fontWeight: "bold", fontSize: 18 }}> {job.company.name}
                            </Text>
                            <View style={MyStyles.infoRow}>
                                {/* Box 1: Địa điểm */}
                                <View style={MyStyles.infoBox}>
                                    <View style={MyStyles.iconWrapper}>
                                        <Icon name="map-marker" size={24} color="#d40000" />
                                    </View>
                                    <Text style={MyStyles.infoText}>{job.location}</Text>
                                </View>

                                {/* Divider 1 */}
                                <View style={MyStyles.verticalDivider} />

                                {/* Box 2: Lương */}
                                <View style={MyStyles.infoBox}>
                                    <View style={MyStyles.iconWrapper}>
                                        <Icon name="currency-usd" size={24} color="#d40000" />
                                    </View>
                                    <Text style={MyStyles.infoText} numberOfLines={2} ellipsizeMode="tail">
                                        <Text style={MyStyles.infoText}>
                                            {formatToMillions(job.salary_from, job.salary_to, job.salary_type)}
                                        </Text>
                                    </Text>
                                </View>

                                {/* Divider 2 */}
                                <View style={MyStyles.verticalDivider} />

                                {/* Box 3: Ngành */}
                                <View style={MyStyles.infoBox}>
                                    <View style={MyStyles.iconWrapper}>
                                        <Icon name="briefcase" size={24} color="#d40000" />
                                    </View>
                                    <Text style={MyStyles.infoText}>{job.industry.name}</Text>
                                </View>
                            </View>


                        </Card.Content>
                    </Card>

                    {/* Nội dung chi tiết bên dưới */}
                    <View style={{ width: '100%', marginTop: 24 }}>
                        <Text style={{ marginBottom: 6 }}>
                            <Text style={{ fontWeight: "bold" }}>Mô tả công việc:</Text> {job.description}
                        </Text>

                        <Text style={{ marginBottom: 6 }}>
                            <Text style={{ fontWeight: "bold" }}>Yêu cầu:</Text> {job.requirements}
                        </Text>

                        <Text style={{ marginBottom: 6 }}>
                            <Text style={{ fontWeight: "bold" }}>Hình thức:</Text> {job.job_type}
                        </Text>

                        <Text style={{ marginBottom: 6 }}>
                            <Text style={{ fontWeight: "bold" }}>Thu nhập:</Text> {formatToMillions(job.salary_from, job.salary_to, job.salary_type)}
                        </Text>

                        <Text style={{ marginBottom: 6 }}>
                            <Text style={{ fontWeight: "bold" }}>Quyền lợi:</Text> {formatToMillions(job.salary_from, job.salary_to, job.salary_type)}
                        </Text>

                        <Text style={{ marginBottom: 6 }}>
                            <Text style={{ fontWeight: "bold" }}>Website công ty:</Text>{' '}
                            <Text style={{ color: 'blue' }} onPress={() => Linking.openURL(job.company.website)}>
                                {job.company.website}
                            </Text>
                        </Text>

                        <Text style={{ marginBottom: 6 }}>
                            <Text style={{ fontWeight: "bold" }}>Giới thiệu công ty:</Text> {job.company.description}
                        </Text>

                        <Text style={{ fontStyle: 'italic', color: '#888', marginTop: 12 }}>
                            Ngày đăng: {new Date(job.created_date).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
                        {/* Nút Ứng tuyển */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ApplyJob', { job })}
                            style={{
                                backgroundColor: '#ff5e5e',
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 12,
                                flex: 1,
                                marginRight: 8,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Ứng tuyển</Text>
                        </TouchableOpacity>


                        {/* Nút Lưu */}
                        <TouchableOpacity
                            onPress={() => alert("Đã lưu công việc!")}
                            style={{
                                backgroundColor: '#f1f1f1',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: 12,
                                alignItems: 'center',
                                marginRight: 8
                            }}
                        >
                            <Icon name="bookmark-outline" size={24} color="#d40000" />
                        </TouchableOpacity>

                        {/* Nút Chia sẻ */}
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    await Share.share({
                                        message: `Tuyển dụng: ${job.title} tại ${job.company.name} - ${job.location}\nChi tiết tại: ${job.company.website}`,
                                    });
                                } catch (error) {
                                    alert('Không thể chia sẻ công việc.');
                                }
                            }}
                            style={{
                                backgroundColor: '#f1f1f1',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Icon name="share-variant" size={24} color="#d40000" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

export default JobDetail;
