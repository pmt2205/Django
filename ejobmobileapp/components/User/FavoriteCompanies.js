import { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { Text, Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";


const getCompanyImage = (company) => {
    if (!company) return '';
    if (Array.isArray(company.images)) return company.images[0]?.image || '';
    if (Array.isArray(company.image)) return company.image[0]?.image || '';
    return company.image || '';
};

const FavouriteCompany = () => {
    const navigation = useNavigation();

    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadFavourites = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(endpoints["follow"]);
            setFavourites(res.data); // chứa danh sách follow, mỗi phần tử có .id và .company
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const unfollow = async (followId) => {
        try {
            const token = await AsyncStorage.getItem("token");
            await authApis(token).delete(endpoints["unfollow"](followId));
            setFavourites((prev) => prev.filter((f) => f.id !== followId));
        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Không thể bỏ theo dõi.");
        }
    };

    useEffect(() => {
        loadFavourites();
    }, []);

    if (loading) return <ActivityIndicator size="large" color="#fa6666" style={{ marginTop: 30 }} />;

    return (
        <ScrollView style={MyStyles.container} contentContainerStyle={{ padding: 16 }}>
            <Text style={MyStyles.sectionTitle}>Công ty đã theo dõi</Text>
            {favourites.length === 0 ? (
                <Text style={{ color: "#999", marginTop: 12 }}>Bạn chưa theo dõi công ty nào.</Text>
            ) : (
                favourites.map(({ id: followId, company }) => (
                    <Card key={followId} style={{ marginBottom: 20, padding: 16 }}>
                        <View style={{ flexDirection: "row" }}>
                            <Image
                                source={{ uri: getCompanyImage(company) }}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 12,
                                    marginRight: 16,
                                    backgroundColor: "#eee",
                                }}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: "bold", fontSize: 16 }}>{company.name}</Text>
                                <Text style={{ color: "#666" }}>{company.address}</Text>
                                <Text numberOfLines={2} style={{ color: "#444", marginTop: 4 }}>
                                    {company.description}
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("home", {
                                    screen: "companyDetail",
                                    params: { companyId: company.id },
                                })}
                            >
                                <Text style={{ color: "#fa6666", fontWeight: "bold" }}>Xem chi tiết</Text>
                            </TouchableOpacity>


                            <TouchableOpacity
                                onPress={() => unfollow(followId)}
                            >
                                <Text style={{ color: "#999", fontWeight: "bold" }}>Bỏ theo dõi</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                ))
            )}
        </ScrollView>
    );
};

export default FavouriteCompany;
