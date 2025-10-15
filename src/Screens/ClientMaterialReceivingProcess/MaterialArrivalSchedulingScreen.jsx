import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button, Chip } from "react-native-paper";
import BackgroundGradient from "../../Components/BackgroundGradient";
import { useNavigation } from "@react-navigation/native";

const MaterialArrivalSchedulingScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [mrReqId, setMrReqId] = useState("");
    const [originOfMaterial, setOriginOfMaterial] = useState("");
    const [expectedArrivalDateTime, setExpectedArrivalDateTime] = useState("");
    const [expectedTotalQty, setExpectedTotalQty] = useState("");
    const [logisticsArranged, setLogisticsArranged] = useState("");
    const [needVehicle, setNeedVehicle] = useState(false);
    const [notes, setNotes] = useState("");

    const handleSaveAndNavigate = () => {
        navigation.navigate('VehicleInspectionScreen');
    };

    return (
        <BackgroundGradient>

            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Material Arrival Scheduling" />
                <ScrollView
                    contentContainerStyle={globalStyles.p_20}
                >
                    {/* MR.Req ID & Origin of Material */}
                    <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
                        <View style={globalStyles.container1}>
                            <TextInput
                                style={globalStyles.height_45}
                                right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
                                mode="outlined"
                                theme={theme}
                                placeholder="MR.Req ID"
                                value={mrReqId}
                                onChangeText={setMrReqId}
                            />
                        </View>

                        <View style={globalStyles.container2}>
                            <TextInput
                                style={globalStyles.height_45}
                                right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
                                mode="outlined"
                                theme={theme}
                                placeholder="Origin of Material"
                                value={originOfMaterial}
                                onChangeText={setOriginOfMaterial}
                            />
                        </View>
                    </View>

                    {/* Expected Arrival Date & Qty */}
                    <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
                        <View style={globalStyles.container1}>
                            <Text
                                style={[globalStyles.subtitle_3]}
                            >
                                Expected Arrival Date & Time
                            </Text>
                            <TextInput
                                style={globalStyles.height_45}
                                mode="outlined"
                                theme={theme}
                                value={expectedArrivalDateTime}
                                onChangeText={setExpectedArrivalDateTime}
                            />
                        </View>

                        <View style={globalStyles.container2}>
                            <Text
                                style={[globalStyles.subtitle_3]}
                            >
                                Expected Total Qty
                            </Text>
                            <TextInput
                                style={globalStyles.height_45}
                                mode="outlined"
                                theme={theme}
                                value={expectedTotalQty}
                                onChangeText={setExpectedTotalQty}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Logistics Arranged */}
                    <View style={globalStyles.mb_10}>
                        <Text
                            style={[globalStyles.subtitle_3]}
                        >
                            Logistics Arrangement
                        </Text>

                        <View style={[styles.chipContainer, globalStyles.twoInputContainer, globalStyles.justifyStart]}>
                            <Chip
                                style={[
                                    styles.chip, { backgroundColor: colors.background, borderColor: colors.primary },
                                ]}
                                textStyle={[
                                    globalStyles.subtitle_3
                                ]}
                                theme={theme}
                            >
                                Self-Arranged
                            </Chip>

                            <Chip
                                style={[
                                    styles.chip, { backgroundColor: colors.background, borderColor: colors.primary },
                                ]}
                                textStyle={[
                                    globalStyles.subtitle_3
                                ]}
                                theme={theme}
                            >
                                Supplier Arranged
                            </Chip>
                        </View>
                    </View>

                    {/* Need Vehicle Checkbox */}
                    <View style={[globalStyles.mt_10, globalStyles.mb_10, globalStyles.twoInputContainer, globalStyles.justifyEnd]}>
                        <TouchableOpacity
                            style={globalStyles.checkBoxContainer}
                            onPress={() => setNeedVehicle(!needVehicle)}
                        >
                            <Ionicons
                                name={needVehicle ? "checkbox" : "square-outline"}
                                size={22}
                                color={colors.primary}
                                style={{ marginRight: 5 }}
                            />
                            <Text style={[[globalStyles.subtitle_3, { color: colors.warning }]]}>
                                Need Vehicle (Forklift / Crane) ?
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Notes / Instructions */}
                    <View style={globalStyles.mt_5}>
                        <Text
                            style={[globalStyles.subtitle_3]}
                        >
                            Notes / Instructions
                        </Text>
                        <TextInput
                            mode="outlined"
                            theme={theme}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </ScrollView>

                {/* Save Button */}
                <Button
                    mode="contained"
                    theme={theme}
                    icon={() => <Ionicons name="receipt" size={20} color="#fff" />}
                    style={[globalStyles.mt_5, globalStyles.bottomButtonContainer]}
                    onPress={handleSaveAndNavigate}
                >
                    <Text style={[globalStyles.subtitle_3]}>Save & Initiate Receipt Process</Text>
                </Button>
            </View>
        </BackgroundGradient>
    );
};

export default MaterialArrivalSchedulingScreen;

const styles = StyleSheet.create({
    chipContainer: {
        paddingVertical: 6,
    },
    chip: {
        marginHorizontal: 4,
    },
});