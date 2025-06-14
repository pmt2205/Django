import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffafc',
    },
    header: {
        paddingTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#fa8888'
    },
    logo: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
        marginRight: 12,
    },
    searchbarContainer: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        borderRadius: 25,
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    searchbar: {
        backgroundColor: 'white',
        elevation: 0,
        shadowOpacity: 0,
    },

    row: {
        flexDirection: "row",
    },
    wrap: {
        flexWrap: "wrap",
    },
    chip: {
        margin: 4,
        paddingVertical: 6,
        paddingHorizontal: 14,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        elevation: 1,
    },
    chipSelected: {
        backgroundColor: '#ff5e5e',
    },
    chipText: {
        color: '#333',
        fontSize: 14,
    },
    chipTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 12,
        margin: 5,
        marginRight: 20,

    },
    listItemShadow: {
        marginHorizontal: 10,
        marginVertical: 6,
        borderRadius: 16,
        backgroundColor: '#fff',
        // Shadow cho iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        // Shadow cho Android
        elevation: 5,
    },
    listItem: {
        flexDirection: 'row',
        borderRadius: 16,
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'transparent',
    },

    listDescription: {
        color: '#666',
        fontSize: 16,
        marginTop: 4,
    },
    titleText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#222',
    },
    industrySection: {
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },

    locationSalaryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Cho phép xuống dòng nếu dư chiều ngang        justifyContent: 'flex-start',
        alignItems: 'center',
        marginHorizontal: 12,
        marginBottom: 10,
    },

    locationBox: {
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffcccc',
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginRight: 6,  // khoảng cách giữa 2 box
        marginBottom: 10,
    },

    locationText: {
        fontSize: 16,
        color: '#d40000',
        textAlign: 'center',
        fontWeight: 'bold',

    },

    btnAll: {
        backgroundColor: '#ff5e5e',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        flex: 1,
        marginRight: 8,
        alignItems: 'center'
    },

    btnAlltt: {
        backgroundColor: '#f1f1f1',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: 8
    },

    // dăng nhao

    formInput: {
        marginBottom: 16,
    },

    formButton: {
        marginTop: 10,
        borderRadius: 55,
        paddingVertical: 8,
        backgroundColor: '#ff5e5e',
    },

    formButtonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    errorText: {
        color: 'black',
        marginBottom: 10,
        textAlign: 'center',
    },
    authWrapper: {
        flex: 1,
        backgroundColor: '#fffafc',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 10
    },

    authCard: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    authTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fa6666',
        textAlign: 'center',
        marginBottom: 20,
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: 10,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,  // khoảng cách giữa 2 lựa chọn
    },
    avatarButton: {
        backgroundColor: '#ececec',
        paddingVertical: 10,
        paddingHorizontal: 12,   // giảm padding ngang cho gọn
        borderRadius: 4,
        alignItems: 'center',
        marginVertical: 10,
        alignSelf: 'flex-start',  // để nút không giãn full chiều ngang
    },

    avatarButtonText: {
        color: 'black',
        fontWeight: '500',
        fontSize: 16,
    },

    boxwhite: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingTop: 40,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginTop: -10, // đẩy lên dưới logo
        zIndex: 1
    },
    companyListContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    companyItem: {
        marginRight: 15,
        alignItems: 'center',
        width: 100,
    },
    companyLogo: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginBottom: -40,
        zIndex: 2,
        backgroundColor: '#fff',
        elevation: 12, // Android
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    companyImage: {
        width: 80,
        height: 80,
        borderRadius: 50,
        marginBottom: 8,
        resizeMode: 'cover',
        backgroundColor: '#f0f0f0',
    },
    companyName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
        width: '100%',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    infoBox: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '30%',
        paddingHorizontal: 8,
        marginTop: 10,
    },

    infoText: {
        fontSize: 14,
        color: '#d40000',
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '500',
        flexWrap: 'wrap',
    },


    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    verticalDivider: {
        width: 1,
        height: 50,
        backgroundColor: '#ffcccc',
        marginHorizontal: 4,
    },

    btnmsg: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: '#ff5e5e',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        zIndex: 1000,
    }
});
