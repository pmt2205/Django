import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MyStyles from "../../styles/MyStyles";
import Apis, { endpoints } from "../../configs/Apis";
import { useNavigation, useRoute } from "@react-navigation/native";
import { formatToMillions } from "../../utils/format";
import HomeHeader
    from "./HomeHeader";
import { TextInput } from "react-native-paper";



const SearchResult = () => {
    const nav = useNavigation();
    const route = useRoute();
    const { q: initialQ = "", initialIndustryId = null } = route.params || {};

    const [q, setQ] = useState(initialQ);
    const [industryId, setIndustryId] = useState(initialIndustryId);
    const [location, setLocation] = useState("");
    const [salaryFrom, setSalaryFrom] = useState("");
    const [salaryTo, setSalaryTo] = useState("");

    const [industries, setIndustries] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadIndustries();
    }, []);

    useEffect(() => {
        loadJobs(true);
    }, [q, industryId, location, salaryFrom, salaryTo]);

    const loadIndustries = async () => {
        try {
            const res = await Apis.get(endpoints["industries"]);
            setIndustries(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadJobs = async (reset = false) => {
        if (!hasMore && !reset) return;

        try {
            setLoading(true);
            let url = `${endpoints["jobs"]}?page=${reset ? 1 : page}`;
            if (q?.trim()) url += `&q=${encodeURIComponent(q.trim())}`;
            if (industryId) url += `&industry_id=${industryId}`;
            if (location.trim()) url += `&location=${encodeURIComponent(location.trim())}`;
            if (salaryFrom.trim()) url += `&salary_from=${salaryFrom.trim()}`;
            if (salaryTo.trim()) url += `&salary_to=${salaryTo.trim()}`;

            const res = await Apis.get(url);

            setJobs(prev =>
                reset ? res.data.results : [...prev, ...res.data.results]
            );
            setPage(reset ? 2 : page + 1);
            setHasMore(res.data.next !== null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getCompanyImage = (company) => {
        if (!company) return "";
        if (Array.isArray(company.images)) return company.images[0]?.image || "";
        if (Array.isArray(company.image)) return company.image[0]?.image || "";
        return company.image || "";
    };

    const renderJob = ({ item, index }) => (
        <TouchableOpacity
            key={index}
            style={MyStyles.listItemShadow}
            onPress={() => nav.navigate("jobDetail", { jobId: item.id })}
        >
            <View style={MyStyles.listItem}>
                <Image
                    style={MyStyles.avatar}
                    source={{ uri: getCompanyImage(item.company) }}
                />
                <View style={{ flex: 1, justifyContent: "center", paddingRight: 12 }}>
                    <Text style={MyStyles.titleText}>{item.title}</Text>
                    <Text
                        style={MyStyles.listDescription}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.company.name}
                    </Text>
                </View>
            </View>

            <View style={MyStyles.locationSalaryRow}>
                <View style={MyStyles.locationBox}>
                    <Text style={MyStyles.locationText}>{item.location.split(':')[0]}
                    </Text>
                </View>
                <View style={MyStyles.locationBox}>
                    <Text style={MyStyles.locationText}>
                        {formatToMillions(item.salary_from, item.salary_to, item.salary_type)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={MyStyles.container}>
            {/* Thanh tìm kiếm cố định */}


            {/* Danh sách và bộ lọc scroll được */}
            <FlatList
                style={{ flex: 1 }}
                data={jobs}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={renderJob}
                onEndReached={() => loadJobs()}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                    <View style={MyStyles.industrySection}>
                        <HomeHeader
                            q={q}
                            setQ={setQ}
                            search={(text, setText) => setText(text)}
                            onSubmit={() => loadJobs(true)}
                            searchOnly={true}
                        />

                        <TextInput
                            label="Địa điểm"
                            mode="outlined"
                            value={location}
                            onChangeText={setLocation}
                            style={MyStyles.formInput}
                            outlineColor="#ffcccc"
                            activeOutlineColor="#ff8888"
                        />

                        <TextInput
                            label="Mức lương từ"
                            mode="outlined"
                            value={salaryFrom}
                            onChangeText={setSalaryFrom}
                            keyboardType="numeric"
                            style={MyStyles.formInput}
                            outlineColor="#ffcccc"
                            activeOutlineColor="#ff8888"
                        />

                        <TextInput
                            label="Mức lương đến"
                            mode="outlined"
                            value={salaryTo}
                            onChangeText={setSalaryTo}
                            keyboardType="numeric"
                            style={MyStyles.formInput}
                            outlineColor="#ffcccc"
                            activeOutlineColor="#ff8888"
                        />

                    </View>
                }
                ListFooterComponent={
                    loading ? (
                        <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
                    ) : null
                }
            />
        </View>
    );
};

export default SearchResult;
