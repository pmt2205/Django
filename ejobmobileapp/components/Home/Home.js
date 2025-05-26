import {
StatusBar,
ActivityIndicator,
FlatList,
Image,
Text,
TouchableOpacity,
View
} from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useEffect, useState } from "react";
import { Chip, List, Searchbar } from "react-native-paper";
import Apis, { endpoints } from "../../configs/Apis";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';

const Home = () => {
const [industries, setIndustries] = useState([]);
const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(false);
const [page, setPage] = useState(1);
const [q, setQ] = useState('');
const [industryId, setIndustryId] = useState(null);
const nav = useNavigation();

const loadIndustries = async () => {
    try {
        let res = await Apis.get(endpoints['industries']);
        setIndustries(res.data);
    } catch (error) {
        console.error(error);
    }
};

const loadJobs = async () => {
    if (page === 0) return;
    try {
        setLoading(true);

        let url = `${endpoints['jobs']}?page=${page}`;
        if (q && q.trim() !== '') url += `&q=${encodeURIComponent(q.trim())}`;
        if (industryId) url += `&industry_id=${industryId}`;

        let res = await Apis.get(url);

        if (page === 1) {
            setJobs(res.data.results);
        } else {
            setJobs(prev => [...prev, ...res.data.results]);
        }

        if (res.data.next === null) {
            setPage(0);
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    loadIndustries();
}, []);

useEffect(() => {
    const timer = setTimeout(() => {
        setPage(1);
    }, 300);
    return () => clearTimeout(timer);
}, [q, industryId]);

useEffect(() => {
    loadJobs();
}, [page]);

const loadMore = () => {
    if (!loading && page > 0) setPage(page + 1);
};

const onSearchChange = (text) => {
    setQ(text);
    setPage(1);
    setJobs([]);
};

const onSelectIndustry = (id) => {
    setIndustryId(id);
    setPage(1);
    setJobs([]);
};

return (
    <SafeAreaView style={MyStyles.container} edges={['left', 'right', 'bottom']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

        {/* Header với Gradient */}
        <LinearGradient
            colors={['#ff5e5e', '#fffafc']}
            style={MyStyles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <Image
                source={require('../../assets/logo.png')}
                style={MyStyles.logo}
            />
            <View style={MyStyles.searchbarContainer}>
                <Searchbar
                    placeholder="Tìm việc làm..."
                    onChangeText={onSearchChange}
                    value={q}
                    style={MyStyles.searchbar}
                />
            </View>

        </LinearGradient>

        {/* Danh sách ngành nghề */}
        <View style={MyStyles.industrySection}>
            <Text style={MyStyles.sectionTitle}>Một số ngành nghề hot</Text>

            <View style={[MyStyles.row, MyStyles.wrap]}>
                <TouchableOpacity onPress={() => onSelectIndustry(null)}>
                    <Chip
                        icon="label"
                        style={[
                            MyStyles.chip,
                            industryId === null && MyStyles.chipSelected
                        ]}
                        textStyle={[
                            MyStyles.chipText,
                            industryId === null && MyStyles.chipTextSelected
                        ]}
                    >
                        Tất cả
                    </Chip>
                </TouchableOpacity>

                {industries.map(ind => (
                    <TouchableOpacity key={`Ind${ind.id}`} onPress={() => onSelectIndustry(ind.id)}>
                        <Chip
                            icon="label"
                            style={[
                                MyStyles.chip,
                                industryId === ind.id && MyStyles.chipSelected
                            ]}
                            textStyle={[
                                MyStyles.chipText,
                                industryId === ind.id && MyStyles.chipTextSelected
                            ]}
                        >
                            {ind.name}
                        </Chip>
                    </TouchableOpacity>
                ))}
            </View>
        </View>


        <View style={MyStyles.industrySection}>
            <Text style={MyStyles.sectionTitle}>Việc làm gợi ý</Text>
            <FlatList
                data={jobs}
                keyExtractor={(item) => item.id.toString()}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}
                renderItem={({ item }) => (
                    <View style={MyStyles.listItemShadow}>

                        <TouchableOpacity
                            onPress={() => nav.navigate('jobDetail', { jobId: item.id })}
                            activeOpacity={0.9}
                            style={MyStyles.listItem}
                        >
                            <Image
                                style={MyStyles.avatar}
                                source={{ uri: item.company.image }}
                            />
                            <View style={{ flex: 1, justifyContent: 'center', paddingRight: 12 }}>
                                <Text style={MyStyles.titleText}>
                                    {item.title}
                                </Text>
                                <Text style={MyStyles.listDescription} numberOfLines={1} ellipsizeMode="tail">
                                    {item.company.name}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={MyStyles.locationSalaryRow}>
                            <View style={MyStyles.locationBox}>
                                <Text style={MyStyles.locationText}>{item.location}</Text>
                            </View>
                            <View style={MyStyles.salaryBox}>
                                <Text style={MyStyles.salaryText}>
                                    {parseFloat(item.salary_from).toLocaleString('vi-VN')} - {parseFloat(item.salary_to).toLocaleString('vi-VN')} {item.salary_type === 'hourly' ? 'VNĐ/giờ' : 'VNĐ/tháng'}
                                </Text>
                            </View>
                        </View>



                    </View>
                )}

            />

        </View>
        {/* Danh sách việc làm */}

    </SafeAreaView>
);
};

export default Home;
