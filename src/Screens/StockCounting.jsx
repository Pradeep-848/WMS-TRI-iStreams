import { Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ScrollView, Modal } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';
import QRBarcodeScanner from '../Components/QRBarcodeScanner';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { LocationService } from '../Logics/LocationService';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GenericListPopup from '../Modal/GenericListPopup';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { useAuth } from '../Context/AuthContext';
import { useSnackbar } from '../Context/SnackbarContext';

const StockCounting = () => {
    const { userData } = useAuth();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { showSnackbar } = useSnackbar();

    const [locationName, setLocationName] = useState('Fetching location...');
    const [coordinates, setCoordinates] = useState('');
    const [address, setAddress] = useState('');
    const [itemCode, setItemCode] = useState('');
    const [itemName, setItemName] = useState('');
    const [subMaterialNo, setSubMaterialNo] = useState(null);
    const [uom, setUom] = useState('');
    const [scanBarcodes, setScanBarcodes] = useState('');
    const [locationID, setLocationID] = useState(null);
    const [rack, setRack] = useState('');
    const [bin, setBin] = useState('');
    const [entryDate, setEntryDate] = useState('');
    const [entryTime, setEntryTime] = useState('');
    const [storeLocation, setStoreLocation] = useState('');
    const [currentQty, setCurrentQty] = useState(null);
    const [activeInput, setActiveInput] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [materialList, setMaterialList] = useState([]);
    const [isMatPopupVisible, setMatPopupVisible] = useState(false);
    const [storeLocationList, setstoreLocationList] = useState([]);
    const [btnloading, setbtnLoading] = useState(false);

    useEffect(() => {
        LocationService(setLocationName, setCoordinates, setAddress);

        const now = new Date();
        setEntryDate(formatDate(now));
        setEntryTime(formatTime(now));

        getMaterialData();
        getStoreLocationData();
    }, []);

    const getMaterialData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('MaterialsList');

            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setMaterialList(parsedData);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

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

    const handleScannedValue = (value) => {
        if (activeInput === 'scanBarcodes') {
            setScanBarcodes(value);
        } else if (activeInput === 'itemCode') {
            setItemCode(value);
        } else if (activeInput === 'locationID') {
            setLocationID(value);
        }

        setModalVisible(false);
        setActiveInput(null);
    };

    const handleStrLocSelect = (storeLocation) => {
        setLocationID(storeLocation.LOCATION_ID);
        setStoreLocation(storeLocation.STORE_LOCATION);
        setRack(storeLocation.RACK_NAME);
        setBin(storeLocation.BIN_NAME);

        setPopupVisible(false);
    };

    const handleMatSelect = (material) => {
        setItemCode(material.ITEM_CODE);
        setItemName(material.ITEM_NAME);
        setUom(material.UOM_STOCK);

        const localSubMaterialNo = material.SUB_MATERIAL_NO.trim() === '' ? 0 : material.SUB_MATERIAL_NO;
        setSubMaterialNo(localSubMaterialNo);

        setMatPopupVisible(false);
    };

    useEffect(() => {
        if (scanBarcodes) {
            handleScannedBarcode(scanBarcodes);
        }
    }, [scanBarcodes]);

    const handleScannedBarcode = async (code) => {
        const barCode_Params = {
            CompanyCode: userData.companyCode,
            BranchCode: userData.branchCode,
            BarCode: code
        }
        const response = await callSoapService(userData.clientURL, 'Invt_ItemCode_For_Barcode', barCode_Params);

        if (!response) {
            showSnackbar('Material not found. Add Barcodes and try again.', 'error');
            setScanBarcodes('');
            setItemCode('');
            setItemName('');
            return;
        }

        let Material_List = [];

        if (response !== null) {
            Material_List = materialList.filter(item => item.ITEM_CODE === response);

            if (Material_List.length > 0) {
                handleMatSelect(Material_List[0]);
            }
        }
    };

    const handleNavigation = async () => {
        setbtnLoading(true);

        if (!itemCode.trim()) {
            showSnackbar('Enter item code', 'warning');
            return;
        }
        if (!currentQty.trim()) {
            showSnackbar('Enter current quantity', 'warning');
            return;
        }
        if (!storeLocation.trim()) {
            showSnackbar('Enter store location', 'warning');
            return;
        }
        try {
            const AddStockCounting_Params = {
                CompanyCode: userData.companyCode,
                BranchCode: userData.branchCode,
                StockDate: entryDate,
                ItemCode: itemCode,
                SubMaterialNo: subMaterialNo,
                UOM: uom,
                PhysicalQty: parseFloat(currentQty),
                LocationID: parseInt(locationID),
                StoreLocation: storeLocation,
                RackName: rack,
                BinName: bin,
                BarCode: '',
                UserName: userData.userName,
                GPSLocation: locationName,
                DeviceRef: userData.androidID
            };

            console.log(AddStockCounting_Params);

            const response = await callSoapService(userData.clientURL, 'Invt_Save_StockCounting', AddStockCounting_Params);

            if (response) {
                showSnackbar('Stock Counting added successfully', 'success');
                setScanBarcodes('');
                setItemCode('');
                setItemName('');
                setCurrentQty('');
                setLocationID('');
                setStoreLocation('');
                setRack('');
                setBin('');
            }

        } catch (error) {
            showSnackbar('Data submission failed', 'error');
        } finally {
            setbtnLoading(false);
        }
    };

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Stock Counting" />

            <ScrollView>
                <View>
                    <View style={globalStyles.locationContainer}>
                        <FontAwesome6Icon name="calendar" size={20} color="#70706d" />
                        <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{entryDate} {entryTime}</Text>
                    </View>

                    <View style={globalStyles.locationContainer}>
                        <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                        <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
                    </View>
                </View>

                <TextInput
                    mode="outlined"
                    label="Scan Barcodes"
                    value={scanBarcodes}
                    theme={theme}
                    onChangeText={setScanBarcodes}
                    editable={false}
                    right={
                        <TextInput.Icon
                            icon="barcode-scan"
                            color={colors.text}
                            onPress={() => {
                                setActiveInput('scanBarcodes');
                                setModalVisible(true);
                            }}
                        />
                    }
                    style={globalStyles.mt_10}
                />

                <View style={[globalStyles.twoInputContainer, globalStyles.mt_10]}>
                    <View style={globalStyles.container1}>
                        <TextInput
                            mode="outlined"
                            label="Item Code"
                            value={
                                itemCode
                                    ? subMaterialNo
                                        ? `${itemCode} - ${subMaterialNo}`
                                        : itemCode
                                    : ''
                            }
                            theme={theme}
                            onChangeText={setItemCode}
                            showSoftInputOnFocus={false}
                            onPress={() => setMatPopupVisible(true)}
                        />
                    </View>

                    <View style={globalStyles.container2}>
                        <TextInput
                            mode="outlined"
                            label="Location ID"
                            value={locationID}
                            theme={theme}
                            onChangeText={setLocationID}
                            editable={false}
                        />
                    </View>
                </View>

                <View style={globalStyles.mt_10}>
                    <TextInput
                        mode="outlined"
                        label="Item Name"
                        multiline
                        numberOfLines={2}
                        editable={false}
                        value={itemName}
                        theme={theme}
                        onChangeText={setItemName}
                    />
                </View>

                <View style={globalStyles.mt_10}>
                    <TextInput
                        mode="outlined"
                        label="Store Location"
                        onPress={() => setPopupVisible(true)}
                        showSoftInputOnFocus={false}
                        value={storeLocation}
                        theme={theme}
                        onChangeText={setStoreLocation}
                    />
                </View>

                <View style={[globalStyles.twoInputContainer, { marginTop: 10 }]}>
                    <View style={globalStyles.container1}>
                        <TextInput
                            mode="outlined"
                            label="Rack"
                            value={rack}
                            theme={theme}
                            onChangeText={setRack}
                            editable={false}
                        />
                    </View>
                    <View style={globalStyles.container2}>
                        <TextInput
                            mode="outlined"
                            label="Bin"
                            value={bin}
                            onChangeText={setBin}
                            theme={theme}
                            editable={false}
                        />
                    </View>
                </View>

                <View style={globalStyles.mt_10}>
                    <TextInput
                        mode="outlined"
                        label="Current Qty"
                        value={currentQty}
                        theme={theme}
                        onChangeText={setCurrentQty}
                        keyboardType="numeric"
                    />
                </View>
            </ScrollView>

            <View style={globalStyles.bottomButtonContainer}>
                <Button
                    mode="contained"
                    onPress={handleNavigation}
                    loading={btnloading}
                    disabled={btnloading}
                    theme={theme}
                >
                    Submit
                </Button>
            </View>

            <Modal visible={modalVisible} animationType="slide">
                <QRBarcodeScanner
                    onScanned={handleScannedValue}
                    onClose={() => setModalVisible(false)}
                />
            </Modal>

            <GenericListPopup
                visible={isPopupVisible}
                onClose={() => setPopupVisible(false)}
                onSelect={handleStrLocSelect}
                data={storeLocationList}
                mainLabelExtractor={(item) => item?.STORE_LOCATION || ''}
                labelExtractor={(item) => item.SUB_MATERIAL_NO || ''}
                subLabelExtractor={(item) => `Rack: ${item.RACK_NAME}` || ''}
                lastLabelExtractor={(item) => `Bin: ${item.BIN_NAME}` || ''}
                searchKeyExtractor={(item) => `${item.STORE_LOCATION || ''} ${item.RACK_NAME || ''}`}
            />

            <GenericListPopup
                visible={isMatPopupVisible}
                onClose={() => setMatPopupVisible(false)}
                onSelect={handleMatSelect}
                data={materialList}
                mainLabelExtractor={(item) => item?.ITEM_CODE || ''}
                labelExtractor={(item) => item.SUB_MATERIAL_NO || ''}
                subLabelExtractor={(item) => item.ITEM_NAME || ''}
                lastLabelExtractor={(item) => item.UOM_STOCK || ''}
                searchKeyExtractor={(item) => `${item.ITEM_CODE || ''} ${item.ITEM_NAME || ''}`}
            />
        </View>
    );
};

export default StockCounting;