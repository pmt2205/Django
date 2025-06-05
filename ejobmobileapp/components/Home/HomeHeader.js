import { Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import MyStyles from "../../styles/MyStyles";

const HomeHeader = ({ q, setQ, search, onSubmit, searchOnly = false }) => {
    return (
        <>
            {searchOnly ? (
                <View >
                    <Searchbar
                        placeholder="Tìm việc làm..."
                        value={q}
                        onChangeText={(text) => search(text, setQ)}
                        style={MyStyles.searchbar}
                        onSubmitEditing={() => onSubmit && onSubmit()}
                        returnKeyType="search"
                        icon={() => (
                            <View style={{ paddingHorizontal: 8 }}>
                                <Icon name="search" size={20} color="#d40000" />
                            </View>
                        )}
                    />
                </View>
            ) : (
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
                            value={q}
                            onChangeText={(text) => search(text, setQ)}
                            style={MyStyles.searchbar}
                            onSubmitEditing={() => onSubmit && onSubmit()}
                            returnKeyType="search"
                            icon={() => (
                                <View style={{ paddingHorizontal: 8 }}>
                                    <Icon name="search" size={20} color="#d40000" />
                                </View>
                            )}
                        />
                    </View>
                </LinearGradient>
            )}
        </>
    );
};

export default HomeHeader;
