// PriorityDropdown.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Pressable,
} from 'react-native';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';

const PriorityDropdown = ({ visible, onClose, onSelect }) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const priorities = ['High', 'Medium', 'Low']; // Static values

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={[globalStyles.flex_1, globalStyles.justalignCenter, { backgroundColor: 'rgba(0,0,0,0.3)' }]} onPress={() => onClose()}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <Text style={[globalStyles.subtitle, globalStyles.my_10, globalStyles.clr_primary]}>Select Priority</Text>
                    {priorities.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={styles.option}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={globalStyles.subtitle_2}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        borderRadius: 8,
        padding: 10,
        elevation: 5,
    },
    option: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default PriorityDropdown;
