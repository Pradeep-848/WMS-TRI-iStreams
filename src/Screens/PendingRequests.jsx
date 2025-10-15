import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import Header from '../Components/Header';
import BackgroundGradient from '../Components/BackgroundGradient';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomSheet } from 'react-native-btr';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { formatDate, formatSoapDate, formatSoapDateonly, parseSoapDateintoIstFormat } from '../Utils/dataTimeUtils';

const PendingRequests = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { filters } = route.params || {};

    const [empData, setEmpData] = useState({ empNo: '', empName: '', designation: '' });
    const [visible, setVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        getPendingMRData();

        // Set employee data from context or props if needed
        setEmpData({
            empNo: userData?.userEmployeeNo || '',
            empName: userData?.userName || 'User',
            designation: userData?.designation || '',
        });
    }, [userData, filters]);

    const getPendingMRData = async () => {
        setLoading(true);
        try {
            const GetPendingMR_RequestParameter = {
                CompanyCode: userData.companyCode,
                BranchCode: userData.branchCode,
                EmpNo: filters.empNo,
                PeriodFrom: filters.startDate,
                PeriodTo: filters.endDate,
            };

            const response = await callSoapService(
                userData.clientURL,
                'MR_Get_MRList_Pending_For_User',
                GetPendingMR_RequestParameter
            );

            if (response !== null) {
                setFilteredData(response);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
            case 'completed':
                return '#4CAF50';
            case 'Unapproved':
                return '#FF9800';
            case 'rejected':
                return '#F44336';
            default:
                return colors.primary;
        }
    };

    // Toggle bottom sheet visibility
    const toggleBottomNavigationView = (request = null) => {
        setSelectedRequest(request);
        setVisible(!visible);
    };

    // Handle option selection from bottom sheet
    const handleOptionSelect = (option) => {
        toggleBottomNavigationView();
        if (option === 'timeline' && selectedRequest) {
            navigation.navigate('MaterialListTimeLine', {
                request: selectedRequest,
                empName: empData.empName
            });
        } else if (option === 'details' && selectedRequest) {
            navigation.navigate('MaterialRequestList', {
                REQUISITION_NO: selectedRequest.REQUISITION_NO,
                REQUISITION_DATE: parseSoapDateintoIstFormat(selectedRequest.REQUISITION_DATE),
            });
        }
    };

    const renderRequestCard = ({ item, index }) => {
        const statusColor = getStatusColor(item.APPROVAL_STATUS);
        return (
            <View style={[globalStyles.my_5]}>
                <Card style={{ backgroundColor: colors.card }}>
                    <Card.Content>
                        <View style={globalStyles.twoInputContainer}>
                            <View style={globalStyles.twoInputContainer}>
                                <View>
                                    <Text style={[globalStyles.subtitle_4, { color: colors.primary }]}>
                                        {item.MR_REF_NO}
                                    </Text>
                                </View>

                                <View>
                                    <Text style={[globalStyles.subtitle_4, { color: colors.primary, marginLeft: 10 }]}>
                                        {parseSoapDateintoIstFormat(item.REQUISITION_DATE)}
                                    </Text>
                                </View>
                            </View>

                            <View style={globalStyles.twoInputContainer}>
                                <Text style={[globalStyles.subtitle_1, globalStyles.ml_5]}>
                                    <MaterialCommunityIcons name="package-variant-closed" size={20} color={colors.gray} />
                                    {item.NO_OF_ITEMS} <Text style={[globalStyles.subtitle_4, { fontSize: 10 }]}>items</Text>
                                </Text>
                            </View>
                        </View>

                        {/* Horizontal Line */}
                        <View style={[styles.horizontalLine, { backgroundColor: colors.outline }]} />

                        {/* Bottom Row - Approved/Required Date and Status */}
                        <View style={[globalStyles.twoInputContainer, { marginTop: 3 }]}>
                            <View>
                                <Text style={globalStyles.subtitle_4}>
                                    Required Date:{' '}
                                    <Text style={[globalStyles.small_text, { color: colors.success }]}>
                                        {parseSoapDateintoIstFormat(item.REQUIRED_DATE)}
                                    </Text>
                                </Text>
                            </View>

                            <View style={globalStyles.twoInputContainer1}>
                                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: statusColor }]}>
                                    <Text style={[globalStyles.subtitle_4, { color: statusColor, fontSize: 10 }]}>
                                        {item.APPROVAL_STATUS}
                                    </Text>
                                </View>

                                <View>
                                    <TouchableOpacity
                                        onPress={() => toggleBottomNavigationView(item)}
                                        style={[styles.statusBadge, { backgroundColor: colors.surface, borderColor: 'grey' }]}
                                    >
                                        <Text style={[globalStyles.subtitle_4, { color: colors.primary, fontSize: 10 }]}>
                                            <MaterialCommunityIcons name="eye" size={15} /> View
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View>
                            <Text style={globalStyles.subtitle_4}>
                                Project Name : {' '}
                                <Text style={[globalStyles.subtitle_4, { color: colors.darkGray }]}>
                                    {`${item.PROJECT_NO} - ${item.PROJECT_NAME}`}
                                </Text>
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            </View>
        );
    };

    // Bottom Sheet Component
    const renderBottomSheet = () => (
        <BottomSheet
            visible={visible}
            onBackButtonPress={toggleBottomNavigationView}
            onBackdropPress={toggleBottomNavigationView}
        >
            <View style={[styles.bottomNavigationView, { backgroundColor: colors.surface }]}>
                <View style={styles.bottomSheetHeader}>
                    <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>
                        Request Options
                    </Text>
                    <TouchableOpacity onPress={toggleBottomNavigationView}>
                        <MaterialCommunityIcons name="close" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.bottomSheetOption}
                    onPress={() => handleOptionSelect('timeline')}
                >
                    <MaterialCommunityIcons name="timeline" size={20} color={colors.primary} />
                    <Text style={[globalStyles.subtitle_4, { marginLeft: 12 }]}>
                        View Timeline
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bottomSheetOption}
                    onPress={() => handleOptionSelect('details')}
                >
                    <MaterialCommunityIcons name="format-list-bulleted" size={20} color={colors.primary} />
                    <Text style={[globalStyles.subtitle_4, { marginLeft: 12 }]}>
                        View Item Details
                    </Text>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title='Pending Requests' navigationType='back' />

                {loading ? (
                    <View style={[globalStyles.flex_1, globalStyles.justifyContentCenter, globalStyles.alignItemsCenter]}>
                        <ActivityIndicator size="small" color={colors.primary} theme={theme} />
                    </View>
                ) : (

                    <FlatList
                        data={filteredData}
                        renderItem={renderRequestCard}
                        keyExtractor={(item) => item.MR_REF_NO}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={[globalStyles.alignItemsCenter, globalStyles.mt_10]}>
                                <Text style={{ color: colors.surface }}>No pending requests found.</Text>
                            </View>
                        }
                    />
                )}

                {renderBottomSheet()}
            </View>
        </BackgroundGradient>
    );
};

export default PendingRequests;

const styles = StyleSheet.create({
    horizontalLine: {
        height: 1,
        marginVertical: 3,
    },
    statusBadge: {
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomNavigationView: {
        backgroundColor: '#fff',
        width: '100%',
        height: 180,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    bottomSheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
});