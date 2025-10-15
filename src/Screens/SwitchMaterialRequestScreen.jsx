import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../Components/Header';
import BackgroundGradient from '../Components/BackgroundGradient';
import EmployeeListCard from '../Components/EmployeeListCard';
import { formatDate } from '../Utils/dataTimeUtils';
import InnovativeCard from '../Components/InnovativeCard';
import { useSnackbar } from '../Context/SnackbarContext';

const SwitchMaterialRequestScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { showSnackbar } = useSnackbar();

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterModalFor, setFilterModalFor] = useState(null);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEmp, setSelectedEmp] = useState(null);

    // Date picker states
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [startDateObj, setStartDateObj] = useState(new Date());
    const [endDateObj, setEndDateObj] = useState(new Date());

    // For Particular Request List
    const [reqNo, setReqNo] = useState('');
    const [reqDate, setReqDate] = useState('');
    const [reqDateObj, setReqDateObj] = useState(new Date());
    const [showReqDatePicker, setShowReqDatePicker] = useState(false); // Separate state for MR date picker
    const [reqNoError, setReqNoError] = useState(false);
    const [reqDateError, setReqDateError] = useState(false);

    // Initialize default dates
    useEffect(() => {
        const today = new Date();
        setStartDate(formatDate(today));

        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);
        setEndDate(formatDate(threeDaysLater));
    }, []);

    // Reset MR fields on screen focus
    useFocusEffect(
        useCallback(() => {
            resetParticularMR();
        }, [])
    );

    const resetParticularMR = useCallback(() => {
        setReqNo('');
        setReqDate('');
        setReqDateObj(new Date());
    }, []);

    const handleFilterApply = () => {
        let hasError = false;

        setReqNoError(false);
        setReqDateError(false);

        if (reqNo && !reqDate) {
            setReqDateError(true);
            hasError = true;
        } else if (!reqNo && reqDate) {
            setReqNoError(true);
            hasError = true;
        }

        // If one is entered but the other is missing → show alert
        if ((reqNo && !reqDate) || (!reqNo && reqDate)) {
            showSnackbar('Please enter both Requisition No. and Requisition Date to search a particular MR.', 'warning');
            return;
        }

        // Direct navigation if ReqNo & ReqDate entered
        if (reqNo && reqDate) {
            navigation.navigate('MaterialRequestList', {
                REQUISITION_NO: reqNo,
                REQUISITION_DATE: reqDate
            });
            setShowFilterModal(false);
            return;
        }

        // Normal filter logic
        const appliedFilters = {
            startDate,
            endDate,
            empNo: selectedEmp?.EMP_NO,
        };

        setShowFilterModal(false);

        if (filterModalFor === 'pending') {
            navigation.navigate('PendingRequests', { filters: appliedFilters });
        } else if (filterModalFor === 'all') {
            navigation.navigate('AllRequests', { filters: appliedFilters });
        }
    };

    // Start & End date handlers
    const onStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDateObj(selectedDate);
            setStartDate(formatDate(selectedDate));
            // Ensure end date is always after start date
            if (endDateObj < selectedDate) {
                setEndDateObj(selectedDate);
                setEndDate(formatDate(selectedDate));
            }
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDateObj(selectedDate);
            setEndDate(formatDate(selectedDate));
        }
    };

    const handleReqDateChange = (event, selectedDate) => {
        setShowReqDatePicker(false);
        if (selectedDate) {
            setReqDateObj(selectedDate);
            setReqDate(formatDate(selectedDate));
        }
    };

    const clearDateFilter = (type) => {
        if (type === 'start') setStartDate('');
        if (type === 'end') setEndDate('');
        if (type === 'req') setReqDate('');
    };

    const handleCardPress = (section) => {
        switch (section) {
            case 'section3':
                setFilterModalFor('all');
                setShowFilterModal(true);
                break;
            case 'section2':
                setFilterModalFor('pending');
                setShowFilterModal(true);
                break;
            case 'section1':
            default:
                navigation.navigate('MaterialRequest');
                break;
        }
    };


    const handleFilterCancel = () => {
        setShowFilterModal(false);
    };

    const cardData = [
        {
            id: 'section1',
            title: 'New Request',
            description: 'Create and submit new material requests',
            icon: 'plus-circle-outline',
            gradientColors: ['#667eea', '#764ba2'],
        },
        {
            id: 'section2',
            title: 'Pending Requests',
            description: 'Track your pending material requests',
            icon: 'clock-outline',
            gradientColors: ['#ffb347', '#ff8c00'],
        },
        {
            id: 'section3',
            title: 'All Requests',
            description: 'View complete request history',
            icon: 'format-list-bulleted',
            gradientColors: ['#4caf50', '#2e7d32'],
        }
    ];

    const renderFilterModal = () => (
        <Modal
            visible={showFilterModal}
            transparent={true}
            animationType="fade"
            onRequestClose={handleFilterCancel}
        >
            <View style={[globalStyles.flex_1, globalStyles.justalignCenter, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={[globalStyles.twoInputContainer, globalStyles.mb_20]}>
                            <Text style={[globalStyles.subtitle_1, { color: colors.primary }]}>MR Selection</Text>
                            <MaterialCommunityIcons name="close" onPress={handleFilterCancel} size={24} color={colors.error} />
                        </View>

                        {/* Date Filters */}
                        <Text style={[globalStyles.subtitle_4, { marginBottom: 5 }]}>Period Selection:</Text>
                        <View style={globalStyles.twoInputContainer1}>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: colors.background }]} onPress={() => setShowStartDatePicker(true)}>
                                <Text style={globalStyles.subtitle_4}>{startDate || 'dd-MMM-yyyy'}</Text>
                                {startDate && <MaterialCommunityIcons name="close-circle" size={16} color={colors.error} onPress={() => clearDateFilter('start')} />}
                            </TouchableOpacity>
                            <Text style={[globalStyles.subtitle_4, { marginHorizontal: 8 }]}>to</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: colors.background }]} onPress={() => setShowEndDatePicker(true)}>
                                <Text style={globalStyles.subtitle_4}>{endDate || 'dd-MMM-yyyy'}</Text>
                                {endDate && <MaterialCommunityIcons name="close-circle" size={16} color={colors.error} onPress={() => clearDateFilter('end')} />}
                            </TouchableOpacity>
                        </View>

                        {/* Date Pickers */}
                        {showStartDatePicker && <DateTimePicker value={startDateObj} mode="date" display="default" onChange={onStartDateChange} />}
                        {showEndDatePicker && <DateTimePicker value={endDateObj} mode="date" display="default" onChange={onEndDateChange} minimumDate={startDateObj} />}

                        {/* Employee & Particular MR */}
                        <View style={globalStyles.my_10}>
                            <Text style={[globalStyles.subtitle, globalStyles.mb_10]}>Request By</Text>
                            <EmployeeListCard onEmployeeChange={setSelectedEmp} />

                            <View style={[globalStyles.twoInputContainer1, globalStyles.my_10]}>
                                <View style={[styles.dottedLine, { borderColor: colors.gray }]} />
                                <Text style={[globalStyles.mx_10, { color: colors.primary }]}>Or</Text>
                                <View style={[styles.dottedLine, { borderColor: colors.gray }]} />
                            </View>

                            <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>Particular MR:</Text>
                            <View style={globalStyles.twoInputContainer1}>
                                <TextInput
                                    mode="outlined"
                                    label="Req No"
                                    theme={theme}
                                    value={reqNo}
                                    onChangeText={setReqNo}
                                    error={reqNoError}
                                    style={[{ width: '40%' }]}
                                    placeholder="Enter Req No."
                                />
                                <View style={globalStyles.container2}>
                                    <TouchableOpacity onPress={() => setShowReqDatePicker(true)}>
                                        <TextInput
                                            mode="outlined"
                                            label="Req Date"
                                            theme={theme}
                                            value={reqDate}
                                            editable={false}
                                            error={reqDateError}
                                            placeholder="Select Requisition Date"
                                            right={reqDate ? <TextInput.Icon icon="close-circle" onPress={() => clearDateFilter('req')} forceTextInputFocus={false} /> : null}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {showReqDatePicker && <DateTimePicker value={reqDateObj} mode="date" display="default" onChange={handleReqDateChange} />}
                        </View>

                        {/* Footer */}
                        <View style={[globalStyles.twoInputContainer, globalStyles.mt_10]}>
                            <Button mode="outlined" onPress={handleFilterCancel} style={globalStyles.container1} theme={{ colors: { primary: colors.primary } }}>Cancel</Button>
                            <Button mode="contained" onPress={handleFilterApply} style={globalStyles.container2} theme={{ colors: { primary: colors.primary } }} icon="filter-outline">Apply Filters</Button>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Material Request" navigationType="back" />
                <ScrollView contentContainerStyle={styles.cardsContainer} showsVerticalScrollIndicator={false}>
                    <View style={[globalStyles.mt_10, { gap: 20 }]}>
                        {cardData.map((card, index) => (
                            <InnovativeCard
                                key={card.id}
                                title={card.title}
                                description={card.description}
                                icon={card.icon}
                                gradientColors={card.gradientColors}
                                onPress={() => handleCardPress(card.id)}
                                delay={index * 200}
                            />
                        ))}
                    </View>
                </ScrollView>
                {renderFilterModal()}
            </View>
        </BackgroundGradient>
    );
};

export default SwitchMaterialRequestScreen;

const styles = StyleSheet.create({
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    dottedLine: {
        flex: 1,
        borderBottomWidth: 1.5,
        borderStyle: 'dotted',
    },
});
