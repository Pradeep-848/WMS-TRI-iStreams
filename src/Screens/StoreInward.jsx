import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, Alert } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import Header from '../Components/Header';
import { useNavigation } from '@react-navigation/native';
import { LocationService } from '../Logics/LocationService';
import { GlobalStyles } from '../Styles/styles';
import { useAuth } from '../Context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import MaterialListCard from '../Components/MaterialListCard';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';

const StoreInward = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [btnloading, setbtnLoading] = useState(false);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [locationName, setLocationName] = useState('Fetching location...');
    const [address, setAddress] = useState('');
    const [GIN, setGIN] = useState('');

    const [loading, setLoading] = useState(false);

    const userName = userData.userName;
    const clientURL = userData.clientURL;
    const companyCode = userData.companyCode;
    const branchCode = userData.branchCode;

    useEffect(() => {
        LocationService(setLocationName, setCoordinates, setAddress);
    }, []);

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
            
        } catch (error) {

        } finally {
            setbtnLoading(false);
        }
    };

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Store / Internal Inward Material" />

            <View style={[globalStyles.locationContainer, { flexDirection: 'row', alignItems: 'center' }]}>
                <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
            </View>

            <View>
                <Text style={[globalStyles.subtitle_2, globalStyles.mt_10, { color: colors.primary }]}>
                    Enter GIN / MRN No
                </Text>

                <TextInput
                    mode="outlined"
                    label="GIN / MRN No"
                    theme={theme}
                    value={GIN}
                    onChangeText={setGIN}
                />
            </View>

            <FlatList
                data={selectedMaterials}
                keyExtractor={(item) => item.ITEM_CODE + item.SUB_MATERIAL_NO}
                ListHeaderComponent={
                    <>
                        <View style={globalStyles.camButtonContainer}>
                            <Button
                                icon="plus"
                                mode="contained-tonal"
                                theme={theme}
                                onPress={() =>
                                    navigation.navigate('MaterialsList', {
                                        onSelect: async (material) => {
                                            setSelectedMaterials(material);
                                        }
                                    })
                                }
                            >
                                Add Materials
                            </Button>
                        </View>

                        <Text style={[globalStyles.subtitle_2, globalStyles.mb_10, { color: colors.primary }]}>
                            Selected Materials
                        </Text>
                    </>
                }
                renderItem={({ item }) => (
                    <MaterialListCard loading={loading} selectedMaterial={[item]} />
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
        </View>
    )
}

export default StoreInward;