import { StatusBar, ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useEffect, useState } from "react";
import { Chip } from "react-native-paper";
import Apis, { endpoints, getCompanyLogo } from "../../configs/Apis";
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
    const [totalPages, setTotalPages] = useState(1);
    const [companyPage, setCompanyPage] = useState(1);
    const [companyTotalPages, setCompanyTotalPages] = useState(1);



    const loadIndustries = async () => {
        try {
            let res = await Apis.get(endpoints['industries']);
            setIndustries(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadJobs = async () => {
        try {
            setLoading(true);
            let url = `${endpoints['jobs']}?page=${page}`;
            if (q?.trim()) url += `&q=${encodeURIComponent(q.trim())}`;
            if (industryId) url += `&industry_id=${industryId}`;
            const res = await Apis.get(url);

            setJobs(res.data.results);

            const count = res.data.count || 0;
            const pageSize = res.data.page_size;
            const total = Math.ceil(count / pageSize);
            setTotalPages(total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const loadCompanies = async () => {
        try {
            let url = `${endpoints['companies']}?page=${companyPage}`;
            const res = await Apis.get(url);
            setCompanies(res.data.results);

            const count = res.data.count || 0;
            const pageSize = res.data.page_size || 5;
            setCompanyTotalPages(Math.ceil(count / pageSize));
        } catch (error) {
            console.error(error);
        }
    };


    const handleSubmitSearch = () => {
        nav.navigate("SearchResult", { q, initialIndustryId: industryId });
    };

    useEffect(() => {
        loadIndustries();
        loadCompanies();
    }, []);

    useEffect(() => {
        loadCompanies();
    }, [companyPage]);


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
                <View style={[MyStyles.row, MyStyles.wrap, { maxHeight: 110, overflow: 'hidden' }]}>
                    <TouchableOpacity onPress={() => search(null, setIndustryId)}>
                        <Chip
                            style={[MyStyles.chip, industryId === null && MyStyles.chipSelected]}
                            textStyle={[MyStyles.chipText, industryId === null && MyStyles.chipTextSelected]}
                        >
                            Tất cả
                        </Chip>
                    </TouchableOpacity>
                    {industries.map(ind => (
                        <TouchableOpacity key={`Ind${ind.id}`} onPress={() => search(ind.id, setIndustryId)}>
                            <Chip
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
                <FlatList
                    data={jobs}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    renderItem={({ item }) => (
                        <View style={MyStyles.listItemShadow}>
                            <TouchableOpacity
                                onPress={() => nav.navigate('jobDetail', { jobId: item.id })}
                                activeOpacity={0.9}
                                style={MyStyles.listItem}
                            >
                                <Image
                                    style={MyStyles.avatar}
                                    source={{ uri: getCompanyLogo(item.company) }}
                                />

                                <View style={{ flex: 1, justifyContent: 'center', paddingRight: 12 }}>
                                    <Text style={MyStyles.titleText}>{item.title}</Text>
                                    <Text
                                        style={MyStyles.listDescription}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {item.company.name}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={MyStyles.locationSalaryRow}>
                                <View style={MyStyles.locationBox}>
                                    <Text style={MyStyles.locationText}>
                                        {item.location.split(':')[0]}
                                    </Text>
                                </View>

                                <View style={MyStyles.locationBox}>
                                    <Text style={MyStyles.locationText}>
                                        {formatToMillions(item.salary_from, item.salary_to)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                    ListFooterComponent={loading ? (
                        <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
                    ) : null}
                />
                {totalPages > 1 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
                        <TouchableOpacity
                            disabled={page <= 1}
                            style={{ marginHorizontal: 10, opacity: page <= 1 ? 0.5 : 1 }}
                            onPress={() => {
                                if (page > 1) setPage(page - 1);
                            }}
                        >
                            <Text style={{ fontSize: 16 }}>← Trước</Text>
                        </TouchableOpacity>

                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                            {page} / {totalPages}
                        </Text>

                        <TouchableOpacity
                            disabled={page >= totalPages}
                            style={{ marginHorizontal: 10, opacity: page >= totalPages ? 0.5 : 1 }}
                            onPress={() => {
                                if (page < totalPages) setPage(page + 1);
                            }}
                        >
                            <Text style={{ fontSize: 16 }}>Sau →</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
                        const imageUri = getCompanyLogo(item);
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
                {companyTotalPages >= 1 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                        <TouchableOpacity
                            disabled={companyPage <= 1}
                            style={{ marginHorizontal: 10, opacity: companyPage <= 1 ? 0.5 : 1 }}
                            onPress={() => {
                                if (companyPage > 1) setCompanyPage(companyPage - 1);
                            }}
                        >
                            <Text style={{ fontSize: 16 }}>← Trước</Text>
                        </TouchableOpacity>

                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                            {companyPage} / {companyTotalPages}
                        </Text>

                        <TouchableOpacity
                            disabled={companyPage >= companyTotalPages}
                            style={{ marginHorizontal: 10, opacity: companyPage >= companyTotalPages ? 0.5 : 1 }}
                            onPress={() => {
                                if (companyPage < companyTotalPages) setCompanyPage(companyPage + 1);
                            }}
                        >
                            <Text style={{ fontSize: 16 }}>Sau →</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </View>
        </>
    );

    return (
        <SafeAreaView style={MyStyles.container} edges={["left", "right"]}>
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
