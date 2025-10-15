import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet, Text } from 'react-native';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';
import Header from '../Components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentScannerComponent from '../Components/DocumentScannerComponent';
import { LocationService } from '../Logics/LocationService';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { TextInput, Button } from 'react-native-paper';
import { formatDate } from '../Utils/dataTimeUtils';
import CustomDatePicker from '../Components/CustomDatePicker';
import { useNavigation } from '@react-navigation/native';
import BackgroundGradient from '../Components/BackgroundGradient';
import { useSnackbar } from '../Context/SnackbarContext';

const SupplierInward = () => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { showSnackbar } = useSnackbar();
    const [documents, setDocuments] = useState([]);
    const [coordinates, setCoordinates] = useState('');
    const [locationName, setLocationName] = useState('Fetching location...');
    const [address, setAddress] = useState('');
    const [delvisible, setDelVisible] = useState(false);
    const [povisible, setPoVisible] = useState(false);
    const [deliveryNoteDate, setDeliveryNoteDate] = useState('');
    const [deliveryNoteNo, setDeliveryNoteNo] = useState('');
    const [poNo, setPoNo] = useState('');
    const [poDate, setPoDate] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [driverName, setDriverName] = useState('');
    const [btnloading, setbtnLoading] = useState(false);

    const handleScanComplete = (scannedImages) => {
        setDocuments((prev) => [...prev, ...scannedImages]);
        console.log("Documents updated:", documents);
    };

    useEffect(() => {
        const now = new Date();
        setDeliveryNoteDate(formatDate(now));
        setPoDate(formatDate(now));

        LocationService(setLocationName, setCoordinates, setAddress);
    }, []);

    const handleDeliveryNoteDate = (dateString) => {
        setDeliveryNoteDate(dateString);
    };

    const handlePODate = (dateString) => {
        setPoDate(dateString);
    };

    const handlenavToEmpPage = () => {
        try {
            if (documents.length === 0) {
                showSnackbar('Please scan documents.', "warning");
                return;
            }
            else if (!deliveryNoteNo || !deliveryNoteDate) {
                showSnackbar('Please enter delivery note details.', "warning");
                return;
            }
            else if (!poNo || !poDate) {
                showSnackbar('Please enter PO details.', "warning");
                return;
            }
            else if (!vehicleNo || !driverName) {
                showSnackbar('Please enter vehicle details.', "warning");
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
            }
        }
        catch (e) {

        }
    };

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Supplier Inward" />

                <View style={[globalStyles.locationContainer, { flexDirection: 'row', alignItems: 'center' }]}>
                    <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                    <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
                </View>
                {/* Scanner button */}
                <DocumentScannerComponent onScanComplete={handleScanComplete} />

                {/* Show scanned images */}
                <ScrollView style={globalStyles.flex_1}>
                    <View style={[globalStyles.twoInputContainer, { marginTop: 10 }]}>
                        <View style={globalStyles.container1}>
                            <TextInput
                                mode="outlined"
                                label="Delivery Note No"
                                theme={theme}
                                value={deliveryNoteNo}
                                onChangeText={setDeliveryNoteNo}
                            />
                        </View>

                        <View style={globalStyles.container2}>
                            <TextInput
                                mode="outlined"
                                label="Delivery Note Date"
                                value={deliveryNoteDate}
                                onPress={() => setDelVisible(true)}
                                showSoftInputOnFocus={false}
                                theme={theme}
                            />
                        </View>
                    </View>

                    <View style={[globalStyles.twoInputContainer, { marginTop: 10 }]}>
                        <View style={globalStyles.container1}>
                            <TextInput
                                mode="outlined"
                                label="PO No"
                                theme={theme}
                                value={poNo}
                                onChangeText={setPoNo}
                            />
                        </View>

                        <View style={globalStyles.container2}>
                            <TextInput
                                mode="outlined"
                                label="PO Date"
                                value={poDate}
                                onPress={() => setPoVisible(true)}
                                showSoftInputOnFocus={false}
                                theme={theme}
                            />
                        </View>
                    </View>

                    <View style={[globalStyles.twoInputContainer, { marginTop: 10 }]}>
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

                <CustomDatePicker
                    visible={delvisible}
                    onClose={() => setDelVisible(false)}
                    onDateSelected={handleDeliveryNoteDate}
                />

                <CustomDatePicker
                    visible={povisible}
                    onClose={() => setPoVisible(false)}
                    onDateSelected={handlePODate}
                />
            </View>
        </BackgroundGradient>
    );
}

const styles = StyleSheet.create({
    imageList: { padding: 10 },
    image: { width: '100%', height: 300, marginBottom: 10, borderRadius: 8 },
});

export default SupplierInward;