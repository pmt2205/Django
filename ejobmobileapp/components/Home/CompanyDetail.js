import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View, Image, Linking, TouchableOpacity, Share } from "react-native";
import { Text, Card } from "react-native-paper";
import Apis, { endpoints } from "../../configs/Apis";
import MyStyles from "../../styles/MyStyles";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis } from "../../configs/Apis";

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


const CompanyDetail = ({ route, navigation }) => {
    const companyId = route.params?.companyId;
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followId, setFollowId] = useState(null); // để bỏ theo dõi

    const checkFollowStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['follow-status'](companyId));
            setIsFollowing(res.data.is_following);

            if (res.data.is_following) {
                // Nếu muốn hiển thị nút "Bỏ theo dõi", cần biết ID follow
                const follows = await authApis(token).get(endpoints['follow']);
                const f = follows.data.find(f => f.company.id === companyId);
                setFollowId(f?.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const followCompany = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).post(endpoints['follow'], { company: companyId });
            setIsFollowing(true);
            setFollowId(res.data.id);
        } catch (err) {
            alert("Đã theo dõi công ty này!");
        }
    };

    const unfollowCompany = async () => {
        if (!followId) return;

        try {
            const token = await AsyncStorage.getItem('token');
            await authApis(token).delete(endpoints['unfollow'](followId));
            setIsFollowing(false);
            setFollowId(null);
            checkFollowStatus(); // gọi lại để cập nhật

        } catch (err) {
            if (err.response) {
                console.error("Unfollow error - server response:", err.response.data);
            } else if (err.request) {
                console.error("Unfollow error - no response from server", err.request);
            } else {
                console.error("Unfollow error - other:", err.message);
            }
        }

    };





    const loadCompany = async () => {
        try {
            const res = await Apis.get(`${endpoints['companies']}${companyId}/`);
            setCompany(res.data);

            const jobRes = await Apis.get(`${endpoints['jobs']}?company_id=${companyId}`);
            setJobs(jobRes.data.results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompany();
        checkFollowStatus();
    }, [companyId]);


    if (loading)
        return <ActivityIndicator size="large" style={{ marginTop: 30 }} color="#fa6666" />;

    return (
        <ScrollView style={MyStyles.container} contentContainerStyle={{ padding: 16 }}>
            <View style={{ alignItems: 'center' }}>
                {/* Logo công ty */}
                <Image
                    source={{ uri: getCompanyImage(company) }}
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: 10,
                        marginBottom: -40,
                        zIndex: 2,
                        backgroundColor: '#fff',
                        elevation: 12,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                    }}
                />


                {/* Card trắng chứa thông tin công ty */}
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
                    marginTop: -10,
                    zIndex: 1
                }}>
                    <Card.Content style={{ alignItems: 'center' }}>
                        <Text style={{ fontWeight: "bold", fontSize: 20 }}>{company.name}</Text>
                        <View style={MyStyles.infoRow}>
                            <View style={MyStyles.infoBox}>
                                <Icon name="map-marker" size={24} color="#d40000" />
                                <Text style={MyStyles.infoText}>{company.address}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Nội dung chi tiết công ty */}
                <View style={{ width: '100%', marginTop: 24 }}>
                    <Text style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: "bold" }}>Mô tả công ty:</Text> {company.description}
                    </Text>

                    {/* <Text style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: "bold" }}>Website:</Text>{' '}
                        <Text style={{ color: 'blue' }} onPress={() => Linking.openURL(company.website)}>
                            {company.website}
                        </Text>
                    </Text> */}
                </View>

                {/* Nút chức năng */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
                    {/* Nút theo dõi */}
                    <TouchableOpacity
                        onPress={isFollowing ? unfollowCompany : followCompany}
                        style={{
                            backgroundColor: isFollowing ? '#ccc' : '#fa6666',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 8,
                            marginHorizontal: 10
                        }}
                    >
                        <Text style={{ color: isFollowing ? '#333' : '#fff', fontWeight: 'bold' }}>
                            {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
                        </Text>
                    </TouchableOpacity>


                    {/* Nút chia sẻ */}
                    <TouchableOpacity
                        onPress={async () => {
                            try {
                                await Share.share({
                                    message: `Khám phá công ty ${company.name} tại ${company.website}`,
                                });
                            } catch (error) {
                                alert('Không thể chia sẻ thông tin công ty.');
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

                {/* Danh sách việc làm */}
                <View style={{ width: '100%', marginTop: 24 }}>
                    <Text style={[MyStyles.sectionTitle, { marginBottom: 8 }]}>Việc làm đang tuyển:</Text>
                    {jobs.length === 0 ? (
                        <Text style={{ color: '#999' }}>Hiện tại chưa có việc làm nào.</Text>
                    ) : (
                        jobs.map((job) => (
                            <TouchableOpacity
                                key={job.id}
                                onPress={() => navigation.navigate("jobDetail", { jobId: job.id })}
                                style={MyStyles.listItemShadow}
                            >
                                <View style={MyStyles.listItem}>
                                    <Image
                                        source={{ uri: getCompanyImage(job.company) || getCompanyImage(company) }}
                                        style={MyStyles.avatar}
                                    />

                                    <View style={{ flex: 1 }}>
                                        <Text style={MyStyles.titleText}>{job.title}</Text>
                                        <Text style={MyStyles.listDescription}>{job.location}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

            </View>
        </ScrollView>
    );
};

export default CompanyDetail;
