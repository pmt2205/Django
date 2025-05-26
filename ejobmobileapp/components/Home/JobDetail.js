import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Linking } from "react-native";
import Apis, { endpoints } from "../../configs/Apis";
import { Card, Text } from "react-native-paper";

const JobDetail = ({ route }) => {
    const jobId = route.params?.jobId;
    const [job, setJob] = useState(null);

    const loadJob = async () => {
        try {
            let res = await Apis.get(endpoints['job-detail'](jobId));
            setJob(res.data); // hoặc res.data.results[0] nếu backend trả dạng danh sách
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadJob();
    }, [jobId]);

    return (
        <ScrollView contentContainerStyle={{ padding: 10 }}>
            {job === null ? (
                <ActivityIndicator />
            ) : (
                <Card>
                    <Card.Title
                        title={job.title}
                        subtitle={`Ngày đăng: ${new Date(job.created_date).toLocaleDateString()}`}
                    />

                    <Card.Cover source={{ uri: job.company.image }} />

                    <Card.Content style={{ gap: 8 }}>
                        <Text variant="bodyMedium"><Text style={{ fontWeight: "bold" }}>Công ty:</Text> {job.company.name}</Text>
                        <Text variant="bodyMedium"><Text style={{ fontWeight: "bold" }}>Địa chỉ:</Text> {job.company.address}</Text>
                        <Text variant="bodyMedium">
                            <Text style={{ fontWeight: "bold" }}>Website:</Text>{' '}
                            <Text style={{ color: 'blue' }} onPress={() => Linking.openURL(job.company.website)}>
                                {job.company.website}
                            </Text>
                        </Text>
                        <Text variant="bodyMedium"><Text style={{ fontWeight: "bold" }}>Ngành nghề:</Text> {job.industry.name}</Text>
                        <Text variant="bodyMedium"><Text style={{ fontWeight: "bold" }}>Hình thức:</Text> {job.job_type}</Text>
                        <Text variant="bodyMedium"><Text style={{ fontWeight: "bold" }}>Mức lương:</Text> {job.salary_from} - {job.salary_to} ({job.salary_type})</Text>
                        <Text variant="bodyMedium"><Text style={{ fontWeight: "bold" }}>Địa điểm làm việc:</Text> {job.location}</Text>
                        <Text variant="bodyMedium"><Text style={{ fontWeight: "bold" }}>Mô tả công ty:</Text> {job.company.description}</Text>
                    </Card.Content>
                </Card>
            )}
        </ScrollView>
    );
};

export default JobDetail;
