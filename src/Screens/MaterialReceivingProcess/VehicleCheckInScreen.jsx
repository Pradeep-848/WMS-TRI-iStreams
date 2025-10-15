import React, { useState } from "react";
import { View, Text, ScrollView, Modal, Pressable, Image, TouchableOpacity, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button, Card, Checkbox } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import QRBarcodeScanner from "../../Components/QRBarcodeScanner";
import { handlePickImageOptimized } from "../../Utils/nativeCameraFunction"; // DPR reference camera
import BackgroundGradient from "../../Components/BackgroundGradient";
import { useNavigation } from "@react-navigation/native";
import MaterialReceivingDropdown from "../../Components/MaterialReceivingDropdown";
import { displayLocalNotification } from "../../Utils/notificationUtils";
import RNShare from 'react-native-share';

const { width, height } = Dimensions.get('window');

const VehicleCheckInScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [scannedBarcodes, setScannedBarcodes] = useState([]);
  const [inwardRegisterNo, setInwardRegisterNo] = useState("");
  const [materialSafety, setMaterialSafety] = useState(false);
  const [materialCondition, setMaterialCondition] = useState("good");
  const [capturedImage, setCapturedImage] = useState(null);

  const [receivingType, setReceivingType] = useState('Supplier');
  const [receivingTypeModalVisible, setReceivingTypeModalVisible] = useState(false);

  const openReceivingTypeDropdown = () => setReceivingTypeModalVisible(true);
  const closeReceivingTypeDropdown = () => setReceivingTypeModalVisible(false);

  const [modalVisible, setModalVisible] = useState(false);

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
        title: 'Vehicle Check In',
        message: 'Vehicle Check In',
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

  const handleSubmit = () => {
    const title = '✅ Check-In Complete';
    const body = 'Delivery IN-1278589 (3 Pole Switch Gear) is ready for unloading.';
    displayLocalNotification(title, body);
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>

        <Header title="Vehicle Check In" />

        <View style={[globalStyles.twoInputContainer1, globalStyles.mt_5, globalStyles.mb_5]}>
          <View style={globalStyles.container1}>
            <Text style={[globalStyles.subtitle_2, { color: colors.gray }]}>Gate ID</Text>
            <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>GR-12121243</Text>
          </View>

          <Button
            mode="contained"
            theme={theme}
            style={globalStyles.camButtonContainer}
            onPress={() => setModalVisible(true)}
          >
            <View style={globalStyles.checkBoxContainer}>
              <Icon name="qrcode-scan" size={20} color={colors.white} />
              <Text style={[globalStyles.subtitle_4, globalStyles.ml_5, { color: colors.white }]}>
                Scan Barcode
              </Text>
            </View>
          </Button>
        </View>

        <ScrollView>
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

          <Card style={[globalStyles.globalCard, globalStyles.mt_10, globalStyles.bordercardColor]}>
            <View style={[globalStyles.twoInputContainer1, globalStyles.p_10]}>
              <Text style={globalStyles.subtitle_2}>
                Driver Details
              </Text>

              <Pressable
                style={globalStyles.alignItemsCenter}
              >
                <Icon name="pencil" size={20} color={colors.primary} />
              </Pressable>
            </View>

            <Card.Content>
              <View style={globalStyles.twoInputContainer1}>
                <View style={globalStyles.twoInputContainer}>
                  <Text style={globalStyles.subtitle_4}>
                    <Icon name="account" size={22} color={colors.primary} />
                  </Text>
                  <Text style={[globalStyles.subtitle_1, globalStyles.ml_10, { color: colors.primary }]}>
                    Youshaf Abdullah
                  </Text>
                </View>

                <View style={[globalStyles.twoInputContainer]}>
                  <Icon name="truck-outline" size={20} color={colors.gray} />
                  <Text style={[globalStyles.subtitle_3, globalStyles.ml_10, globalStyles.mb_5]}>
                    D 87550
                  </Text>
                </View>
              </View>


              <View style={[globalStyles.checkBoxContainer]}>
                <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
                  <Icon name="phone" size={20} color={colors.success} />
                </Text>
                <Text style={[globalStyles.subtitle_3, globalStyles.ml_10, { color: colors.success }]}>
                  +971 589397436
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Material Condition */}
          <View style={[globalStyles.mt_5]}>
            <Text style={[globalStyles.subtitle_4, globalStyles.container1]}>Material Condition</Text>
            <View style={globalStyles.twoInputContainer}>
              {["good", "damaged", "rejected"].map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[globalStyles.twoInputContainer, globalStyles.px_10, globalStyles.py_10, globalStyles.mr_10,
                  globalStyles.borderRadius_10, {
                    borderWidth: 1,
                    borderColor: colors.white,
                    backgroundColor: materialCondition === condition ? colors.primary : colors.background
                  }]}
                  onPress={() => setMaterialCondition(condition)}
                >
                  <Ionicons
                    name={materialCondition === condition ? "radio-button-on" : "radio-button-off"}
                    size={18}
                    color={materialCondition === condition ? colors.white : colors.primary}
                    style={globalStyles.mr_10}
                  />
                  <Text style={{ color: materialCondition === condition ? colors.white : colors.primary }}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Take Photo */}
          <View>
            <Button
              mode="outlined"
              theme={theme}
              icon={"camera"}
              style={globalStyles.bottomButtonContainer}
              onPress={handleCapturePress}
            >
              <Text style={globalStyles.subtitle_3}>Take Photo (Vhcl/Mtrl)</Text>
            </Button>
          </View>

          {/* Inward Register No */}
          <View style={{ width: width * 0.50 }}>
            <Text style={globalStyles.subtitle_4}>Inward Register No</Text>
            <TextInput
              mode="outlined"
              theme={theme}
              style={globalStyles.height_45}
              value="IN-1278589"
              onChangeText={setInwardRegisterNo}
              disabled
            />
          </View>

          {/* Remarks / Notes */}
          <View style={globalStyles.mt_5}>
            <Text style={[globalStyles.subtitle_4]}>Remarks / Notes :</Text>
            <TextInput
              mode="outlined"
              theme={theme}
              placeholder="Enter Remarks / Notes"
              multiline
              numberOfLines={3}
            />
          </View>

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

        <View style={globalStyles.bottomButtonContainer}>
          <Button
            mode="contained"
            theme={theme}
            onPress={handleSubmit}
            textColor={colors.white}
          >
            Submit
          </Button>
        </View>
      </View>

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
    </BackgroundGradient>
  );
};

export default VehicleCheckInScreen;


// import React, { useState } from "react";
// import { View, Text, ScrollView, Modal, Pressable, Image, TouchableOpacity, Dimensions } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import Header from "../../Components/Header";
// import { useTheme } from "../../Context/ThemeContext";
// import { GlobalStyles } from "../../Styles/styles";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { TextInput, Button, Card, Checkbox } from "react-native-paper";
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import QRBarcodeScanner from "../../Components/QRBarcodeScanner";
// import { handlePickImageOptimized } from "../../Utils/nativeCameraFunction"; // DPR reference camera
// import BackgroundGradient from "../../Components/BackgroundGradient";
// import { useNavigation } from "@react-navigation/native";
// import MaterialReceivingDropdown from "../../Components/MaterialReceivingDropdown";
// import { displayLocalNotification } from "../../Utils/notificationUtils";
// import RNShare from 'react-native-share';

// const { width, height } = Dimensions.get('window');

// const VehicleCheckInScreen = () => {
//   const navigation = useNavigation();
//   const insets = useSafeAreaInsets();
//   const { theme } = useTheme();
//   const colors = theme.colors;
//   const globalStyles = GlobalStyles(colors);

//   const [scannedBarcodes, setScannedBarcodes] = useState([]);
//   const [inwardRegisterNo, setInwardRegisterNo] = useState("");
//   const [materialSafety, setMaterialSafety] = useState(false);
//   const [materialCondition, setMaterialCondition] = useState("good");
//   const [capturedImage, setCapturedImage] = useState(null);

//   const [receivingType, setReceivingType] = useState('Supplier');
//   const [receivingTypeModalVisible, setReceivingTypeModalVisible] = useState(false);

//   const openReceivingTypeDropdown = () => setReceivingTypeModalVisible(true);
//   const closeReceivingTypeDropdown = () => setReceivingTypeModalVisible(false);

//   const [modalVisible, setModalVisible] = useState(false);

//   const handlePrioritySelect = (value) => {
//     setReceivingType(value);
//     closeReceivingTypeDropdown();
//   };

//   const handleScannedValue = (value) => {
//     if (!scannedBarcodes.includes(value)) {
//       setScannedBarcodes(prev => [...prev, value]);
//     }
//     setModalVisible(false);
//   };

//   const handleCapturePress = () => {
//     handlePickImageOptimized((imageUri) => {
//       if (imageUri) {
//         setCapturedImage(imageUri);
//       }
//     });
//   };

//   const shareViaWhatsApp = async () => {
//     if (!capturedImage) {
//       Alert.alert("No Image", "Please capture an image first before sharing.");
//       return;
//     }

//     try {
//       const shareOptions = {
//         title: 'Vehicle Check In',
//         message: 'Vehicle Check In',
//         url: `file://${capturedImage}`,
//         type: 'image/jpeg',
//         social: RNShare.Social.WHATSAPP,
//       };

//       await RNShare.shareSingle(shareOptions);

//     } catch (error) {
//       console.log("Error sharing to WhatsApp:", error);

//       // Fallback: Try general share
//       try {
//         await RNShare.open({
//           title: 'Vehicle Inspection Photo',
//           message: 'Vehicle Inspection Photo',
//           url: `file://${capturedImage}`,
//           type: 'image/jpeg',
//         });
//       } catch (fallbackError) {
//         Alert.alert("Sharing Error", "Unable to share the image.");
//       }
//     }
//   };

//   const handleSubmit = () => {
//     const title = '✅ Check-In Complete';
//     const body = 'Delivery IN-1278589 (3 Pole Switch Gear) is ready for unloading.';
//     displayLocalNotification(title, body);
//   };

//   return (
//     <BackgroundGradient>
//       <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>

//         <Header title="Vehicle Check In" />

//         <View style={[globalStyles.twoInputContainer1, globalStyles.mt_5, globalStyles.mb_5]}>
//           <View style={globalStyles.container1}>
//             <Text style={[globalStyles.subtitle_2, { color: colors.gray }]}>Gate ID</Text>
//             <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>GR-12121243</Text>
//           </View>

//           <Button
//             mode="contained"
//             theme={theme}
//             style={globalStyles.camButtonContainer}
//             onPress={() => setModalVisible(true)}
//           >
//             <View style={globalStyles.checkBoxContainer}>
//               <Icon name="qrcode-scan" size={20} color={colors.white} />
//               <Text style={[globalStyles.subtitle_4, globalStyles.ml_5, { color: colors.white }]}>
//                 Scan Barcode
//               </Text>
//             </View>
//           </Button>
//         </View>

//         <ScrollView>
//           <TouchableOpacity onPress={openReceivingTypeDropdown} style={globalStyles.container2}>
//             <TextInput
//               mode="outlined"
//               label="Receiving Type"
//               value={receivingType}
//               editable={false}
//               theme={theme}
//               right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
//               pointerEvents="none"
//             />
//           </TouchableOpacity>

//           <Card style={[globalStyles.globalCard, globalStyles.mt_10, globalStyles.bordercardColor]}>
//             <View style={[globalStyles.twoInputContainer1, globalStyles.p_10]}>
//               <Text style={globalStyles.subtitle_2}>
//                 Driver Details
//               </Text>

//               <Pressable
//                 style={globalStyles.alignItemsCenter}
//               >
//                 <Icon name="pencil" size={20} color={colors.primary} />
//               </Pressable>
//             </View>

//             <Card.Content>
//               <View style={globalStyles.twoInputContainer1}>
//                 <View style={globalStyles.twoInputContainer}>
//                   <Text style={globalStyles.subtitle_4}>
//                     <Icon name="account" size={22} color={colors.primary} />
//                   </Text>
//                   <Text style={[globalStyles.subtitle_1, globalStyles.ml_10, { color: colors.primary }]}>
//                     Youshaf Abdullah
//                   </Text>
//                 </View>

//                 <View style={[globalStyles.twoInputContainer]}>
//                   <Icon name="truck-outline" size={20} color={colors.gray} />
//                   <Text style={[globalStyles.subtitle_3, globalStyles.ml_10, globalStyles.mb_5]}>
//                     D 87550
//                   </Text>
//                 </View>
//               </View>


//               <View style={[globalStyles.checkBoxContainer]}>
//                 <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
//                   <Icon name="phone" size={20} color={colors.success} />
//                 </Text>
//                 <Text style={[globalStyles.subtitle_3, globalStyles.ml_10, { color: colors.success }]}>
//                   +971 589397436
//                 </Text>
//               </View>
//             </Card.Content>
//           </Card>

//           {/* Material Condition */}
//           <View style={[globalStyles.mt_5]}>
//             <Text style={[globalStyles.subtitle_4, globalStyles.container1]}>Material Condition</Text>
//             <View style={globalStyles.twoInputContainer}>
//               {["good", "damaged", "rejected"].map((condition) => (
//                 <TouchableOpacity
//                   key={condition}
//                   style={[globalStyles.twoInputContainer, globalStyles.px_10, globalStyles.py_10, globalStyles.mr_10,
//                   globalStyles.borderRadius_10, {
//                     borderWidth: 1,
//                     borderColor: colors.white,
//                     backgroundColor: materialCondition === condition ? colors.primary : colors.background
//                   }]}
//                   onPress={() => setMaterialCondition(condition)}
//                 >
//                   <Ionicons
//                     name={materialCondition === condition ? "radio-button-on" : "radio-button-off"}
//                     size={18}
//                     color={materialCondition === condition ? colors.white : colors.primary}
//                     style={globalStyles.mr_10}
//                   />
//                   <Text style={{ color: materialCondition === condition ? colors.white : colors.primary }}>
//                     {condition.charAt(0).toUpperCase() + condition.slice(1)}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           {/* Take Photo */}
//           <View>
//             <Button
//               mode="outlined"
//               theme={theme}
//               style={globalStyles.bottomButtonContainer}
//               onPress={handleCapturePress}
//             >
//               <View style={globalStyles.twoInputContainer}>
//                 <Text style={globalStyles.subtitle_3}>Take Photo (Vhcl/Mtrl)</Text>
//                 <Ionicons name="camera" size={20} color={colors.warning} />
//               </View>
//             </Button>
//           </View>

//           {/* Inward Register No */}
//           <View style={{ width: width * 0.50 }}>
//             <Text style={globalStyles.subtitle_4}>Inward Register No</Text>
//             <TextInput
//               mode="outlined"
//               theme={theme}
//               style={globalStyles.height_45}
//               value="IN-1278589"
//               onChangeText={setInwardRegisterNo}
//               disabled
//             />
//           </View>

//           {/* Remarks / Notes */}
//           <View style={globalStyles.mt_5}>
//             <Text style={[globalStyles.subtitle_4]}>Remarks / Notes :</Text>
//             <TextInput
//               mode="outlined"
//               theme={theme}
//               placeholder="Enter Remarks / Notes"
//               multiline
//               numberOfLines={3}
//             />
//           </View>

//           {capturedImage && (
//             <View style={[globalStyles.mt_10, globalStyles.container1, globalStyles.twoInputContainer]}>
//               <Image
//                 source={{ uri: capturedImage }}
//                 style={[globalStyles.mt_10, globalStyles.container1, {
//                   width: width * 0.94,
//                   height: width * 0.45,
//                   borderWidth: 1,
//                   borderColor: colors.lightGray,
//                 }]}
//               />

//               {/* Share Button */}
//               <Button
//                 mode="contained"
//                 theme={theme}
//                 icon={"share-variant"}
//                 style={globalStyles.height_45}
//                 onPress={shareViaWhatsApp}
//               >
//               </Button>
//             </View>
//           )}
//         </ScrollView>

//         <View style={globalStyles.bottomButtonContainer}>
//           <Button
//             mode="contained"
//             theme={theme}
//             onPress={handleSubmit}
//           >
//             Submit
//           </Button>
//         </View>
//       </View>

//       <MaterialReceivingDropdown visible={receivingTypeModalVisible}
//         onClose={() => setReceivingTypeModalVisible(false)}
//         onSelect={handlePrioritySelect} />

//       {/* Scanner Modal */}
//       <Modal visible={modalVisible} animationType="slide">
//         <QRBarcodeScanner
//           onScanned={handleScannedValue}
//           onClose={() => setModalVisible(false)}
//         />
//       </Modal>
//     </BackgroundGradient>
//   );
// };

// export default VehicleCheckInScreen;