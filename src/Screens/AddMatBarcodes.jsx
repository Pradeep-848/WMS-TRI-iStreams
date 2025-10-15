import { View, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Text, TextInput, Button } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../Components/Header';
import { useTheme } from '../Context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { useAuth } from '../Context/AuthContext';
import PreviousBarcodesTable from '../Modal/PreviousBarcodesTable';
import GenericListPopup from '../Modal/GenericListPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { LocationService } from '../Logics/LocationService';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';
import BackgroundGradient from '../Components/BackgroundGradient';
import { useSnackbar } from '../Context/SnackbarContext';

const AddMatBarcodes = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { userData } = useAuth();
    const { showSnackbar } = useSnackbar();

    const [itemCode, setItemCode] = useState('');
    const [itemName, setItemName] = useState('');
    const [subMaterialNo, setSubMaterialNo] = useState('');
    const [uom, setUom] = useState('');
    const [loading, setLoading] = useState(false);
    const [barcodes, setBarcodes] = useState([]);
    const [btnLoading, setbtnLoading] = useState(false);
    const [isMatPopupVisible, setMatPopupVisible] = useState(false);
    const [materialList, setMaterialList] = useState([]);
    const [entryDate, setEntryDate] = useState('');
    const [entryTime, setEntryTime] = useState('');
    const [locationName, setLocationName] = useState('Fetching location...');
    const [coordinates, setCoordinates] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        LocationService(setLocationName, setCoordinates, setAddress);

        const now = new Date();
        setEntryDate(formatDate(now));
        setEntryTime(formatTime(now));

        getMaterialData();
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

    const getPreviousBarcodes = async (materials) => {
        setLoading(true);

        const localSubMaterialNo = materials.SUB_MATERIAL_NO.trim() === '' ? 0 : materials.SUB_MATERIAL_NO;

        setItemCode(materials.ITEM_CODE);
        setItemName(materials.ITEM_NAME);
        setSubMaterialNo(localSubMaterialNo);

        const SqlQuery_Parameter = {
            SQLQuery: `SELECT REF_SERIAL_NO, BARCODE_NO, USER_NAME 
                       FROM invt_material_barcodes 
                       WHERE ITEM_CODE = '${materials.ITEM_CODE}' 
                       AND SUB_MATERIAL_NO = ${localSubMaterialNo}`
        };

        const response = await callSoapService(
            userData.clientURL,
            'DataModel_GetDataFrom_Query',
            SqlQuery_Parameter
        );

        if (response) {
            setBarcodes(response);
        }

        setLoading(false);
    };

    const handleMatSelect = async (material) => {
        setItemCode(material.ITEM_CODE);
        setItemName(material.ITEM_NAME);
        setUom(material.UOM_STOCK);

        const localSubMaterialNo = material.SUB_MATERIAL_NO.trim() === '' ? 0 : material.SUB_MATERIAL_NO;
        setSubMaterialNo(localSubMaterialNo);

        setMatPopupVisible(false);

        await getPreviousBarcodes(material);
    };

    const handleNavigation = async () => {
        try {
            setbtnLoading(true);

            if (!itemCode.trim()) {
                showSnackbar('Select Material', 'warning');
                return;
            }

            navigation.navigate('AddMatBarcodes_1', {
                itemCode,
                itemName,
                subMaterialNo,
            });

        } catch (error) {
            console.error('Error submitting data:', error);
            showSnackbar('Failed to submit data', 'error');
        } finally {
            setbtnLoading(false);
        }
    };

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Material Barcodes Mapping" />

                <View style={globalStyles.my_10}>
                    <View style={globalStyles.locationContainer}>
                        <FontAwesome6Icon name="calendar" size={20} color="#70706d" />
                        <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{entryDate} {entryTime}</Text>
                    </View>

                    <View style={globalStyles.locationContainer}>
                        <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                        <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
                    </View>
                </View>

                <ScrollView style={globalStyles.flex_1}>
                    {/* Material Selection */}
                    <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
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
                            showSoftInputOnFocus={false}
                            onChangeText={setItemCode}
                            style={globalStyles.container1}
                            onPress={() => setMatPopupVisible(true)}
                        />
                        <TextInput
                            mode="outlined"
                            label="UOM"
                            value={uom}
                            theme={theme}
                            editable={false}
                            style={globalStyles.container2}
                        />
                    </View>

                    {/* Item Name */}
                    <TextInput
                        mode="outlined"
                        label="Item Name"
                        value={itemName}
                        theme={theme}
                        editable={false}
                        multiline
                        numberOfLines={2}
                        style={globalStyles.mb_10}
                    />

                    {/* Previous Barcodes */}
                    <PreviousBarcodesTable barcodes={barcodes} loading={loading} />
                </ScrollView>

                {/* Action Buttons */}
                <View style={globalStyles.bottomButtonContainer}>
                    <Button
                        icon="plus"
                        mode="contained"
                        onPress={handleNavigation}
                        theme={{
                            colors: {
                                primary: colors.primary,
                                disabled: colors.lightGray,
                            },
                        }}
                        loading={btnLoading}
                        disabled={btnLoading}
                    >
                        Add Barcodes
                    </Button>
                </View>

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
        </BackgroundGradient>
    );
};

export default AddMatBarcodes;