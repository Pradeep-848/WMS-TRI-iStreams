import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, Dimensions, Linking } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button, Checkbox, Icon } from "react-native-paper";
import BackgroundGradient from "../../Components/BackgroundGradient";
import MaterialReceivingDropdown from "../../Components/MaterialReceivingDropdown";
import { handlePickImageOptimized } from "../../Utils/nativeCameraFunction";
import DataTableComponent from "../../Components/DataTableComponent";
import QRBarcodeScanner from "../../Components/QRBarcodeScanner";
import PdfComponent from "../../Components/PdfComponent";
import { displayLocalLineNotification } from "../../Utils/notificationUtils";
import RNShare from "react-native-share";

const { width, height } = Dimensions.get('window');

const ActiveReceiptScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [verified, setVerified] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [capturedImage, setCapturedImage] = useState(null);

  const [receivingType, setReceivingType] = useState('Supplier');
  const [receivingTypeModalVisible, setReceivingTypeModalVisible] = useState(false);

  const openReceivingTypeDropdown = () => setReceivingTypeModalVisible(true);
  const closeReceivingTypeDropdown = () => setReceivingTypeModalVisible(false);

  const handlePrioritySelect = (value) => {
    setReceivingType(value);
    closeReceivingTypeDropdown();
  };

  const handleScannedValue = (value) => {
    if (!scannedBarcodes.includes(value)) {
      setScannedBarcodes(prev => [...prev, value]);
    }
    setModalVisible(false);
  };

  const handleCapturePress = () => {
    handlePickImageOptimized((imageUri) => {
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
        title: 'Material Verification',
        message: 'Material Verification',
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
        Alert.alert("Sharing Error", "Unable to share the image.");
      }
    }
  };

  const items = [
    {
      code: "MAT-001",
      desc: "Cement - Grade A, Construction Mix High Strength",
      ordered: 50,
      prev: 10,
      que: 5,
      received: 35,
      uom: "Bags",
    },
    {
      code: "MAT-002",
      desc: "Steel Rods 8mm High Quality Reinforcement Material",
      ordered: 100,
      prev: 60,
      que: 10,
      received: 30,
      uom: "Kg",
    },
  ];

  // Table Columns Configuration
  const tableColumns = [
    {
      title: "Item Code",
      key: "code",
      width: 100,
    },
    {
      title: "Description",
      key: "desc",
      width: 200,
      numberOfLines: 2,
    },
    {
      title: "Qty Ordered",
      key: "ordered",
      width: 90,
      numeric: true,
    },
    {
      title: "Qty Prev.",
      key: "prev",
      width: 90,
      numeric: true,
    },
    {
      title: "Qty Que.",
      key: "que",
      width: 90,
      numeric: true,
    },
    {
      title: "Received Now",
      key: "received",
      width: 110,
      numeric: true,
    },
    // {
    //   title: "UOM",
    //   key: "uom",
    //   width: 80,
    // },
  ];

  // Open PDF using system viewer
  const handleViewPdf = async () => {
    if (!uploadedPdf) return;
    const url = Platform.OS === "android" ? uploadedPdf.uri : uploadedPdf.fileCopyUri || uploadedPdf.uri;
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.warn("Cannot open PDF", err);
    }
  };

  const handleProceed = () => {
    const title = 'New GRN Request Approval';

    const lines = [
      'GRN: GRN-81',
      'Vendor: 3 Pole Switch Gear',
      'Items: 3 Line Items',
      'Total Value: $23,000',
      'Submitted By: John Doe'
    ];

    // pass lines as the 3rd arg
    displayLocalLineNotification(title, null, lines);
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>

        <Header title="Active Receipt" />

        <ScrollView>
          {/* Receiving Type */}
          <TouchableOpacity onPress={openReceivingTypeDropdown} style={globalStyles.container2}>
            <TextInput
              mode="outlined"
              label="Receiving Type"
              value={receivingType}
              editable={false}
              theme={theme}
              right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
              pointerEvents="none"
            />
          </TouchableOpacity>

          {/* LPO Barcode */}
          <View style={globalStyles.camButtonContainer}>
            <Button
              mode="contained"
              theme={theme}
              icon={() => <Ionicons name="scan" size={20} color={colors.white} />}
              textColor={colors.white}
              onPress={() => setModalVisible(true)}
            >
              Scan LPO BarCode
            </Button>
          </View>

          {/* Items Section */}
          <Text style={[globalStyles.subtitle_3, globalStyles.container2]}>Received Items List</Text>
          {/* Table Component */}
          <DataTableComponent
            data={items}
            columns={tableColumns}
            minWidth={600}
            striped={true}
            showHorizontalScroll={true}
          />

          <View style={[globalStyles.checkBoxContainer, globalStyles.justifyEnd]}>
            <Checkbox
              status={verified ? "checked" : "unchecked"}
              onPress={() => setVerified(!verified)}
              theme={theme}
              color={verified ? colors.success : colors.warning}
            />
            <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>
              {verified ? "Verified" : "Unverified"}
            </Text>
          </View>

          {/* Take Photo */}
          <TextInput
            label="Material Verification"
            mode="outlined"
            theme={theme}
            style={[globalStyles.mb_10]}
            right={<TextInput.Icon icon="camera" onPress={handleCapturePress} />}
          />

          {capturedImage && (
            <View style={[globalStyles.mt_10, globalStyles.container1, globalStyles.twoInputContainer]}>
              <Image
                source={{ uri: capturedImage }}
                style={[globalStyles.mt_10, globalStyles.container1, {
                  width: width * 0.94,
                  height: width * 0.45,
                  borderWidth: 1,
                  borderColor: colors.lightGray,
                }]}
              />

              {/* Share Button */}
              <Button
                mode="contained"
                theme={theme}
                icon={"share-variant"}
                style={globalStyles.height_45}
                onPress={shareViaWhatsApp}
              >
              </Button>
            </View>
          )}
        </ScrollView>

        <PdfComponent
          colors={colors}
          globalStyles={globalStyles}
          theme={theme}
          label="Upload PDF"
        />

        <MaterialReceivingDropdown visible={receivingTypeModalVisible}
          onClose={() => setReceivingTypeModalVisible(false)}
          onSelect={handlePrioritySelect} />

        {/* Scanner Modal */}
        <Modal visible={modalVisible} animationType="slide">
          <QRBarcodeScanner
            onScanned={handleScannedValue}
            onClose={() => setModalVisible(false)}
          />
        </Modal>

        {/* Submit Button */}
        <Button
          mode="contained"
          theme={theme}
          style={[globalStyles.mt_10, globalStyles.bottomButtonContainer]}
          onPress={handleProceed}
        >
          Proceed
        </Button>
      </View>
    </BackgroundGradient>
  );
};

export default ActiveReceiptScreen;