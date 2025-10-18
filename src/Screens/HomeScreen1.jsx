import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, BackHandler, Alert, Dimensions, ScrollView, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ModuleCard from '../Components/ModuleCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../Context/AuthContext';
import HomeHeader from '../Components/HomeHeader';
import { useTheme } from '../Context/ThemeContext';
import { colors } from '../Styles/colors';
import BackgroundGradient from '../Components/BackgroundGradient';
import MatReqPopup from '../Modal/MatReqPopup';
import InwardMaterialPopup from '../Modal/InwardMaterialPopup';
import { checkForUpdate } from '../Logics/CheckForUpdate';

const { width, height } = Dimensions.get('window');

const HomeScreen1 = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { userData, logout } = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    const insets = useSafeAreaInsets();
    const [selectedModule, setSelectedModule] = useState(null);
    const [matReqpopupVisible, setMatReqPopupVisible] = useState(false);
    const [showInwardMatPopup, setShowInwardMatPopup] = useState(false);

    const [avatarUri, setAvatarUri] = useState(userData?.userAvatar ? `data:image/jpeg;base64,${userData.userAvatar}` : null);

    const handleDPImageCLick = () => {
        navigation.navigate('ProfileScreen');
    };

    const handlePopupCLick = () => {
        setShowPopup(!showPopup);
    };

    const handleInwardMatSelection = (option) => {
        if (option === 'supplier') {
            navigation.navigate('SupplierInward');
        } else if (option === 'store') {
            navigation.navigate('StoreInward');
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            logout();
            navigation.replace('Login');
        } catch (error) {
            console.error('Error clearing AsyncStorage:', error);
        }
    };

    const handleShopfloorTracking = () => navigation.navigate('ShopfloorTracking');
    const handleInwardMaterial = () => {
        setShowInwardMatPopup(true);
    };

    const modules = [
        {
            image: require('../../assets/modules/tracking.jpg'),
            title: 'Requests',
            submodules: [
                {
                    image: require('../../assets/modules/mat_req.jpg'),
                    title: 'Material Request',
                    onPress: () => navigation.navigate('SwitchMaterialRequestScreen'),
                },
            ],
        },
        // {
        //     image: require('../../assets/modules/request.jpg'),
        //     title: 'Progress Tracking',
        //     submodules: [
        //         {
        //             image: require('../../assets/modules/shopfloor.jpg'),
        //             title: 'Shopfloor Tracking',
        //             onPress: handleShopfloorTracking,
        //         },
        //         {
        //             image: require('../../assets/modules/dpr.jpg'),
        //             title: 'DPR',
        //             onPress: () => navigation.navigate('DPR'),
        //         },
        //     ],
        // },
        {
            image: require('../../assets/modules/inv_management.jpg'),
            title: 'Inventory Management',
            submodules: [
                {
                    image: require('../../assets/modules/stk_counting.jpg'),
                    title: 'Stock Counting',
                    onPress: () => navigation.navigate('StockCounting'),
                },
                {
                    image: require('../../assets/modules/barcode_mapping.jpg'),
                    title: 'Material Barcodes',
                    onPress: () => navigation.navigate('AddMatBarcodes'),
                },
                {
                    image: require('../../assets/modules/mat_inwards.jpg'),
                    title: 'Material Inwards',
                    onPress: handleInwardMaterial,
                },
                {
                    image: require('../../assets/modules/mat_trans_note.jpg'),
                    title: 'Material Transfer Note',
                    onPress: () => navigation.navigate('MaterialTransferNote'),
                },
            ],
        },
        {
            image: require('../../assets/materialProcess/materialreceivingprocess.png'),
            title: 'Material Receiving Process',
            submodules: [
                {
                    image: require('../../assets/materialProcess/vehiclecheckin.png'),
                    title: 'Vehicle Check In',
                    onPress: () => navigation.navigate('VehicleCheckInScreen'),
                },
                {
                    image: require('../../assets/materialProcess/activereceipt.png'),
                    title: 'Active Receipt',
                    onPress: () => navigation.navigate('ActiveReceiptScreen'),
                },
                {
                    image: require('../../assets/materialProcess/grnbooking.png'),
                    title: 'GRN Details',
                    onPress: () => navigation.navigate('GrnDetailsScreen'),
                },
                {
                    image: require('../../assets/materialProcess/putawayprocess.png'),
                    title: 'Putaway Process',
                    onPress: () => navigation.navigate('PutawayProcessScreen'),
                },
            ],
        },
        {
            image: require('../../assets/materialProcess/materialreceivingprocess.png'),
            title: 'Material Issue Process',
            submodules: [
                {
                    image: require('../../assets/materialProcess/vehiclecheckin.png'),
                    title: 'Material Issue List',
                    onPress: () => navigation.navigate('MaterialIssueListScreen'),
                },
                {
                    image: require('../../assets/materialProcess/vehiclecheckin.png'),
                    title: 'Pick Material',
                    onPress: () => navigation.navigate('PickMaterialScreen'),
                },
                {
                    image: require('../../assets/materialProcess/vehiclecheckin.png'),
                    title: 'Loading & Dispatch',
                    onPress: () => navigation.navigate('LoadingAndDispatchScreen'),
                },
                {
                    image: require('../../assets/materialProcess/vehiclecheckin.png'),
                    title: 'Security Inspection',
                    onPress: () => navigation.navigate('SecurityInspectionScreen'),
                },
            ],
        }
    ];

    // dynamically add subtitle based on submodules
    const modulesWithSubtitles = modules.map(module => ({
        ...module,
        subtitle: `(${module.submodules.map(sub => sub.title).join(', ')})`,
    }));

    const handleModuleClick = (module) => {
        setSelectedModule(module);
    };

    useEffect(() => {
        checkForUpdate();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (selectedModule) {
                    setSelectedModule(null);
                    return true; // prevent exit
                }
                Alert.alert(
                    'Exit App',
                    'Do you want to exit?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Yes', onPress: () => BackHandler.exitApp() },
                    ]
                );
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [selectedModule])
    );

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                {/* === Top Bar === */}
                <View style={[globalStyles.twoInputContainer, globalStyles.my_5]}>
                    {/* Logo on the left */}
                    <Image source={require('../../assets/logo_edited.png')} style={styles.logo} />

                    {/* Spacer or main content container */}
                    <View style={[globalStyles.twoInputContainer1, globalStyles.flex_1, globalStyles.ml_10]}>
                        {/* Company name in center */}
                        <TouchableOpacity style={styles.titleContainer} onPress={handlePopupCLick}>
                            <Text style={[globalStyles.subtitle_3, globalStyles.txt_center]} numberOfLines={1}>
                                {userData.companyName}
                            </Text>
                        </TouchableOpacity>

                        {/* Icons row aligned to the right */}
                        <View style={globalStyles.twoInputContainer}>
                            <TouchableOpacity onPress={() => navigation.navigate('NotificationListScreen')} style={[styles.iconButton, { backgroundColor: colors.background }]}>
                                <Icon name='bell' size={24} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')} style={[styles.iconButton, { backgroundColor: colors.background }]}>
                                <AntDesign name='message1' size={24} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDPImageCLick}>
                                <Image
                                    source={
                                        avatarUri
                                            ? { uri: avatarUri }
                                            : require("../../assets/images.png") // fallback image
                                    }
                                    style={globalStyles.medAvatar}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* === Popup for Account === */}
                {showPopup && (
                    <View style={[styles.popup, { backgroundColor: colors.card }]}>
                        <Text style={[globalStyles.subtitle_3, { marginBottom: 5, textAlign: 'center', width: 170 }]} numberOfLines={2}>
                            {userData.companyName}
                        </Text>

                        <Text style={[globalStyles.subtitle_3, { marginBottom: 5, textAlign: 'center' }]}>
                            Account Details
                        </Text>

                        <Button style={{ backgroundColor: colors.error }} onPress={handleLogout} theme={{ colors: { primary: 'white' } }}>
                            Logout
                        </Button>
                    </View>
                )}

                <MatReqPopup visible={matReqpopupVisible} onClose={() => setMatReqPopupVisible(false)} />

                <HomeHeader user={{ name: userData.userName, avatar: avatarUri }} />

                {/* === Modules & Submodules === */}
                <ScrollView contentContainerStyle={[globalStyles.justalignCenter, globalStyles.my_5]} showsVerticalScrollIndicator={false}>
                    {!selectedModule ? (
                        modulesWithSubtitles.map((m, index) => (
                            <ModuleCard
                                key={index}
                                {...m}
                                onPress={() => handleModuleClick(m)}
                            />
                        ))
                    ) : (
                        <>
                            <TouchableOpacity onPress={() => setSelectedModule(null)} style={globalStyles.mb_20}>
                                <Text style={[globalStyles.subtitle, { color: colors.primary }]}>← Back</Text>
                            </TouchableOpacity>
                            {selectedModule.submodules.map((sm, index) => (
                                <ModuleCard key={index} {...sm} />
                            ))}
                        </>
                    )}
                </ScrollView>

                {/* Popup for Account Details and Logout */}
                {showInwardMatPopup && (
                    <InwardMaterialPopup visible={showInwardMatPopup} onClose={() => setShowInwardMatPopup(false)}
                        onSelectOption={handleInwardMatSelection} />
                )}
            </View>
        </BackgroundGradient>
    );
};

export default HomeScreen1;

const styles = StyleSheet.create({
    logo: {
        width: width > 768 ? 150 : 110,
        resizeMode: 'contain',
        height: width > 768 ? 80 : 60,
    },
    popup: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 70 : 60,
        right: width * 0.05,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 10,
    },
    titleContainer: {
        flex: 1,
        padding: 10,
        borderColor: colors.gray,
        borderWidth: 1,
        borderRadius: 10,
    },
    iconButton: {
        marginHorizontal: 5,
        padding: 8,
        borderRadius: 50,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 18,
    },
});
// import React, { useState, useEffect } from 'react';
// import { View, Text, Image, StyleSheet, TouchableOpacity, BackHandler, Alert, Dimensions, ScrollView, Platform } from 'react-native';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Button } from 'react-native-paper';
// import { GlobalStyles } from '../Styles/styles';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import AntDesign from 'react-native-vector-icons/AntDesign';
// import ModuleCard from '../Components/ModuleCard';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useAuth } from '../Context/AuthContext';
// import HomeHeader from '../Components/HomeHeader';
// import { useTheme } from '../Context/ThemeContext';
// import { colors } from '../Styles/colors';
// import BackgroundGradient from '../Components/BackgroundGradient';
// import MatReqPopup from '../Modal/MatReqPopup';
// import InwardMaterialPopup from '../Modal/InwardMaterialPopup';
// import { checkForUpdate } from '../Logics/CheckForUpdate';

// const { width, height } = Dimensions.get('window');

// const HomeScreen1 = () => {
//     const navigation = useNavigation();
//     const { theme } = useTheme();
//     const colors = theme.colors;
//     const globalStyles = GlobalStyles(colors);
//     const { userData, logout } = useAuth();
//     const [showPopup, setShowPopup] = useState(false);
//     const insets = useSafeAreaInsets();
//     const [selectedModule, setSelectedModule] = useState(null);
//     const [matReqpopupVisible, setMatReqPopupVisible] = useState(false);
//     const [showInwardMatPopup, setShowInwardMatPopup] = useState(false);

//     const [avatarUri, setAvatarUri] = useState(userData?.userAvatar ? `data:image/jpeg;base64,${userData.userAvatar}` : null);

//     const handleDPImageCLick = () => {
//         navigation.navigate('ProfileScreen');
//     };

//     const handlePopupCLick = () => {
//         setShowPopup(!showPopup);
//     };

//     const handleInwardMatSelection = (option) => {
//         if (option === 'supplier') {
//             navigation.navigate('SupplierInward');
//         } else if (option === 'store') {
//             navigation.navigate('StoreInward');
//         }
//     };

//     const handleLogout = async () => {
//         try {
//             await AsyncStorage.clear();
//             logout();
//             navigation.replace('Login');
//         } catch (error) {
//             console.error('Error clearing AsyncStorage:', error);
//         }
//     };

//     const handleShopfloorTracking = () => navigation.navigate('ShopfloorTracking');
//     const handleInwardMaterial = () => {
//         setShowInwardMatPopup(true);
//     };

//     const modules = [
//         {
//             image: require('../../assets/modules/tracking.jpg'),
//             title: 'Requests',
//             submodules: [
//                 {
//                     image: require('../../assets/modules/mat_req.jpg'),
//                     title: 'Material Request',
//                     onPress: () => navigation.navigate('SwitchMaterialRequestScreen'),
//                 },
//             ],
//         },
//         {
//             image: require('../../assets/modules/request.jpg'),
//             title: 'Progress Tracking',
//             submodules: [
//                 {
//                     image: require('../../assets/modules/shopfloor.jpg'),
//                     title: 'Shopfloor Tracking',
//                     onPress: handleShopfloorTracking,
//                 },
//                 {
//                     image: require('../../assets/modules/dpr.jpg'),
//                     title: 'DPR',
//                     onPress: () => navigation.navigate('DPR'),
//                 },
//             ],
//         },
//         {
//             image: require('../../assets/modules/inv_management.jpg'),
//             title: 'Inventory Management',
//             submodules: [
//                 {
//                     image: require('../../assets/modules/stk_counting.jpg'),
//                     title: 'Stock Counting',
//                     onPress: () => navigation.navigate('StockCounting'),
//                 },
//                 {
//                     image: require('../../assets/modules/barcode_mapping.jpg'),
//                     title: 'Material Barcodes',
//                     onPress: () => navigation.navigate('AddMatBarcodes'),
//                 },
//                 {
//                     image: require('../../assets/modules/mat_inwards.jpg'),
//                     title: 'Material Inwards',
//                     onPress: handleInwardMaterial,
//                 },
//                 {
//                     image: require('../../assets/modules/mat_trans_note.jpg'),
//                     title: 'Material Transfer Note',
//                     onPress: () => navigation.navigate('MaterialTransferNote'),
//                 },
//             ],
//         },
//         {
//             image: require('../../assets/materialProcess/projectmaterialprocess.png'),
//             title: 'Project Material Receiving Process',
//             submodules: [
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Material Arrival Scheduling',
//                     onPress: () => navigation.navigate('MaterialArrival'),
//                 },
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Gate Security Check In',
//                     onPress: () => navigation.navigate('GatePassCheckIn'),
//                 },
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'GRN & Project Confirmation',
//                     onPress: () => navigation.navigate('ProjectConfirmation'),
//                 },
//             ],
//         },
//         {
//             image: require('../../assets/materialProcess/suppliermaterialprocess.png'),
//             title: 'Supplier Material Receiving Process',
//             submodules: [
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Vehicle Check In',
//                     onPress: () => navigation.navigate('VehicleCheckInScreen'),
//                 },
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Material Receiving & Grn',
//                     onPress: () => navigation.navigate('MaterialReceivingandGrn'),
//                 },
//                 // {
//                 //     image: require('../../assets/modules/add-location.jpg'),
//                 //     title: 'Active Receipt',
//                 //     onPress: () => navigation.navigate('ActiveReceiptScreen'),
//                 // },
//                 // {
//                 //     image: require('../../assets/modules/add-location.jpg'),
//                 //     title: 'Grn Processing',
//                 //     onPress: () => navigation.navigate('GrnProcessingScreen'),
//                 // },
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Putaway Process',
//                     onPress: () => navigation.navigate('PutawayProcessScreen'),
//                 },
//             ],
//         },
//         {
//             image: require('../../assets/materialProcess/clientmaterialprocess.png'),
//             title: 'Client Material Receiving Process',
//             submodules: [
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Material Arrival Scheduling',
//                     onPress: () => navigation.navigate('MaterialArrivalSchedulingScreen'),
//                 },
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Vehicle Inspection',
//                     onPress: () => navigation.navigate('VehicleInspectionScreen'),
//                 },
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Active Material Receipt',
//                     onPress: () => navigation.navigate('ActiveMaterialReceiptScreen'),
//                 },
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Project Head Confirmation',
//                     onPress: () => navigation.navigate('ProjectHeadConfirmationScreen'),
//                 },
//             ],
//         },
//         {
//             image: require('../../assets/materialProcess/thirdpartyprocess.png'),
//             title: '3rd Party Material Receiving Process',
//             submodules: [
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Gate Entry & Pre-Arrival',
//                     onPress: () => navigation.navigate('PreArrivalConfirmation'),
//                 },
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Receiver Unloading & Verfication',
//                     onPress: () => navigation.navigate('ReceiverUnloadingVerification'),
//                 },
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'System Entry (Store Executive)',
//                     onPress: () => navigation.navigate('SystemEntry'),
//                 },
//             ],
//         },
//         {
//             image: require('../../assets/modules/others.jpg'),
//             title: 'Others',
//             submodules: [
//                 {
//                     image: require('../../assets/modules/add-location.jpg'),
//                     title: 'Add Office / Project Location',
//                 },
//             ],
//         },
//     ];

//     // dynamically add subtitle based on submodules
//     const modulesWithSubtitles = modules.map(module => ({
//         ...module,
//         subtitle: `(${module.submodules.map(sub => sub.title).join(', ')})`,
//     }));

//     const handleModuleClick = (module) => {
//         setSelectedModule(module);
//     };

//     useEffect(() => {
//         checkForUpdate();
//     }, []);

//     useFocusEffect(
//         React.useCallback(() => {
//             const onBackPress = () => {
//                 if (selectedModule) {
//                     setSelectedModule(null);
//                     return true; // prevent exit
//                 }
//                 Alert.alert(
//                     'Exit App',
//                     'Do you want to exit?',
//                     [
//                         { text: 'Cancel', style: 'cancel' },
//                         { text: 'Yes', onPress: () => BackHandler.exitApp() },
//                     ]
//                 );
//                 return true;
//             };
//             const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//             return () => subscription.remove();
//         }, [selectedModule])
//     );

//     return (
//         <BackgroundGradient>
//             <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
//                 {/* === Top Bar === */}
//                 <View style={[globalStyles.twoInputContainer, globalStyles.my_5]}>
//                     {/* Logo on the left */}
//                     <Image source={require('../../assets/logo_edited.png')} style={styles.logo} />

//                     {/* Spacer or main content container */}
//                     <View style={[globalStyles.twoInputContainer1, globalStyles.flex_1, globalStyles.ml_10]}>
//                         {/* Company name in center */}
//                         <TouchableOpacity style={styles.titleContainer} onPress={handlePopupCLick}>
//                             <Text style={[globalStyles.subtitle_3, globalStyles.txt_center]} numberOfLines={1}>
//                                 {userData.companyName}
//                             </Text>
//                         </TouchableOpacity>

//                         {/* Icons row aligned to the right */}
//                         <View style={globalStyles.twoInputContainer}>
//                             <TouchableOpacity onPress={() => navigation.navigate('NotificationListScreen')} style={[styles.iconButton, { backgroundColor: colors.background }]}>
//                                 <Icon name='bell' size={24} color={colors.text} />
//                             </TouchableOpacity>
//                             <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')} style={[styles.iconButton, { backgroundColor: colors.background }]}>
//                                 <AntDesign name='message1' size={24} color={colors.text} />
//                             </TouchableOpacity>
//                             <TouchableOpacity onPress={handleDPImageCLick}>
//                                 <Image
//                                     source={
//                                         avatarUri
//                                             ? { uri: avatarUri }
//                                             : require("../../assets/images.png") // fallback image
//                                     }
//                                     style={globalStyles.medAvatar}
//                                 />
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </View>

//                 {/* === Popup for Account === */}
//                 {showPopup && (
//                     <View style={[styles.popup, { backgroundColor: colors.card }]}>
//                         <Text style={[globalStyles.subtitle_3, { marginBottom: 5, textAlign: 'center', width: 170 }]} numberOfLines={2}>
//                             {userData.companyName}
//                         </Text>

//                         <Text style={[globalStyles.subtitle_3, { marginBottom: 5, textAlign: 'center' }]}>
//                             Account Details
//                         </Text>

//                         <Button style={{ backgroundColor: colors.error }} onPress={handleLogout} theme={{ colors: { primary: 'white' } }}>
//                             Logout
//                         </Button>
//                     </View>
//                 )}

//                 <MatReqPopup visible={matReqpopupVisible} onClose={() => setMatReqPopupVisible(false)} />

//                 <HomeHeader user={{ name: userData.userName, avatar: avatarUri }} />

//                 {/* === Modules & Submodules === */}
//                 <ScrollView contentContainerStyle={[globalStyles.justalignCenter, globalStyles.my_5]} showsVerticalScrollIndicator={false}>
//                     {!selectedModule ? (
//                         modulesWithSubtitles.map((m, index) => (
//                             <ModuleCard
//                                 key={index}
//                                 {...m}
//                                 onPress={() => handleModuleClick(m)}
//                             />
//                         ))
//                     ) : (
//                         <>
//                             <TouchableOpacity onPress={() => setSelectedModule(null)} style={globalStyles.mb_20}>
//                                 <Text style={[globalStyles.subtitle, { color: colors.primary }]}>← Back</Text>
//                             </TouchableOpacity>
//                             {selectedModule.submodules.map((sm, index) => (
//                                 <ModuleCard key={index} {...sm} />
//                             ))}
//                         </>
//                     )}
//                 </ScrollView>

//                 {/* Popup for Account Details and Logout */}
//                 {showInwardMatPopup && (
//                     <InwardMaterialPopup visible={showInwardMatPopup} onClose={() => setShowInwardMatPopup(false)}
//                         onSelectOption={handleInwardMatSelection} />
//                 )}
//             </View>
//         </BackgroundGradient>
//     );
// };

// export default HomeScreen1;

// const styles = StyleSheet.create({
//     logo: {
//         width: width > 768 ? 150 : 110,
//         resizeMode: 'contain',
//         height: width > 768 ? 80 : 60,
//     },
//     popup: {
//         position: 'absolute',
//         top: Platform.OS === 'ios' ? 70 : 60,
//         right: width * 0.05,
//         borderRadius: 10,
//         paddingVertical: 10,
//         paddingHorizontal: 20,
//         shadowColor: '#000',
//         shadowOpacity: 0.2,
//         shadowRadius: 5,
//         elevation: 5,
//         zIndex: 10,
//     },
//     titleContainer: {
//         flex: 1,
//         padding: 10,
//         borderColor: colors.gray,
//         borderWidth: 1,
//         borderRadius: 10,
//     },
//     iconButton: {
//         marginHorizontal: 5,
//         padding: 8,
//         borderRadius: 50,
//     },
//     profileImage: {
//         width: 40,
//         height: 40,
//         borderRadius: 18,
//     },
// });