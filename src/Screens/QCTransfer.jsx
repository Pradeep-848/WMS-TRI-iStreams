import React, { useState, useEffect } from 'react';
import { View, ScrollView, Modal, Text, Dimensions, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';
import Header from '../Components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocationService } from '../Logics/LocationService';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { TextInput, Button, Provider } from 'react-native-paper';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';
import CustomDatePicker from '../Components/CustomDatePicker';
import { useNavigation } from '@react-navigation/native';
import QRBarcodeScanner from '../Components/QRBarcodeScanner';
import { useAuth } from '../Context/AuthContext';
import EmployeeListCard from '../Components/EmployeeListCard';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSnackbar } from '../Context/SnackbarContext';

const { height } = Dimensions.get('window');

const QCTransfer = () => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { userData } = useAuth();
    const { showSnackbar } = useSnackbar();

    const [coordinates, setCoordinates] = useState('');
    const [locationName, setLocationName] = useState('Fetching location...');
    const [address, setAddress] = useState('');
    const [transDatevisible, settransDateVisible] = useState(false);
    const [transferDate, setTransferDate] = useState('');
    const [transferTime, setTransferTime] = useState('');
    const [projectNo, setProjectNo] = useState('');
    const [projectName, setProjectName] = useState('');
    const [btnloading, setbtnLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [qcController, setQcController] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cuttingLineNo, setCuttingLineNo] = useState('');
    const [cuttingLineList, setCuttingLineList] = useState([]);

    const [sectionFromModalVisible, setSectionFromModalVisible] = useState(false);
    const [sectionToModalVisible, setSectionToModalVisible] = useState(false);

    const [selectedSectionFrom, setSelectedSectionFrom] = useState(null);
    const [selectedSectionTo, setSelectedSectionTo] = useState(null);

    const openSectionFromModal = () => setSectionFromModalVisible(true);
    const closeSectionFromModal = () => setSectionFromModalVisible(false);

    const openSectionToModal = () => {
        if (selectedSectionFrom) {
            setSectionToModalVisible(true);
        }
    };
    const closeSectionToModal = () => setSectionToModalVisible(false);

    const handleSectionSelectFrom = (section) => {
        setSelectedSectionFrom(section);
        setSelectedSectionTo(null); // Reset Transfer To
        closeSectionFromModal();
    };

    const handleSectionSelectTo = (section) => {
        setSelectedSectionTo(section);
        closeSectionToModal();
    };

    const sectionListForTo = selectedSectionFrom
        ? sectionList.filter(section => section.SECTION_NO !== selectedSectionFrom.SECTION_NO)
        : [];

    const getEmpData = async () => {
        try {
            const empData = await callSoapService(userData.clientURL, 'Get_Emp_BasicInfo', {
                EmpNo: userData.userEmployeeNo
            });

            if (empData.length > 0) {
                const empDataWithAvatar = empData.map(emp => ({
                    ...emp,
                    EMP_IMAGE: userData.userAvatar
                }));
                setQcController(empDataWithAvatar);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    const getSectionList = async () => {
        try {
            const sectionList = await callSoapService(userData.clientURL, 'QC_Production_GetSectionsList', {});

            if (sectionList.length > 0) {
                setSectionList(sectionList);
            }

        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    const getCuttingLineList = async () => {
        try {
            if (!cuttingLineList || cuttingLineList.length === 0) {
                const storedCuttingLineData = await AsyncStorage.getItem('CuttingLineList');
                if (storedCuttingLineData !== null) {
                    const parsedData = JSON.parse(storedCuttingLineData);
                    setCuttingLineList(parsedData);
                }
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    useEffect(() => {
        const now = new Date();
        setTransferDate(formatDate(now));
        setTransferTime(formatTime(now));

        LocationService(setLocationName, setCoordinates, setAddress);

        getEmpData();
        getSectionList();
        getCuttingLineList();
    }, []);

    const handleTransferNoteDate = (dateString) => {
        setTransferDate(dateString);
    };

    const handleScannedValue = (scannedValue) => {
        setCuttingLineNo(scannedValue);

        // Use the same lookup logic as handleGetProjectBOQ
        const filteredData = cuttingLineList.filter(item => item.CUTTINGLINE_NO === scannedValue);

        if (filteredData.length > 0) {
            setProjectNo(filteredData[0].PROJECT_NO);
            setProjectName(filteredData[0].PROJECT_NAME);
        } else {
            setCuttingLineNo('');
            setProjectNo('');
            setProjectName('');
            showSnackbar('Cutting Line Not Found', 'error');
        }

        setModalVisible(false);
    };


    const handleGetProjectBOQ = () => {
        const filteredData = cuttingLineList.filter(item => item.CUTTINGLINE_NO === cuttingLineNo);

        if (filteredData.length > 0) {
            setProjectNo(filteredData[0].PROJECT_NO);
            setProjectName(filteredData[0].PROJECT_NAME);
        } else {
            setCuttingLineNo('');
            setProjectNo('');
            setProjectName('');
            showSnackbar('Cutting Line Not Found', 'error');
        }
    };

    const handlenavToEmpPage = () => {
        setbtnLoading(true);
        try {
            if (!selectedSectionFrom) {
                showSnackbar('Please enter Section From details.', 'warning');
                return;
            }
            else if (!selectedSectionTo) {
                showSnackbar('Please enter Section To details.', 'warning');
                return;
            }
            else if (!cuttingLineNo) {
                showSnackbar('Please scan / enter Cutting Line No.', 'warning');
                return;
            }
            else if (!projectNo || !projectName) {
                showSnackbar('Please enter Project details.', 'warning');
                return;
            }

            navigation.navigate('QCTransElements', {
                transferDate, transferTime, qcController, 
                selectedSectionFrom, selectedSectionTo, cuttingLineNo, 
                projectNo, projectName
            });

        }
        catch (e) {
            setbtnLoading(false);
        }
        finally {
            setbtnLoading(false);
        }
    };

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="QC Transfer Shopfloor" />

            <View style={[globalStyles.locationContainer, { flexDirection: 'row', alignItems: 'center' }]}>
                <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
            </View>

            <View style={{ height: height * 0.16 }}>
                <Text style={[globalStyles.subtitle, globalStyles.my_5]}>QC Controller</Text>

                <EmployeeListCard loading={loading} selectedEmp={qcController} />
            </View>

            {/* Show scanned images */}
            <ScrollView style={globalStyles.flex_1}>
                <View style={[globalStyles.twoInputContainer, { marginTop: 10 }]}>
                    <View style={globalStyles.container1}>
                        <TextInput
                            mode="outlined"
                            label="Transfer Date"
                            value={transferDate}
                            onPress={() => settransDateVisible(true)}
                            showSoftInputOnFocus={false}
                            theme={theme}
                        />
                    </View>

                    <View style={globalStyles.container2}>
                        <TextInput
                            mode="outlined"
                            label="Transfer Time"
                            value={transferTime}
                            theme={theme}
                            editable={false}
                        />
                    </View>
                </View>

                <Provider>
                    <View>
                        {/* Transfer From */}
                        <Text style={[globalStyles.subtitle, globalStyles.my_5]}>Transfer From</Text>
                        <View style={[globalStyles.twoInputContainer, { gap: 8 }]}>
                            <TouchableOpacity onPress={openSectionFromModal} style={{ width: '35%' }}>
                                <TextInput
                                    mode="outlined"
                                    label="Section No"
                                    theme={theme}
                                    value={selectedSectionFrom ? selectedSectionFrom.SECTION_NO.toString() : ''}
                                    editable={false}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={openSectionFromModal} style={globalStyles.container2}>
                                <TextInput
                                    mode="outlined"
                                    label="Section Name"
                                    theme={theme}
                                    value={selectedSectionFrom ? selectedSectionFrom.SECTION_NAME : ''}
                                    editable={false}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Transfer To */}
                        <Text style={[globalStyles.subtitle, globalStyles.my_5]}>Transfer To</Text>
                        <View style={[globalStyles.twoInputContainer, { gap: 8 }]}>
                            <TouchableOpacity onPress={openSectionToModal} style={{ width: '35%' }}>
                                <TextInput
                                    mode="outlined"
                                    label="Section No"
                                    theme={theme}
                                    value={selectedSectionTo ? selectedSectionTo.SECTION_NO.toString() : ''}
                                    editable={false}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={openSectionToModal} style={globalStyles.container2}>
                                <TextInput
                                    mode="outlined"
                                    label="Section Name"
                                    theme={theme}
                                    value={selectedSectionTo ? selectedSectionTo.SECTION_NAME : ''}
                                    editable={false}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Transfer From Modal */}
                        <Modal
                            visible={sectionFromModalVisible}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={closeSectionFromModal}
                        >
                            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
                                <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 10, padding: 20 }}>
                                    <Text style={[globalStyles.subtitle, globalStyles.my_5]}>Select Section</Text>
                                    <ScrollView>
                                        {sectionList.map(section => (
                                            <Button
                                                key={section.SECTION_NO}
                                                theme={theme}
                                                onPress={() => handleSectionSelectFrom(section)}
                                            >
                                                {section.SECTION_NAME}
                                            </Button>
                                        ))}
                                    </ScrollView>
                                    <Button mode="contained" theme={theme} onPress={closeSectionFromModal}>Cancel</Button>
                                </View>
                            </View>
                        </Modal>

                        {/* Transfer To Modal */}
                        <Modal
                            visible={sectionToModalVisible}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={closeSectionToModal}
                        >
                            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
                                <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 10, padding: 20 }}>
                                    <Text style={[globalStyles.subtitle, globalStyles.my_5]}>Select Section</Text>
                                    <ScrollView>
                                        {sectionListForTo.map(section => (
                                            <Button
                                                key={section.SECTION_NO}
                                                theme={theme}
                                                onPress={() => handleSectionSelectTo(section)}
                                            >
                                                {section.SECTION_NAME}
                                            </Button>
                                        ))}
                                    </ScrollView>
                                    <Button mode="contained" theme={theme} onPress={closeSectionToModal}>Cancel</Button>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </Provider>

                <View>
                    <Text style={[globalStyles.subtitle, globalStyles.my_5]}>CuttingLine Details</Text>
                    <View style={globalStyles.twoInputContainer}>
                        <View style={globalStyles.container1}>
                            <TextInput
                                mode="outlined"
                                label="CuttingLine No"
                                theme={theme}
                                value={cuttingLineNo}
                                onChangeText={setCuttingLineNo}
                                onSubmitEditing={handleGetProjectBOQ}
                                right={
                                    <TextInput.Icon
                                        icon="qrcode-scan"
                                        size={30}
                                        color={colors.text}
                                        onPress={() => setModalVisible(true)}
                                    />}
                            />
                        </View>

                        <View style={globalStyles.container2}>
                            <TextInput
                                mode="outlined"
                                label="Project No"
                                theme={theme}
                                value={projectNo}
                                editable={false}
                                onChangeText={setProjectNo}
                            />
                        </View>
                    </View>

                    <TextInput
                        mode="outlined"
                        label="Project Name"
                        theme={theme}
                        value={projectName}
                        editable={false}
                        style={globalStyles.my_5}
                        onChangeText={setProjectName}
                    />
                </View>
            </ScrollView >

            <View style={globalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    disabled={btnloading}
                    theme={{
                        colors: {
                            primary: colors.primary,
                            disabled: colors.lightGray,
                        },
                    }}
                    onPress={handlenavToEmpPage}
                    loading={btnloading}>
                    Next
                </Button>
            </View>

            <CustomDatePicker
                visible={transDatevisible}
                onClose={() => settransDateVisible(false)}
                onDateSelected={handleTransferNoteDate}
            />

            {/* Scanner Modal */}
            <Modal visible={modalVisible} animationType="slide">
                <QRBarcodeScanner
                    onScanned={handleScannedValue}
                    onClose={() => setModalVisible(false)}
                />
            </Modal>
        </View >
    );
};

export default QCTransfer;