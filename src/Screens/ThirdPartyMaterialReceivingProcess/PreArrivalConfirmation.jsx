import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../Context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Header from '../../Components/Header';
import BackgroundGradient from '../../Components/BackgroundGradient';
import { GlobalStyles } from '../../Styles/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../Context/ThemeContext';
import { Checkbox, TextInput, Button, Card, IconButton, Chip } from 'react-native-paper';
import GenericListPopup from '../../Modal/GenericListPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNShare from 'react-native-share';
import { handlePickImageOptimized } from '../../Utils/nativeCameraFunction';

const PreArrivalConfirmation = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { userData } = useAuth();

    const [modalVisible, setModalVisible] = useState(false);
    const [activeCard, setActiveCard] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    //GenericListPopup
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [projectNo, setProjectNo] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectList, setprojectList] = useState([]);

    const [formProjectData, setFormProjectData] = useState({});

    const [formData, setFormData] = useState({
        preArrival: {
            projectRef: '',
            expectedDate: '',
            confirmation: false,
            logisticsArranged: false,
            thirdPartyArranged: false,
            hasData: false,
        },
        vehicleArrival: {
            securityId: '',
            deliveryNote: '',
            status: '',
            driverName: '',
            vehiclePlate: '',
            verifySafety: false,
            photoTaken: false,
            hasData: false,
        }
    });

    const [tempFormData, setTempFormData] = useState({});

    const handleCapturePress = () => {
        console.log('Capture button pressed');
        handlePickImageOptimized((imageUri) => {
            console.log('Callback received image URI:', imageUri);
            if (imageUri) {
                setCapturedImage(imageUri);
            }
        });
    };

    const shareViaWhatsApp = async () => {
        if (!capturedImage) {
            Alert.alert("No Image", "Please capture an image first before sharing.");
            return;
        }

        try {
            const shareOptions = {
                title: 'Vehicle Inspection',
                message: 'Vehicle Inspection Photo',
                url: `file://${capturedImage}`,
                type: 'image/jpeg',
                social: RNShare.Social.WHATSAPP,
            };

            await RNShare.shareSingle(shareOptions);

        } catch (error) {
            console.log("Error sharing to WhatsApp:", error);

            // Fallback: Try general share
            try {
                await RNShare.open({
                    title: 'Vehicle Inspection Photo',
                    message: 'Vehicle Inspection Photo',
                    url: `file://${capturedImage}`,
                    type: 'image/jpeg',
                });
            } catch (fallbackError) {
                console.log("Fallback share error:", fallbackError);
                Alert.alert("Sharing Error", "Unable to share the image.");
            }
        }
    };

    const openModal = (cardType) => {
        setTempFormData({ ...formData[cardType] });
        setActiveCard(cardType);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setActiveCard(null);
        setTempFormData({});
    };

    const updateTempFormData = (field, value) => {
        setTempFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveFormData = () => {
        if (activeCard) {
            setFormData(prev => ({
                ...prev,
                [activeCard]: {
                    ...tempFormData,
                    photoTaken: activeCard === 'vehicleArrival' ? capturedImage : prev[activeCard]?.photoTaken,
                    hasData: true
                }
            }));
        }
        closeModal();
    };

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('ProjectList');
            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setprojectList(parsedData);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    const handleProjectSelect = (project) => {
        setProjectNo(project.PROJECT_NO);
        setProjectName(project.PROJECT_NAME);
        setFormProjectData(prev => ({
            ...prev,
            PROJECT_NO: project.PROJECT_NO,
            PROJECT_NAME: project.PROJECT_NAME
        }));
        setPopupVisible(false);
    };

    const handleChange = (name, value) => {
        setFormProjectData(prevFormData => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const renderModalContent = () => {
        if (!activeCard) return null;

        if (activeCard === 'preArrival') {
            return (
                <ScrollView style={[styles.modalContent]}>
                    <View style={styles.checkBoxSection}>
                        <Text style={globalStyles.subtitle_3}>Confirmation to Store Material</Text>
                        <Checkbox
                            status={tempFormData.confirmation ? 'checked' : 'unchecked'}
                            onPress={() => updateTempFormData('confirmation', !tempFormData.confirmation)}
                            theme={theme}
                        />
                    </View>

                    <TextInput
                        label="Project Ref.No"
                        mode="outlined"
                        theme={theme}
                        value={formProjectData.PROJECT_NAME}
                        onChangeText={text => handleChange('PROJECT_NO', text)}
                        left={<TextInput.Icon icon="file-document" />}
                        style={globalStyles.mb_5}
                        showSoftInputOnFocus={false}
                    />

                    <TextInput
                        label="Expected Arrival Date"
                        mode="outlined"
                        theme={theme}
                        value={tempFormData.expectedDate}
                        onChangeText={(t) => updateTempFormData('expectedDate', t)}
                        left={<TextInput.Icon icon="calendar" />}
                    />

                    <View style={globalStyles.mt_10}>
                        <Text style={[globalStyles.subtitle_2, globalStyles.mt_10, globalStyles.mb_10]}>Vehicle Arrangements<Text style={[globalStyles.subtitle_4, { color: colors.gray }]}>{" "}(Select Options)</Text></Text>
                    </View>

                    <View style={[styles.chipContainer]}>
                        <Chip
                            style={[
                                styles.chip, globalStyles.mb_5, { backgroundColor: colors.background },
                            ]}
                            icon={tempFormData.logisticsArranged ? "check" : "truck"}
                            textStyle={[
                                globalStyles.subtitle_3
                            ]}
                            theme={theme}
                            onPress={() => updateTempFormData('logisticsArranged', !tempFormData.logisticsArranged)}
                            selected={tempFormData.logisticsArranged}
                        >
                            Logistics Arranged
                        </Chip>

                        <Chip
                            style={[
                                styles.chip, { backgroundColor: colors.background },
                            ]}
                            icon={tempFormData.thirdPartyArranged ? "check" : "account-group"}
                            textStyle={[
                                globalStyles.subtitle_3
                            ]}
                            theme={theme}
                            onPress={() => updateTempFormData('thirdPartyArranged', !tempFormData.thirdPartyArranged)}
                            selected={tempFormData.thirdPartyArranged}
                        >
                            3rd Party Arranged
                        </Chip>
                    </View>
                </ScrollView>
            );
        }

        if (activeCard === 'vehicleArrival') {
            return (
                <ScrollView style={styles.modalContent}>
                    <Button
                        mode="outlined"
                        style={[globalStyles.bottomButtonContainer]}
                        theme={theme}
                        icon="barcode-scan"
                        onPress={() => console.log('Scan Pass')}
                    >
                        Scan Pass
                    </Button>

                    <TextInput
                        label="Driver Name"
                        mode="outlined"
                        theme={theme}
                        style={globalStyles.mb_5}
                        value={tempFormData.driverName}
                        onChangeText={(t) => updateTempFormData('driverName', t)}
                        left={<TextInput.Icon icon="account" />}
                    />

                    <TextInput
                        label="Vehicle Plate No"
                        mode="outlined"
                        theme={theme}
                        style={globalStyles.mb_5}
                        value={tempFormData.vehiclePlate}
                        onChangeText={(t) => updateTempFormData('vehiclePlate', t)}
                        left={<TextInput.Icon icon="car" />}
                    />

                    <View style={[globalStyles.twoInputContainer1, globalStyles.justifyEnd]}>
                        <View style={globalStyles.checkBoxContainer}>
                            <Checkbox
                                theme={theme}
                                status={tempFormData.verifySafety ? 'checked' : 'unchecked'}
                                onPress={() => updateTempFormData('verifySafety', !tempFormData.verifySafety)}
                            />
                            <View style={globalStyles.twoInputContainer}>
                                <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>Verify Material Safety</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[globalStyles.twoInputContainer, globalStyles.p_10, globalStyles.borderRadius_10, globalStyles.mt_10, { borderWidth: 2, borderColor: colors.gray, borderStyle: "dashed" }]}>
                        {capturedImage && (
                            <View style={[globalStyles.mt_10, globalStyles.container1, globalStyles.alignItemsCenter]}>
                                <Image
                                    source={{ uri: capturedImage }}
                                    style={globalStyles.uploadedEmpImage}
                                />
                            </View>
                        )}

                        <View style={[globalStyles.twoInputContainer]}>
                            {/* Share Button */}
                            <IconButton
                                icon="share-variant"
                                mode="outlined"
                                theme={theme}
                                size={24}
                                onPress={shareViaWhatsApp}
                            />

                            <IconButton
                                icon={capturedImage ? "camera-check" : "camera"}
                                mode="contained"
                                theme={theme}
                                size={24}
                                onPress={handleCapturePress}
                            />
                        </View>
                    </View>
                </ScrollView>
            );
        }
    };

    const displayCardData = (cardType) => {
        const data = formData[cardType];

        if (!data.hasData) {
            return (
                <View style={[globalStyles.alignItemsCenter, globalStyles.justalignCenter, globalStyles.p_10]}>
                    <Icon name="information-outline" size={24} color={colors.warning} />
                    <Text style={[globalStyles.subtitle_3, { color: colors.gray }, globalStyles.mt_5]}>
                        No data entered yet. Click the edit icon to add details.
                    </Text>
                </View>
            );
        }

        if (cardType === 'preArrival') {
            return (
                <View style={globalStyles.p_10}>
                    <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
                        <View style={globalStyles.twoInputContainer}>
                            <Icon name="map" size={20} color={colors.primary} />
                            <Text style={[globalStyles.subtitle_2, globalStyles.ml_5]}>{formProjectData.PROJECT_NAME || 'Not set'}</Text>
                        </View>
                        <View style={globalStyles.twoInputContainer}>
                            <Icon name="calendar" size={20} color={colors.primary} />
                            <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>{data.expectedDate || 'Not set'}</Text>
                        </View>
                    </View>

                    <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
                        <View style={globalStyles.twoInputContainer}>
                            <Icon name="truck" size={20} color={data.logisticsArranged ? colors.success : colors.gray} />
                            <Text style={[globalStyles.subtitle_4, globalStyles.ml_5, { color: data.logisticsArranged ? colors.success : colors.gray }]}>
                                {data.logisticsArranged ? 'Logistics Arranged' : 'Logistics Not Arranged'}
                            </Text>
                        </View>

                        <View style={globalStyles.twoInputContainer}>
                            <Icon name="account-group" size={20} color={data.thirdPartyArranged ? colors.success : colors.gray} />
                            <Text style={[globalStyles.subtitle_4, globalStyles.ml_5, { color: data.thirdPartyArranged ? colors.success : colors.gray }]}>
                                {data.thirdPartyArranged ? '3rd Party Arranged' : '3rd Party Not Arranged'}
                            </Text>
                        </View>
                    </View>

                    {/* In Pass ID Status - Show after proceed */}
                    <View style={[globalStyles.twoInputContainer1, globalStyles.justifyEnd]}>
                        <View style={[globalStyles.twoInputContainer]}>
                            <Icon name="clock-time-three-outline" size={20} color={colors.warning} />
                            <Text style={[globalStyles.subtitle_4, globalStyles.ml_5, { color: colors.warning }]}>
                                In Pass ID: Pending
                            </Text>
                        </View>
                    </View>
                </View>
            );
        }

        if (cardType === 'vehicleArrival') {
            return (
                <View style={globalStyles.p_10}>
                    <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
                        <View style={globalStyles.twoInputContainer}>
                            <Icon name="note-text" size={20} color={colors.primary} />
                            <Text style={[globalStyles.subtitle_2, globalStyles.ml_5]}>Delivery Note: {data.deliveryNote || 'Not set'}</Text>
                        </View>
                        <View style={globalStyles.twoInputContainer}>
                            <Icon name="information" size={20} color={colors.primary} />
                            <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>Status: {data.status || 'Not set'}</Text>
                        </View>
                    </View>

                    <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
                        <View style={globalStyles.twoInputContainer}>
                            <Icon name="account" size={20} color={colors.primary} />
                            <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>{data.driverName || 'Not set'}</Text>
                        </View>
                        <View style={globalStyles.twoInputContainer}>
                            <Icon name="car" size={20} color={colors.primary} />
                            <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>{data.vehiclePlate || 'Not set'}</Text>
                        </View>
                    </View>

                    <View style={[globalStyles.mb_10, globalStyles.twoInputContainer1]}>
                        <Text style={[globalStyles.subtitle_2, globalStyles.ml_5]}>Material Safety :</Text>
                        <Text style={[globalStyles.subtitle_3, globalStyles.ml_5, data.verifySafety ? styles.verified : styles.pending]}>
                            {data.verifySafety ? '✓ Verified' : 'Not Verified'}
                        </Text>
                    </View>

                    <View>
                        <Image
                            source={data.photoTaken ? { uri: data.photoTaken } : require('../../../assets/timeLine/delivery.jpg')}
                            style={{ height: 200, width: '100%', borderRadius: 8 }}
                        />
                    </View>
                </View>
            );
        }
    };

    const handleNext = () => {
        navigation.navigate('ReceiverUnloadingVerification');
    };

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Gate Entry & Pre-Arrival" />

                <Card style={[globalStyles.dataCard, globalStyles.mb_20]}>
                    <Card.Title
                        title="3rd Party Receipt Planning"
                        titleStyle={[globalStyles.subtitle_1]}
                        left={(props) => <Icon name="clipboard-text" size={35} color={colors.primary} />}
                        right={(props) => (
                            <IconButton
                                {...props}
                                icon="pencil"
                                onPress={() => openModal('preArrival')}
                            />
                        )}
                    />
                    <Card.Content>
                        {displayCardData('preArrival')}

                        {formData.preArrival.hasData && (
                            <Button
                                mode="contained"
                                style={globalStyles.bottomButtonContainer}
                                theme={theme}
                                icon={formData.preArrival.confirmation ? "check" : "alert-circle"}
                                disabled={!formData.preArrival.confirmation}
                            >
                                {formData.preArrival.confirmation ? 'Saved' : 'Save & Notify Security'}
                            </Button>
                        )}
                    </Card.Content>
                </Card>

                <Card style={globalStyles.dataCard}>
                    <Card.Title
                        title="Security Gate Check-In"
                        titleStyle={[globalStyles.subtitle_1]}
                        left={(props) => <Icon name="boom-gate" size={35} color={colors.primary} />}
                        right={(props) => (
                            <IconButton
                                {...props}
                                icon="pencil"
                                onPress={() => openModal('vehicleArrival')}
                            />
                        )}
                    />
                    <Card.Content>
                        {displayCardData('vehicleArrival')}

                        {formData.vehicleArrival.hasData && (
                            <Button
                                mode="contained"
                                style={globalStyles.bottomButtonContainer}
                                theme={theme}
                                icon={formData.vehicleArrival.verifySafety ? "check" : "alert-circle"}
                                disabled={!formData.vehicleArrival.verifySafety}
                            >
                                {formData.vehicleArrival.verifySafety ? 'Security Stamped' : 'Apply Security Stamp & Release'}
                            </Button>
                        )}
                    </Card.Content>
                </Card>

                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={closeModal}
                >
                    <View style={[globalStyles.flex_1, globalStyles.justalignCenter, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                            <View style={globalStyles.twoInputContainer1}>
                                <Text style={globalStyles.subtitle_1}>
                                    {activeCard === 'preArrival' ? '3rd Party Receipt Planning' : 'Security Gate Check-In'}
                                </Text>
                                <IconButton
                                    icon="close"
                                    size={24}
                                    iconColor={colors.error}
                                    onPress={closeModal}
                                />
                            </View>

                            {renderModalContent()}

                            <Button
                                mode="contained"
                                theme={theme}
                                style={globalStyles.bottomButtonContainer}
                                onPress={saveFormData}
                                icon="content-save"
                            >
                                Proceed
                            </Button>
                        </View>
                    </View>
                </Modal>

                <GenericListPopup
                    visible={isPopupVisible}
                    onClose={() => setPopupVisible(false)}
                    onSelect={handleProjectSelect}
                    data={projectList}
                    mainLabelExtractor={(item) => item?.PROJECT_NO || ''}
                    labelExtractor={null}
                    subLabelExtractor={(item) => item.PROJECT_NAME || ''}
                    lastLabelExtractor={null}
                    searchKeyExtractor={(item) => `${item.PROJECT_NO || ''} ${item.PROJECT_NAME || ''}`}
                />
            </View>

            <View style={[globalStyles.bottomButtonContainer, globalStyles.p_20]}>
                <Button
                    mode="contained"
                    theme={theme}
                    onPress={handleNext}
                >
                    Next
                </Button>
            </View>
        </BackgroundGradient>
    );
};

export default PreArrivalConfirmation;

const styles = StyleSheet.create({
    checkBoxSection: {
        flexDirection: 'row-reverse',
        alignItems: 'center'
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    verified: {
        color: '#4CAF50',
    },
    pending: {
        color: '#FF9800',
    },
    chipContainer: {
        paddingVertical: 6,
    },
    chip: {
        marginHorizontal: 4,
    },
});



// import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, Image } from 'react-native';
// import React, { useState } from 'react';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useAuth } from '../../Context/AuthContext';
// import { useNavigation } from '@react-navigation/native';
// import Header from '../../Components/Header';
// import BackgroundGradient from '../../Components/BackgroundGradient';
// import { GlobalStyles } from '../../Styles/styles';
// import { useTheme } from '../../Context/ThemeContext';
// import { Checkbox, TextInput, Button, Card, IconButton, Chip, Icon } from 'react-native-paper';

// const PreArrivalConfirmation = () => {
//     const insets = useSafeAreaInsets();
//     const navigation = useNavigation();
//     const { theme } = useTheme();
//     const colors = theme.colors;
//     const globalStyles = GlobalStyles(colors);
//     const { userData } = useAuth();

//     const [modalVisible, setModalVisible] = useState(false);
//     const [activeCard, setActiveCard] = useState(null);

//     const [formData, setFormData] = useState({
//         preArrival: {
//             projectRef: '',
//             expectedDate: '',
//             confirmation: false,
//             logisticsArranged: false,
//             thirdPartyArranged: false,
//             hasData: false,
//         },
//         vehicleArrival: {
//             securityId: '',
//             deliveryNote: '',
//             status: '',
//             driverName: '',
//             vehiclePlate: '',
//             verifySafety: false,
//             photoTaken: false,
//             hasData: false,
//         }
//     });

//     const [tempFormData, setTempFormData] = useState({});

//     const openModal = (cardType) => {
//         setTempFormData({ ...formData[cardType] });
//         setActiveCard(cardType);
//         setModalVisible(true);
//     };

//     const closeModal = () => {
//         setModalVisible(false);
//         setActiveCard(null);
//         setTempFormData({});
//     };

//     const updateTempFormData = (field, value) => {
//         setTempFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     const saveFormData = () => {
//         if (activeCard) {
//             setFormData(prev => ({
//                 ...prev,
//                 [activeCard]: {
//                     ...tempFormData,
//                     hasData: true
//                 }
//             }));
//         }
//         closeModal();
//     };

//     const renderModalContent = () => {
//         if (!activeCard) return null;

//         if (activeCard === 'preArrival') {
//             return (
//                 <ScrollView style={[styles.modalContent]}>
//                     <View style={styles.checkBoxSection}>
//                         <Text style={globalStyles.subtitle_3}>Confirmation to Store Material</Text>
//                         <Checkbox
//                             status={tempFormData.confirmation ? 'checked' : 'unchecked'}
//                             onPress={() => updateTempFormData('confirmation', !tempFormData.confirmation)}
//                             theme={theme}
//                         />
//                     </View>

//                     <TextInput
//                         label="Project Ref.No"
//                         mode="outlined"
//                         theme={theme}
//                         value={tempFormData.projectRef}
//                         onChangeText={(t) => updateTempFormData('projectRef', t)}
//                         left={<TextInput.Icon icon="file-document" />}
//                         style={globalStyles.mb_5}
//                     />

//                     <TextInput
//                         label="Expected Arrival Date"
//                         mode="outlined"
//                         theme={theme}
//                         value={tempFormData.expectedDate}
//                         onChangeText={(t) => updateTempFormData('expectedDate', t)}
//                         left={<TextInput.Icon icon="calendar" />}
//                     />

//                     <View style={globalStyles.mt_10}>
//                         <Text style={[globalStyles.subtitle_2, globalStyles.mt_10, globalStyles.mb_10]}>Vehicle Arrangements</Text>
//                     </View>

//                     <View style={[styles.chipContainer]}>
//                         <Chip
//                             style={[
//                                 styles.chip, globalStyles.mb_5, { backgroundColor: colors.background, borderColor: colors.primary },
//                             ]}
//                             icon={tempFormData.logisticsArranged ? "check" : "truck"}
//                             textStyle={[
//                                 globalStyles.subtitle_3
//                             ]}
//                             theme={theme}
//                             onPress={() => updateTempFormData('logisticsArranged', !tempFormData.logisticsArranged)}
//                             selected={tempFormData.logisticsArranged}
//                         >
//                             Logistics Arranged
//                         </Chip>

//                         <Chip
//                             style={[
//                                 styles.chip, { backgroundColor: colors.background, borderColor: colors.primary },
//                             ]}
//                             icon={tempFormData.thirdPartyArranged ? "check" : "account-group"}
//                             textStyle={[
//                                 globalStyles.subtitle_3
//                             ]}
//                             theme={theme}
//                             onPress={() => updateTempFormData('thirdPartyArranged', !tempFormData.thirdPartyArranged)}
//                             selected={tempFormData.thirdPartyArranged}
//                         >
//                             3rd Party Arranged
//                         </Chip>
//                     </View>
//                 </ScrollView>
//             );
//         }

//         if (activeCard === 'vehicleArrival') {
//             return (
//                 <ScrollView style={styles.modalContent}>
//                     <View style={globalStyles.twoInputContainer}>
//                         <Icon source="badge-account" size={20} color={colors.primary} />
//                         <Text style={[globalStyles.subtitle_2, globalStyles.ml_5]}>Security - ID</Text>
//                     </View>

//                     <View style={globalStyles.twoInputContainer1}>
//                         <Button
//                             mode="outlined"
//                             style={[globalStyles.flex_1, globalStyles.m_10]}
//                             theme={theme}
//                             icon="barcode-scan"
//                             onPress={() => console.log('Scan Pass')}
//                         >
//                             Scan Pass
//                         </Button>
//                     </View>

//                     <TextInput
//                         label="Delivery Note/Invoice No."
//                         mode="outlined"
//                         theme={theme}
//                         style={globalStyles.mb_5}
//                         value={tempFormData.deliveryNote}
//                         onChangeText={(t) => updateTempFormData('deliveryNote', t)}
//                         left={<TextInput.Icon icon="note-text" />}
//                     />
//                     <TextInput
//                         label="Status"
//                         mode="outlined"
//                         theme={theme}
//                         style={globalStyles.mb_5}
//                         value={tempFormData.status}
//                         onChangeText={(t) => updateTempFormData('status', t)}
//                         left={<TextInput.Icon icon="information" />}
//                     />

//                     <TextInput
//                         label="Driver Name"
//                         mode="outlined"
//                         theme={theme}
//                         style={globalStyles.mb_5}
//                         value={tempFormData.driverName}
//                         onChangeText={(t) => updateTempFormData('driverName', t)}
//                         left={<TextInput.Icon icon="account" />}
//                     />

//                     <TextInput
//                         label="Vehicle Plate No"
//                         mode="outlined"
//                         theme={theme}
//                         style={globalStyles.mb_5}
//                         value={tempFormData.vehiclePlate}
//                         onChangeText={(t) => updateTempFormData('vehiclePlate', t)}
//                         left={<TextInput.Icon icon="car" />}
//                     />

//                     <View style={globalStyles.twoInputContainer1}>
//                         <View style={styles.checkBoxSection}>
//                             <Checkbox
//                                 status={tempFormData.verifySafety ? 'checked' : 'unchecked'}
//                                 onPress={() => updateTempFormData('verifySafety', !tempFormData.verifySafety)}
//                             />
//                             <View style={globalStyles.twoInputContainer}>
//                                 <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>Verify Material Safety</Text>
//                             </View>
//                         </View>

//                         <IconButton
//                             icon={tempFormData.photoTaken ? "camera-check" : "camera"}
//                             mode="contained"
//                             theme={theme}
//                             size={24}
//                             onPress={() => updateTempFormData('photoTaken', !tempFormData.photoTaken)}
//                         />
//                     </View>
//                 </ScrollView>
//             );
//         }
//     };

//     const displayCardData = (cardType) => {
//         const data = formData[cardType];

//         if (!data.hasData) {
//             return (
//                 <View style={[globalStyles.alignItemsCenter, globalStyles.justalignCenter, globalStyles.p_10]}>
//                     <Icon source="information-outline" size={24} color={colors.warning} />
//                     <Text style={[globalStyles.subtitle_3, { color: colors.gray }, globalStyles.mt_5]}>
//                         No data entered yet. Click the edit icon to add details.
//                     </Text>
//                 </View>
//             );
//         }

//         if (cardType === 'preArrival') {
//             return (
//                 <View style={globalStyles.p_10}>
//                     <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
//                         <View style={globalStyles.twoInputContainer}>
//                             <Icon source="map" size={20} color={colors.primary} />
//                             <Text style={[globalStyles.subtitle_2, globalStyles.ml_5]}>{data.projectRef || 'Not set'}</Text>
//                         </View>
//                         <View style={globalStyles.twoInputContainer}>
//                             <Icon source="calendar" size={20} color={colors.primary} />
//                             <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>{data.expectedDate || 'Not set'}</Text>
//                         </View>
//                     </View>

//                     <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
//                         <View style={globalStyles.twoInputContainer}>
//                             <Icon source="truck" size={20} color={data.thirdPartyArranged ? colors.success : colors.gray} />
//                             <Text style={[globalStyles.subtitle_4, globalStyles.ml_5, { color: data.thirdPartyArranged ? colors.success : colors.gray }]}>
//                                 {data.thirdPartyArranged ? 'Logistics Arranged' : '3rd Party Arranged'}
//                             </Text>
//                         </View>
//                         <View style={globalStyles.twoInputContainer}>
//                             {/* <Icon source="check-circle" size={20} color={data.confirmation ? colors.success : colors.error} /> */}
//                             <Text style={[globalStyles.subtitle_4, globalStyles.ml_5, { color: data.confirmation ? colors.success : colors.error }]}>
//                                 {data.confirmation ? '✓ Confirmed' : 'Not Confirmed'}
//                             </Text>
//                         </View>
//                     </View>
//                 </View>
//             );
//         }

//         if (cardType === 'vehicleArrival') {
//             return (
//                 <View style={globalStyles.p_10}>
//                     <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
//                         <View style={globalStyles.twoInputContainer}>
//                             <Icon source="note-text" size={20} color={colors.primary} />
//                             <Text style={[globalStyles.subtitle_2, globalStyles.ml_5]}>{data.deliveryNote || 'Not set'}</Text>
//                         </View>
//                         <View style={globalStyles.twoInputContainer}>
//                             <Icon source="information" size={20} color={colors.primary} />
//                             <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>{data.status || 'Not set'}</Text>
//                         </View>
//                     </View>

//                     <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
//                         <View style={globalStyles.twoInputContainer}>
//                             <Icon source="account" size={20} color={colors.primary} />
//                             <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>{data.driverName || 'Not set'}</Text>
//                         </View>
//                         <View style={globalStyles.twoInputContainer}>
//                             <Icon source="car" size={20} color={colors.primary} />
//                             <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>{data.vehiclePlate || 'Not set'}</Text>
//                         </View>
//                     </View>

//                     <View style={[globalStyles.mb_10, globalStyles.twoInputContainer1]}>
//                         <Text style={[globalStyles.subtitle_2, globalStyles.ml_5]}>Safety Verified:</Text>
//                         <Text style={[globalStyles.subtitle_3, globalStyles.ml_5, data.verifySafety ? styles.verified : styles.pending]}>
//                             {data.verifySafety ? '✓ Verified' : 'Not Verified'}
//                         </Text>
//                     </View>

//                     <View>
//                         <Image
//                             source={data.photoTaken ? { uri: data.photoTaken } : require('../../../assets/timeLine/delivery.jpg')}
//                             style={{ height: 200, width: '100%', borderRadius: 8 }}
//                         />
//                     </View>
//                 </View>
//             );
//         }
//     };

//     return (
//         <BackgroundGradient>
//             <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
//                 <Header title="Gate Entry & Pre-Arrival" />

//                 <Card style={[globalStyles.dataCard, globalStyles.mb_20]}>
//                     <Card.Title
//                         title="3rd Party Receipt Planning"
//                         titleStyle={[globalStyles.subtitle_1]}
//                         left={(props) => <Icon source="clipboard-text" size={35} color={colors.primary} />}
//                         right={(props) => (
//                             <IconButton
//                                 {...props}
//                                 icon="pencil"
//                                 onPress={() => openModal('preArrival')}
//                             />
//                         )}
//                     />
//                     <Card.Content>
//                         {displayCardData('preArrival')}

//                         {formData.preArrival.hasData && (
//                             <Button
//                                 mode="contained"
//                                 style={globalStyles.bottomButtonContainer}
//                                 theme={theme}
//                                 icon={formData.preArrival.confirmation ? "check" : "alert-circle"}
//                                 disabled={!formData.preArrival.confirmation}
//                             >
//                                 {formData.preArrival.confirmation ? 'Saved' : 'Save & Notify Security'}
//                             </Button>
//                         )}
//                     </Card.Content>
//                 </Card>

//                 <Card style={globalStyles.dataCard}>
//                     <Card.Title
//                         title="Security Gate Check-In"
//                         titleStyle={[globalStyles.subtitle_1]}
//                         left={(props) => <Icon source="boom-gate" size={35} color={colors.primary} />}
//                         right={(props) => (
//                             <IconButton
//                                 {...props}
//                                 icon="pencil"
//                                 onPress={() => openModal('vehicleArrival')}
//                             />
//                         )}
//                     />
//                     <Card.Content>
//                         {displayCardData('vehicleArrival')}

//                         {formData.vehicleArrival.hasData && (
//                             <Button
//                                 mode="contained"
//                                 style={globalStyles.bottomButtonContainer}
//                                 theme={theme}
//                                 icon={formData.vehicleArrival.verifySafety ? "check" : "alert-circle"}
//                                 disabled={!formData.vehicleArrival.verifySafety}
//                             >
//                                 {formData.vehicleArrival.verifySafety ? 'Security Stamped' : 'Apply Security Stamp & Release'}
//                             </Button>
//                         )}
//                     </Card.Content>
//                 </Card>

//                 <Modal
//                     visible={modalVisible}
//                     transparent
//                     animationType="slide"
//                     onRequestClose={closeModal}
//                 >
//                     <View style={[globalStyles.flex_1, globalStyles.justalignCenter, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
//                         <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
//                             <View style={globalStyles.twoInputContainer1}>
//                                 <Text style={globalStyles.subtitle_1}>
//                                     {activeCard === 'preArrival' ? '3rd Party Receipt Planning' : 'Security Gate Check-In'}
//                                 </Text>
//                                 <IconButton
//                                     icon="close"
//                                     size={24}
//                                     iconColor={colors.error}
//                                     onPress={closeModal}
//                                 />
//                             </View>

//                             {renderModalContent()}

//                             <Button
//                                 mode="contained"
//                                 style={globalStyles.bottomButtonContainer}
//                                 onPress={saveFormData}
//                                 theme={theme}
//                                 icon="content-save"
//                             >
//                                 Proceed
//                             </Button>
//                         </View>
//                     </View>
//                 </Modal>
//             </View>
//         </BackgroundGradient>
//     );
// };

// export default PreArrivalConfirmation;

// const styles = StyleSheet.create({
//     checkBoxSection: {
//         flexDirection: 'row-reverse',
//         alignItems: 'center'
//     },
//     modalContent: {
//         width: '100%',
//         maxWidth: 400,
//         borderRadius: 20,
//         padding: 20,
//         maxHeight: '80%',
//     },
//     verified: {
//         color: '#4CAF50',
//     },
//     pending: {
//         color: '#FF9800',
//     },
//     chipContainer: {
//         paddingVertical: 6,
//     },
//     chip: {
//         marginHorizontal: 4,
//     },
// });