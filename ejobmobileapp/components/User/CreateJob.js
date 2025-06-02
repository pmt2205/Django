import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Alert, Platform } from "react-native";
import { Button } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';

const JOB_TYPE_OPTIONS = [
  { label: "Bán thời gian", value: "part_time" },
  { label: "Toàn thời gian", value: "full_time" },
  { label: "Freelance", value: "freelance" },
];

const SALARY_TYPE_OPTIONS = [
  { label: "Theo giờ", value: "hourly" },
  { label: "Theo ngày", value: "daily" },
  { label: "Theo tháng", value: "monthly" },
  { label: "Theo dự án", value: "project" },
];

const CreateJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [industry, setIndustry] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [jobType, setJobType] = useState("");
  const [salaryType, setSalaryType] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Fetch industries from API khi component mount
    const fetchIndustries = async () => {
      try {
        const res = await axios.get("https://tuongou.pythonanywhere.com/industries/");
        setIndustries(res.data);
      } catch (error) {
        console.error("Failed to fetch industries", error);
      }
    };
    fetchIndustries();
  }, []);

  const onChangeDeadline = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // iOS giữ picker mở
    if (selectedDate) setDeadline(selectedDate);
  };

  const submitJob = async () => {
    if (!title || !description || !requirements || !industry || !jobType || !salaryType || !location) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const payload = {
        title,
        description,
        requirements,
        industry: industry, // id ngành nghề
        job_type: jobType,
        salary_type: salaryType,
        salary_from: salaryFrom ? Number(salaryFrom) : null,
        salary_to: salaryTo ? Number(salaryTo) : null,
        location,
        deadline: deadline ? deadline.toISOString().split("T")[0] : null,
      };

      const res = await axios.post(
        "https://tuongou.pythonanywhere.com/jobs/create_job/",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Thành công", "Đăng tin tuyển dụng thành công!");
      // Reset form
      setTitle("");
      setDescription("");
      setRequirements("");
      setIndustry(null);
      setJobType("");
      setSalaryType("");
      setSalaryFrom("");
      setSalaryTo("");
      setLocation("");
      setDeadline(null);
    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert("Lỗi", "Không thể đăng tin tuyển dụng. Vui lòng thử lại.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>Đăng tin tuyển dụng</Text>

      <Text>Tiêu đề *</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Nhập tiêu đề"
        style={{ borderBottomWidth: 1, marginBottom: 15 }}
      />

      <Text>Mô tả công việc *</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Mô tả chi tiết"
        multiline
        numberOfLines={4}
        style={{ borderWidth: 1, marginBottom: 15, padding: 8, textAlignVertical: "top" }}
      />

      <Text>Yêu cầu kỹ năng *</Text>
      <TextInput
        value={requirements}
        onChangeText={setRequirements}
        placeholder="Yêu cầu kỹ năng, kinh nghiệm"
        multiline
        numberOfLines={3}
        style={{ borderWidth: 1, marginBottom: 15, padding: 8, textAlignVertical: "top" }}
      />

      <Text>Ngành nghề *</Text>
      <View style={{ borderWidth: 1, borderRadius: 4, marginBottom: 15 }}>
        <Picker
          selectedValue={industry}
          onValueChange={(itemValue) => setIndustry(itemValue)}
          prompt="Chọn ngành nghề"
        >
          <Picker.Item label="-- Chọn ngành nghề --" value={null} />
          {industries.map((ind) => (
            <Picker.Item key={ind.id} label={ind.name} value={ind.id} />
          ))}
        </Picker>
      </View>

      <Text>Loại hình công việc *</Text>
      <View style={{ borderWidth: 1, borderRadius: 4, marginBottom: 15 }}>
        <Picker selectedValue={jobType} onValueChange={setJobType}>
          <Picker.Item label="-- Chọn loại hình --" value="" />
          {JOB_TYPE_OPTIONS.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>

      <Text>Loại mức lương *</Text>
      <View style={{ borderWidth: 1, borderRadius: 4, marginBottom: 15 }}>
        <Picker selectedValue={salaryType} onValueChange={setSalaryType}>
          <Picker.Item label="-- Chọn loại mức lương --" value="" />
          {SALARY_TYPE_OPTIONS.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>

      <Text>Mức lương từ</Text>
      <TextInput
        value={salaryFrom}
        onChangeText={setSalaryFrom}
        placeholder="Nhập mức lương từ"
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 15 }}
      />

      <Text>Mức lương đến</Text>
      <TextInput
        value={salaryTo}
        onChangeText={setSalaryTo}
        placeholder="Nhập mức lương đến"
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 15 }}
      />

      <Text>Địa điểm làm việc *</Text>
      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="Nhập địa điểm"
        style={{ borderBottomWidth: 1, marginBottom: 15 }}
      />

      <Text>Hạn nộp hồ sơ</Text>
      <Button onPress={() => setShowDatePicker(true)} mode="outlined" style={{ marginBottom: 10 }}>
        {deadline ? deadline.toLocaleDateString() : "Chọn ngày"}
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={deadline || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDeadline}
          minimumDate={new Date()}
        />
      )}

      <Button mode="contained" onPress={submitJob}>
        Đăng tin
      </Button>
    </ScrollView>
  );
};

export default CreateJob;
