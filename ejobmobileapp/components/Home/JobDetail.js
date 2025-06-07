import { useEffect, useState, useContext } from "react";
import { ActivityIndicator, ScrollView, View, Image, Linking, TouchableOpacity, Share } from "react-native";
import { Text, Card } from "react-native-paper";
import Apis, { endpoints, getCompanyLogo } from "../../configs/Apis";
import MyStyles from "../../styles/MyStyles";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatToMillions } from '../../utils/format'
import { format } from 'date-fns';
import { MyUserContext } from "../../configs/MyContexts";

const JobDetail = ({ route, navigation }) => {
    const jobId = route.params?.jobId;
    const [job, setJob] = useState(null);
    const user = useContext(MyUserContext);
    const currentUserId = user?.id;
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
        <View style={{ flex: 1 }}>
            <ScrollView style={MyStyles.container} contentContainerStyle={{ padding: 16 }}>
                {job === null ? (
                    <ActivityIndicator size="large" color="#fa6666" />
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <Image source={{ uri: getCompanyLogo(job.company) }}
                            style={MyStyles.companyLogo}
                        />
                        <Card style={MyStyles.boxwhite}>
                            <Card.Content style={{ alignItems: 'center' }}>
                                <Text style={{ fontWeight: "bold", fontSize: 18 }}>{job.title}</Text>
                                <Text style={MyStyles.listDescription}> {job.company.name}</Text>
                                <View style={MyStyles.infoRow}>
                                    <View style={MyStyles.infoBox}>
                                        <View style={MyStyles.iconWrapper}>
                                            <Icon name="map-marker" size={24} color="#d40000" />
                                        </View>
                                        <Text style={MyStyles.infoText}>{job.location.split(':')[0]}</Text>
                                    </View>
                                    <View style={MyStyles.verticalDivider} />
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
                                    <View style={MyStyles.verticalDivider} />
                                    <View style={MyStyles.infoBox}>
                                        <View style={MyStyles.iconWrapper}>
                                            <Icon name="briefcase" size={24} color="#d40000" />
                                        </View>
                                        <Text style={MyStyles.infoText}>{job.industry.name}</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>

                        <View style={{ width: '100%', marginTop: 24 }}>
                            <View style={{ marginBottom: 6 }}>
                                <Text style={{ fontWeight: "bold", fontSize: 18 }}>Mô tả công việc</Text>
                                <Text style={{ marginLeft: 20, marginTop: 4 }}>{job.description}</Text>
                            </View>
                            <View style={{ marginBottom: 6 }}>
                                <Text style={{ fontWeight: "bold", fontSize: 18 }}>Mô tả công việc</Text>
                                <Text style={{ marginLeft: 20, marginTop: 4 }}>{job.location}</Text>
                            </View>
                            <View style={{ marginBottom: 6 }}>
                                <Text style={{ fontWeight: "bold", fontSize: 18 }}>Yêu cầu</Text>
                                <Text style={{ marginLeft: 20, marginTop: 4 }}>{job.requirements}</Text>
                            </View>
                            <View style={{ marginBottom: 6 }}>
                                <Text style={{ fontWeight: "bold", fontSize: 18 }}>Hình thức</Text>
                                <Text style={{ marginLeft: 20, marginTop: 4 }}>{job.job_type}</Text>
                            </View>
                            <View style={{ marginBottom: 6 }}>
                                <Text style={{ fontWeight: "bold", fontSize: 18 }}>Thu nhập</Text>
                                <Text style={{ marginLeft: 20, marginTop: 4 }}>
                                    {formatToMillions(job.salary_from, job.salary_to, job.salary_type)}
                                </Text>
                            </View>
                            <View style={{ marginBottom: 6 }}>
                                <Text style={{ fontWeight: "bold", fontSize: 18 }}>Quyền lợi</Text>
                                <Text style={{ marginLeft: 20, marginTop: 4 }}>
                                    {formatToMillions(job.salary_from, job.salary_to, job.salary_type)}
                                </Text>
                            </View>
                            <View style={{ marginBottom: 6 }}>
                                <Text style={{ fontWeight: "bold", fontSize: 18 }}>Website công ty</Text>
                                <Text
                                    style={{ marginLeft: 20, marginTop: 4, color: 'blue' }}
                                    onPress={() => Linking.openURL(job.company.website)}>{job.company.website}
                                </Text>
                            </View>
                            <View style={{ marginBottom: 6 }}>
                                <Text style={{ fontWeight: "bold", fontSize: 18 }}>Giới thiệu công ty</Text>
                                <Text style={{ marginLeft: 20, marginTop: 4 }}>{job.company.description}</Text>
                            </View>
                            <Text style={{ fontStyle: 'italic', color: '#888', marginTop: 12 }}>
                                Ngày đăng: {format(new Date(job.created_date), 'dd/MM/yyyy')}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('ApplyJob', { job })}
                                style={MyStyles.btnAll}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Ứng tuyển</Text>
                            </TouchableOpacity>


                            {/* Nút Lưu */}
                            <TouchableOpacity
                                onPress={() => alert("Đã lưu công việc!")}
                                style={MyStyles.btnAlltt}
                            >
                                <Icon name="bookmark-outline" size={24} color="#d40000" />
                            </TouchableOpacity>
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
                                style={MyStyles.btnAlltt}>
                                <Icon name="share-variant" size={24} color="#d40000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {job && (
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate("ChatScreen", {
                            jobId: job.id,
                            candidateId: currentUserId,
                            employerId: job.company.user,
                            currentUserId,
                        })
                    }
                    style={MyStyles.btnmsg}>
                    <Icon name="chat" size={28} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default JobDetail;
