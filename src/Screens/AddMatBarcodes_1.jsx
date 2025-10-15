import { Text, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Button } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../Components/Header';
import { useTheme } from '../Context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../Context/AuthContext';
import { useRoute } from '@react-navigation/native';
import PreviousBarcodesTable from '../Modal/PreviousBarcodesTable';
import QRBarcodeScanner from '../Components/QRBarcodeScanner';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import BackgroundGradient from '../Components/BackgroundGradient';
import { useSnackbar } from '../Context/SnackbarContext';

const AddMatBarcodes_1 = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { userData } = useAuth();
    const { showSnackbar } = useSnackbar();

    const { itemCode, itemName, subMaterialNo } = route.params;

    const [scannedBarcodes, setScannedBarcodes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [btnLoading, setbtnLoading] = useState(false);

    const handleScannedValue = (value) => {
        if (!scannedBarcodes.includes(value)) {
            setScannedBarcodes(prev => [...prev, value]);
        }
        setModalVisible(false);
    };

    const handleNavigation = async () => {
        try {
            setbtnLoading(true);

            if (scannedBarcodes.length === 0) {
                showSnackbar('Please Scan Barcodes', 'warning');
                return;
            }

            if (!itemCode.trim()) {
                showSnackbar('Please Select Material', 'warning');
                return;
            }

            const barcodeDataXml = scannedBarcodes.map(barcodes => `<string>${barcodes}</string>`).join('');

            const AddBarcode_Params = {
                CompanyCode: userData.companyCode,
                BranchCode: userData.branchCode,
                ItemCode: itemCode,
                SubMaterialNo: subMaterialNo,
                UserName: userData.userName,
                BarCodeData: barcodeDataXml
            };

            const response = await callSoapService(
                userData.clientURL,
                'Invt_Save_MaterialBarCodes',
                AddBarcode_Params
            );

            if (response === 'stage:11') {
                navigation.navigate('SuccessAnimationScreen', {
                    message: 'Barcodes Added Successfully',
                    details: 'Continue to add more Barcodes',
                    returnTo: 'AddMatBarcodes' || 'Home1',
                });
            }

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
                <Header title="Add Material Barcodes" />

                <View style={globalStyles.projectContainer}>
                    <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>{`${itemCode} - ${subMaterialNo}`}</Text>
                    <Text style={globalStyles.subtitle}> {itemName}</Text>
                </View>

                <View style={[globalStyles.alignItemsCenter, globalStyles.my_5]}>
                    <Text style={[globalStyles.subtitle_1, globalStyles.mb_5, { color: colors.primary }]}>
                        Add Barcodes
                    </Text>
                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 40,
                            padding: 15,
                            elevation: 3,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.5,
                        }}
                        onPress={() => setModalVisible(true)}
                    >
                        <Icon name="qrcode-scan" size={30} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[globalStyles.mt_5, globalStyles.content]}>
                        Tap to scan barcode
                    </Text>
                </View>

                <ScrollView style={globalStyles.flex_1}>
                    {/* Scanned Barcodes Table */}
                    {scannedBarcodes.length > 0 && (
                        <View style={globalStyles.mt_10}>
                            <PreviousBarcodesTable
                                barcodes={scannedBarcodes.map(code => ({
                                    REF_SERIAL_NO: '-',
                                    BARCODE_NO: code,
                                    USER_NAME: userData?.userName
                                }))}
                                loading={false}
                            />
                        </View>
                    )}
                </ScrollView>

                {/* Action Buttons */}
                <View style={globalStyles.bottomButtonContainer}>
                    <Button
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
                        Submit
                    </Button>
                </View>

                {/* Scanner Modal */}
                <Modal visible={modalVisible} animationType="slide">
                    <QRBarcodeScanner
                        onScanned={handleScannedValue}
                        onClose={() => setModalVisible(false)}
                    />
                </Modal>
            </View>
        </BackgroundGradient>
    );
};

export default AddMatBarcodes_1;