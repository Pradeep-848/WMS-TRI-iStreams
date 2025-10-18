import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Modal, Image, Dimensions, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button, Card, Checkbox } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { handlePickImageOptimized } from "../../Utils/nativeCameraFunction"; // DPR reference camera
import BackgroundGradient from "../../Components/BackgroundGradient";
import { displayLocalLineNotification } from "../../Utils/notificationUtils";
import RNShare from 'react-native-share';
import GenericListPopup from "../../Modal/GenericListPopup";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get('window');

const PickMaterialScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  // Bin Location  
  const [storeLocationList, setstoreLocationList] = useState([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [locationID, setLocationID] = useState(null);
  const [storeLocation, setStoreLocation] = useState('');
  const [rack, setRack] = useState('');
  const [bin, setBin] = useState('');

  // Picked Qty
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [tempQty, setTempQty] = useState("");

  const [capturedImage, setCapturedImage] = useState(null);

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    getStoreLocationData();
    setFilteredData([
      { materialName: "MS Rod 16mm", materialCode: "M12345", requestedQty: "20", binLocation: "A-12", checked: false },
      { materialName: "Cement Bag", materialCode: "C56789", requestedQty: "10", binLocation: "B-07", checked: false },
    ]);
  }, []);

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

  const handleStrLocSelect = (storeLocation) => {
    setLocationID(storeLocation.LOCATION_ID);
    setStoreLocation(storeLocation.STORE_LOCATION);
    setRack(storeLocation.RACK_NAME);
    setBin(storeLocation.BIN_NAME);

    setPopupVisible(false);
  };

  const renderRequestCard = ({ item, index }) => {
    return (
      <View style={[globalStyles.my_5]}>
        <Card style={{ backgroundColor: colors.card }}>
          <Card.Content>
            {/* Top Row — Item Name and Code */}
            <View style={globalStyles.twoInputContainer}>
              <View>
                <Text style={[globalStyles.subtitle_3, { color: colors.primary }]}>
                  {item.materialName || "MS Rod 16mm"}
                </Text>
              </View>

              <View>
                <TouchableOpacity onPress={() => setPopupVisible(true)}>
                  <View style={globalStyles.twoInputContainer}>
                    {bin ? (
                      <Text style={[globalStyles.subtitle_3, { color: colors.gray, textDecorationLine: 'underline' }]}>
                        {bin}
                      </Text>
                    ) : (
                      <>
                        <Icon name="map-marker" size={16} color={colors.gray} />
                        <Text style={[globalStyles.subtitle_3, { color: colors.gray, textDecorationLine: 'underline' }]}>
                          {" "}Select Bin Location
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={[globalStyles.mt_5, { height: 1, backgroundColor: colors.outline }]} />

            {/* Middle Row — Quantity Info */}
            <View style={[globalStyles.twoInputContainer, globalStyles.mt_5]}>
              <View>
                <Text style={globalStyles.subtitle_4}>
                  Requested Qty : {" "}
                  <Text style={{ color: colors.warning }}>
                    {item.requestedQty || "20"}
                  </Text>
                </Text>
              </View>
              <View>
                <Text
                  style={globalStyles.subtitle_4}
                  onPress={() => {
                    setCurrentIndex(index);
                    setTempQty(item.pickedQty || "");
                    setQtyModalVisible(true);
                  }}
                >
                  Picked Qty : {" "}<Text style={{ color: colors.primary }}>{item.pickedQty || "0"}</Text>
                </Text>
              </View>
            </View>

            {/* Bottom Row — Checkbox for confirmation */}
            <View style={globalStyles.twoInputContainer}>
              <View style={[globalStyles.checkBoxContainer]}>
                <Text style={globalStyles.subtitle_4}>
                  Available : {" "}
                </Text>
                <Text style={[globalStyles.subtitle_4, { color: colors.success }]}>
                  50
                </Text>
              </View>

              <View style={[globalStyles.checkBoxContainer]}>
                <Checkbox
                  theme={theme}
                  status={item.checked ? "checked" : "unchecked"}
                  onPress={() => {
                    const updatedData = [...filteredData];
                    updatedData[index].checked = !updatedData[index].checked;
                    setFilteredData(updatedData);
                  }}
                />
                <Text style={[globalStyles.subtitle_4, { color: colors.gray }]}>
                  Confirm Item Picked
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
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

  const handleConfirm = () => {
    const title = '✅ Picked Successfully !...';
    displayLocalLineNotification(title);
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="Pick Material" />

        <View style={[globalStyles.twoInputContainer, globalStyles.mb_5]}>
          <Text style={globalStyles.subtitle_2}>Picker - {" "}<Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>MIS-10234</Text></Text>
        </View>

        <View style={[globalStyles.mb_5, globalStyles.p_5, globalStyles.borderRadius_10, { backgroundColor: colors.card }]}>
          {/* Top Row — Item Name and Code */}
          <View style={globalStyles.twoInputContainer}>
            <View>
              <Text style={globalStyles.subtitle_3}>
                Material Name
              </Text>
            </View>

            <View>
              <Text style={globalStyles.subtitle_3}>
                Bin
              </Text>
            </View>
          </View>
        </View>

        <ScrollView>
          <FlatList
            data={filteredData}
            renderItem={renderRequestCard}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={[globalStyles.alignItemsCenter]}>
                <Icon name="inbox-outline" size={50} color={colors.disabled} />
                <Text style={[globalStyles.subtitle_2, { color: colors.disabled, marginTop: 16 }]}>
                  No Items found.
                </Text>
              </View>
            }
          />

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

        {/* Remarks / Notes */}
        <View style={globalStyles.mt_5}>
          <TextInput
            mode="outlined"
            theme={theme}
            label="Remarks / Notes"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Take Photo */}
        <View style={globalStyles.bottomButtonContainer}>
          <Button
            mode="outlined"
            theme={theme}
            icon={"camera"}
            onPress={handleCapturePress}
          >
            <Text style={globalStyles.subtitle_3}>Take Photo</Text>
          </Button>
        </View>

        <View style={globalStyles.bottomButtonContainer}>
          <Button
            mode="contained"
            theme={theme}
            textColor={colors.white}
            onPress={handleConfirm}
          >
            Confirm Pick
          </Button>
        </View>

        <Modal visible={qtyModalVisible} transparent animationType="fade">
          <View style={[globalStyles.flex_1, globalStyles.justalignCenter, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <TextInput
                mode="outlined"
                theme={theme}
                label="Enter Picked Qty"
                value={tempQty}
                keyboardType="numeric"
                onChangeText={(val) => setTempQty(val.replace(/[^0-9]/g, ''))}
              />

              <View style={[globalStyles.twoInputContainer, globalStyles.mt_10]}>
                <Button
                  mode="outlined"
                  theme={theme}
                  onPress={() => setQtyModalVisible(false)}
                >
                  Cancel
                </Button>

                <Button
                  mode="contained"
                  theme={theme}
                  textColor={colors.white}
                  onPress={() => {
                    const updated = [...filteredData];
                    updated[currentIndex].pickedQty = tempQty;
                    setFilteredData(updated);
                    setQtyModalVisible(false);
                  }}
                >
                  OK
                </Button>
              </View>
            </View>
          </View>
        </Modal>

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
      </View>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
});

export default PickMaterialScreen;