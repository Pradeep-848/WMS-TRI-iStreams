import React, { useState, useEffect } from 'react';
import { View, ScrollView, Modal, Text } from 'react-native';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';
import Header from '../Components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocationService } from '../Logics/LocationService';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { TextInput, Button } from 'react-native-paper';
import { formatDate } from '../Utils/dataTimeUtils';
import { useNavigation } from '@react-navigation/native';
import QRBarcodeScanner from '../Components/QRBarcodeScanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GenericListPopup from '../Modal/GenericListPopup';
import TransferSection from '../Components/TransferSection';
import BackgroundGradient from '../Components/BackgroundGradient';
import { useSnackbar } from '../Context/SnackbarContext';

const MaterialTransferNote = () => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { showSnackbar } = useSnackbar();

    const [coordinates, setCoordinates] = useState('');
    const [locationName, setLocationName] = useState('Fetching location...');
    const [address, setAddress] = useState('');
    const [transferDate, setTransferDate] = useState('');
    const [transferNote, setTransferNote] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [driverName, setDriverName] = useState('');
    const [btnloading, setbtnLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [scannedBarcodes, setScannedBarcodes] = useState([]);
    const [storeLocationList, setstoreLocationList] = useState([]);
    const [projectList, setprojectList] = useState([]);

    // Transfer From
    const [fromLocation, setFromLocation] = useState("");
    const [fromRack, setFromRack] = useState("");
    const [fromBin, setFromBin] = useState("");
    const [fromProjectNo, setFromProjectNo] = useState("");
    const [fromProjectName, setFromProjectName] = useState("");

    // Transfer To
    const [toLocation, setToLocation] = useState("");
    const [toRack, setToRack] = useState("");
    const [toBin, setToBin] = useState("");
    const [toProjectNo, setToProjectNo] = useState("");
    const [toProjectName, setToProjectName] = useState("");

    // Popup state
    const [locationPopup, setLocationPopup] = useState({ visible: false, type: "" });
    const [projectPopup, setProjectPopup] = useState({ visible: false, type: "" });

    const getStoreLocationData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('StoreLocationList');
            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setstoreLocationList(parsedData);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    const getProjectData = async () => {
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

    useEffect(() => {
        const now = new Date();
        setTransferDate(formatDate(now));

        LocationService(setLocationName, setCoordinates, setAddress);

        getStoreLocationData();
        getProjectData();
    }, []);

    const handleTransferNoteDate = (dateString) => {
        setTransferDate(dateString);
    };

    const handleScannedValue = (value) => {
        if (!scannedBarcodes.includes(value)) {
            setTransferNote(value);
        }
        setModalVisible(false);
    };

    const handleLocationSelect = (item) => {
        if (locationPopup.type === "from") {
            setFromLocation(item.STORE_LOCATION + " (" + item.LOCATION_ID + ")");
            setFromRack(item.RACK_NAME);
            setFromBin(item.BIN_NAME);
        } else if (locationPopup.type === "to") {
            setToLocation(item.STORE_LOCATION + " (" + item.LOCATION_ID + ")");
            setToRack(item.RACK_NAME);
            setToBin(item.BIN_NAME);
        }
        setLocationPopup({ visible: false, type: "" });
    };

    const handleProjectSelect = (item) => {
        if (projectPopup.type === "from") {
            setFromProjectNo(item.PROJECT_NO);
            setFromProjectName(item.PROJECT_NAME);
        } else if (projectPopup.type === "to") {
            setToProjectNo(item.PROJECT_NO);
            setToProjectName(item.PROJECT_NAME);
        }
        setProjectPopup({ visible: false, type: "" });
    };

    const handlenavToEmpPage = () => {
        setbtnLoading(true);

        try {
            if (!transferNote) {
                showSnackbar('Scan / Enter Transfer Note', 'warning');
                return;
            }
            else if (!vehicleNo || !driverName) {
                showSnackbar('Enter vehicle details.', 'warning');
                return;
            }
            else if (!fromLocation || !fromProjectNo || !fromProjectName) {
                showSnackbar('Enter Transfer From details.', 'warning');
                return;
            }
            else if (!toLocation || !toProjectNo || !toProjectName) {
                showSnackbar('Enter Transfer To details.', 'warning');
                return;
            }
            else {
                navigation.navigate('SuppInward_Material', {
                    documents, coordinates, locationName, address,
                    deliveryNoteNo,
                    deliveryNoteDate,
                    poNo,
                    poDate,
                    vehicleNo,
                    driverName
                });

                setbtnLoading(false);
            }
        }
        catch (e) {
            console.log(e);
        }
        finally {
            setbtnLoading(false);
        }
    };

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Material Transfer Note" />

                <View style={globalStyles.locationContainer}>
                    <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                    <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
                </View>

                {/* Show scanned images */}
                <ScrollView style={globalStyles.flex_1}>
                    <View style={[globalStyles.twoInputContainer, globalStyles.mt_10]}>
                        <View style={globalStyles.container1}>
                            <TextInput
                                mode="outlined"
                                label="Transfer Note No"
                                theme={theme}
                                value={transferNote}
                                onChangeText={setTransferNote}
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
                                label="Transfer Date"
                                value={transferDate}
                                editable={false}
                                theme={theme}
                            />
                        </View>
                    </View>

                    <View style={[globalStyles.twoInputContainer, globalStyles.mt_10]}>
                        <View style={globalStyles.container1}>
                            <TextInput
                                mode="outlined"
                                label="Vehicle No"
                                theme={theme}
                                value={vehicleNo}
                                onChangeText={setVehicleNo}
                            />
                        </View>

                        <View style={globalStyles.container2}>
                            <TextInput
                                mode="outlined"
                                label="Driver"
                                theme={theme}
                                value={driverName}
                                onChangeText={setDriverName}
                            />
                        </View>
                    </View>

                    <TransferSection
                        title="Transfer From"
                        colors={colors}
                        globalStyles={globalStyles}
                        location={fromLocation}
                        setLocation={setFromLocation}
                        rack={fromRack}
                        setFromRack={setFromRack}
                        bin={fromBin}
                        setFromBin={setFromBin}
                        projectNo={fromProjectNo}
                        setProjectNo={setFromProjectNo}
                        projectName={fromProjectName}
                        setProjectName={setFromProjectName}
                        onLocationPress={() => setLocationPopup({ visible: true, type: "from" })}
                        onProjectPress={() => setProjectPopup({ visible: true, type: "from" })}
                    />

                    <TransferSection
                        title="Transfer To"
                        colors={colors}
                        globalStyles={globalStyles}
                        location={toLocation}
                        setLocation={setToLocation}
                        rack={toRack}
                        setRack={setToRack}
                        bin={toBin}
                        setBin={setToBin}
                        projectNo={toProjectNo}
                        setProjectNo={setToProjectNo}
                        projectName={toProjectName}
                        setProjectName={setToProjectName}
                        onLocationPress={() => setLocationPopup({ visible: true, type: "to" })}
                        onProjectPress={() => setProjectPopup({ visible: true, type: "to" })}
                    />
                </ScrollView>

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

                {/* Scanner Modal */}
                <Modal visible={modalVisible} animationType="slide">
                    <QRBarcodeScanner
                        onScanned={handleScannedValue}
                        onClose={() => setModalVisible(false)}
                    />
                </Modal>

                <GenericListPopup
                    visible={locationPopup.visible}
                    onClose={() => setLocationPopup({ visible: false, type: "" })}
                    onSelect={handleLocationSelect}
                    data={storeLocationList}
                    mainLabelExtractor={(item) => item?.STORE_LOCATION || ""}
                    labelExtractor={(item) => item.SUB_MATERIAL_NO || ""}
                    subLabelExtractor={(item) => `Rack: ${item.RACK_NAME}` || ""}
                    lastLabelExtractor={(item) => `Bin: ${item.BIN_NAME}` || ""}
                    searchKeyExtractor={(item) => `${item.STORE_LOCATION || ""} ${item.RACK_NAME || ""}`}
                />

                <GenericListPopup
                    visible={projectPopup.visible}
                    onClose={() => setProjectPopup({ visible: false, type: "" })}
                    onSelect={handleProjectSelect}
                    data={projectList}
                    mainLabelExtractor={(item) => item?.PROJECT_NO || ""}
                    labelExtractor={null}
                    subLabelExtractor={(item) => item.PROJECT_NAME || ""}
                    lastLabelExtractor={null}
                    searchKeyExtractor={(item) => `${item.PROJECT_NO || ""} ${item.PROJECT_NAME || ""}`}
                />
            </View>
        </BackgroundGradient>
    );
};

export default MaterialTransferNote;