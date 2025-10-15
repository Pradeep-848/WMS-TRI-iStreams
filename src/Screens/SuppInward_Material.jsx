import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import Header from '../Components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GlobalStyles } from '../Styles/styles';
import { useAuth } from '../Context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import MaterialListCard from '../Components/MaterialListCard';
import BackgroundGradient from '../Components/BackgroundGradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialEditPopup from '../Components/MaterialEditPopup';

const SuppInward_Material = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [btnloading, setbtnLoading] = useState(false);
    const { documents, coordinates, locationName, address, deliveryNoteNo,
        deliveryNoteDate, poNo, poDate, vehicleNo, driverName } = route.params || {};
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState([]);
    const [didLoad, setDidLoad] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isBoqPopupVisible, setBoqPopupVisible] = useState(false);
    const [currentMaterial, setCurrentMaterial] = useState(null);
    const [selectedBoq, setSelectedBoq] = useState(null);
    const [reqDate, setReqDate] = useState('');
    const [priority, setPriority] = useState('');
    const [remarks, setRemarks] = useState('');

    const userName = userData.userName;
    const clientURL = userData.clientURL;
    const companyCode = userData.companyCode;
    const branchCode = userData.branchCode;

    useEffect(() => {
        const loadSelectedMaterials = async () => {
            try {
                const storedMaterials = await AsyncStorage.getItem('selectedMaterials');
                if (storedMaterials !== null) {
                    setSelectedMaterials(JSON.parse(storedMaterials));
                }
            } catch (error) {
                console.error('Error loading materials:', error);
            }
            finally {
                setDidLoad(true);
            }
        };

        loadSelectedMaterials();
    }, []);

    useEffect(() => {
        if (!didLoad) return;
        const saveSelectedMaterials = async () => {
            try {
                await AsyncStorage.setItem('selectedMaterials', JSON.stringify(selectedMaterial));
            } catch (error) {
                console.error('Error saving materials:', error);
            }
        };

        saveSelectedMaterials();
    }, [selectedMaterial]);

    const clearSelectedMaterials = async () => {
        try {
            await AsyncStorage.removeItem('selectedMaterials');
            setSelectedMaterials([]);
        } catch (error) {
            console.error('Error clearing materials:', error);
        }
    };

    const saveMaterialEdit = () => {
        setSelectedMaterials((prev) =>
            prev.map((mat) =>
                mat.ITEM_CODE === currentMaterial.ITEM_CODE && mat.SUB_MATERIAL_NO === currentMaterial.SUB_MATERIAL_NO
                    ? currentMaterial
                    : mat
            )
        );
    };

    const handleDeleteMaterial = (item) => {
        setSelectedMaterials((prev) =>
            prev.filter(
                mat => mat.ITEM_CODE !== item.ITEM_CODE || mat.SUB_MATERIAL_NO !== item.SUB_MATERIAL_NO
            )
        );
    };

    const handleSelect = (newSelection) => {
        setSelectedMaterials(newSelection);
    };

    const handleMaterialPress = (material) => {
        setCurrentMaterial(material);
        setModalVisible(true);
    };

    useEffect(() => {
        if (errorMessage) {
            Alert.alert('Error', errorMessage, [
                { text: 'OK', onPress: () => setErrorMessage('') }
            ]);
        }
    }, [errorMessage]);

    const SaveTeamCheckin = async () => {

        setbtnLoading(true);

        try {
            await clearSelectedMaterials();

            setSelectedMaterials([]);
        } catch (error) {
            console.error('Error saving Checkin data:', error);
        } finally {
            setbtnLoading(false);
        }
    };

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Supplier Inward Material" />

                <View style={globalStyles.projectContainer}>
                    <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>
                        <Text style={globalStyles.subtitle_2}>Delivery Note No: </Text>
                        {deliveryNoteNo}
                    </Text>
                    <Text style={globalStyles.subtitle}>
                        <Text style={globalStyles.subtitle}>PO No: </Text>
                        {poNo}
                    </Text>
                </View>

                <FlatList
                    data={selectedMaterials}
                    keyExtractor={(item) => item.ITEM_CODE + item.SUB_MATERIAL_NO}
                    ListHeaderComponent={
                        <>
                            <View style={globalStyles.camButtonContainer}>
                                <Button
                                    icon="plus"
                                    mode="contained"
                                    theme={theme}
                                    onPress={() =>
                                        navigation.navigate('MaterialList', {
                                            selectedMaterial: selectedMaterial, // pass current selection
                                            onSelect: handleSelect,
                                        })
                                    }
                                >
                                    Add Materials
                                </Button>
                            </View>

                            <View style={[globalStyles.twoInputContainer, globalStyles.my_5]}>
                                <Text style={[globalStyles.subtitle, { color: colors.text }]}>
                                    Selected Materials
                                </Text>

                                {selectedMaterials.length > 0 && (
                                    <TouchableOpacity onPress={(e) => {
                                        e.stopPropagation();
                                        Alert.alert(
                                            "Confirm Delete",
                                            "Are you sure you want to delete all the material?",
                                            [
                                                {
                                                    text: "Cancel",
                                                    style: "cancel"
                                                },
                                                {
                                                    text: "Delete",
                                                    style: "destructive",
                                                    onPress: () => clearSelectedMaterials()
                                                }
                                            ]
                                        );
                                    }}>
                                        <Text style={[globalStyles.subtitle_2, { color: colors.primary, textDecorationLine: 'underline' }]}>
                                            Clear All
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    }
                    renderItem={({ item }) => (
                        <MaterialListCard
                            loading={loading}
                            selectedMaterial={[item]}
                            onPress={handleMaterialPress}
                            onDelete={(item) => handleDeleteMaterial(item)}
                        />
                    )}
                    ListEmptyComponent={<Text style={[globalStyles.body, { padding: 10, textAlign: 'center' }]}>No Materials selected.</Text>}
                />

                <View style={globalStyles.bottomButtonContainer}>
                    <Button mode="contained"
                        onPress={SaveTeamCheckin}
                        theme={{
                            colors: {
                                primary: colors.primary,
                                disabled: colors.lightGray,
                            },
                        }}
                        disabled={btnloading}
                        loading={btnloading}>
                        Submit
                    </Button>
                </View>

                <MaterialEditPopup
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    currentMaterial={currentMaterial}
                    setCurrentMaterial={setCurrentMaterial}
                    setBoqPopupVisible={setBoqPopupVisible}
                    selectedBoq={selectedBoq}
                    reqDate={reqDate}
                    priority={priority}
                    remarks={remarks}
                    theme={theme}
                    globalStyles={globalStyles}
                    colors={colors}
                    saveMaterialEdit={saveMaterialEdit}
                />
            </View>
        </BackgroundGradient>
    )
}

export default SuppInward_Material;