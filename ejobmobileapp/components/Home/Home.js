// screens/Home.js
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
import { Chip } from "react-native-paper";
import Apis, { endpoints } from "../../configs/Apis";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import HomeHeader from "../Home/HomeHeader";
import { formatToMillions } from "../../utils/format";

const Home = () => {
    const [industries, setIndustries] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [companies, setCompanies] = useState([]);
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
            if (q?.trim()) url += `&q=${encodeURIComponent(q.trim())}`;
            if (industryId) url += `&industry_id=${industryId}`;
            const res = await Apis.get(url);

            setJobs(prev => page === 1 ? res.data.results : [...prev, ...res.data.results]);

            if (res.data.next === null) {
                setPage(0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadCompanies = async () => {
        try {
            let res = await Apis.get(endpoints['companies']);
            setCompanies(res.data.results);
        } catch (error) {
            console.error(error);
        }
    };

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

    const handleSubmitSearch = () => {
    // Chuyển sang màn SearchResult với từ khóa q, industryId hiện tại
    nav.navigate("SearchResult", { q, initialIndustryId: industryId });
  };


    useEffect(() => {
        loadIndustries();
        loadCompanies();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadJobs();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, q, industryId]);

    const search = (value, callback) => {
        setJobs([]);
        setPage(1);
        callback(value);
    };

    const ListFooterComponent = () => (
        <>
            <View style={MyStyles.industrySection}>
                <Text style={MyStyles.sectionTitle}>Một số ngành nghề hot</Text>
                <View style={[MyStyles.row, MyStyles.wrap]}>
                    <TouchableOpacity onPress={() => search(null, setIndustryId)}>
                        <Chip
                            icon="label"
                            style={[MyStyles.chip, industryId === null && MyStyles.chipSelected]}
                            textStyle={[MyStyles.chipText, industryId === null && MyStyles.chipTextSelected]}
                        >
                            Tất cả
                        </Chip>
                    </TouchableOpacity>
                    {industries.map(ind => (
                        <TouchableOpacity key={`Ind${ind.id}`} onPress={() => search(ind.id, setIndustryId)}>
                            <Chip
                                icon="label"
                                style={[MyStyles.chip, industryId === ind.id && MyStyles.chipSelected]}
                                textStyle={[MyStyles.chipText, industryId === ind.id && MyStyles.chipTextSelected]}
                            >
                                {ind.name}
                            </Chip>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={MyStyles.industrySection}>
                <Text style={MyStyles.sectionTitle}>Việc làm gợi ý</Text>
                {jobs.map((item) => (
                    <View key={item.id.toString()} style={MyStyles.listItemShadow}>
                        <TouchableOpacity
                            onPress={() => nav.navigate('jobDetail', { jobId: item.id })}
                            activeOpacity={0.9}
                            style={MyStyles.listItem}
                        >
                            <Image
                                style={MyStyles.avatar}
                                source={{ uri: getCompanyImage(item.company) }}
                            />

                            <View style={{ flex: 1, justifyContent: 'center', paddingRight: 12 }}>
                                <Text style={MyStyles.titleText}>{item.title}</Text>
                                <Text style={MyStyles.listDescription} numberOfLines={1} ellipsizeMode="tail">
                                    {item.company.name}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={MyStyles.locationSalaryRow}>
                            <View style={MyStyles.locationBox}>
                                <Text style={MyStyles.locationText}>{item.location}</Text>
                            </View>
                            <View style={MyStyles.locationBox}>
                                <Text style={MyStyles.locationText}>
                                    {formatToMillions(item.salary_from, item.salary_to, item.salary_type)}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
                {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}
            </View>

            <View style={MyStyles.industrySection}>
                <Text style={MyStyles.sectionTitle}>Công ty tiêu biểu</Text>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={companies}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={MyStyles.companyListContainer}
                    renderItem={({ item }) => {
                        const imageUri = getCompanyImage(item);
                        return (
                            <TouchableOpacity
                                style={MyStyles.companyItem}
                                onPress={() => nav.navigate('companyDetail', { companyId: item.id })}
                            >
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={MyStyles.companyImage} />
                                ) : (
                                    <View style={[MyStyles.companyImage, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text>No Image</Text>
                                    </View>
                                )}
                                <Text style={MyStyles.companyName} numberOfLines={1}>{item.name}</Text>
                            </TouchableOpacity>
                        );
                    }}

                />
            </View>
        </>
    );

    return (
    <SafeAreaView style={MyStyles.container} edges={["left", "right", "bottom"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={<HomeHeader q={q} setQ={setQ} search={search} onSubmit={handleSubmitSearch} />}
        ListFooterComponent={ListFooterComponent}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Home;
