import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, Alert, Linking } from "react-native";
import { TextInput, Button } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { GlobalStyles } from "../Styles/styles";
import { useTheme } from "../Context/ThemeContext";

const MaterialMsgTimeLinePopup = ({ visible, onClose, lastStage }) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [messageTo, setMessageTo] = useState("");
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState('message'); // 'call' or 'message'

    const handleSend = () => {
        console.log("Send pressed:", { lastStage, messageTo, message });
        onClose();
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={[globalStyles.flex_1, globalStyles.justalignCenter, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={{
                    width: '90%',
                    backgroundColor: colors.card,
                    borderRadius: 8,
                    padding: 20,
                }}>
                    {/* Modal Header */}
                    <View style={[globalStyles.twoInputContainer, globalStyles.mb_20]}>
                        <Text style={[globalStyles.subtitle_1, { color: colors.primary }]}>
                            Follow up {lastStage}
                        </Text>

                        <MaterialCommunityIcons name="close" size={24} color={colors.error} onPress={onClose} />
                    </View>

                    <View style={globalStyles.mb_10}>
                        <Text style={[globalStyles.subtitle_3, globalStyles.mb_5, { color: colors.gray }]}>
                            <MaterialCommunityIcons name="account" size={20} color={colors.primary} onPress={onClose} />
                            Contact Person :
                        </Text>

                        {/* Message To */}
                        <TextInput
                            value={messageTo}
                            onChangeText={setMessageTo}
                            mode="outlined"
                            theme={theme}
                            style={globalStyles.input}
                        />
                    </View>

                    {/* Message Box */}
                    {/* Tabs: Call / Message */}
                    <View style={[globalStyles.twoInputContainer, globalStyles.justifyStart, globalStyles.mb_10]}>
                        <TouchableOpacity  onPress={() => setActiveTab('call')} style={[{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }, globalStyles.chip]}>
                            <MaterialCommunityIcons name="card-account-phone" size={20} color={activeTab === 'call' ? colors.primary : colors.gray} />
                            <Text style={[globalStyles.subtitle_3, { marginLeft: 6, color: activeTab === 'call' ? colors.primary : colors.gray }]}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setActiveTab('message')} style={[{ flexDirection: 'row', alignItems: 'center' }, globalStyles.chip]}>
                            <MaterialCommunityIcons name="message-text" size={20} color={activeTab === 'message' ? colors.primary : colors.gray} />
                            <Text style={[globalStyles.subtitle_3, { marginLeft: 6, color: activeTab === 'message' ? colors.primary : colors.gray }]}>Message</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Active Panel */}
                    {activeTab === 'call' ? (
                        <View style={[globalStyles.mb_10]}>
                            <TextInput
                                label="Phone"
                                value={messageTo}
                                theme={theme}
                                onChangeText={setMessageTo}
                                mode="outlined"
                                style={globalStyles.input}
                                disabled
                            />
                        </View>
                    ) : (
                        <View style={[globalStyles.mb_10]}>
                            <TextInput
                                label="Message"
                                value={message}
                                onChangeText={setMessage}
                                theme={theme}
                                mode="outlined"
                                numberOfLines={4}
                                multiline={true}
                            />
                        </View>
                    )}

                    {/* Send Button */}
                    <View style={globalStyles.camButtonContainer}>
                        <Button
                            mode="contained"
                            onPress={() => {
                                if (activeTab === 'message') {
                                    handleSend();
                                }
                            }}
                            icon={activeTab === 'message' ? 'send' : 'phone'}
                            contentStyle={{ flexDirection: "row-reverse" }}
                            style={{ backgroundColor: colors.primary }}
                        >
                            {activeTab === 'message' ? 'Send' : 'Call'}
                        </Button>
                    </View>
                </View>
            </View>
        </Modal >
    );
};

export default MaterialMsgTimeLinePopup;