import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, ScrollView, View, Image, TouchableOpacity, Share, Dimensions } from "react-native";
import { Text, Card, TextInput } from "react-native-paper";
import Apis, { authApis, endpoints, getCompanyLogo, getCompanyImages } from "../../configs/Apis";
import MyStyles from "../../styles/MyStyles";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get('window').width;
const CompanyDetail = ({ route, navigation }) => {
    const companyId = route.params?.companyId;
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followId, setFollowId] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [content, setContent] = useState("");
    const [rating, setRating] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [replyContents, setReplyContents] = useState({});
    const [replyLoading, setReplyLoading] = useState({});
    const [replyVisible, setReplyVisible] = useState({});
    const companyImages = company ? getCompanyImages(company) : [];

    const submitReply = async (reviewId) => {
        if (!replyContents[reviewId] || replyContents[reviewId].trim() === "") {
            alert("Vui lòng nhập nội dung phản hồi");
            return;
        }
        setReplyLoading(prev => ({ ...prev, [reviewId]: true }));
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).post(`${endpoints['reviews']}${reviewId}/reply/`, {
                content: replyContents[reviewId]
            });
            setReplyContents(prev => ({ ...prev, [reviewId]: "" }));
            setReplyVisible(prev => ({ ...prev, [reviewId]: false }));
            loadReviews();
        } catch (error) {
            alert("Gửi phản hồi thất bại");
        }
        setReplyLoading(prev => ({ ...prev, [reviewId]: false }));
    };
    const loadReviews = async () => {
        if (!companyId) return;
        setLoadingReviews(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(`${endpoints['reviews']}?company_id=${companyId}`);
            setReviews(res.data);
        } catch (error) {
        } finally {
            setLoadingReviews(false);
        }
    };
    const submitReview = async () => {
        if (!content || !rating) {
            alert("Vui lòng nhập đầy đủ nội dung và điểm đánh giá");
            return;
        }
        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("token");
            await authApis(token).post(endpoints['reviews'], { company: companyId, content, rating: Number(rating) });
            setContent("");
            setRating("");
            loadReviews();
        } catch (error) {
            alert("Gửi đánh giá thất bại");
        }
        setSubmitting(false);
    };
    const checkFollowStatus = async () => {
        const token = await AsyncStorage.getItem('token');
        const res = await authApis(token).get(endpoints['follow-status'](companyId));
        setIsFollowing(res.data.is_following);
        if (res.data.is_following) {
            const follows = await authApis(token).get(endpoints['follow']);
            const f = follows.data.find(f => f.company.id === companyId);
            setFollowId(f?.id);
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
            checkFollowStatus();
        } catch (err) {
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
    const StarRating = ({ rating, onChange }) => {
        const maxStars = 5;
        return (
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                {[...Array(maxStars)].map((_, i) => {
                    const starValue = i + 1;
                    return (
                        <TouchableOpacity key={i} onPress={() => onChange(String(starValue))}>
                            <Text style={{
                                fontSize: 28,
                                color: starValue <= parseInt(rating) ? '#fa6666' : '#ccc',
                                marginRight: 4,
                            }}> ★
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };
    useEffect(() => {
        loadCompany();
        checkFollowStatus();
        loadReviews();
    }, [companyId]);

    if (loading)
        return <ActivityIndicator size="large" style={{ marginTop: 30 }} color="#fa6666" />;
    return (
        <ScrollView style={MyStyles.container} contentContainerStyle={{ padding: 16 }}>
            <View style={{ alignItems: 'center' }}>
                {/* Logo công ty */}
                <Image
                    source={{ uri: getCompanyLogo(company) }}
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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
                            <TouchableOpacity
                                onPress={isFollowing ? unfollowCompany : followCompany}
                                style={{
                                    backgroundColor: isFollowing ? '#ccc' : '#fa6666',
                                    paddingVertical: 12,
                                    paddingHorizontal: 24,
                                    borderRadius: 12,
                                    flex: 1,
                                    marginRight: 8,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: isFollowing ? '#333' : '#fff', fontWeight: 'bold' }}>
                                    {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
                                </Text>
                            </TouchableOpacity>
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
                                }}>
                                <Icon name="share-variant" size={24} color="#d40000" />
                            </TouchableOpacity>
                        </View>
                    </Card.Content>
                </Card>
                <View style={{ width: '100%', marginTop: 24 }}>
                    <View style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Mô tả công ty</Text>
                        <Text style={{ marginLeft: 20, marginTop: 4 }}>{company.description}</Text>
                    </View>
                    <View style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Mã số thuế</Text>
                        <Text style={{ marginLeft: 20, marginTop: 4 }}>{company.tax_code}</Text>
                    </View>
                    <View style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Địa chỉ</Text>
                        <Text style={{ marginLeft: 20, marginTop: 4 }}>{company.address}</Text>
                    </View>
                    {/* <View style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Website</Text>
                        <Text style={{ color: 'blue', marginLeft: 20, marginTop: 4 }} onPress={() => Linking.openURL(company.website)}>{company.website}</Text>
                    </View> */}
                </View>
                {companyImages.length > 0 && (
                    <View style={{ marginTop: 24, width: '100%', position: 'relative' }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>Một số hình ảnh công ty</Text>
                        <View style={{ width: '100%', height: 200 }}>
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                style={{ width: '100%', height: 200 }}
                            >
                                {companyImages.map((img, i) => (
                                    <Image
                                        key={i}
                                        source={{ uri: img }}
                                        style={{ width: screenWidth - 40, height: 200, borderRadius: 20, marginRight: 15, }}
                                        resizeMode="cover"
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}
                <View style={{ width: '100%', marginTop: 24 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>Đánh giá của ứng viên</Text>
                    {loadingReviews ? (
                        <ActivityIndicator size="small" color="#fa6666" />
                    ) : reviews.length === 0 ? (
                        <Text style={{ color: "#999" }}>Chưa có đánh giá nào.</Text>
                    ) : (
                        reviews.map((review) => (
                            <Card key={review.id} style={{ marginBottom: 12, padding: 12 }}>
                                <Text style={{ fontWeight: "bold" }}>{review.candidate?.username || "Ứng viên"}</Text>
                                <Text>Điểm: {review.rating}</Text>
                                <Text>{review.content}</Text>
                                <Text style={{ color: "#999", fontSize: 12, marginTop: 4 }}>{new Date(review.created_date).toLocaleDateString()}</Text>
                                {reviews.filter(r => r.parent === review.id).map(reply => (
                                    <Card key={reply.id} style={{ marginLeft: 20, marginTop: 8, padding: 8, backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                        <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>{reply.candidate?.username || 'Công ty'}</Text>
                                        <Text>{reply.content}</Text>
                                        <Text style={{ color: '#999', fontSize: 11, marginTop: 2 }}>{new Date(reply.created_date).toLocaleDateString()}</Text>
                                    </Card>
                                ))}
                                <TouchableOpacity onPress={() => setReplyVisible(prev => ({ ...prev, [review.id]: !prev[review.id] }))} style={{ marginTop: 8 }}>
                                    <Text style={{ color: '#fa6666', fontWeight: 'bold' }}>
                                        {replyVisible[review.id] ? 'Đóng phản hồi' : 'Phản hồi'}
                                    </Text>
                                </TouchableOpacity>
                                {replyVisible[review.id] && (
                                    <View style={{ marginTop: 8 }}>
                                        <TextInput
                                            label="Nội dung phản hồi"
                                            mode="outlined"
                                            value={replyContents[review.id] || ''}
                                            onChangeText={text => setReplyContents(prev => ({ ...prev, [review.id]: text }))}
                                            style={MyStyles.formInput}
                                            outlineColor="#ffcccc"
                                            activeOutlineColor="#ff8888"
                                            multiline
                                            numberOfLines={4} />
                                        <TouchableOpacity
                                            onPress={() => submitReply(review.id)}
                                            disabled={replyLoading[review.id]}
                                            style={{
                                                backgroundColor: replyLoading[review.id] ? '#ccc' : '#fa6666',
                                                paddingVertical: 12,
                                                paddingHorizontal: 24,
                                                borderRadius: 12,
                                                flex: 1,
                                                alignItems: 'center',
                                                opacity: replyLoading[review.id] ? 0.8 : 1
                                            }}>
                                            <Text style={{ color: replyLoading[review.id] ? '#333' : '#fff', fontWeight: 'bold' }}>
                                                {replyLoading[review.id] ? 'Đang gửi...' : 'Gửi phản hồi'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {review.replies && review.replies.map((rep, idx) => (
                                    <View key={idx} style={{ paddingLeft: 16, marginTop: 4 }}>
                                        <Text style={{ color: '#888' }}>{rep.user?.username ?? 'Ẩn danh'} trả lời:</Text>
                                        <Text>{rep.content}</Text>
                                    </View>
                                ))}
                            </Card>
                        ))
                    )}

                    <View style={{ marginTop: 30, padding: 16, backgroundColor: "#fff", borderRadius: 8, elevation: 3 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>Đánh giá công ty</Text>
                        <TextInput
                            label="Nội dung đánh giá"
                            mode="outlined"
                            value={content}
                            onChangeText={setContent}
                            style={MyStyles.formInput}
                            outlineColor="#ffcccc"
                            activeOutlineColor="#ff8888"
                            multiline
                            numberOfLines={4} />
                        <StarRating rating={rating} onChange={setRating} />
                        <Text style={{ marginBottom: 12, color: '#666' }}>
                            {rating ? `Bạn đã chọn: ${rating} sao` : 'Chọn số sao để đánh giá'}
                        </Text>
                        <TouchableOpacity
                            onPress={submitReview}
                            disabled={submitting}
                            style={{
                                backgroundColor: submitting ? '#ccc' : '#fa6666',
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 12,
                                alignItems: 'center',
                                opacity: submitting ? 0.8 : 1,
                                marginTop: 8
                            }}>
                            <Text style={{ color: submitting ? '#333' : '#fff', fontWeight: 'bold' }}>
                                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ width: '100%', marginTop: 24 }}>
                    <Text style={[MyStyles.sectionTitle, { marginBottom: 8 }]}>Việc làm đang tuyển</Text>
                    {jobs.length === 0 ? (
                        <Text style={{ color: '#999' }}>Hiện tại chưa có việc làm nào.</Text>
                    ) : (
                        jobs.map((job) => (
                            <TouchableOpacity
                                key={job.id}
                                onPress={() => navigation.navigate("jobDetail", { jobId: job.id })}
                                style={MyStyles.listItemShadow}>
                                <View style={MyStyles.listItem}>
                                    <Image
                                        source={{ uri: getCompanyLogo(job.company) }}
                                        style={MyStyles.avatar} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={MyStyles.titleText}>{job.title}</Text>
                                        <Text style={MyStyles.listDescription}>{job.location.split(':')[0]}</Text>
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