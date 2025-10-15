import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';

const MatReqPopup = ({ visible, onClose }) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const navigation = useNavigation();

    const handleNewRequest = () => {
        onClose();
        navigation.navigate('MaterialRequest');
    };

    const handleViewRequest = () => {
        onClose();
        navigation.navigate('MyRequests');
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.popupContainer}>
                    <TouchableOpacity style={styles.optionButton} onPress={handleNewRequest}>
                        <Icon name="add-circle-outline" size={24} color={colors.primary} style={styles.icon} />
                        <Text style={[globalStyles.subtitle_1, globalStyles.ml_10, {color: colors.primary}]}>New Material Request</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionButton} onPress={handleViewRequest}>
                        <FontAwesome name="list" size={24} color={colors.primary} style={styles.icon} />
                        <Text style={[globalStyles.subtitle_1, globalStyles.ml_10, {color: colors.primary}]}>View Previous Requests</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    popupContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingVertical: 20,
        paddingHorizontal: 25,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    optionText: {
        fontSize: 18,
        color: '#0685de',
        marginLeft: 15,
    },
    icon: {
        width: 30,
    },
});

export default MatReqPopup;