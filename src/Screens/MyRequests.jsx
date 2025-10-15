import { ScrollView, View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text, Card, Searchbar } from 'react-native-paper';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { convertDataModelToStringData } from '../Utils/dataModelConverter';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Import the icon library
import { useNavigation } from '@react-navigation/native';
import BackgroundGradient from '../Components/BackgroundGradient';

const MyRequests = ({ employee }) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [loading, setLoading] = useState(true);
    const [empData, setEmpData] = useState({ empNo: '', empName: '', designation: '' });
    const [loanType, setLoanType] = useState('');
    const [category, setCategory] = useState('');
    const [loanTypeVisible, setLoanTypeVisible] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalDays, setTotalDays] = useState('');
    const [remarks, setRemarks] = useState('');
    const [btnLoading, setBtnLoading] = useState(false);
    const [loanTypeList, setLoanTypeList] = useState([]);
    const [requestsList, setRequestsList] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Sample data - replace with your actual data
    const sampleRequests = [
        {
            id: '1',
            refNo: 'MR001',
            date: '15-08-2025',
            approved: 'Yes',
            requiredDate: '20-08-2025',
            status: 'Approved'
        },
        {
            id: '2',
            refNo: 'MR002',
            date: '12-08-2025',
            approved: 'No',
            requiredDate: '18-08-2025',
            status: 'Pending'
        },
        {
            id: '3',
            refNo: 'MR003',
            date: '10-08-2025',
            approved: 'Yes',
            requiredDate: '15-08-2025',
            status: 'Completed'
        },
        {
            id: '4',
            refNo: 'MR004',
            date: '08-08-2025',
            approved: 'No',
            requiredDate: '12-08-2025',
            status: 'Rejected'
        }
    ];

    useEffect(() => {
        getData();
        setRequestsList(sampleRequests);
        setFilteredRequests(sampleRequests);

        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const getData = async () => {
        try {
            const loanType_Params = {
                CompanyCode: userData.companyCode,
                BranchCode: userData.branchCode
            };
            const response = await callSoapService(userData.clientURL, "HR_Get_LoanTypes_List", loanType_Params)

            if (response !== null) {
                setLoanTypeList(response);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const GetMatched_EmpParameter = {
                    EmpNo: userData.userEmployeeNo
                };

                const GetMatched_EmpList = await callSoapService(userData.clientURL, 'Get_Emp_BasicInfo', GetMatched_EmpParameter);

                const employee = GetMatched_EmpList[0];

                if (employee) {
                    setEmpData({
                        empNo: employee.EMP_NO || '',
                        empName: employee.EMP_NAME || '',
                        designation: employee.DESIGNATION || '',
                    });
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [employee]);

    const onSearchChange = (query) => {
        setSearchQuery(query);
        if (query === '') {
            setFilteredRequests(requestsList);
        } else {
            const filtered = requestsList.filter(item =>
                item.refNo.toLowerCase().includes(query.toLowerCase()) ||
                item.status.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredRequests(filtered);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
            case 'completed':
                return '#4CAF50';
            case 'pending':
                return '#FF9800';
            case 'rejected':
                return '#F44336';
            default:
                return colors.primary;
        }
    };

    const onLoanSelect = (loanType) => {
        setLoanType(loanType.LOAN_TYPE);
    };
    const onLeaveCategorySelect = (category) => {
        setCategory(category.LOAN_CATEGORY);
    };

    // Date picker states
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [startDateObj, setStartDateObj] = useState(new Date());
    const [endDateObj, setEndDateObj] = useState(new Date());

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateForAPI = (date) => {
        return date.toISOString();
    };

    const calculateDays = (start, end) => {
        if (start && end) {
            const timeDiff = end.getTime() - start.getTime();
            const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            setTotalDays(dayDiff.toString());
        }
    };

    const onStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDateObj(selectedDate);
            setStartDate(formatDate(selectedDate));
            calculateDays(selectedDate, endDateObj);
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDateObj(selectedDate);
            setEndDate(formatDate(selectedDate));
            calculateDays(startDateObj, selectedDate);
        }
    };

    const handleSubmit = async () => {
        if (!loanType) {
            alert('Please select leave type');
            return;
        }
        if (!startDate || !endDate) {
            alert('Please select start and end dates');
            return;
        }
        if (!remarks) {
            alert('Please enter remarks');
            return;
        }

        setBtnLoading(true);

        try {
            const leaveData = {
                LOAN_TYPE: loanType,
                LEAVE_CATEGORY: category || 'General',
                START_DATE: formatDateForAPI(startDateObj),
                END_DATE: formatDateForAPI(endDateObj),
                NO_OF_DAYS: totalDays,
                EMP_REMARKS: remarks,
                EMP_NO: empData.empNo,
            };

            const convertedDataModel = convertDataModelToStringData(
                "leave_request",
                leaveData
            );

            const leaveRequest_Parameter = {
                UserName: userData.userName,
                DModelData: convertedDataModel,
            };

            const response = await callSoapService(
                userData.clientURL,
                "DataModel_SaveData",
                leaveRequest_Parameter
            );

            if (response) {
                alert('Leave request submitted successfully');
                // Reset form
                setLoanType('');
                setCategory('');
                setStartDate('');
                setEndDate('');
                setTotalDays('');
                setRemarks('');
                // Reset date objects to current date
                setStartDateObj(new Date());
                setEndDateObj(new Date());
            }
        } catch (error) {
            console.error('Error saving leave request:', error);
            alert('Failed to submit leave request: ' + error.message);
        } finally {
            setBtnLoading(false);
        }
    };

    const renderRequestCard = ({ item, index }) => {
        const statusColor = getStatusColor(item.status);
        return (
            <View style={[styles.cardContainer]}>
                <Card style={{ backgroundColor: colors.card }}>
                    <Card.Content>
                        {/* Top Row - Ref# and Date */}
                        <View style={styles.cardTopCol}>
                            <View style={globalStyles.twoInputContainer}>
                                <View style={globalStyles.twoInputContainer}>
                                    <View>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('MaterialRequestList', {
                                                materialName: item.refNo,
                                                date: item.date,
                                                items: 10
                                            })}
                                        >
                                            <Text style={[globalStyles.subtitle_4, { color: colors.primary }]}>
                                                {item.refNo}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View>
                                        <Text style={[globalStyles.subtitle_4, { color: colors.primary, marginLeft: 10 }]}>
                                            {item.date}
                                        </Text>
                                    </View>
                                </View>

                                <View style={globalStyles.twoInputContainer}>
                                    <MaterialCommunityIcons name="package-variant-closed" size={20} />
                                    <Text style={[globalStyles.subtitle_1, { marginLeft: 5 }]}>
                                        10 <Text style={[globalStyles.subtitle_4, { fontSize: 10 }]}>items</Text>
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Horizontal Line */}
                        <View style={[styles.horizontalLine, { backgroundColor: colors.outline }]} />

                        {/* Bottom Row - Approved/Required Date and Status */}
                        <View style={[globalStyles.twoInputContainer, { marginTop: 3 }]}>
                            <View>
                                <Text style={globalStyles.subtitle_4}>Required Date: <Text style={globalStyles.subtitle_4}>{item.requiredDate}</Text></Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: statusColor }]}
                                onPress={() => navigation.navigate('MaterialListTimeLine')}
                            >
                                <Text style={[globalStyles.subtitle_4, { color: statusColor, fontSize: 10 }]}>
                                    {item.status}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Card.Content>
                </Card>
            </View>
        );
    };

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title='My Requests' />
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View style={globalStyles.justalignCenter}>
                        <View style={globalStyles.summaryRow}>
                            {/* <View style={globalStyles.summaryItem}>
                                <Text style={[globalStyles.content1, globalStyles.txt_center]}>Emp No</Text>
                                <Text style={[globalStyles.subtitle_2, globalStyles.txt_center, { color: colors.primary }]}>{empData.empNo || 'N/A'}</Text>
                            </View> */}

                            {/* <View style={globalStyles.summaryItem}>
                                <Text style={[globalStyles.content1, globalStyles.txt_center]}>Emp Name</Text>
                                <Text style={[globalStyles.subtitle_2, globalStyles.txt_center]}>
                                    {empData.empName || 'N/A'}
                                </Text>
                            </View> */}
                        </View>
                    </View>

                    {/* <Text style={[globalStyles.subtitle]}>Loan application</Text> */}
                    <Searchbar
                        style={globalStyles.my_5}
                        placeholder="Search Requests"
                        inputStyle={globalStyles.content1}
                    />

                    <FlatList style={styles.flatListContainer}
                        data={filteredRequests}
                        scrollEnabled={false}
                        renderItem={renderRequestCard}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                </ScrollView>
            </View >
        </BackgroundGradient>
    );
};

export default MyRequests;

const styles = StyleSheet.create({
    flatListContainer: {
        flex: 1,
    },
    cardContainer: {
        flex: 0.48,
        marginVertical: 5,
    },
    cardTopCol: {
        flexDirection: 'col',
    },
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
    tableSearchBar: {
        height: 40,
        elevation: 0,
        marginBottom: 5
    },
    searchInput: {
        fontSize: 14,
        minHeight: 36,
    },
});