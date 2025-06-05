import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import { Button, TextInput } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import MyStyles from "../../../styles/MyStyles";

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
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);



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
      setMsg("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    setMsg(null);
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      const payload = {
        title,
        description,
        requirements,
        industry,
        job_type: jobType,
        salary_type: salaryType,
        salary_from: salaryFrom ? Number(salaryFrom) : null,
        salary_to: salaryTo ? Number(salaryTo) : null,
        location,
        deadline: deadline ? deadline.toISOString().split("T")[0] : null,
      };

      await axios.post(
        "https://tuongou.pythonanywhere.com/jobs/create_job/",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg("Đăng tin tuyển dụng thành công!");

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
      console.error("Submit error:", error.response?.data || error.message);
      setMsg("Không thể đăng tin tuyển dụng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={MyStyles.sectionTitle}>Đăng tin tuyển dụng</Text>
      {loading && (
        <ActivityIndicator size="large" color="#fa6666" style={{ marginVertical: 10 }} />
      )}


      <TextInput
        label="Tiêu đề"
        mode="outlined"
        value={title}
        onChangeText={setTitle}
        style={MyStyles.formInput}
        outlineColor="#ffcccc"
        activeOutlineColor="#ff8888"
      />

      <TextInput
        label="Mô tả công việc"
        mode="outlined"
        value={description}
        onChangeText={setDescription}
        style={MyStyles.formInput}
        outlineColor="#ffcccc"
        activeOutlineColor="#ff8888"
        multiline
        numberOfLines={4}
      />

      <TextInput
        label="Yêu cầu kỹ năng, kinh nghiệm"
        mode="outlined"
        value={requirements}
        onChangeText={setRequirements}
        style={MyStyles.formInput}
        outlineColor="#ffcccc"
        activeOutlineColor="#ff8888"
        multiline
        numberOfLines={4}
      />

      <View style={{
        borderWidth: 1,
        borderColor: '#ffcccc',
        borderRadius: 4,
        marginBottom: 15,
        justifyContent: 'center',
        height: 56
      }}>
        <Picker
          selectedValue={industry}
          onValueChange={(itemValue) => setIndustry(itemValue)}
          prompt="Chọn ngành nghề"
          dropdownIconColor="#ff8888"
        >
          <Picker.Item label="Chọn ngành nghề" value={null} />
          {industries.map((ind) => (
            <Picker.Item key={ind.id} label={ind.name} value={ind.id} />
          ))}
        </Picker>
      </View>

      <View style={{
        borderWidth: 1,
        borderColor: '#ffcccc',
        borderRadius: 4,
        marginBottom: 15,
        justifyContent: 'center',
        height: 56
      }}>
        <Picker
          selectedValue={jobType}
          onValueChange={(setJobType)}
          prompt="Loại hình công việc"
          dropdownIconColor="#ff8888"
        >
          <Picker.Item label="Loại hình công việc" value={null} />
          {JOB_TYPE_OPTIONS.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>

      <View style={{
        borderWidth: 1,
        borderColor: '#ffcccc',
        borderRadius: 4,
        marginBottom: 15,
        justifyContent: 'center',
        height: 56
      }}>
        <Picker
          selectedValue={salaryType}
          onValueChange={(setSalaryType)}
          prompt="Loại mức lương"
          dropdownIconColor="#ff8888"
        >
          <Picker.Item label="Loại mức lương" value={null} />
          {SALARY_TYPE_OPTIONS.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>

      <TextInput
        label="Mức lương từ"
        mode="outlined"
        value={salaryFrom}
        onChangeText={setSalaryFrom}
        style={MyStyles.formInput}
        keyboardType="numeric"
        outlineColor="#ffcccc"
        activeOutlineColor="#ff8888"
      />

      <TextInput
        label="Mức lương đến"
        mode="outlined"
        value={salaryTo}
        onChangeText={setSalaryTo}
        style={MyStyles.formInput}
        keyboardType="numeric"
        outlineColor="#ffcccc"
        activeOutlineColor="#ff8888"
      />

      <TextInput
        label="Địa điểm làm việc"
        mode="outlined"
        value={location}
        onChangeText={setLocation}
        style={MyStyles.formInput}
        outlineColor="#ffcccc"
        activeOutlineColor="#ff8888"
      />

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: deadline ? '#ff8888' : '#ffcccc',
            borderRadius: 4,
            paddingHorizontal: 12,
            justifyContent: 'center',
            height: 56,
            marginBottom: 15,
          }}
        >
          <Text style={{
            paddingLeft: 3,
            color: '#444',
            fontSize: 16,
          }}>
            {deadline ? deadline.toLocaleDateString() : "Hạn nộp hồ sơ"}
          </Text>
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={deadline || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDeadline}
          minimumDate={new Date()}
        />
      )}

      {msg && (
        <Text
          style={{
            color: msg.includes("thành công") ? "green" : "red",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          {msg}
        </Text>
      )}




      <Button
        mode="contained"
        onPress={submitJob}
        style={{
          borderRadius: 12,
          marginTop: 8,
          backgroundColor: '#fa6666',
        }}
        labelStyle={{
          color: '#fff',
          fontWeight: 'bold',
        }}
      >
        Đăng tin
      </Button>

    </ScrollView>
  );
};

export default CreateJob;
