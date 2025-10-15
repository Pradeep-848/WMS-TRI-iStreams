import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button, Card, RadioButton } from "react-native-paper";
import BackgroundGradient from "../../Components/BackgroundGradient";
import QRBarcodeScanner from "../../Components/QRBarcodeScanner";
import { handlePickImageOptimized } from "../../Utils/nativeCameraFunction";
import { useNavigation } from "@react-navigation/native";

const ReceiverUnloadingAndVerfication = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [inPassId, setInPassId] = useState("INP-12345");
    const [doBarcode, setDoBarcode] = useState(null);
    const [scannedItems, setScannedItems] = useState([]);
    const [scannerModalVisible, setScannerModalVisible] = useState(false);
    const [doScannerModalVisible, setDoScannerModalVisible] = useState(false);
    const [itemModalVisible, setItemModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [receivedQty, setReceivedQty] = useState("");
    const [materialCondition, setMaterialCondition] = useState("good");
    const [capturedImage, setCapturedImage] = useState(null);

    // Handle DO / Invoice Scan
    const handleDoScannedValue = (value) => {
        setDoBarcode(value);
        setDoScannerModalVisible(false);
    };

    // Handle Item Scan
    const handleScannedValue = (value) => {
        if (!scannedItems.find((item) => item.barcode === value)) {
            const newItem = {
                id: Date.now().toString(),
                barcode: value,
                name: `Item ${value}`,
                expectedQty: "100",
                receivedQty: "",
                condition: "good",
                verified: false,
            };
            setScannedItems((prev) => [...prev, newItem]);
            setCurrentItem(newItem);
            setItemModalVisible(true);
        } else {
            const existingItem = scannedItems.find((item) => item.barcode === value);
            setCurrentItem(existingItem);
            setReceivedQty(existingItem.receivedQty || "");
            setMaterialCondition(existingItem.condition || "good");
            setItemModalVisible(true);
        }
        setScannerModalVisible(false);
    };

    const handleItemVerification = () => {
        if (currentItem && receivedQty) {
            const updatedItems = scannedItems.map((item) =>
                item.id === currentItem.id
                    ? {
                        ...item,
                        receivedQty: receivedQty,
                        condition: materialCondition,
                        verified: true,
                        image: capturedImage,
                    }
                    : item
            );
            setScannedItems(updatedItems);
            setItemModalVisible(false);
            setReceivedQty("");
            setMaterialCondition("good");
            setCapturedImage(null);
            setCurrentItem(null);
        }
    };

    const handleCapturePress = () => {
        handlePickImageOptimized(setCapturedImage);
    };

    const handleSubmit = () => {
        navigation.navigate("ProjectHeadConfirmationScreen");
    };

    const verifiedItemsCount = scannedItems.filter((item) => item.verified).length;
    const totalItemsCount = scannedItems.length;

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Active Material Receipt" showBackButton={true} />

                <ScrollView contentContainerStyle={globalStyles.p_20}>
                    {/* --- DO / INVOICE SCAN CARD --- */}
                    <Card
                        style={[
                            globalStyles.dataCard,
                            globalStyles.bordercardColor,
                            globalStyles.mb_10,
                        ]}
                    >
                        <Card.Content>
                            <Text
                                style={[
                                    globalStyles.subtitle_1,
                                    { color: colors.primary, marginBottom: 10 },
                                ]}
                            >
                                IN Pass: {inPassId}
                            </Text>
                            <Button
                                mode="contained"
                                theme={theme}
                                onPress={() => setDoScannerModalVisible(true)}
                                icon="barcode-scan"
                            >
                                [SCAN DO / INVOICE BARCODE]
                            </Button>
                            {doBarcode && (
                                <Text
                                    style={[
                                        globalStyles.small_text,
                                        { color: colors.text, marginTop: 10 },
                                    ]}
                                >
                                    Scanned DO / Invoice: {doBarcode}
                                </Text>
                            )}
                        </Card.Content>
                    </Card>

                    {/* --- ITEM SCAN + VERIFY CARD --- */}
                    <Card
                        style={[
                            globalStyles.dataCard,
                            globalStyles.bordercardColor,
                            globalStyles.mb_10,
                        ]}
                    >
                        <Card.Content>


                            <Button
                                mode="contained"
                                theme={theme}
                                onPress={() => setScannerModalVisible(true)}
                                icon="barcode-scan"
                            >
                                SCAN ITEM BARCODE
                            </Button>

                            <Button
                                mode="contained"
                                theme={theme}
                                style={{ marginTop: 10 }}
                                disabled={!currentItem}
                                onPress={() => setItemModalVisible(true)}
                            >
                                Verify Current Item
                            </Button>
                        </Card.Content>
                    </Card>

                    {/* Progress Card */}
                    <Card style={[globalStyles.dataCard, globalStyles.mb_10]}>
                        <Card.Content>
                            <Text
                                style={[
                                    globalStyles.subtitle_2,
                                    { color: colors.text, marginBottom: 5 },
                                ]}
                            >
                                Progress
                            </Text>
                            <Text
                                style={[
                                    globalStyles.small_text,
                                    { color: colors.text, marginBottom: 10 },
                                ]}
                            >
                                {verifiedItemsCount}/{totalItemsCount} items verified
                            </Text>
                            <View
                                style={{
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: colors.surfaceVariant,
                                    overflow: "hidden",
                                }}
                            >
                                <View
                                    style={{
                                        width:
                                            totalItemsCount > 0
                                                ? `${(verifiedItemsCount / totalItemsCount) * 100}%`
                                                : "0%",
                                        height: "100%",
                                        backgroundColor:
                                            verifiedItemsCount === totalItemsCount && totalItemsCount > 0
                                                ? colors.success
                                                : colors.primary,
                                    }}
                                />
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Verified Items List */}
                    {scannedItems.length > 0 && (
                        <Card style={[globalStyles.dataCard, globalStyles.mb_10]}>
                            <Card.Content>
                                <Text
                                    style={[
                                        globalStyles.subtitle_2,
                                        globalStyles.mb_10,
                                        { color: colors.text },
                                    ]}
                                >
                                    Items Verified
                                </Text>
                                {scannedItems.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            globalStyles.twoInputContainer1,
                                            globalStyles.mb_5,
                                            globalStyles.p_5,
                                            {
                                                backgroundColor: colors.surfaceVariant,
                                                borderRadius: 8,
                                                borderLeftWidth: 4,
                                                borderLeftColor: item.verified
                                                    ? colors.success
                                                    : colors.warning,
                                            },
                                        ]}
                                        onPress={() => {
                                            setCurrentItem(item);
                                            setReceivedQty(item.receivedQty || "");
                                            setMaterialCondition(item.condition || "good");
                                            setCapturedImage(item.image || null);
                                            setItemModalVisible(true);
                                        }}
                                    >
                                        <View style={globalStyles.flex_1}>
                                            <Text
                                                style={[globalStyles.subtitle_4, { color: colors.text }]}
                                            >
                                                {item.barcode}
                                            </Text>
                                            <Text
                                                style={[globalStyles.small_text, { color: colors.text }]}
                                            >
                                                {item.name}
                                            </Text>
                                        </View>
                                        <View style={[globalStyles.alignItemsCenter]}>
                                            <Ionicons
                                                name={item.verified ? "checkmark-circle" : "time-outline"}
                                                size={20}
                                                color={item.verified ? colors.success : colors.warning}
                                            />
                                            <Text
                                                style={[
                                                    globalStyles.very_small_text,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {item.verified ? "Verified" : "Pending"}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </Card.Content>
                        </Card>
                    )}
                </ScrollView>

                {/* DO Scanner Modal */}
                <Modal visible={doScannerModalVisible} animationType="slide">
                    <QRBarcodeScanner
                        onScanned={handleDoScannedValue}
                        onClose={() => setDoScannerModalVisible(false)}
                    />
                </Modal>

                {/* Item Scanner Modal */}
                <Modal visible={scannerModalVisible} animationType="slide">
                    <QRBarcodeScanner
                        onScanned={handleScannedValue}
                        onClose={() => setScannerModalVisible(false)}
                    />
                </Modal>

                {/* Item Verification Modal */}
                <Modal
                    visible={itemModalVisible}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setItemModalVisible(false)}
                >
                    <View
                        style={[
                            globalStyles.flex_1,
                            globalStyles.justalignCenter,
                            { backgroundColor: "rgba(0,0,0,0.7)" },
                        ]}
                    >
                        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                            <View style={globalStyles.twoInputContainer1}>
                                <Text style={globalStyles.subtitle_1}>Item Verification</Text>
                                <Icon
                                    name="close"
                                    size={24}
                                    color={colors.error}
                                    onPress={() => setItemModalVisible(false)}
                                />
                            </View>

                            {currentItem && (
                                <ScrollView>
                                    <View style={[globalStyles.twoInputContainer, globalStyles.p_10]}>
                                        <Text style={[globalStyles.subtitle_3, { color: colors.text }]}>
                                            Barcode
                                        </Text>
                                        <Text style={[globalStyles.subtitle_4, { color: colors.text }]}>
                                            {currentItem.barcode}
                                        </Text>
                                    </View>

                                    <View style={[globalStyles.mt_5]}>
                                        <TextInput
                                            mode="outlined"
                                            theme={theme}
                                            placeholder={`Received Quantity: ${currentItem.expectedQty}`}
                                            value={receivedQty}
                                            onChangeText={setReceivedQty}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <View
                                        style={[globalStyles.twoInputContainers, globalStyles.mt_5]}
                                    >
                                        <Text style={[globalStyles.subtitle_3, { color: colors.text }]}>
                                            Material Condition
                                        </Text>
                                        <RadioButton.Group
                                            onValueChange={setMaterialCondition}
                                            value={materialCondition}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    justifyContent: "space-around",
                                                }}
                                            >
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <RadioButton value="good" color={colors.primary} />
                                                    <Text>Good</Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <RadioButton value="damaged" color={colors.error} />
                                                    <Text>Damaged</Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <RadioButton value="missing" color={colors.warning} />
                                                    <Text>Missing</Text>
                                                </View>
                                            </View>
                                        </RadioButton.Group>
                                    </View>

                                    <View
                                        style={[globalStyles.bottomButtonContainer, globalStyles.p_20]}
                                    >
                                        <Button mode="contained" theme={theme} onPress={handleSubmit}>
                                            <Text style={[globalStyles.subtitle_4]}>
                                                Receiver Stamp on DO
                                            </Text>
                                        </Button>
                                    </View>

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            marginTop: 15,
                                        }}
                                    >
                                        <Button
                                            mode="outlined"
                                            theme={theme}
                                            onPress={() => setItemModalVisible(false)}
                                            style={{ flex: 1, marginRight: 10 }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            mode="contained"
                                            theme={theme}
                                            onPress={handleItemVerification}
                                            disabled={!receivedQty}
                                            style={{ flex: 1 }}
                                        >
                                            Confirm & Save
                                        </Button>
                                    </View>
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>
            </View>

            <View style={[globalStyles.bottomButtonContainer, globalStyles.p_20]}>
                <Button mode="contained" theme={theme} onPress={handleSubmit}>
                    <Text style={[globalStyles.subtitle_4]}>
                        SUBMIT DOCUMENTS TO STORE EXECUTIVE
                    </Text>
                </Button>
            </View>
        </BackgroundGradient>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        width: "100%",
        maxWidth: 400,
        borderRadius: 20,
        padding: 20,
        maxHeight: "80%",
    },
});

export default ReceiverUnloadingAndVerfication;




// import React, { useState } from 'react';
// import { View, ScrollView, StyleSheet, Alert } from 'react-native';
// import { TextInput, Button, Card, Chip, Text, Checkbox } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import Header from '../../Components/Header';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useTheme } from '../../Context/ThemeContext';
// import { GlobalStyles } from '../../Styles/styles';
// import { useAuth } from '../../Context/AuthContext';
// import BackgroundGradient from '../../Components/BackgroundGradient';

// const ReceiverUnloadingAndVerfication = () => {
//     const insets = useSafeAreaInsets();
//     const navigation = useNavigation();
//     const { theme } = useTheme();
//     const colors = theme.colors;
//     const globalStyles = GlobalStyles(colors);
//     const { userData } = useAuth();

//     // State for form data
//     const [formData, setFormData] = useState({
//         inPass: '',
//         invoiceBarcode: '',
//         itemName: '',
//         itemBarcode: '',
//         quantity: '',
//         size: '',
//         brand: '',
//         specifications: '',
//         materialCondition: 'good',
//         damageDescription: '',
//         receiverSignature: null,
//         itemsVerified: false
//     });

//     const updateFormData = (field, value) => {
//         setFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     const handleBarcodeScan = () => {
//         // Simulate barcode scanning
//         Alert.alert(
//             "Scan Barcode",
//             "Barcode scanner would open here",
//             [
//                 { text: "Cancel", style: "cancel" },
//                 {
//                     text: "Simulate Scan",
//                     onPress: () => updateFormData('invoiceBarcode', 'INV-' + Date.now().toString().slice(-6))
//                 }
//             ]
//         );
//     };

//     const handleSubmit = () => {
//         if (!formData.inPass || !formData.itemName || !formData.quantity) {
//             Alert.alert("Error", "Please fill all required fields");
//             return;
//         }

//         if (!formData.receiverSignature) {
//             Alert.alert("Error", "Receiver signature is required");
//             return;
//         }

//         Alert.alert(
//             "Submit Verification",
//             "Are you sure you want to submit this material receipt?",
//             [
//                 { text: "Cancel", style: "cancel" },
//                 {
//                     text: "Submit",
//                     onPress: () => {
//                         // Navigate to next screen or show success
//                         Alert.alert("Success", "Material receipt submitted successfully!");
//                         // navigation.navigate('StoreExecutiveDashboard');
//                     }
//                 }
//             ]
//         );
//     };

//     return (
//         <BackgroundGradient>
//             <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
//                 {/* Header */}
//                 <Header title="Active Material Receipt" />

//                 {/* IN Pass ection */}
//                 <Card style={globalStyles.dataCard}>
//                     <Card.Content>
//                         <Text style={globalStyles.subtitle_2}>IN Pass : {" "}
//                             <Text style={[globalStyles.subtitle_2, { color: colors.warning }]}>IN-2108201</Text>
//                         </Text>

//                         <Button
//                             mode="outlined"
//                             style={globalStyles.bottomButtonContainer}
//                             icon="camera"
//                             theme={theme}
//                             onPress={handleBarcodeScan}
//                         >
//                             Scan Invoice Barcode
//                         </Button>
//                         {formData.invoiceBarcode ? (
//                             <Text style={styles.scannedText}>
//                                 📄 Scanned: {formData.invoiceBarcode}
//                             </Text>
//                         ) : null}
//                     </Card.Content>
//                 </Card>

//                 <View style={[globalStyles.bottomButtonContainer, globalStyles.p_20]}>
//                     <Button
//                         mode="outlined"
//                         icon="camera"
//                         theme={theme}
//                         onPress={handleBarcodeScan}
//                     >
//                         Scan Item Barcode to Verify
//                     </Button>
//                 </View>

//                 {/* Items Verification */}
//                 <Card style={globalStyles.dataCard}>
//                     <Card.Title title="Items Verification" titleStyle={globalStyles.subtitle_3} />
//                     <Card.Content>
//                         <View style={styles.verificationHeader}>
//                             <Text style={globalStyles.subtitle_3}>Items Verified</Text>
//                             <Checkbox
//                                 status={formData.itemsVerified ? 'checked' : 'unchecked'}
//                                 onPress={() => updateFormData('itemsVerified', !formData.itemsVerified)}
//                             />
//                         </View>

//                         <TextInput
//                             label="Item Name *"
//                             mode="outlined"
//                             theme={theme}
//                             value={formData.itemName}
//                             onChangeText={(text) => updateFormData('itemName', text)}
//                             style={globalStyles.mb_5}
//                         />

//                         <TextInput
//                             label="Item Barcode"
//                             mode="outlined"
//                             theme={theme}
//                             value={formData.itemBarcode}
//                             onChangeText={(text) => updateFormData('itemBarcode', text)}
//                             style={globalStyles.mb_5}
//                         />

//                         <TextInput
//                             label="Quantity *"
//                             mode="outlined"
//                             theme={theme}
//                             value={formData.quantity}
//                             onChangeText={(text) => updateFormData('quantity', text)}
//                             keyboardType="numeric"
//                             style={globalStyles.mb_5}
//                         />

//                         {/* Specifications Row */}
//                         <View style={globalStyles.twoInputContainer}>
//                             <TextInput
//                                 label="Size"
//                                 mode="outlined"
//                                 theme={theme}
//                                 value={formData.size}
//                                 style={globalStyles.container1}
//                                 onChangeText={(text) => updateFormData('size', text)}
//                             />
//                             <TextInput
//                                 label="Brand"
//                                 mode="outlined"
//                                 theme={theme}
//                                 value={formData.brand}
//                                 style={globalStyles.container2}
//                                 onChangeText={(text) => updateFormData('brand', text)}
//                             />
//                         </View>

//                         <TextInput
//                             label="Specifications"
//                             mode="outlined"
//                             theme={theme}
//                             value={formData.specifications}
//                             onChangeText={(text) => updateFormData('specifications', text)}
//                             multiline
//                             numberOfLines={3}
//                             style={globalStyles.mb_5}
//                         />
//                     </Card.Content>
//                 </Card>
//             </View>

//             <View style={[globalStyles.bottomButtonContainer, globalStyles.p_20]}>
//                 {/* Submit Button */}
//                 <Button
//                     mode="contained"
//                     theme={theme}
//                     onPress={handleSubmit}
//                     icon="check-circle"
//                 >
//                     Submit Verification
//                 </Button>
//             </View>
//         </BackgroundGradient>
//     );
// };

// const styles = StyleSheet.create({
//     scannedText: {
//         textAlign: 'center',
//         color: '#4CAF50',
//         fontWeight: '500',
//         marginTop: 8,
//     },
//     verificationHeader: {
//         flexDirection: 'row',
//         justifyContent: 'flex-start',
//         alignItems: 'center'
//     },
//     conditionRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         marginBottom: 16,
//     },
//     conditionChip: {
//         minWidth: 120,
//     },
//     selectedChip: {
//         backgroundColor: '#4CAF50',
//     },
//     damagedChip: {
//         backgroundColor: '#ffebee',
//     },
//     signatureButton: {
//         marginBottom: 12,
//     },
//     signaturePreview: {
//         alignItems: 'center',
//         padding: 12,
//         backgroundColor: '#f8f9fa',
//         borderRadius: 8,
//     },
//     signatureSuccess: {
//         color: '#4CAF50',
//         fontWeight: '600',
//     },
//     signaturePending: {
//         color: '#FF9800',
//         fontWeight: '500',
//     },
//     submitButton: {
//         marginTop: 20,
//         paddingVertical: 8,
//     },
// });

// export default ReceiverUnloadingAndVerfication;