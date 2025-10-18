import React, { useState } from "react";
import { View, Text, ScrollView, Image, Dimensions } from "react-native";
import { TextInput, Button, Card, Checkbox, IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "../../Components/Header";
import BackgroundGradient from "../../Components/BackgroundGradient";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PdfComponent from "../../Components/PdfComponent";
import { launchCamera } from "react-native-image-picker";

const { width } = Dimensions.get("window");

const LoadingAndDispatchScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [materialSafety, setMaterialSafety] = useState(false);
  const [vehicleNo, setVehicleNo] = useState("D 87550");
  const [laborCount, setLaborCount] = useState("");


  const [issuerSignature, setIssuerSignature] = useState("");
  const [driverSignature, setDriverSignature] = useState("");
  const [remarks, setRemarks] = useState("");
  const [step1Complete, setStep1Complete] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  // Camera Function
  const handleLaborCameraPress = async () => {
    try {
      const result = await launchCamera({
        mediaType: "photo",
        saveToPhotos: true,
      });

      if (result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted");
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="Loading & Dispatch" />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* MIS Info */}
          <View style={[globalStyles.twoInputContainer, globalStyles.mt_5]}>
            <Text style={[globalStyles.subtitle_2, { color: colors.gray }]}>
              Material Issue
            </Text>
            <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>
              MIS-10234
            </Text>
          </View>

          {/* Verification Section */}
          <Card style={[globalStyles.globalCard, globalStyles.mb_10, globalStyles.bordercardColor]}>
            <Card.Content>
              <Text style={globalStyles.subtitle_2}>Verification Section</Text>

              <View style={globalStyles.twoInputContainer1}>
                <View style={globalStyles.checkBoxContainer}>
                  <Checkbox
                    status={materialSafety ? "checked" : "unchecked"}
                    onPress={() => setMaterialSafety(!materialSafety)}
                    color={colors.success}
                  />
                  <Text style={[globalStyles.subtitle_3, { color: colors.text }]}>
                    Verify Quantity per MIs
                  </Text>
                </View>

                <Text style={[globalStyles.subtitle_3, { color: colors.text }]}>
                  <Icon
                    name="truck-outline"
                    size={20}
                    color={colors.gray}
                    style={globalStyles.m_10}
                  />
                  {vehicleNo}
                </Text>
              </View>

              {/* Labor Count with Camera inside TextInput */}
              <View style={globalStyles.twoInputContainer1}>
                <View style={globalStyles.container1}>
                  <Text style={[globalStyles.subtitle_4]}></Text>
                  <TextInput
                    style={globalStyles.height_45}
                    mode="outlined"
                    theme={theme}
                    placeholder="Labor Count"
                    value={laborCount}
                    onChangeText={setLaborCount}
                    keyboardType="numeric"
                    right={
                      <TextInput.Icon
                        icon="camera"
                        onPress={handleLaborCameraPress}
                        forceTextInputFocus={false} // so input doesn’t lose focus when icon pressed
                      />
                    }
                  />
                </View>
              </View>
              {/* Captured Image */}
              {capturedImage && (
                <Image
                  source={{ uri: capturedImage }}
                  style={{
                    width: width * 0.94,
                    height: width * 0.45,
                    marginTop: 10,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: colors.gray,
                    alignSelf: "center"
                  }}
                />
              )}
            </Card.Content>
          </Card>

          {/* PDF Upload */}
          <PdfComponent
            colors={colors}
            globalStyles={globalStyles}
            theme={theme}
            label="Upload File"
          />

          {/* Signature Section */}
          <Card style={[globalStyles.globalCard, globalStyles.mt_10, { borderColor: step1Complete ? colors.success : colors.primary, borderWidth: 2 }]}>
            <Card.Content>
              <Text style={[globalStyles.subtitle_3, { color: colors.primary }]}>
                Signature Section
              </Text>

              <View style={globalStyles.twoInputContainer1}>
                <View style={globalStyles.container1}>
                  <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>Issuer Signature</Text>
                  <TextInput
                    style={globalStyles.height_45}
                    mode="outlined"
                    theme={theme}
                    value={issuerSignature}
                    onChangeText={setIssuerSignature}
                  />
                </View>

                <View style={globalStyles.container2}>
                  <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>Driver Signature</Text>
                  <TextInput
                    style={globalStyles.height_45}
                    mode="outlined"
                    theme={theme}
                    value={driverSignature}
                    onChangeText={setDriverSignature}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Remarks */}
          <View style={globalStyles.mt_10}>
            <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>Remarks / Notes</Text>
            <TextInput
              mode="outlined"
              theme={theme}
              placeholder="Enter remarks or notes"
              multiline
              numberOfLines={3}
              value={remarks}
              onChangeText={setRemarks}
            />
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View
          style={[globalStyles.twoInputContainer1, globalStyles.bottomButtonContainer]}
        >
          <Button
            mode="contained"
            theme={theme}
            style={globalStyles.container1}
            onPress={handleSubmit}
          >
            Save
          </Button>

          <Button
            mode="contained"
            theme={theme}
            style={globalStyles.container2}
            onPress={handleSubmit}
          >
            Send to Security
          </Button>
        </View>
      </View>
    </BackgroundGradient>
  );
};

export default LoadingAndDispatchScreen;