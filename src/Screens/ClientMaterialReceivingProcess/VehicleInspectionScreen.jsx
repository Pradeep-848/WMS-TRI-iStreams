import React, { useState } from "react";
import { View, Text, ScrollView, Modal, Pressable, Image, TouchableOpacity, Share, Alert, Platform } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button, Card, IconButton, Checkbox } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import QRBarcodeScanner from "../../Components/QRBarcodeScanner";
import { handlePickImageOptimized } from "../../Utils/nativeCameraFunction"; // DPR reference camera
import BackgroundGradient from "../../Components/BackgroundGradient";
import RNShare from 'react-native-share';
import { useNavigation } from "@react-navigation/native";

const VehicleInspectionScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [scannedBarcodes, setScannedBarcodes] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  const handleScannedValue = (value) => {
    if (!scannedBarcodes.includes(value)) {
      setScannedBarcodes(prev => [...prev, value]);
    }
    setModalVisible(false);
  };

  const handleCapturePress = () => {
    console.log('Capture button pressed');
    handlePickImageOptimized((imageUri) => {
      console.log('Callback received image URI:', imageUri);
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
        title: 'Vehicle Inspection',
        message: 'Vehicle Inspection Photo', // This will be the caption
        url: `file://${capturedImage}`, // Ensure it's a proper file URI
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
        console.log("Fallback share error:", fallbackError);
        Alert.alert("Sharing Error", "Unable to share the image.");
      }
    }
  };

  const handleNext = () => {
    navigation.navigate('ActiveMaterialReceiptScreen');
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="Vehicle Inspection" />

        <Card style={[globalStyles.globalCard, globalStyles.p_10]}>
          <View style={globalStyles.twoInputContainer1}>
            <View>
              <Text style={[globalStyles.subtitle_3, globalStyles.mb_5]}>
                <Icon name="package-variant" size={15} color={colors.primary} />
                {" "} MR ID - MR001
              </Text>
            </View>

            <View>
              <Text style={[globalStyles.subtitle_3, globalStyles.mb_5, globalStyles.borderRadius_10, globalStyles.px_5, { color: colors.success, borderWidth: 1, borderColor: colors.success }]}>
                <Icon name="check" size={15} color={colors.success} />{" "} Verified
              </Text>
            </View>

            <View>
              <Button
                mode="contained"
                theme={theme}
                style={globalStyles.camButtonContainer}
                onPress={() => setModalVisible(true)}
              >
                <View style={globalStyles.checkBoxContainer}>
                  <Icon name="qrcode-scan" size={20} color={colors.text} />
                  <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>
                    Scan In Pass
                  </Text>
                </View>
              </Button>
            </View>
          </View>
        </Card>

        <Card style={[globalStyles.globalCard, globalStyles.mt_10, globalStyles.bordercardColor]}>
          <View style={[globalStyles.twoInputContainer1, globalStyles.p_10]}>
            <Text style={[globalStyles.subtitle_2, globalStyles.mb_5]}>
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
                <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
                  <Icon name="account" size={22} color={colors.primary} />
                </Text>
                <Text style={[globalStyles.subtitle_1, globalStyles.ml_10, globalStyles.mb_5, { color: colors.primary }]}>
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
              <Text style={[globalStyles.subtitle_3, globalStyles.ml_10, globalStyles.mb_5, { color: colors.success }]}>
                +971 589397436
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={[globalStyles.checkBoxContainer, globalStyles.justifyEnd, globalStyles.p_5]}>
          <Checkbox
          />
          <View>
            <Text style={[globalStyles.subtitle_3, globalStyles.ml_5, { color: colors.warning, textDecorationLine: "underline" }]}>Verify Material Safety</Text>
          </View>
        </View>

        {/* Take Photo */}
        <View style={[globalStyles.twoInputContainer, globalStyles.p_20, globalStyles.borderRadius_10, { borderWidth: 2, borderColor: colors.gray, borderStyle: "dashed" }]}>
          {capturedImage && (
            <View style={[globalStyles.mt_10, globalStyles.container1, globalStyles.alignItemsCenter]}>
              <Text style={[globalStyles.subtitle_3, globalStyles.mb_10]}>Captured Image:</Text>
              <Image
                source={{ uri: capturedImage }}
                style={globalStyles.uploadedEmpImage}
              />

              {/* Share Button */}
              <Button
                mode="contained"
                theme={theme}
                style={[globalStyles.bottomButtonContainer, globalStyles.mt_10]}
                onPress={shareViaWhatsApp}
              >
                <View style={globalStyles.twoInputContainer}>
                  <Text style={[globalStyles.subtitle_3]}>Share</Text>
                  <Icon name="share-variant" size={20} color={colors.text} style={{ marginLeft: 10 }} />
                </View>
              </Button>
            </View>
          )}

          <View style={globalStyles.container2}>
            <Button
              mode="outlined"
              theme={theme}
              style={globalStyles.rightButton}
              onPress={handleCapturePress}
            >
              <View style={globalStyles.twoInputContainer}>
                <Text style={[globalStyles.subtitle_4]}>Take Photo (Vhcl/Mtrl)</Text>
                <Ionicons name="camera" size={20} color={colors.primary} style={globalStyles.ml_10} />
              </View>
            </Button>
          </View>
        </View>

        {/* Scanner Modal */}
        <Modal visible={modalVisible} animationType="slide">
          <QRBarcodeScanner
            onScanned={handleScannedValue}
            onClose={() => setModalVisible(false)}
          />
        </Modal>
      </View>

      <View style={[globalStyles.bottomButtonContainer, globalStyles.p_20]}>
        <Button
          mode="contained"
          theme={theme}
          onPress={handleNext}
        >
          Next
        </Button>
      </View>
    </BackgroundGradient>
  );
};

export default VehicleInspectionScreen;