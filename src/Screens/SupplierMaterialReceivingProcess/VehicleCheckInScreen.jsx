import React, { useState } from "react";
import { View, Text, ScrollView, Modal, Pressable, Image, TouchableOpacity, Dimensions } from "react-native";
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
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get('window');

const VehicleCheckInScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [gateId, setGateId] = useState("");

  const [scannedBarcodes, setScannedBarcodes] = useState([]);
  const [inwardRegisterNo, setInwardRegisterNo] = useState("");
  const [materialSafety, setMaterialSafety] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  const handleScannedValue = (value) => {
    if (!scannedBarcodes.includes(value)) {
      setScannedBarcodes(prev => [...prev, value]);
    }
    setModalVisible(false);
  };

  const handleCapturePress = () => {
    handlePickImageOptimized(setCapturedImage);
  };

  const handleNext = () => {
    navigation.navigate('MaterialReceivingandGrn');
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="Vehicle Check In" />
        <View style={[globalStyles.p_20]}>

          <View style={[globalStyles.twoInputContainer1, globalStyles.mt_5, globalStyles.mb_5]}>
            <View style={globalStyles.container1}>
              <Text style={globalStyles.subtitle_2}>Gate ID - {" "}
                <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>GR-12121243</Text></Text>
            </View>

            <Button
              mode="contained"
              theme={theme}
              style={globalStyles.camButtonContainer}
              onPress={() => setModalVisible(true)}
            >
              <View style={globalStyles.checkBoxContainer}>
                <Icon name="qrcode-scan" size={20} />
                <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>
                  Scan Barcode
                </Text>
              </View>
            </Button>
          </View>

          {/* Vendor Name (Moved Up) */}
          <Card style={[globalStyles.globalCard, globalStyles.mt_10, globalStyles.p_20]}>
            <View style={[globalStyles.mt_5, globalStyles.mb_5]}>
              <Text style={[globalStyles.subtitle_2, globalStyles.mb_5]}>
                Vendor Name - <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>3 Pole Switch Gear</Text>
              </Text>
            </View>

            <View style={[globalStyles.twoInputContainer1, globalStyles.mt_5]}>
              <View>
                <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
                  Expected Date - <Text style={[globalStyles.subtitle_4, { color: colors.warning }]}>05/01/2023</Text>
                </Text>
              </View>

              <View>
                <Text style={[globalStyles.subtitle_3, globalStyles.mb_5]}>
                  IN Pass ID - <Text style={[globalStyles.subtitle_3, { color: colors.gray }]}>1234</Text>
                </Text>
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

          <View style={[globalStyles.checkBoxContainer, globalStyles.justifyEnd]}>
            <Checkbox
              theme={theme}
              status={materialSafety ? "checked" : "unchecked"}
              onPress={() => setMaterialSafety(!materialSafety)}
            />
            <View>
              <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>Verify Material Safety</Text>
            </View>
          </View>

          {/* Take Photo */}
          <View>
            <Button
              mode="outlined"
              theme={theme}
              style={globalStyles.bottomButtonContainer}
              onPress={handleCapturePress}
            >
              <View style={globalStyles.twoInputContainer}>
                <Text style={[globalStyles.subtitle_4]}>Take Photo (Vhcl/Mtrl)</Text>
                <Ionicons name="camera" size={20} color={colors.primary} style={{ marginLeft: 10 }} />
              </View>
            </Button>
          </View>

          {/* Inward Register No */}
          <View style={[globalStyles.mt_5, globalStyles.mb_5]}>
            <Text style={[globalStyles.subtitle_4]}>Inward Register No</Text>
            <TextInput
              mode="outlined"
              theme={theme}
              style={[globalStyles.height_45, { width: "50%" }]}
              value="IN-1278589"
              onChangeText={setInwardRegisterNo}
              disabled
            />
          </View>

          {capturedImage && (
            <Image
              source={{ uri: capturedImage }}
              style={{
                marginTop: 10,
                width: width * 0.94,
                height: width * 0.45,
                borderWidth: 1,
                borderColor: colors.lightGray,
              }}
            />
          )}
        </View>
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
