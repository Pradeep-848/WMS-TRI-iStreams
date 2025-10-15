import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, Modal } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button } from "react-native-paper";
import BackgroundGradient from "../../Components/BackgroundGradient";
import { LocationService } from "../../Logics/LocationService";
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { formatDate, formatTime } from '../../Utils/dataTimeUtils';
import QRBarcodeScanner from "../../Components/QRBarcodeScanner";

const PutawayProcessScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState("");
  const [materialBarcode, setMaterialBarcode] = useState("");
  const [locationBarcode, setLocationBarcode] = useState("");
  const [modalMaterialVisible, setModalMaterialVisible] = useState(false);
  const [modalLocationVisible, setModalLocationVisible] = useState(false);

  const [step1Complete, setStep1Complete] = useState(false);
  const [step2Complete, setStep2Complete] = useState(false);

  // Location details fields
  const [warehouse, setWarehouse] = useState("");
  const [storeRack, setStoreRack] = useState("");
  const [binArea, setBinArea] = useState("");

  const [locationName, setLocationName] = useState('Fetching location...');
  const [coordinates, setCoordinates] = useState('');
  const [address, setAddress] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Static data for demonstration
  const taskId = "GRN-213083434";

  const handleMaterialScanned = (value) => {
    setMaterialBarcode(value);
    setModalMaterialVisible(false);

    // Check if all Step 1 fields are filled to complete the step
    if (itemName.trim() && qty.trim() && value.trim()) {
      setStep1Complete(true);
      Alert.alert("Success", "Material barcode scanned successfully! You can now proceed to Step 2.");
    } else {
      Alert.alert("Info", "Material barcode scanned. Please fill Item Name and Qty to complete Step 1.");
    }
  };

  const handleLocationScanned = (value) => {
    setLocationBarcode(value);
    setModalLocationVisible(false);

    // Parse the location barcode and auto-fill the location fields
    parseLocationBarcode(value);

    // Check if location details are now complete
    checkStep2Completion(value);
  };

  const parseLocationBarcode = (barcode) => {
    // Simple parsing logic - adjust based on your barcode format
    const parts = barcode.split('-');

    if (parts.length >= 3) {
      const warehouseValue = parts[0] || "";
      const storeRackValue = parts[1] + "-" + (parts[2] || "");
      const binAreaValue = parts.slice(3).join('-') || "";

      setWarehouse(warehouseValue);
      setStoreRack(storeRackValue);
      setBinArea(binAreaValue);
    } else {
      // If barcode doesn't match expected format, just set it as warehouse
      setWarehouse(barcode);
    }
  };

  const checkStep2Completion = (scannedBarcode) => {
    // Parse to get expected values
    const parts = scannedBarcode.split('-');
    let warehouseCheck, storeRackCheck, binAreaCheck;

    if (parts.length >= 3) {
      warehouseCheck = parts[0] || "";
      storeRackCheck = parts[1] + "-" + (parts[2] || "");
      binAreaCheck = parts.slice(3).join('-') || "";
    } else {
      warehouseCheck = scannedBarcode;
      storeRackCheck = "";
      binAreaCheck = "";
    }

    // Check if all location fields will be filled
    if (warehouseCheck.trim() && storeRackCheck.trim() && binAreaCheck.trim()) {
      setStep2Complete(true);
      Alert.alert("Success", "Location details confirmed successfully!");
    }
  };

  useEffect(() => {
    LocationService(setLocationName, setCoordinates, setAddress);

    const now = new Date();
    setEntryDate(formatDate(now));

    const currentTimeFormatted = formatTime(now);

    const oneHourLater = new Date(now);
    oneHourLater.setHours(oneHourLater.getHours() + 1);
    const oneHourLaterFormatted = formatTime(oneHourLater);

    setStartTime(currentTimeFormatted);
    setEndTime(oneHourLaterFormatted);
  }, []);

  // Auto-check Step 1 completion when fields change
  useEffect(() => {
    if (itemName.trim() && qty.trim() && materialBarcode.trim()) {
      setStep1Complete(true);
    } else {
      setStep1Complete(false);
    }
  }, [itemName, qty, materialBarcode]);

  // Auto-check Step 2 completion when location fields change
  useEffect(() => {
    if (warehouse.trim() && storeRack.trim() && binArea.trim()) {
      setStep2Complete(true);
    } else {
      setStep2Complete(false);
    }
  }, [warehouse, storeRack, binArea]);

  const handleConfirmPutaway = () => {
    if (step1Complete && step2Complete) {
      Alert.alert(
        "Success",
        `Item Putaway Confirmed!\n\nLocation Details:\nWarehouse: ${warehouse}\nStore/Rack: ${storeRack}\nBin/Area: ${binArea}`,
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form for next task
              setItemName("");
              setQty("");
              setMaterialBarcode("");
              setLocationBarcode("");
              setWarehouse("");
              setStoreRack("");
              setBinArea("");
              setStep1Complete(false);
              setStep2Complete(false);
            }
          }
        ]
      );
    } else {
      Alert.alert("Error", "Please complete both Step 1 and Step 2 before confirming.");
    }
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>

        <Header title="Putaway Process" />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Task ID */}
          <View>
            <Text style={[globalStyles.subtitle_1, globalStyles.container1]}>
              Task :{" "}
              <Text style={[globalStyles.subtitle_1, { color: colors.primary }]}>
                {taskId}
              </Text>
            </Text>
          </View>

          {/* Location */}
          <View style={globalStyles.locationContainer}>
            <FontAwesome6Icon name="location-dot" size={18} color={colors.gray} />
            <Text style={[globalStyles.subtitle, globalStyles.ml_5]}>
              {locationName}
            </Text>
          </View>

          {/* STEP 1: COLLECT ITEM */}
          <View style={[globalStyles.mt_10, globalStyles.p_10, globalStyles.borderRadius_10, {
            backgroundColor: step1Complete ? colors.white : colors.card,
            borderWidth: 2,
            borderColor: step1Complete ? colors.success : colors.primary,
          }]}>
            <View style={[globalStyles.mb_10, globalStyles.twoInputContainer1]}>
              <View style={globalStyles.container1}>
                <Text style={[globalStyles.subtitle_3, { color: colors.primary }]}>
                  STEP 1:
                </Text>
                <Text style={[globalStyles.subtitle_3, { color: colors.gray }]}>
                  COLLECT ITEM
                </Text>
              </View>

              {/* Material Barcode */}
              <View style={[globalStyles.twoInputContainer1, globalStyles.justifyEnd]}>
                <Button
                  mode="contained"
                  theme={theme}
                  icon={() => <Ionicons name="scan" size={18} color={colors.white} />}
                  style={globalStyles.camButtonContainer}
                  onPress={() => setModalMaterialVisible(true)}
                  disabled={step1Complete}
                >
                  <Text style={{ color: colors.white }}>
                    Scan Material Barcode
                  </Text>
                </Button>
              </View>
            </View>

            {/* Item Name & Qty */}
            <View style={[globalStyles.twoInputContainer1]}>
              <View style={globalStyles.container1}>
                <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
                  Item Name
                </Text>
                <TextInput
                  style={globalStyles.height_45}
                  mode="outlined"
                  theme={theme}
                  value={itemName}
                  onChangeText={setItemName}
                  disabled={step1Complete}
                />
              </View>

              <View style={globalStyles.container2}>
                <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
                  Qty
                </Text>
                <TextInput
                  style={globalStyles.height_45}
                  mode="outlined"
                  theme={theme}
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="numeric"
                  disabled={step1Complete}
                />
              </View>
            </View>

            {/* Scanned Material Barcode Display */}
            {materialBarcode ? (
              <View style={[globalStyles.mt_10, globalStyles.p_10, globalStyles.borderRadius_10, {
                backgroundColor: colors.surfaceVariant
              }]}>
                <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
                  Scanned Material Barcode:
                </Text>
                <Text style={[globalStyles.subtitle_3, { color: colors.primary }]}>
                  {materialBarcode}
                </Text>
              </View>
            ) : null}
          </View>

          {/* STEP 2: PUT TO LOCATION */}
          <View style={[globalStyles.mt_10, globalStyles.p_10, globalStyles.borderRadius_10, {
            backgroundColor: step2Complete ? colors.white : colors.card,
            borderWidth: 2,
            borderColor: step2Complete ? colors.success : !step1Complete ? colors.white : colors.primary,
            opacity: !step1Complete ? 0.6 : 1,
          }]}>
            <View style={[globalStyles.mb_10, globalStyles.twoInputContainer1]}>
              <View style={globalStyles.container1}>
                <Text style={[globalStyles.subtitle_3, { color: colors.primary }]}>
                  STEP 2:
                </Text>
                <Text style={[globalStyles.subtitle_3, { color: colors.gray }]}>
                  PUT TO LOCATION
                </Text>
              </View>

              {step2Complete && (
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              )}

              {/* Location Barcode */}
              <View style={[globalStyles.twoInputContainer1, globalStyles.justifyEnd]}>
                <Button
                  mode="contained"
                  theme={theme}
                  icon={() => <Ionicons name="scan" size={20} color={colors.white} />}
                  style={globalStyles.camButtonContainer}
                  onPress={() => setModalLocationVisible(true)}
                  disabled={!step1Complete || step2Complete}
                >
                  <Text style={{ color: !step1Complete ? colors.gray : colors.white }}>
                    Scan Location Barcode
                  </Text>
                </Button>
              </View>
            </View>

            {/* Location Details Fields */}
            <View style={[globalStyles.mb_10]}>
              <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
                Location Details:
              </Text>

              {/* Warehouse / Location */}
              <View style={[globalStyles.mb_10]}>
                <TextInput
                  style={globalStyles.height_45}
                  mode="outlined"
                  theme={theme}
                  value={warehouse}
                  onChangeText={setWarehouse}
                  placeholder="Enter warehouse or location"
                  disabled={!step1Complete || step2Complete}
                />
              </View>

              {/* Store / Rack */}
              <View style={[globalStyles.mb_10]}>
                <TextInput
                  style={globalStyles.height_45}
                  mode="outlined"
                  theme={theme}
                  value={storeRack}
                  onChangeText={setStoreRack}
                  placeholder="Enter store or rack number"
                  disabled={!step1Complete || step2Complete}
                />
              </View>

              {/* Bin / Area */}
              <View style={[globalStyles.mb_10]}>
                <TextInput
                  style={globalStyles.height_45}
                  mode="outlined"
                  theme={theme}
                  value={binArea}
                  onChangeText={setBinArea}
                  placeholder="Enter bin or area"
                  disabled={!step1Complete || step2Complete}
                />
              </View>
            </View>

            {/* Scanned Location Barcode Display */}
            {locationBarcode ? (
              <View style={[globalStyles.mb_10, globalStyles.p_10, globalStyles.borderRadius_10, {
                backgroundColor: colors.surfaceVariant
              }]}>
                <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
                  Scanned Location Barcode:
                </Text>
                <Text style={[globalStyles.subtitle_3, { color: colors.primary }]}>
                  {locationBarcode}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Scanner Modals */}
        <Modal visible={modalMaterialVisible} animationType="slide">
          <QRBarcodeScanner
            onScanned={handleMaterialScanned}
            onClose={() => setModalMaterialVisible(false)}
          />
        </Modal>

        <Modal visible={modalLocationVisible} animationType="slide">
          <QRBarcodeScanner
            onScanned={handleLocationScanned}
            onClose={() => setModalLocationVisible(false)}
          />
        </Modal>

        {/* Confirm Button */}
        <Button
          mode="contained"
          theme={theme}
          style={[globalStyles.mt_5, globalStyles.bottomButtonContainer]}
          onPress={handleConfirmPutaway}
          disabled={!step1Complete || !step2Complete}
          icon={() => <Ionicons name="checkmark-done" size={20} />}
        >
          <Text style={globalStyles.subtitle_4}>
            Confirm Putaway
          </Text>
        </Button>
      </View>
    </BackgroundGradient>
  );
};

export default PutawayProcessScreen;