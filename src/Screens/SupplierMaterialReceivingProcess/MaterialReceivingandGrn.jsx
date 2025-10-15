import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Modal,
  Image,
  Linking
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Context/ThemeContext";
import Header from "../../Components/Header";
import BackgroundGradient from "../../Components/BackgroundGradient";
import { GlobalStyles } from "../../Styles/styles";
import { TextInput, Button, Card, IconButton, Checkbox } from "react-native-paper";
import DocumentPicker from "@react-native-documents/picker"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera } from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";

const GRNandActiveReceiptScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const [formData, setFormData] = useState({
    activeReceipt: {
      scannedMaterial: "",
      receivedQty: "",
      UOM: "",
      brand: "",
      size: "",
      capturedImage: null,
      verified: false,
      verification: "",
      pdf: null,
      hasData: false,
    },
    grn: {
      securitySign: "",
      receiverSign: "",
      lpoExpectedQty: "",
      receivedQty: "",
      verified: false,
      pdf: null,
      hasData: false,
    },
  });

  const [tempFormData, setTempFormData] = useState({});

  const openModal = (cardType) => {
    setTempFormData({ ...formData[cardType] });
    setActiveCard(cardType);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setActiveCard(null);
    setTempFormData({});
  };

  const updateTempFormData = (field, value) => {
    setTempFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveFormData = () => {
    if (activeCard) {
      setFormData((prev) => ({
        ...prev,
        [activeCard]: { ...tempFormData, hasData: true },
      }));
    }
    closeModal();
  };

  const handleNext = () => {
    navigation.navigate('PutawayProcessScreen');
  };

  const handlePickPdf = async () => {
    try {
      const res = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.pdf] });
      updateTempFormData("pdf", res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) console.warn(err);
    }
  };

  const handleViewPdf = (pdf) => {
    if (pdf?.uri) Linking.openURL(pdf.uri).catch(() => alert("Cannot open PDF"));
    else alert("No PDF uploaded");
  };

  const handleOpenCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 0.7, saveToPhotos: true }, (response) => {
      if (response.didCancel) console.log('User cancelled camera');
      else if (response.errorCode) alert('Camera error: ' + response.errorMessage);
      else updateTempFormData('capturedImage', response.assets[0].uri);
    });
  };

  const renderModalContent = () => {
    if (!activeCard) return null;

    if (activeCard === "activeReceipt") {
      return (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <TextInput
            label="Scanned Material / Item"
            mode="outlined"
            value={tempFormData.scannedMaterial}
            onChangeText={(t) => updateTempFormData("scannedMaterial", t)}
            style={globalStyles.mb_10}
          />

          <View style={globalStyles.twoInputContainer1}>
            <TextInput
              label="Brand"
              mode="outlined"
              value={tempFormData.brand}
              onChangeText={(t) => updateTempFormData("brand", t)}
              style={globalStyles.flex_1}
            />
            <TextInput
              label="Size"
              mode="outlined"
              value={tempFormData.size}
              onChangeText={(t) => updateTempFormData("size", t)}
              style={[globalStyles.flex_1, { marginHorizontal: 5 }]}
            />
            <TextInput
              label="UOM"
              mode="outlined"
              value={tempFormData.UOM}
              onChangeText={(t) => updateTempFormData("UOM", t)}
              style={globalStyles.flex_1}
            />
          </View>

          <TextInput
            label="Received Qty"
            mode="outlined"
            keyboardType="numeric"
            value={tempFormData.receivedQty}
            onChangeText={(t) => updateTempFormData("receivedQty", t)}
            style={[globalStyles.mb_10, globalStyles.mt_10]}
          />

          <View style={styles.checkBoxSection}>
            <Checkbox
              status={tempFormData.verified ? "checked" : "unchecked"}
              onPress={() => updateTempFormData("verified", !tempFormData.verified)}
              theme={theme}
              mode="outlined"
              color={tempFormData.verified ? '#4CAF50' : '#FF9800'}
            />
            <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>
              {tempFormData.verified ? "Verified" : "Unverified"}
            </Text>
          </View>

          <TextInput
            label="Material Verification"
            mode="outlined"
            value={tempFormData.verification || ""}
            onChangeText={(t) => updateTempFormData("verification", t)}
            style={[globalStyles.mb_10, { marginTop: 10 }]}
            right={<TextInput.Icon icon="camera" onPress={handleOpenCamera} />}
          />

          {tempFormData.capturedImage && (
            <Image
              source={{ uri: tempFormData.capturedImage }}
              style={{ height: 160, width: "100%", borderRadius: 8, marginBottom: 10 }}
            />
          )}

          <Button mode="outlined" onPress={handlePickPdf} style={globalStyles.mb_10}>
            <View style={globalStyles.checkBoxContainer}>
              <Icon name="file-link" size={20} color={colors.text} />
              <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>
                Upload PDF
              </Text>
            </View>
          </Button>

          {tempFormData.pdf && (
            <Button mode="contained" onPress={() => handleViewPdf(tempFormData.pdf)} style={{ marginBottom: 10 }}>
              <View style={globalStyles.checkBoxContainer}>
                <Icon name="file-link" size={20} color={colors.text} />
                <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>
                  View PDF
                </Text>
              </View>
            </Button>
          )}
        </ScrollView>
      );
    }

    if (activeCard === "grn") {
      return (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <TextInput
            label="Security Sign"
            mode="outlined"
            value={tempFormData.securitySign}
            onChangeText={(t) => updateTempFormData("securitySign", t)}
            style={globalStyles.mb_10}
          />
          <TextInput
            label="Receiver Sign"
            mode="outlined"
            value={tempFormData.receiverSign}
            onChangeText={(t) => updateTempFormData("receiverSign", t)}
            style={globalStyles.mb_10}
          />
          <View style={globalStyles.twoInputContainer1}>
            <TextInput
              label="LPO Expected Qty"
              mode="outlined"
              keyboardType="numeric"
              value={tempFormData.lpoExpectedQty}
              onChangeText={(t) => updateTempFormData("lpoExpectedQty", t)}
              style={globalStyles.flex_1}
            />
            <TextInput
              label="Received Qty"
              mode="outlined"
              keyboardType="numeric"
              value={tempFormData.receivedQty}
              onChangeText={(t) => updateTempFormData("receivedQty", t)}
              style={globalStyles.flex_1}
            />
          </View>

          <View style={styles.checkBoxSection}>
            <Checkbox
              status={tempFormData.verified ? "checked" : "unchecked"}
              onPress={() => updateTempFormData("verified", !tempFormData.verified)}
              theme={theme}
              mode="outlined"
              color={tempFormData.verified ? '#4CAF50' : '#FF9800'}
            />
            <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>
              {tempFormData.verified ? "Verified" : "Unverified"}
            </Text>
          </View>

          <Button mode="outlined" onPress={handlePickPdf} style={globalStyles.mb_10}>
            <View style={globalStyles.checkBoxContainer}>
              <Icon name="file-link" size={20} color={colors.text} />
              <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>
                Upload GRN PDF
              </Text>
            </View>
          </Button>

          {tempFormData.pdf && (
            <Button mode="contained" onPress={() => handleViewPdf(tempFormData.pdf)} style={globalStyles.mb_10}>
              <View style={globalStyles.checkBoxContainer}>
                <Icon name="file-link" size={20} color={colors.text} />
                <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>
                  View GRN PDF
                </Text>
              </View>
            </Button>
          )}
        </ScrollView>
      );
    }
  };

  const displayCardDataStyled = (cardType) => {
    const data = formData[cardType];

    if (!data.hasData) {
      return (
        <View style={[globalStyles.alignItemsCenter, globalStyles.justalignCenter, globalStyles.p_10]}>
          <Icon name="information-outline" size={24} color={colors.warning} />
          <Text style={[globalStyles.subtitle_3, { color: colors.gray }, globalStyles.mt_5]}>
            No data entered yet. Click the edit icon to add details.
          </Text>
        </View>
      );
    }

    return (
      <View style={globalStyles.p_5}>
        {cardType === "activeReceipt" && (
          <>
            <View style={[globalStyles.twoInputContainer1, globalStyles.mb_5]}>
              <Text style={globalStyles.subtitle_2}>Scanned Material / Item - </Text>
              <Text style={[globalStyles.subtitle_2, globalStyles.mt_2, globalStyles.flex_1, { color: colors.primary }]}>{data.scannedMaterial || "Not set"}</Text>
            </View>

            <View style={[globalStyles.twoInputContainer1, globalStyles.mb_5]}>
              <View>
                <Text style={globalStyles.subtitle_2}>Brand</Text>
                <Text style={[globalStyles.subtitle_3, globalStyles.mt_2, { color: colors.warning }]}>{data.brand || "Not set"}</Text>
              </View>
              <View style={[{ marginHorizontal: 5 }]}>
                <Text style={globalStyles.subtitle_2}>Size</Text>
                <Text style={[globalStyles.subtitle_3, globalStyles.mt_2, { color: colors.warning }]}>{data.size || "Not set"}</Text>
              </View>
              <View>
                <Text style={globalStyles.subtitle_2}>UOM</Text>
                <Text style={[globalStyles.subtitle_3, globalStyles.mt_2, { color: colors.warning }]}>{data.UOM || "Not set"}</Text>
              </View>
            </View>

            <View style={[globalStyles.mb_5, globalStyles.checkBoxContainer]}>
              <Text style={globalStyles.subtitle_2}>Received Qty</Text>
              <Text style={[globalStyles.subtitle_2, globalStyles.ml_5, { color: colors.success }]}>{data.receivedQty || "Not set"}</Text>
            </View>

            <View style={[globalStyles.twoInputContainer, globalStyles.justifyEnd]}>
              <Text style={[globalStyles.subtitle_3, { color: data.verified ? colors.success : colors.error }]}>
                {data.verified ? "Verified ✓" : "Unverified"}
              </Text>
            </View>

            {data.capturedImage && (
              <Image source={{ uri: data.capturedImage }} style={{ height: 140, width: "100%", borderRadius: 8, marginBottom: 5 }} />
            )}

            {data.pdf && (
              <Button mode="outlined" icon="file-pdf" onPress={() => handleViewPdf(data.pdf)} style={{ marginBottom: 5 }}>
                View PDF
              </Button>
            )}
          </>
        )}

        {cardType === "grn" && (
          <>
            <View style={[globalStyles.twoInputContainer1, globalStyles.mb_5]}>
              <View>
                <Text style={globalStyles.subtitle_2}>Security Sign</Text>
                <Text style={[globalStyles.subtitle_3, globalStyles.mt_2]}>{data.securitySign || "Not set"}</Text>
              </View>
              <View>
                <Text style={globalStyles.subtitle_2}>Receiver Sign</Text>
                <Text style={[globalStyles.subtitle_3, globalStyles.mt_2]}>{data.receiverSign || "Not set"}</Text>
              </View>
            </View>

            <View style={[globalStyles.twoInputContainer1, globalStyles.mb_5]}>
              <View>
                <Text style={globalStyles.subtitle_2}>LPO Expected Qty</Text>
                <Text style={[globalStyles.subtitle_3, globalStyles.mt_2]}>{data.lpoExpectedQty || "Not set"}</Text>
              </View>

              <View>
                <Text style={globalStyles.subtitle_2}>Received Qty</Text>
                <Text style={[globalStyles.subtitle_3, globalStyles.mt_2]}>{data.receivedQty || "Not set"}</Text>
              </View>
            </View>

            <View style={[globalStyles.twoInputContainer, globalStyles.justifyEnd, globalStyles.mb_5]}>
              <Text style={[globalStyles.subtitle_3, { color: data.verified ? colors.success : colors.error }]}>
                {data.verified ? "Verified ✓" : "Unverified"}
              </Text>
            </View>

            {data.pdf && (
              <Button mode="outlined" icon="file-pdf" onPress={() => handleViewPdf(data.pdf)} style={{ marginBottom: 5 }}>
                View PDF
              </Button>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="Active Receipt & GRN Booking" />

        <Card style={[globalStyles.dataCard, { padding: 10, marginBottom: 10 }]}>
          <Card.Title
            title="Active Receipt"
            titleStyle={globalStyles.subtitle_1}
            left={(props) => <Icon name="clipboard-text" size={35} color={colors.primary} />}
            right={(props) => <IconButton {...props} icon="pencil" iconColor={colors.gray} onPress={() => openModal("activeReceipt")} />}
          />
          <Card.Content>{displayCardDataStyled("activeReceipt")}</Card.Content>
        </Card>

        <Card style={[globalStyles.dataCard, { padding: 10 }]}>
          <Card.Title
            title="GRN Processing"
            titleStyle={globalStyles.subtitle_1}
            left={(props) => <Icon name="timeline-clock-outline" size={35} color={colors.primary} />}
            right={(props) => <IconButton {...props} icon="pencil" iconColor={colors.gray} onPress={() => openModal("grn")} />}
          />
          <Card.Content>{displayCardDataStyled("grn")}</Card.Content>
        </Card>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={[globalStyles.flex_1, globalStyles.justalignCenter, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={globalStyles.twoInputContainer1}>
                <Text style={globalStyles.subtitle_1}>
                  {activeCard === "activeReceipt" ? "Active Receipt" : "GRN"} Details
                </Text>
                <IconButton icon="close" size={24} iconColor={colors.error} onPress={closeModal} />
              </View>
              {renderModalContent()}
              <Button
                mode="contained"
                style={globalStyles.bottomButtonContainer}
                onPress={saveFormData}
                theme={theme}
                icon="content-save"
              >
                Proceed
              </Button>
            </View>
          </View>
        </Modal>
      </View>

      <View style={[globalStyles.bottomButtonContainer, globalStyles.p_20]}>
        <Button
          mode="contained"
          onPress={handleNext}
          theme={theme}
          icon="arrow-right"
        >
          Next
        </Button>
      </View>
    </BackgroundGradient>
  );
};

export default GRNandActiveReceiptScreen;

const styles = StyleSheet.create({
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  checkBoxSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
});
