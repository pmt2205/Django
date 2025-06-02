// components/Home/HomeHeader.js
import React from 'react';
import { Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Searchbar } from 'react-native-paper';
import MyStyles from "../../styles/MyStyles";

const HomeHeader = ({ q, setQ, search, onSubmit }) => {
    return (
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
                    onChangeText={(text) => {
                        search(text, setQ);
                    }}
                    style={MyStyles.searchbar}
                    onSubmitEditing={() => {
                        onSubmit && onSubmit();
                    }}
                    returnKeyType="search"
                />
            </View>
        </LinearGradient>
    );
};

export default HomeHeader;
