import { View, Text } from "react-native"
import MyStyles from "../../styles/MyStyles"
import { Chip } from "react-native-paper";
import Apis, {endpoints} from "../../configs/Apis";
import { useEffect, useState } from "react";

const Home = () => {
    const [industries, setIndustries] = useState([]);
    const loadIndus = async () => {
        let res = await Apis.get(endpoints['industries'])
        setIndustries(res.data);
    }

    useEffect(() => {
        loadIndus();
    }, []);

    return (
        <View style={MyStyles.container}>
            <Text>Danh sách ngành</Text>
            <View>
                {industries.map(i => <Chip key={i.id} icon="label">{i.name}</Chip>)}
            </View>
        </View>
    )
}

export default Home