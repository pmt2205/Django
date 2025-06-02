// components/Home/SearchResult.js
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MyStyles from "../../styles/MyStyles";
import Apis, { endpoints } from "../../configs/Apis";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Chip } from "react-native-paper";
import { formatToMillions } from "../../utils/format";

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
        if (Array.isArray(company.images)) {
            return company.images[0]?.image || "";
        }
        if (Array.isArray(company.image)) {
            return company.image[0]?.image || "";
        }
        return company.image || "";
    };

    return (
        <View style={MyStyles.container}>
            <View style={MyStyles.industrySection}>
                <Text style={MyStyles.sectionTitle}>Bộ lọc tìm kiếm</Text>

                <View style={{ marginBottom: 10 }}>
                    <Text>Địa điểm</Text>
                    <TextInput
                        style={MyStyles.input}
                        placeholder="Nhập địa điểm"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text>Mức lương từ</Text>
                    <TextInput
                        style={MyStyles.input}
                        placeholder="Nhập mức lương tối thiểu"
                        value={salaryFrom}
                        onChangeText={setSalaryFrom}
                        keyboardType="numeric"
                    />
                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text>Mức lương đến</Text>
                    <TextInput
                        style={MyStyles.input}
                        placeholder="Nhập mức lương tối đa"
                        value={salaryTo}
                        onChangeText={setSalaryTo}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <FlatList
                data={jobs}
                keyExtractor={(item) => item.id.toString()}
                onEndReached={() => loadJobs()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                    loading ? (
                        <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
                    ) : null
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        key={item.id}
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
                                <Text style={MyStyles.locationText}>{item.location}</Text>
                            </View>
                            <View style={MyStyles.locationBox}>
                                <Text style={MyStyles.locationText}>
                                    {formatToMillions(item.salary_from, item.salary_to, item.salary_type)}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default SearchResult;
