import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View, Platform } from "react-native";
import { TextInput } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import Apis, { endpoints, getCompanyLogo } from "../../configs/Apis";
import { useNavigation, useRoute } from "@react-navigation/native";
import { formatToMillions } from "../../utils/format";
import HomeHeader from "./HomeHeader";
import { Picker } from "@react-native-picker/picker";
import { format, parseISO } from "date-fns";
import DropDownPicker from "react-native-dropdown-picker"; // Đừng quên import


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
    const [totalPages, setTotalPages] = useState(1);
    const [openTimeType, setOpenTimeType] = useState(false);
    const [selectedTimeTypes, setSelectedTimeTypes] = useState([]);
    const [timeTypeOptions, setTimeTypeOptions] = useState([
        { label: '6 - 12h', value: 'morning' },
        { label: '12 - 18h', value: 'afternoon' },
        { label: '18 - 0h', value: 'evening' },
        { label: '0h - 6h', value: 'late' },
    ]);

    useEffect(() => {
        loadIndustries();
    }, []);

    useEffect(() => {
        loadJobs(true);
    }, [q, industryId, location, salaryFrom, salaryTo, selectedTimeTypes]);

    const loadIndustries = async () => {
        try {
            const res = await Apis.get(endpoints["industries"]);
            setIndustries(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadJobs = async (reset = false) => {
        try {
            setLoading(true);
            let currentPage = reset ? 1 : page;
            let url = `${endpoints["jobs"]}?page=${currentPage}`;

            if (q?.trim()) url += `&q=${encodeURIComponent(q.trim())}`;
            if (industryId) url += `&industry_id=${industryId}`;
            if (location.trim()) url += `&location=${encodeURIComponent(location.trim())}`;
            if (salaryFrom.trim()) url += `&salary_from=${salaryFrom.trim()}`;
            if (salaryTo.trim()) url += `&salary_to=${salaryTo.trim()}`;
            if (selectedTimeTypes.length > 0) {
                url += `&time_type=${selectedTimeTypes.join(",")}`;
            }



            const res = await Apis.get(url);
            const count = res.data.count || 0;
            const pageSize = res.data.page_size || 5;
            setTotalPages(Math.ceil(count / pageSize));
            setPage(reset ? 1 : currentPage);
            setJobs(reset ? res.data.results : [...jobs, ...res.data.results]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderJob = ({ item }) => (
        <TouchableOpacity
            style={MyStyles.listItemShadow}
            onPress={() => nav.navigate("jobDetail", { jobId: item.id })}
        >
            <View style={MyStyles.listItem}>
                <Image style={MyStyles.avatar} source={{ uri: getCompanyLogo(item.company) }} />
                <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={MyStyles.titleText}>{item.title}</Text>
                    <Text style={MyStyles.listDescription} numberOfLines={1}>
                        {item.company.name}
                    </Text>
                </View>
            </View>
            <View style={MyStyles.locationSalaryRow}>
                <View style={MyStyles.locationBox}>
                    <Text style={MyStyles.locationText}>{item.location.split(":")[0]}</Text>
                </View>
                <View style={MyStyles.locationBox}>
                    <Text style={MyStyles.locationText}>
                        {formatToMillions(item.salary_from, item.salary_to)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={MyStyles.container}>
            <FlatList
                style={{ flex: 1 }}
                data={jobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderJob}
                ListHeaderComponent={
                    <View style={MyStyles.industrySection}>
                        <HomeHeader
                            q={q}
                            setQ={setQ}
                            search={(text, setText) => setText(text)}
                            searchOnly={true}
                            onSubmit={() => loadJobs(true)}
                        />

                        {/* DropDownPicker - khung giờ làm việc */}
                        <View style={{ marginBottom: 12 }}>
                            <DropDownPicker
                                multiple={true}
                                open={openTimeType}
                                value={selectedTimeTypes}
                                items={timeTypeOptions}
                                setOpen={setOpenTimeType}
                                setValue={setSelectedTimeTypes}
                                setItems={setTimeTypeOptions}
                                placeholder="Chọn khung giờ làm việc"
                                mode="BADGE"
                                badgeColors="#fa6666"
                                style={{
                                    borderColor: '#ffcccc',
                                    borderWidth: 1,
                                    borderRadius: 6,
                                    minHeight: 50,
                                }}
                                dropDownContainerStyle={{
                                    borderColor: '#ffcccc',
                                    borderWidth: 1,
                                    borderRadius: 6,
                                    zIndex: 2000,
                                }}
                            />
                        </View>

                        {/* Picker ngành nghề */}
                        <View style={{
                            borderWidth: 1,
                            borderColor: '#ffcccc',
                            borderRadius: 6,
                            marginBottom: 12,
                            minHeight: 50,
                            justifyContent: 'center',
                            paddingHorizontal: 10,
                        }}>
                            <Picker
                                selectedValue={industryId}
                                onValueChange={(value) => setIndustryId(value)}
                                style={{ height: 50 }} // để đồng bộ chiều cao
                            >
                                <Picker.Item label="Tất cả ngành nghề" value={null} />
                                {industries.map((ind) => (
                                    <Picker.Item key={ind.id} label={ind.name} value={ind.id} />
                                ))}
                            </Picker>
                        </View>

                        {/* Các ô input phía dưới */}
                        <TextInput
                            label="Địa điểm (ví dụ: HCM)"
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
                    loading ? <ActivityIndicator size="large" style={{ marginVertical: 20 }} /> : null
                }
            />

            {/* Điều hướng phân trang */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 10 }}>
                <TouchableOpacity
                    disabled={page <= 1}
                    onPress={() => {
                        const newPage = page - 1;
                        setPage(newPage);
                        loadJobs(true);
                    }}
                    style={{ opacity: page <= 1 ? 0.5 : 1, marginHorizontal: 20 }}
                >
                    <Text>← Trước</Text>
                </TouchableOpacity>

                <Text>{`${page} / ${totalPages}`}</Text>

                <TouchableOpacity
                    disabled={page >= totalPages}
                    onPress={() => {
                        const newPage = page + 1;
                        setPage(newPage);
                        loadJobs(true);
                    }}
                    style={{ opacity: page >= totalPages ? 0.5 : 1, marginHorizontal: 20 }}
                >
                    <Text>Sau →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SearchResult;
