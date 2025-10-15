import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button } from "react-native-paper";

const ActiveReceiptScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [receivedQty, setReceivedQty] = useState("");
  const [qty, setQty] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [materialCondition, setMaterialCondition] = useState("good");
  const [verification, setVerification] = useState("");

  return (
    <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
      <Header title="Active Receipt" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

        {/* LPO Header */}
        <Text style={[globalStyles.subtitle_2, globalStyles.container1, { color: "black" }]}>LPO-12345</Text>

        {/* Barcode Buttons */}
        <View style={[globalStyles.twoInputContainer1]}>

          <Button
            style={globalStyles.height_45}
            mode="contained"
            theme={theme}
            icon={() => <Ionicons name="scan" size={20} color="#fff" />}
          >
            Do/Invoice
          </Button>

          <Button
            style={globalStyles.height_45}
            mode="contained"
            theme={theme}
            icon={() => <Ionicons name="scan" size={20} color="#fff" />}
          >
            Item BarCode
          </Button>
        </View>

        {/* Items Section */}
        <Text style={[globalStyles.subtitle_3, globalStyles.container2, { color: "black" }]}>Items</Text>

        {/* Received Qty and Qty */}
        <View style={[globalStyles.twoInputContainer1, globalStyles.mt_5]}>
          <View style={globalStyles.container1}>
            <Text style={[globalStyles.subtitle_4, globalStyles.mb_5, { color: "black" }]}>Received Qty</Text>
            <TextInput
              style={globalStyles.height_45}
              mode="outlined"
              theme={theme}
              value={receivedQty}
              onChangeText={setReceivedQty}

            />
          </View>
          <View style={globalStyles.container2}>
            <Text style={[globalStyles.subtitle_4, globalStyles.mb_5, { color: "black" }]}>Qty</Text>
            <TextInput
              style={globalStyles.height_45}
              mode="outlined"
              theme={theme}
              value={qty}
              onChangeText={setQty}
              right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
            />
          </View>
        </View>
        {/* Brand */}

        <View style={[globalStyles.twoInputContainer1, globalStyles.mt_5]}>
          <View style={globalStyles.container1}>
            <Text style={[globalStyles.subtitle_4, globalStyles.mb_5, { color: "black" }]}>Brand</Text>
            <TextInput
              style={globalStyles.height_45}
              mode="outlined"
              theme={theme}
              value={brand}
              onChangeText={setBrand}
              right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
            />
          </View>
          <View style={globalStyles.container2}>
            <Text style={[globalStyles.subtitle_4, globalStyles.mb_5, { color: "black" }]}>Size</Text>
            <TextInput
              style={globalStyles.height_45}
              mode="outlined"
              theme={theme}
              value={size}
              onChangeText={setSize}
              right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
            />
          </View>
        </View>

        {/* Material Condition */}
        <View style={[globalStyles.mt_10]}>
          <Text style={[globalStyles.subtitle_4, globalStyles.container1, { color: "black" }]}>Material Condition</Text>
          <View style={globalStyles.twoInputContainer}>
            {["good", "damaged", "rejected"].map((condition) => (
              <TouchableOpacity
                key={condition}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.White,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginRight: 8,
                  backgroundColor: materialCondition === condition ? colors.primary : "#fff"
                }}
                onPress={() => setMaterialCondition(condition)}
              >
                <Ionicons
                  name={materialCondition === condition ? "radio-button-on" : "radio-button-off"}
                  size={18}
                  color={materialCondition === condition ? "#fff" : colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={{ color: materialCondition === condition ? "#fff" : colors.primary, fontSize: 14 }}>
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Verification */}
        <View style={globalStyles.mt_10}>
          <Text style={[globalStyles.subtitle_4, globalStyles.container1, { color: "black" }]}>Material Condition Verification</Text>
          <TextInput
            mode="outlined"
            theme={theme}
            value={verification}
            onChangeText={setVerification}
            style={globalStyles.height_45}
            right={<TextInput.Icon icon="camera" />}
          />
        </View>

        {/* Action Buttons */}
        <View style={[globalStyles.twoInputContainer1, globalStyles.mt_10]}>
          <Button mode="contained" theme={theme}
            style={[globalStyles.mt_10, globalStyles.bottomButtonContainer]}
          >
            Confirm Item
          </Button>
          <Button mode="contained" theme={theme}
            style={[globalStyles.mt_10, globalStyles.bottomButtonContainer]}
          >
            Receiver Sign
          </Button>
        </View>

      </ScrollView>

      {/* Submit Button */}
      <Button
        mode="contained"
        theme={theme}
        style={[globalStyles.mt_10, globalStyles.bottomButtonContainer]}
      >
        Submit
      </Button>
    </View>
  );
};

export default ActiveReceiptScreen;
