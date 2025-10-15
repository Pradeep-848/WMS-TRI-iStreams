import React, { useState } from "react";
import { View, Text, ScrollView, Modal, Image, Pressable } from "react-native";
import { TextInput, Button, Card, Checkbox } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackgroundGradient from "../../Components/BackgroundGradient";
import QRBarcodeScanner from "../../Components/QRBarcodeScanner";
import { handlePickImageOptimized } from "../../Utils/nativeCameraFunction";
import { useNavigation } from "@react-navigation/native";

const GatePassCheckIn = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  // States
  const [materialSafety, setMaterialSafety] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Handlers
  const handleScannedValue = (value) => {
    console.log("Scanned value:", value);
    setModalVisible(false);
  };

  const handleCapturePress = () => {
    handlePickImageOptimized(setCapturedImage);
  };

  const handleProceed = () => {
    navigation.navigate('ProjectActiveMaterialReceiptScreen');
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="Gate Security check-in" />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={globalStyles.p_20}>
            <Button
              mode="contained-tonal"
              theme={theme}
              style={globalStyles.bottomButtonContainer}
              onPress={() => setModalVisible(true)}
            >
              <View style={globalStyles.checkBoxContainer}>
                <Icon name="qrcode-scan" size={20} color={colors.text} />
                <Text style={[globalStyles.subtitle_4, globalStyles.ml_5,]}>
                  Scan IN Pass
                </Text>
              </View>
            </Button>

            {/* Driver Details Card */}
            <Card
              style={[
                globalStyles.globalCard,
                globalStyles.mt_10,
                globalStyles.bordercardColor,
              ]}
            >
              <View
                style={[
                  globalStyles.twoInputContainer1,
                  globalStyles.p_10,
                  globalStyles.justifyBetween,
                ]}
              >
                <Text style={[globalStyles.subtitle_2, globalStyles.mb_5]}>
                  Driver Details
                </Text>
                <Pressable style={globalStyles.alignItemsCenter}>
                  <Icon name="pencil" size={20} color={colors.primary} />
                </Pressable>
              </View>

              <Card.Content>
                <View style={globalStyles.twoInputContainer1}>
                  <View style={globalStyles.twoInputContainer}>
                    <Icon name="account" size={22} color={colors.primary} />
                    <Text
                      style={[
                        globalStyles.subtitle_1,
                        globalStyles.ml_10,
                        globalStyles.mb_5,
                        { color: colors.primary },
                      ]}
                    >
                      Youshaf Abdullah
                    </Text>
                  </View>

                  <View style={globalStyles.twoInputContainer}>
                    <Icon name="truck-outline" size={20} color={colors.gray} />
                    <Text
                      style={[
                        globalStyles.subtitle_3,
                        globalStyles.ml_10,
                        globalStyles.mb_5,
                      ]}
                    >
                      D 87550
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Material Safety */}
            <View
              style={[
                globalStyles.checkBoxContainer,
                globalStyles.justifyEnd,
                globalStyles.mt_10,
              ]}
            >
              <Text style={[globalStyles.subtitle_4]}>
                Verify Material Safety
              </Text>
              <Checkbox
                theme={theme}
                status={materialSafety ? "checked" : "unchecked"}
                onPress={() => setMaterialSafety(!materialSafety)}
              />
            </View>

            {/* Take Photo */}
            <View style={globalStyles.mt_10}>
              <Button
                mode="outlined"
                theme={theme}
                style={globalStyles.bottomButtonContainer}
                onPress={handleCapturePress}
              >
                <View style={globalStyles.twoInputContainer}>
                  <Text style={[globalStyles.subtitle_4]}>
                    Take Photo (Vehicle / Material)
                  </Text>
                  <Ionicons
                    name="camera"
                    size={20}
                    color={colors.primary}
                    style={{ marginLeft: 10 }}
                  />
                </View>
              </Button>

              {capturedImage && (
                <View style={globalStyles.imageContainer}>
                  <Image
                    source={{ uri: capturedImage }}
                    style={globalStyles.fullImage}
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Proceed Button */}
        <View style={[globalStyles.bottomButtonContainer, globalStyles.p_20]}>
          <Button
            mode="contained"
            theme={theme}
            onPress={handleProceed}
          >
            <Text style={[globalStyles.subtitle_4, { color: "#fff" }]}>
              STAMP & PROCEED TO RECEIVING
            </Text>
          </Button>
        </View>

        {/* QR Scanner Modal */}
        <Modal visible={modalVisible} animationType="slide">
          <QRBarcodeScanner
            onScanned={handleScannedValue}
            onClose={() => setModalVisible(false)}
          />
        </Modal>
      </View>
    </BackgroundGradient>
  );
};

export default GatePassCheckIn;
