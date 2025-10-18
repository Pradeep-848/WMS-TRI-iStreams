import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { TextInput, Button, Card, Checkbox } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "../../Components/Header";
import BackgroundGradient from "../../Components/BackgroundGradient";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Timeline from "react-native-timeline-flatlist";
import { launchCamera } from "react-native-image-picker";

const SecurityInspection = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [verifyMIS, setVerifyMIS] = useState(false);
  const [checkAllSignatures, setCheckAllSignatures] = useState(false);
  const [uploadedLogPhoto, setUploadedLogPhoto] = useState(false);
  const [logPhotos, setLogPhotos] = useState([]);
  const [issuerSignature, setIssuerSignature] = useState("");
  const [driverSignature, setDriverSignature] = useState("");
  const [remarks, setRemarks] = useState("");
  const [viewPhotoModal, setViewPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Camera Function
  const handleLogCameraPress = async () => {
    try {
      const result = await launchCamera({
        mediaType: "photo",
        saveToPhotos: true,
      });

      if (result.assets && result.assets.length > 0) {
        const newPhotoUri = result.assets[0].uri;
        setLogPhotos((prev) => {
          const updatedPhotos = [...prev, newPhotoUri];
          setSelectedPhotoIndex(updatedPhotos.length - 1); // show last uploaded photo
          setViewPhotoModal(true);
          return updatedPhotos;
        });
        setUploadedLogPhoto(true);
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  // Timeline Data
  const timelineData = [
    {
      time: "",
      title: "Verify MIS Quantity",
      description: "Ensure MIS quantity matches records",
      circleColor: verifyMIS ? colors.success : colors.gray,
      lineColor: colors.gray,
      icon: "checkmark-circle-outline",
      status: verifyMIS ? "completed" : "pending",
    },
    {
      time: "",
      title: "Check All Signatures",
      description: "Ensure issuer & driver signatures are valid",
      circleColor: checkAllSignatures ? colors.success : colors.gray,
      lineColor: colors.gray,
      icon: "document-outline",
      status: checkAllSignatures ? "completed" : "pending",
    },
    {
      time: "",
      title: "Uploaded Log Photos",
      circleColor: uploadedLogPhoto ? colors.success : colors.warning,
      lineColor: colors.gray,
      icon: "camera-outline",
      status: uploadedLogPhoto ? "completed" : "in-progress",
    },
  ];

  const renderDetail = (rowData) => {
    let title = <Text style={[globalStyles.subtitle_3, { color: colors.text, marginBottom: 5 }]}>{rowData.title}</Text>;
    let desc = rowData.description ? (
      <Text style={[globalStyles.subtitle_4, { color: colors.gray }]}>{rowData.description}</Text>
    ) : null;
    const handleToggle = () => {
      if (rowData.title === "Verify MIS Quantity") setVerifyMIS(!verifyMIS);
      else if (rowData.title === "Check All Signatures")
        setCheckAllSignatures(!checkAllSignatures);
    };

    return (
      <View
        style={[
          globalStyles.flex_1,
          globalStyles.p_10,
          globalStyles.borderRadius_10,
          globalStyles.mb_10,
          { backgroundColor: colors.background },
        ]}
      >
        {title}
        {desc}

        <View
          style={[
            globalStyles.twoInputContainer,
            globalStyles.mt_5, globalStyles.justifySpaceBetween, globalStyles.alignItemsCenter
          ]}
        >
          <View style={globalStyles.checkBoxContainer}>
            <Text
              style={[
                globalStyles.subtitle_4,
                {
                  color:
                    rowData.status === "completed"
                      ? colors.success
                      : rowData.status === "in-progress"
                        ? colors.warning
                        : colors.gray,
                },
              ]}
            >
              {rowData.status === "completed"
                ? "Completed"
                : rowData.status === "in-progress"
                  ? "In Progress"
                  : "Pending"}
            </Text>
          </View>

          {rowData.title === "Uploaded Log Photos" && (
            <View style={globalStyles.twoInputContainer}>
              <Icon
                name="camera"
                size={20}
                color={colors.primary}
                onPress={handleLogCameraPress}
                style={globalStyles.mr_10}
              />

              <Icon
                name="eye"
                size={20}
                color={colors.gray}
                onPress={() => {
                  if (logPhotos.length > 0)
                    setSelectedPhotoIndex(logPhotos.length - 1);
                  setViewPhotoModal(true);
                }}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEvent = (rowData) => (
    <View
      style={[
        globalStyles.justifyContentCenter,
        globalStyles.alignItemsCenter,
        globalStyles.borderRadius_10,
        { width: 24, height: 24, backgroundColor: rowData.circleColor },
      ]}
    >
      <Ionicons name={rowData.icon} size={16} color={colors.white} />
    </View>
  );

  const handleSubmit = () => console.log("Form submitted");

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="Security Inspection" />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Verification Checklist */}
          <Card style={[globalStyles.globalCard, globalStyles.mt_5]}>
            <Card.Content>
              <Text
                style={[
                  globalStyles.subtitle_2,
                  globalStyles.txt_center,
                  { color: colors.primary },
                ]}
              >
                Verification Checklist
              </Text>
              <Timeline
                data={timelineData}
                circleSize={10}
                circleColor={colors.primary}
                lineColor={colors.outline}
                renderDetail={renderDetail}
                renderEvent={renderEvent}
                showTime={false}
                options={{ scrollEnabled: false, style: { padding: 12 } }}
              />
            </Card.Content>
          </Card>

          {/* Signature Section */}
          <Card
            style={[
              globalStyles.globalCard,
              globalStyles.mt_10,
              globalStyles.bordercardColor
            ]}
          >
            <Card.Content>
              <Text
                style={[globalStyles.subtitle_3, { color: colors.primary }]}
              >
                Signature Section
              </Text>
              <View style={globalStyles.twoInputContainer1}>
                <View style={globalStyles.container1}>
                  <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
                    Issuer Signature
                  </Text>
                  <TextInput
                    style={globalStyles.height_45}
                    mode="outlined"
                    theme={theme}
                    value={issuerSignature}
                    onChangeText={setIssuerSignature}
                  />
                </View>
                <View style={globalStyles.container2}>
                  <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
                    Driver Signature
                  </Text>
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
            <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
              Remarks / Notes
            </Text>
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
          style={[
            globalStyles.twoInputContainer1,
            globalStyles.bottomButtonContainer,
          ]}
        >
          <Button
            mode="outlined"
            theme={theme}
            style={[globalStyles.container1, globalStyles.bottomButtonContainer]}
          >
            Hold
          </Button>
          <Button
            mode="contained"
            theme={theme}
            style={[globalStyles.container1, globalStyles.bottomButtonContainer]}
            onPress={handleSubmit}
          >
            Gate Release
          </Button>
        </View>

        {/* Photo Modal */}
        <Modal
          visible={viewPhotoModal}
          transparent
          animationType="fade"
          onRequestClose={() => setViewPhotoModal(false)}
        >
          <View
            style={[
              globalStyles.flex_1,
              globalStyles.justalignCenter,
              { backgroundColor: "rgba(0,0,0,0.7)" },
            ]}
          >
            <View
              style={[
                globalStyles.borderRadius_10, globalStyles.p_10,
                { width: "90%", backgroundColor: colors.surface },
              ]}
            >
              {/* Header */}
              <View
                style={[
                  globalStyles.twoInputContainer,
                  globalStyles.mb_10, globalStyles.justifySpaceBetween,
                ]}
              >
                <Text style={[globalStyles.subtitle_1, { color: colors.primary }]}>
                  View Log Photos
                </Text>
                <Icon
                  name="close"
                  size={24}
                  color={colors.error}
                  onPress={() => setViewPhotoModal(false)}
                />
              </View>

              {/* Show Image */}
              {logPhotos[selectedPhotoIndex] ? (
                <Image
                  source={{ uri: logPhotos[selectedPhotoIndex] }}
                  style={[globalStyles.borderRadius_10, globalStyles.mb_10, {
                    width: "100%",
                    height: 350,
                  }]}
                  resizeMode="contain"
                />
              ) : (
                <Text
                  style={[
                    globalStyles.subtitle_4,
                    { color: colors.gray, },
                  ]}
                >
                  No image selected
                </Text>
              )}

              {/* OK Button */}
              <View
                style={[
                  globalStyles.twoInputContainer, globalStyles.justifyContentCenter
                ]}
              >
                <Button
                  mode="contained"
                  onPress={() => setViewPhotoModal(false)}
                  style={[globalStyles.container1]}
                  theme={{ colors: { primary: colors.primary } }}
                >
                  OK
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </BackgroundGradient>
  );
};

export default SecurityInspection;