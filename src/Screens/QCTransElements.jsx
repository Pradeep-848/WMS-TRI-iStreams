import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, Alert, Image } from 'react-native';
import { Button } from 'react-native-paper';
import Header from '../Components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { GlobalStyles } from '../Styles/styles';
import { useAuth } from '../Context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import MaterialListCard from '../Components/MaterialListCard';

const QCTransElements = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [btnloading, setbtnLoading] = useState(false);
    const { transferDate, transferTime, qcController,
        selectedSectionFrom, selectedSectionTo, cuttingLineNo,
        projectNo, projectName } = route.params || {};
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const [loading, setLoading] = useState(false);
    const [assemblyElements, setAssemblyElements] = useState([]);

    const userName = userData.userName;
    const clientURL = userData.clientURL;
    const companyCode = userData.companyCode;
    const branchCode = userData.branchCode;

    useEffect(() => {
        getAssemblyElements();
    }, []);

    const getAssemblyElements = async () => {
        try {
            const assemblyElements_Params = {
                CompanyCode: companyCode,
                BranchCode: branchCode,
                CuttingLineNo: cuttingLineNo,
            };

            const assemblyElements_List = await callSoapService(clientURL, 'QC_Get_AssemblyElements_For_CuttingLine',
                assemblyElements_Params
            );

            if (assemblyElements_List !== null) {
                setAssemblyElements(assemblyElements_List);
            }
        }
        catch (e) {

        }
    }

    useEffect(() => {
        if (errorMessage) {
            Alert.alert('Error', errorMessage, [
                { text: 'OK', onPress: () => setErrorMessage('') }
            ]);
        }
    }, [errorMessage]);

    const SaveTeamCheckin = async () => {

    };

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="QC Transfer Elements" />

            <View style={globalStyles.projectContainer}>
                <Text style={[globalStyles.subtitle_2, globalStyles.clr_primary]}>
                    <Text style={globalStyles.subtitle_2}>CuttingLine No: </Text>
                    {cuttingLineNo}
                </Text>
                <Text style={globalStyles.subtitle}>
                    <Text style={globalStyles.subtitle}>Project No: </Text>
                    {projectNo}
                </Text>
            </View>

            <View style={[globalStyles.projectContainer, globalStyles.twoInputContainer]}>
                <Text style={globalStyles.subtitle}>
                    {`${selectedSectionFrom.SECTION_NO} - ${selectedSectionFrom.SECTION_NAME}`}
                </Text>
                <Text style={globalStyles.subtitle}>
                    {`->`}
                </Text>
                <Text style={globalStyles.subtitle}>
                    {`${selectedSectionTo.SECTION_NO} - ${selectedSectionTo.SECTION_NAME}`}
                </Text>
            </View>

            <View>
                <Text style={[globalStyles.subtitle_1, globalStyles.clr_primary, globalStyles.mt_10]}>Assembly Elements</Text>
            </View>

            <FlatList
                data={assemblyElements}
                keyExtractor={(item) => item.ELEMENT_DESCRIPTION}
                renderItem={({ item }) => (
                    <View style={globalStyles.projectContainer}>
                        <Text style={[globalStyles.subtitle_1, globalStyles.clr_primary, {textAlign: 'center'}]}>{item.ELEMENT_DESCRIPTION}</Text>
                        <View style={globalStyles.twoInputContainer1}>
                            <View style={[globalStyles.container1, globalStyles.justalignCenter]}>
                                <Text style={[globalStyles.subtitle_2, globalStyles.clr_primary]}>
                                    <Text style={globalStyles.subtitle_2}>CuttingLine Qty: </Text>
                                    {item.CUTTINGLINE_QTY}
                                </Text>
                                <Text style={[globalStyles.subtitle_2, globalStyles.clr_primary]}>
                                    <Text style={globalStyles.subtitle_2}>Balance Qty: </Text>
                                    {item.BALANCE_QTY}
                                </Text>
                            </View>
                            <View style={[globalStyles.container2, globalStyles.justalignCenter]}>
                                <Text style={[globalStyles.subtitle_2, globalStyles.clr_primary]}>
                                    <Text style={globalStyles.subtitle_2}>Accepted Qty: </Text>
                                    {item.ACCEPTED_QTY}
                                </Text>
                                <Text style={[globalStyles.subtitle_2, globalStyles.clr_primary]}>
                                    <Text style={globalStyles.subtitle_2}>Rejected Qty: </Text>
                                    {item.REJECTED_QTY}
                                </Text>
                                <Text style={[globalStyles.subtitle_2, globalStyles.clr_primary]}>
                                    <Text style={globalStyles.subtitle_2}>Transfer Qty: </Text>
                                    {item.TRANSFER_QTY}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={[globalStyles.body, { padding: 10, textAlign: 'center' }]}>No Valid Elements Found</Text>}
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

export default QCTransElements;