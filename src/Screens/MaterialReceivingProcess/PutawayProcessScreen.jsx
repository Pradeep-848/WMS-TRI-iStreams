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
import QRBarcodeScanner from "../../Components/QRBarcodeScanner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GenericListPopup from "../../Modal/GenericListPopup";
import { useSnackbar } from "../../Context/SnackbarContext";

const PutawayProcessScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const { showSnackbar } = useSnackbar();
  const globalStyles = GlobalStyles(colors);

  const [activeInput, setActiveInput] = useState(null);

  // Material details fields
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState("");
  const [uom, setUom] = useState("");
  const [qty, setQty] = useState("");
  const [materialBarcode, setMaterialBarcode] = useState("");
  const [locationBarcode, setLocationBarcode] = useState("");

  // Location details fields    
  const [locationID, setLocationID] = useState(null);
  const [storeLocation, setStoreLocation] = useState('');
  const [rack, setRack] = useState('');
  const [bin, setBin] = useState('');

  const [locationName, setLocationName] = useState('Fetching location...');
  const [coordinates, setCoordinates] = useState('');
  const [address, setAddress] = useState('');

  const [materialList, setMaterialList] = useState([]);
  const [storeLocationList, setstoreLocationList] = useState([]);

  const [modalMaterialVisible, setModalMaterialVisible] = useState(false);
  const [modalLocationVisible, setModalLocationVisible] = useState(false);

  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isMatPopupVisible, setMatPopupVisible] = useState(false);

  const [step1Complete, setStep1Complete] = useState(false);
  const [step2Complete, setStep2Complete] = useState(false);

  // Static data for demonstration
  const taskId = "GRN-213083434";

  const handleMatSelect = (material) => {
    setItemCode(material.ITEM_CODE);
    setItemName(material.ITEM_NAME);
    setUom(material.UOM_STOCK);

    setMatPopupVisible(false);
  };

  const handleStrLocSelect = (storeLocation) => {
    setLocationID(storeLocation.LOCATION_ID);
    setStoreLocation(storeLocation.STORE_LOCATION);
    setRack(storeLocation.RACK_NAME);
    setBin(storeLocation.BIN_NAME);

    setPopupVisible(false);
  };

  const handleMaterialScanned = (value) => {
    setMaterialBarcode(value);

    // Try to find material in list by barcode
    const foundMaterial = materialList.find(
      (mat) => mat.ITEM_CODE === value || mat.SUB_MATERIAL_NO === value
    );

    if (foundMaterial) {
      setItemCode(foundMaterial.ITEM_CODE);
      setItemName(foundMaterial.ITEM_NAME);
      setUom(foundMaterial.UOM_STOCK);
    } else {
      showSnackbar('Material not found in list. Please select manually.', 'error');
    }

    setModalMaterialVisible(false);
    setActiveInput(null);
  };

  const handleLocationScanned = (value) => {
    setLocationBarcode(value);

    // Parse barcode to populate location fields
    const parts = value.split('-');
    let warehouseCheck, storeRackCheck, binAreaCheck;

    if (parts.length >= 3) {
      warehouseCheck = parts[0] || "";
      storeRackCheck = parts[1] + "-" + (parts[2] || "");
      binAreaCheck = parts.slice(3).join('-') || "";
    } else {
      warehouseCheck = value;
      storeRackCheck = "";
      binAreaCheck = "";
    }

    // Try to find in store location list
    const foundLocation = storeLocationList.find(
      (loc) => loc.STORE_LOCATION === warehouseCheck
    );

    if (foundLocation) {
      setLocationID(foundLocation.LOCATION_ID);
      setStoreLocation(foundLocation.STORE_LOCATION);
      setRack(foundLocation.RACK_NAME);
      setBin(foundLocation.BIN_NAME);
    } else {
      showSnackbar('Location not found. Please select manually.', 'error');
    }

    setModalLocationVisible(false);
    setActiveInput(null);
  };

  // NEW: Handle remove selection for Step 1
  const handleRemoveMaterialSelection = () => {
    setItemCode('');
    setItemName('');
    setUom('');
    setQty('');
    setMaterialBarcode('');
    setStep1Complete(false);
    // Also reset Step 2 when Step 1 is cleared
    handleRemoveLocationSelection();
  };

  // RENAMED: Handle remove selection for Step 2
  const handleRemoveLocationSelection = () => {
    setLocationBarcode('');
    setLocationID(null);
    setStoreLocation('');
    setRack('');
    setBin('');
    setStep2Complete(false);
  };

  useEffect(() => {
    LocationService(setLocationName, setCoordinates, setAddress);
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

  // Auto-check Step 1
  useEffect(() => {
    // Step 1 complete if item and qty entered (manual) OR barcode scanned
    if (itemName.trim() && qty.trim() && (materialBarcode.trim() || itemCode.trim())) {
      setStep1Complete(true);
    } else {
      setStep1Complete(false);
    }
  }, [itemName, qty, materialBarcode, itemCode]);

  // Auto-check Step 2
  useEffect(() => {
    if (storeLocation.trim() && rack.trim() && bin.trim()) {
      setStep2Complete(true);
    } else {
      setStep2Complete(false);
    }
  }, [storeLocation, rack, bin]);

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
            backgroundColor: colors.card,
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

            {/* Item Name */}
            <View>
              <TextInput
                mode="outlined"
                theme={theme}
                label="Item Name"
                value={
                  itemName
                    ? `${itemName}`
                    : itemName
                }
                onChangeText={setItemName}
                showSoftInputOnFocus={false}
                selectionHandleColor={colors.primary}
                onPress={() => !step1Complete && setMatPopupVisible(true)}
                disabled={step1Complete}
                right={
                  (itemName || materialBarcode) ? (
                    <TextInput.Icon icon="close" onPress={handleRemoveMaterialSelection} />
                  ) : null
                }
              />
            </View>

            {/* Qty */}
            <View>
              <TextInput
                style={{ width: "30%" }}
                mode="outlined"
                theme={theme}
                label="Qty"
                value={qty}
                onChangeText={setQty}
                keyboardType="numeric"
                disabled={step1Complete}
              />
            </View>
          </View>

          {/* STEP 2: PUT TO LOCATION */}
          <View style={[globalStyles.mt_10, globalStyles.p_10, globalStyles.borderRadius_10, {
            backgroundColor: colors.card,
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
                  <Text style={{ color: colors.white }}>
                    Scan Location Barcode
                  </Text>
                </Button>
              </View>
            </View>

            {/* Location Details Fields */}
            <View style={[globalStyles.mb_10]}>
              <Text style={[globalStyles.subtitle_4, globalStyles.mt_10]}>
                Location Details :
              </Text>

              {/* Warehouse / Location */}
              <View>
                <TextInput
                  mode="outlined"
                  label="Store Location"
                  theme={theme}
                  value={storeLocation}
                  onPress={() => step1Complete && !step2Complete && setPopupVisible(true)}
                  showSoftInputOnFocus={false}
                  onChangeText={setStoreLocation}
                  disabled={!step1Complete || step2Complete}
                  right={
                    (storeLocation || locationBarcode) ? (
                      <TextInput.Icon icon="close" onPress={handleRemoveLocationSelection} />
                    ) : null
                  }
                />
              </View>

              {/* Store / Rack */}
              <View>
                <TextInput
                  mode="outlined"
                  label="Rack"
                  theme={theme}
                  value={rack}
                  onChangeText={setRack}
                  editable={false}
                />
              </View>

              {/* Bin / Area */}
              <View>
                <TextInput
                  mode="outlined"
                  label="Bin"
                  theme={theme}
                  value={bin}
                  onChangeText={setBin}
                  editable={false}
                />
              </View>
            </View>
          </View>
        </ScrollView>

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
          disabled={!step1Complete || !step2Complete}
          icon={() => <Ionicons name="checkmark-done" size={20} color={colors.lightGray} />}
          textColor={colors.white}
        >
          Confirm Putaway
        </Button>
      </View>
    </BackgroundGradient>
  );
};

export default PutawayProcessScreen;