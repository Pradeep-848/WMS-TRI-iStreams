import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput, Button, Modal } from "react-native-paper";
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

  const [locationName, setLocationName] = useState('Fetching location...');
  const [coordinates, setCoordinates] = useState('');
  const [address, setAddress] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Static data for demonstration
  const taskId = "GRN-213083434";
  const putawayLocation = "Aisle A-3-Shelf 05";

  const handleMaterialScanned = (value) => {
    if (!scannedBarcodes.includes(value)) {
      setMaterialBarcode(prev => [...prev, value]);
    }
    setModalMaterialVisible(false);
  };

  const handleLocationScanned = (value) => {
    if (!scannedBarcodes.includes(value)) {
      setLocationBarcode(prev => [...prev, value]);
    }
    setLocationModalVisible(false);
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

  const handleMaterialBarcodeScan = () => {
    // Simulate barcode scanning - you can integrate actual barcode scanner here
    if (materialBarcode.trim() && itemName.trim() && qty.trim()) {
      setStep1Complete(true);
      Alert.alert("Success", "Material barcode scanned successfully!");
    } else {
      Alert.alert("Error", "Please fill Item Name, Qty, and scan Material Barcode");
    }
  };

  const handleLocationBarcodeScan = () => {
    // Simulate barcode scanning
    if (locationBarcode.trim()) {
      setStep2Complete(true);
      Alert.alert("Success", "Location barcode scanned successfully!");
    } else {
      Alert.alert("Error", "Please scan Location Barcode");
    }
  };

  const handleRequestOverride = () => {
    Alert.alert(
      "Request Override",
      "Location appears to be blocked. Do you want to request an override?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Request", onPress: () => Alert.alert("Override requested") }
      ]
    );
  };

  const handleConfirmPutaway = () => {
    if (step1Complete && step2Complete) {
      Alert.alert(
        "Success",
        "Item Putaway Confirmed. Task Complete.",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form for next task
              setItemName("");
              setQty("");
              setMaterialBarcode("");
              setLocationBarcode("");
              setStep1Complete(false);
              setStep2Complete(false);
            }
          }
        ]
      );
    }
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="Putaway Process" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={globalStyles.p_20}>
          {/* Task ID */}
          <View>
            <Text style={[globalStyles.subtitle_1, globalStyles.container1]}>
              Task:{" "}
              <Text style={[globalStyles.subtitle_1, { color: colors.primary }]}>
                {taskId}
              </Text>
            </Text>
          </View>

          {/* Location */}
          <View style={[globalStyles.mt_10]}>
            <View style={globalStyles.locationContainer}>
              <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
              <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>
                {locationName}
              </Text>
            </View>
          </View>

          {/* STEP 1: COLLECT ITEM */}
          <View style={[globalStyles.mt_10, globalStyles.p_10, globalStyles.borderRadius_10, {
            backgroundColor: step1Complete ? '#e8f5e9' : colors.card,
            borderWidth: 2,
            borderColor: step1Complete ? '#4caf50' : colors.primary,
          }]}>
            <View style={[globalStyles.mb_10, globalStyles.twoInputContainer1]}>
              <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>
                STEP 1: COLLECT ITEM
              </Text>
              {step1Complete && (
                <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
              )}

              {/* Material Barcode */}
              <View style={[globalStyles.twoInputContainer1, globalStyles.justifyEnd]}>
                <Button
                  mode="contained"
                  theme={theme}
                  style={globalStyles.camButtonContainer}
                  onPress={() => setModalMaterialVisible(true)}
                >
                  <View style={globalStyles.checkBoxContainer}>
                    <Icon name="qrcode-scan" size={20} color={colors.text} />
                    <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>
                      Scan Material Barcode
                    </Text>
                  </View>
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
          </View>

          {/* STEP 2: PUT TO LOCATION */}
          <View style={[globalStyles.mt_10, globalStyles.p_10, {
            backgroundColor: step2Complete ? '#e8f5e9' : colors.card,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: step2Complete ? '#4caf50' : !step1Complete ? '#ccc' : colors.primary,
            opacity: !step1Complete ? 0.6 : 1,
          }]}>
            <View style={[globalStyles.mb_10, globalStyles.twoInputContainer1]}>
              <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>
                STEP 2: PUT TO LOCATION
              </Text>
              {step2Complete && (
                <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
              )}

              {/* Location Barcode */}
              <View style={[globalStyles.twoInputContainer1, globalStyles.justifyEnd]}>
                <Button
                  mode="contained"
                  theme={theme}
                  style={globalStyles.camButtonContainer}
                  onPress={() => setModalLocationVisible(true)}
                >
                  <View style={globalStyles.checkBoxContainer}>
                    <Icon name="qrcode-scan" size={20} color={colors.text} />
                    <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>
                      Scan Location Barcode
                    </Text>
                  </View>
                </Button>
              </View>
            </View>

            {/* Location Display */}
            <View style={[globalStyles.mb_10, globalStyles.p_10, {
              backgroundColor: colors.background,
              borderRadius: 8
            }]}>
              <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
                Putaway Location:
              </Text>
              <Text style={[globalStyles.title, { color: colors.primary }]}>
                {putawayLocation}
              </Text>
            </View>

            {/* Exception Link */}
            {step1Complete && !step2Complete && (
              <View style={globalStyles.mt_10}>
                <Button
                  mode="text"
                  onPress={handleRequestOverride}
                  icon={() => <Ionicons name="alert-circle" size={18} color="#ff9800" />}
                  labelStyle={{ color: '#ff9800' }}
                >
                  Location Blocked? Request Override
                </Button>
              </View>
            )}
          </View>

          {/* Progress Indicator */}
          {/* <View style={[globalStyles.mt_10, globalStyles.twoInputContainer1]}>
            <View style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: step1Complete ? '#4caf50' : '#ccc',
              marginHorizontal: 5
            }} />
            <View style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: step2Complete ? '#4caf50' : '#ccc',
              marginHorizontal: 5
            }} />
          </View> */}
        </ScrollView>

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

      {/* Scanner Modal */}
      <Modal visible={modalMaterialVisible} animationType="slide">
        <QRBarcodeScanner
          onScanned={handleMaterialScanned}
          onClose={() => setModalMaterialVisible(false)}
        />
      </Modal>
    </BackgroundGradient>
  );
};

export default PutawayProcessScreen;

// import React, { useEffect, useState } from "react";
// import { View, Text, ScrollView } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import Header from "../../Components/Header";
// import { useTheme } from "../../Context/ThemeContext";
// import { GlobalStyles } from "../../Styles/styles";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { TextInput, Button, Icon } from "react-native-paper";
// import BackgroundGradient from "../../Components/BackgroundGradient";
// import { LocationService } from "../../Logics/LocationService";
// import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
// import { formatDate, formatTime } from '../../Utils/dataTimeUtils';

// const PutawayProcessScreen = () => {
//   const insets = useSafeAreaInsets();
//   const { theme } = useTheme();
//   const colors = theme.colors;
//   const globalStyles = GlobalStyles(colors);

//   const [itemName, setItemName] = useState("");
//   const [qty, setQty] = useState("");

//   const [locationName, setLocationName] = useState('Fetching location...');
//   const [coordinates, setCoordinates] = useState('');
//   const [address, setAddress] = useState('');
//   const [entryDate, setEntryDate] = useState('');
//   const [startTime, setStartTime] = useState('');
//   const [endTime, setEndTime] = useState('');


//   useEffect(() => {
//     LocationService(setLocationName, setCoordinates, setAddress);

//     const now = new Date();
//     setEntryDate(formatDate(now));

//     const currentTimeFormatted = formatTime(now);

//     const oneHourLater = new Date(now);
//     oneHourLater.setHours(oneHourLater.getHours() + 1);
//     const oneHourLaterFormatted = formatTime(oneHourLater);

//     setStartTime(currentTimeFormatted);
//     setEndTime(oneHourLaterFormatted);
//   }, []);

//   return (
//     <BackgroundGradient>
//       <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
//         <Header title="Putaway Process" />
//         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={globalStyles.p_20}>
//           {/* Task ID */}
//           <View>
//             <Text
//               style={[
//                 globalStyles.subtitle_1,
//                 globalStyles.container1]}
//             >
//               Task :{" "} <Text style={[globalStyles.subtitle_1, { color: colors.primary }]}>GRN-213083434</Text>
//             </Text>
//           </View>

//           {/* Location Input */}
//           <View style={[globalStyles.mt_10]}>
//             <View>
//               <View style={globalStyles.locationContainer}>
//                 <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
//                 <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
//               </View>
//             </View>
//           </View>

//           {/* Material Barcode Button */}
//           <View style={[globalStyles.mt_10, globalStyles.camButtonContainer]}>
//             <Button
//               mode="outlined"
//               theme={theme}
//               icon={() => <Ionicons name="scan" size={20} color="#fff" />}
//             >
//               Material Barcode
//             </Button>
//           </View>

//           {/* Collect Items Title */}
//           {/* <View style={[globalStyles.mt_10, globalStyles.p_20]}>
//             <Text
//               style={[
//                 globalStyles.subtitle_1,
//                 globalStyles.justifyStart, { color: colors.primary }]}
//             >
//               Collect Items {" "}<Ionicons name="pricetags" size={20} color={colors.white} />
//             </Text>
//           </View> */}

//           {/* Item Name & Qty */}
//           <View style={[globalStyles.twoInputContainer1, globalStyles.mt_10]}>
//             <View style={globalStyles.container1}>
//               <Text
//                 style={[
//                   globalStyles.subtitle_4,
//                   globalStyles.mb_5,
//                 ]}
//               >
//                 Item Name
//               </Text>
//               <TextInput
//                 style={globalStyles.height_45}
//                 mode="outlined"
//                 theme={theme}
//                 value={itemName}
//                 onChangeText={setItemName}
//               />
//             </View>

//             <View style={globalStyles.container2}>
//               <Text
//                 style={[
//                   globalStyles.subtitle_4,
//                   globalStyles.mb_5,
//                 ]}
//               >
//                 Qty
//               </Text>
//               <TextInput
//                 style={globalStyles.height_45}
//                 mode="outlined"
//                 theme={theme}
//                 value={qty}
//                 onChangeText={setQty}
//               />
//             </View>
//           </View>
//         </ScrollView>

//         {/* Save Button */}
//         <Button
//           mode="contained"
//           theme={theme}
//           style={[globalStyles.mt_5, globalStyles.bottomButtonContainer]}
//         >
//           <Text style={[globalStyles.subtitle_4, { color: "#fff" }]}>Save</Text>
//         </Button>
//       </View>
//     </BackgroundGradient>
//   );
// };

// export default PutawayProcessScreen;
