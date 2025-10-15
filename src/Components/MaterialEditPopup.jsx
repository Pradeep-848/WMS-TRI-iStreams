import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import PriorityDropdown from '../Components/PriorityDropdown';
import { formatDate } from '../Utils/dataTimeUtils';
import GenericListPopup from '../Modal/GenericListPopup';

const MaterialEditPopup = ({
    visible,
    onClose,
    currentMaterial,
    setCurrentMaterial,
    isBoqPopupVisible,
    setBoqPopupVisible,
    selectedBoq,
    boqList,
    reqDate,
    priority,
    remarks,
    theme,
    globalStyles,
    colors,
    saveMaterialEdit
}) => {
    const [priorityModalVisible, setProiorityModalVisible] = useState(false);
    const openPriorityDropdown = () => setProiorityModalVisible(true);
    const closePriorityDropdown = () => setProiorityModalVisible(false);

    const [showReqDatePicker, setShowReqDatePicker] = useState(false);
    const [reqDateObj, setReqDateObj] = useState(new Date());
    const onReqDateChange = (event, selectedDate) => {
        setShowReqDatePicker(false);
        if (selectedDate) {
            setReqDateObj(selectedDate);
            setCurrentMaterial(prev => ({ ...prev, RequiredDate: formatDate(selectedDate) }));
        }
    };

    const handlePrioritySelect = (value) => {
        setCurrentMaterial(prev => ({ ...prev, Priority: value }));
        closePriorityDropdown();
    };

    const handleProjectBOQSelect = (boq) => {
        setCurrentMaterial(prev => ({ ...prev, BOQRef:`${boq.BOQ_NO} - ${boq.BOQ_DESCRIPTION}`}));
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={[globalStyles.flex_1, globalStyles.justalignCenter, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={{
                    width: '90%',
                    backgroundColor: colors.card,
                    borderRadius: 8,
                    padding: 20,
                }}>
                    <ScrollView>
                        <Text style={[globalStyles.subtitle, globalStyles.mb_10]}>Edit Material</Text>

                        <TextInput
                            placeholder="UOM"
                            value={currentMaterial?.UOM || ''}
                            label="UOM"
                            mode="outlined"
                            theme={theme}
                            onChangeText={(text) => setCurrentMaterial(prev => ({ ...prev, UOM: text }))}
                            style={[globalStyles.input, globalStyles.mb_10]}
                        />
                        <TextInput
                            placeholder="Qty"
                            value={currentMaterial?.Qty !== undefined ? currentMaterial.Qty : '1'}
                            keyboardType="numeric"
                            label="Qty"
                            mode="outlined"
                            theme={theme}
                            onChangeText={(text) => {
                                if (/^\d*$/.test(text)) {
                                    setCurrentMaterial(prev => ({ ...prev, Qty: text }));
                                }
                            }}
                            style={[globalStyles.input, globalStyles.mb_10]}
                        />

                        <TouchableOpacity onPress={() => setShowReqDatePicker(true)} style={globalStyles.flex_1}>
                            <TextInput
                                placeholder="Required Date"
                                label="Required Date"
                                mode="outlined"
                                theme={theme}
                                value={currentMaterial?.RequiredDate || reqDate || ''}
                                editable={false}
                                style={[globalStyles.input, globalStyles.mb_10]}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setBoqPopupVisible(true)} style={globalStyles.mb_5}>
                            <TextInput
                                mode="outlined"
                                label="Select BOQ"
                                editable={false}
                                value={currentMaterial?.BOQRef || selectedBoq || ''}
                                onChangeText={(text) => setCurrentMaterial(prev => ({ ...prev, BOQRef: text }))}
                                theme={theme}
                                style={[globalStyles.input, globalStyles.mb_10]}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={openPriorityDropdown} style={globalStyles.container2}>
                            <TextInput
                                mode="outlined"
                                label="Priority"
                                value={currentMaterial?.Priority || priority}
                                onChangeText={(text) => setCurrentMaterial(prev => ({ ...prev, Priority: text }))}
                                style={[globalStyles.input, globalStyles.mb_10]}
                                editable={false}
                                theme={theme}
                                right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
                                pointerEvents="none"
                            />
                        </TouchableOpacity>

                        <TextInput
                            placeholder="Remarks"
                            label="Remarks"
                            mode="outlined"
                            theme={theme}
                            value={currentMaterial?.Remarks || remarks || ''}
                            onChangeText={(text) => setCurrentMaterial(prev => ({ ...prev, Remarks: text }))}
                            style={[globalStyles.input, globalStyles.mb_10]}
                        />

                        <View style={[globalStyles.twoInputContainer, globalStyles.my_10]}>
                            <Button
                                onPress={onClose}
                                theme={theme}
                                mode="outlined"
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={() => {
                                    saveMaterialEdit();
                                    onClose();
                                }}
                                mode="contained"
                                theme={theme}
                            >
                                Submit
                            </Button>
                        </View>

                        {showReqDatePicker && (
                            <DateTimePicker
                                value={reqDateObj}
                                mode="date"
                                display="default"
                                onChange={onReqDateChange}
                            />
                        )}

                        <PriorityDropdown 
                            visible={priorityModalVisible}
                            onClose={() => setProiorityModalVisible(false)}
                            onSelect={handlePrioritySelect} />

                        {isBoqPopupVisible && (
                            <GenericListPopup
                                visible={isBoqPopupVisible}
                                onClose={() => setBoqPopupVisible(false)}
                                onSelect={(boq) => {
                                    handleProjectBOQSelect(boq);
                                    setBoqPopupVisible(false);
                                }}
                                data={boqList}
                                mainLabelExtractor={(item) => item?.BOQ_NO || ''}
                                labelExtractor={null}
                                subLabelExtractor={(item) => item.BOQ_DESCRIPTION || ''}
                                lastLabelExtractor={null}
                                searchKeyExtractor={(item) => `${item.BOQ_NO || ''} ${item.BOQ_DESCRIPTION || ''}`}
                            />
                        )}

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default MaterialEditPopup;