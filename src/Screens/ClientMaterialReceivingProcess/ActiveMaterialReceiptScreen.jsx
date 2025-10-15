import React, { use, useState } from "react";
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

const ActiveMaterialReceipt = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [inPassId, setInPassId] = useState("INP-12345");
    const [scannedItems, setScannedItems] = useState([]);
    const [scannerModalVisible, setScannerModalVisible] = useState(false);
    const [itemModalVisible, setItemModalVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [receivedQty, setReceivedQty] = useState("");
    const [materialCondition, setMaterialCondition] = useState("good");
    const [capturedImage, setCapturedImage] = useState(null);

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
        navigation.navigate('ProjectHeadConfirmationScreen');
    };

    const verifiedItemsCount = scannedItems.filter((item) => item.verified).length;
    const totalItemsCount = scannedItems.length;

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Active Material Receipt" showBackButton={true} />

                <ScrollView contentContainerStyle={globalStyles.p_20}>
                    {/* IN Pass ID + Scan Button */}
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

                    {/* Progress */}
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

                    {/* Verified Items */}
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

                {/* Scanner Modal */}
                <Modal visible={scannerModalVisible} animationType="slide">
                    <QRBarcodeScanner
                        onScanned={handleScannedValue}
                        onClose={() => setScannerModalVisible(false)}
                    />
                </Modal>

                {/* Redesigned Item Modal */}
                <Modal visible={itemModalVisible} animationType="fade" transparent={true}
                    onRequestClose={() => setItemModalVisible(false)}>
                    <View style={[globalStyles.flex_1, globalStyles.justalignCenter, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                            <View style={globalStyles.twoInputContainer1}>
                                <Text style={globalStyles.subtitle_1}>
                                    Item Verification
                                </Text>
                                <Icon
                                    name="close"
                                    size={24}
                                    color={colors.error}
                                    onPress={() => setItemModalVisible(false)}
                                />
                            </View>

                            {currentItem && (
                                <ScrollView>
                                    <View
                                        style={[globalStyles.twoInputContainer, globalStyles.p_10]}>
                                        <Text style={[globalStyles.subtitle_3, { color: colors.text }]}>
                                            Barcode
                                        </Text>
                                        <Text style={[globalStyles.subtitle_4, { color: colors.text }]}>
                                            {currentItem.barcode}
                                        </Text>
                                    </View>

                                    <View
                                        style={[globalStyles.mt_5]}>
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
                                        style={[globalStyles.twoInputContainers, globalStyles.mt_5]}>

                                        <Text style={[globalStyles.subtitle_3, { color: colors.text }]}>
                                            Material Condition
                                        </Text>
                                        <RadioButton.Group
                                            onValueChange={setMaterialCondition}
                                            value={materialCondition}
                                        >
                                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
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
                                        style={[globalStyles.twoInputContainers, globalStyles.mt_5]}>

                                        <Text style={[globalStyles.subtitle_3, { color: colors.text }]}>
                                            Capture Photo
                                        </Text>
                                        <Button
                                            mode="outlined"
                                            theme={theme}
                                            icon="camera"
                                            style={{ marginTop: 5 }}
                                            onPress={handleCapturePress}
                                        >
                                            Take Photo
                                        </Button>
                                        {capturedImage && (
                                            <Image
                                                source={{ uri: capturedImage }}
                                                style={{
                                                    width: "100%",
                                                    height: 150,
                                                    borderRadius: 8,
                                                    marginTop: 10,
                                                }}
                                            />
                                        )}
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
                <Button
                    mode="contained"
                    theme={theme}
                    onPress={handleSubmit}
                >
                    <Text style={[globalStyles.subtitle_4]}>
                        SUBMIT TO STORE EXECUTIVE
                    </Text>
                </Button>
            </View>
        </BackgroundGradient>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
});

export default ActiveMaterialReceipt;