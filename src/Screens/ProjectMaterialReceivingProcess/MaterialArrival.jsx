import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button, Card } from "react-native-paper";
import BackgroundGradient from "../../Components/BackgroundGradient";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';

const MaterialArrivalScheduling = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [supplier, setSupplier] = useState("");
  const [expectedDateTime, setExpectedDateTime] = useState("");
  const [expectedTotalQty, setExpectedTotalQty] = useState("");
  const [logisticsType, setLogisticsType] = useState("Self-Arranged");
  const [vehicleForklift, setVehicleForklift] = useState(false);
  const [vehicleCrane, setVehicleCrane] = useState(false);
  const [vehiclePallet, setVehiclePallet] = useState(false);
  const [instructions, setInstructions] = useState("");

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (event, date) => {
    // Handle both Android and iOS differently
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && date) {
      setSelectedDate(date);
      setExpectedDateTime(date.toLocaleString());
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const showDateTimePicker = () => {
    setShowDatePicker(true);
  };

  const handleSave = () => {
    navigation.navigate('GatePassCheckIn');
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="Material Arrival Scheduling" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20 }}
        >
          <View style={globalStyles.twoInputContainer1}>
            {/* MR */}
            <View style={globalStyles.container1}>
              <TextInput
                style={[globalStyles.height_45, globalStyles.mt_5]}
                right={<TextInput.Icon icon="chevron-down" />}
                mode="outlined"
                theme={theme}
                placeholder="MR/PO NO"
                value={supplier}
                onChangeText={setSupplier}
              />
            </View>

            {/* Supplier */}
            <View style={globalStyles.container2}>
              <TextInput
                style={[globalStyles.height_45, globalStyles.mt_5]}
                right={<TextInput.Icon icon="chevron-down" />}
                mode="outlined"
                theme={theme}
                placeholder="Supplier / Source"
                value={supplier}
                onChangeText={setSupplier}
              />
            </View>
          </View>

          {/* Expected Date & Qty */}
          <View style={[globalStyles.twoInputContainer1, globalStyles.mt_10]}>
            <View style={globalStyles.container1}>
              <Text style={[globalStyles.subtitle_4]}>
                Expected Date
              </Text>
              <TouchableOpacity onPress={showDateTimePicker}>
                <TextInput
                  style={[globalStyles.height_45, globalStyles.mt_5]}
                  mode="outlined"
                  theme={theme}
                  value={expectedDateTime}
                  onChangeText={setExpectedDateTime}
                  placeholder="Select Date"
                  editable={false}
                  pointerEvents="none"
                  right={<TextInput.Icon icon="calendar" />}
                />
              </TouchableOpacity>
            </View>

            <View style={globalStyles.container2}>
              <Text style={[globalStyles.subtitle_4]}>
                Expected Total Qty
              </Text>
              <TextInput
                style={[globalStyles.height_45, globalStyles.mt_5]}
                mode="outlined"
                theme={theme}
                value={expectedTotalQty}
                onChangeText={setExpectedTotalQty}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          <Card style={[globalStyles.globalCard, globalStyles.p_20, globalStyles.mt_10]}>
            {/* Logistics Type */}
            <View style={globalStyles.mb_10}>
              <Text style={[globalStyles.subtitle_3]}>
                Logistics Arrangement
              </Text>
              <View style={[globalStyles.twoInputContainer1, globalStyles.mt_5, globalStyles.justifyStart]}>
                <View>
                  <TouchableOpacity
                    onPress={() => setLogisticsType("Self-Arranged")}
                    style={globalStyles.checkBoxContainer}
                  >
                    <Ionicons
                      name={
                        logisticsType === "Self-Arranged"
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[globalStyles.subtitle_3, globalStyles.content, globalStyles.ml_5]}>
                      Self-Arranged
                    </Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <TouchableOpacity
                    onPress={() => setLogisticsType("Supplier Arranged")}
                    style={globalStyles.checkBoxContainer}
                  >
                    <Ionicons
                      name={
                        logisticsType === "Supplier Arranged"
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[globalStyles.subtitle_4, globalStyles.content, globalStyles.ml_5]}>
                      Supplier Arranged
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Vehicle Type Request */}
            <View style={globalStyles.mt_10}>
              <Text style={[globalStyles.subtitle_3]}>
                Vehicle Type Request
              </Text>

              <View style={[globalStyles.twoInputContainer1, globalStyles.mt_5, globalStyles.justifyStart]}>
                <View>
                  <TouchableOpacity
                    onPress={() => setVehicleForklift(!vehicleForklift)}
                    style={globalStyles.checkBoxContainer}
                  >
                    <Ionicons
                      name={vehicleForklift ? "checkbox" : "square-outline"}
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[globalStyles.subtitle_3, globalStyles.content, globalStyles.ml_5]}>
                      Forklift
                    </Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <TouchableOpacity
                    onPress={() => setVehicleCrane(!vehicleCrane)}
                    style={globalStyles.checkBoxContainer}
                  >
                    <Ionicons
                      name={vehicleCrane ? "checkbox" : "square-outline"}
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[globalStyles.subtitle_4, globalStyles.content, globalStyles.ml_5]}>
                      Crane
                    </Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <TouchableOpacity
                    onPress={() => setVehiclePallet(!vehiclePallet)}
                    style={globalStyles.checkBoxContainer}
                  >
                    <Ionicons
                      name={vehiclePallet ? "checkbox" : "square-outline"}
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[globalStyles.subtitle_4, globalStyles.content, globalStyles.ml_5]}>
                      Pallet Jack
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Card>

          {/* Special Instructions */}
          <View style={globalStyles.mt_5}>
            <Text style={[globalStyles.subtitle_3]}>
              Special Instructions
            </Text>
            <TextInput
              mode="outlined"
              theme={theme}
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
              placeholder="Notes on handling, safety, or delivery specifics."
              style={globalStyles.mt_5}
            />
          </View>
        </ScrollView>

        {/* Date Time Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Save Button */}
        <Button
          mode="contained"
          theme={theme}
          style={[globalStyles.mt_5, globalStyles.bottomButtonContainer]}
          onPress={handleSave}
        >
          <Text style={[globalStyles.subtitle_4, { color: "#fff" }]}>
            SAVE & INITIATE IN PASS CREATION
          </Text>
        </Button>
      </View>
    </BackgroundGradient>
  );
};

export default MaterialArrivalScheduling;
