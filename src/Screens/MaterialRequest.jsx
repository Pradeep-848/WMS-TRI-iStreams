import { ScrollView, View, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { formatDate } from '../Utils/dataTimeUtils';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import GenericListPopup from '../Modal/GenericListPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmployeeListCard from '../Components/EmployeeListCard';
import { LocationService } from '../Logics/LocationService';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import PriorityDropdown from '../Components/PriorityDropdown';
import BackgroundGradient from '../Components/BackgroundGradient';
import { useSnackbar } from '../Context/SnackbarContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MaterialRequest = () => {
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const navigation = useNavigation();
    const { showSnackbar } = useSnackbar();
    const insets = useSafeAreaInsets();

    const [empCardLoading, setEmpCardLoading] = useState(true);
    const [projectListVisible, setProjectListVisible] = useState(false);
    const [refSerialNo, setRefSerialNo] = useState('');
    const [entryDate, setEntryDate] = useState('');
    const [projectDetails, setProjectDetails] = useState('');
    const [btnLoading, setBtnLoading] = useState(false);
    const [requestedEmp, setRequestedEmp] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [projectList, setProjectList] = useState([]);
    const [boqList, setBoqList] = useState([]);
    const [isBoqPopupVisible, setBoqPopupVisible] = useState(false);
    const [selectedBoq, setSelectedBoq] = useState(null);
    const [mrRefNo, setMrRefNo] = useState('');
    const [remarks, setRemarks] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [locationName, setLocationName] = useState('Fetching location...');
    const [address, setAddress] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [priorityModalVisible, setPriorityModalVisible] = useState(false);
    const [reqDate, setReqDate] = useState('');

    const clientURL = userData.clientURL;

    const openPriorityDropdown = () => setPriorityModalVisible(true);
    const closePriorityDropdown = () => setPriorityModalVisible(false);

    const handlePrioritySelect = (value) => {
        setPriority(value);
        closePriorityDropdown();
    };

    const getData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('ProjectList');            

            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setProjectList(parsedData);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    const getEmpData = async () => {
        setEmpCardLoading(true);
        try {
            const empData = await callSoapService(clientURL, 'Get_Emp_BasicInfo', {
                EmpNo: userData.userEmployeeNo
            });

            if (empData.length > 0) {
                const empDataWithAvatar = empData.map(emp => ({
                    ...emp,
                    EMP_IMAGE: userData.userAvatar
                }));
                setRequestedEmp(empDataWithAvatar);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
        finally {
            setEmpCardLoading(false);
        }
    };

    useEffect(() => {
        const now = new Date();
        setEntryDate(formatDate(now));
        setReqDate(formatDate(now));

        LocationService(setLocationName, setCoordinates, setAddress);

        getData();
        getEmpData();
    }, []);

    useEffect(() => {
        if (errorMessage) {
            Alert.alert('Error', errorMessage, [
                { text: 'OK', onPress: () => setErrorMessage('') }
            ]);
        }
    }, [errorMessage]);

    const onProjectSelect = async (project) => {
        setProjectDetails(`${project.PROJECT_NO} - ${project.PROJECT_NAME}`);

        try {
            const PrjBOQ_ListParameter = {
                projectnum: project.PROJECT_NO,
            };

            const ProjectBOQList = await callSoapService(userData.clientURL, 'getproject_part_details', PrjBOQ_ListParameter);

            if (ProjectBOQList !== null) {
                setBoqList(ProjectBOQList);
            }
        } catch (error) {
            console.error("Error fetching BOQ list:", error);
        }
    };

    const handleProjectBOQSelect = (boq) => {
        setSelectedBoq(`${boq.BOQ_NO} - ${boq.BOQ_DESCRIPTION}`);
    };

    // Date picker states
    const [showReqDatePicker, setShowReqDatePicker] = useState(false);
    const [reqDateObj, setReqDateObj] = useState(new Date());

    const onReqDateChange = (event, selectedDate) => {
        setShowReqDatePicker(false);
        if (selectedDate) {
            setReqDateObj(selectedDate);
            setReqDate(formatDate(selectedDate));
        }
    };

    const handleSubmit = async () => {
        try {
            setBtnLoading(true);

            if (!projectDetails) {
                showSnackbar('Select Project to continue', "warning");
                setBtnLoading(false);
                return;
            }
            if (!reqDate) {
                showSnackbar('Select Request Date to continue', "warning");
                setBtnLoading(false);
                return;
            }

            navigation.navigate('MaterialAddScreen', {
                projectDetails,
                entryDate,
                selectedBoq,
                requestedEmp,
                reqDate,
                priority,
                remarks,
                boqList
            });
        } catch (error) {
            showSnackbar('Error: ' + error.message, "error");
        } finally {
            setBtnLoading(false);
        }
    };

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title='Material Request' />

                <View style={[globalStyles.locationContainer]}>
                    <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                    <Text style={[globalStyles.content1, globalStyles.mx_10, globalStyles.mb_5]}>{locationName}</Text>
                </View>

                <View style={[globalStyles.mb_5, { height: 1, backgroundColor: '#ccc' }]} />

                <View style={globalStyles.flex_1}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}>
                        <Text style={[globalStyles.subtitle, globalStyles.mb_10]}>Requested By</Text>

                        <View style={globalStyles.flex_1}>
                            <EmployeeListCard />
                        </View>

                        <View style={[globalStyles.twoInputContainer, globalStyles.mb_10]}>
                            <TextInput
                                mode="outlined"
                                label="Req # : (New)"
                                showSoftInputOnFocus={false}
                                theme={theme}
                                style={globalStyles.container1}
                                placeholder="(New)"
                                pointerEvents="none"
                            />

                            <TextInput
                                mode="outlined"
                                label="MR / Entry Date"
                                value={entryDate}
                                editable={false}
                                theme={theme}
                                style={globalStyles.container2}
                                placeholder="DD/MMM/YYYY"
                            />
                        </View>

                        <View style={globalStyles.flex_1}>
                            <TextInput
                                mode="outlined"
                                label="MR Ref # : (New)"
                                showSoftInputOnFocus={false}
                                placeholder='(New)'
                                style={globalStyles.mb_10}
                                theme={theme}
                            />

                            <TouchableOpacity onPress={() => setProjectListVisible(true)} style={globalStyles.mb_10}>
                                <TextInput
                                    mode="outlined"
                                    label="Select Project"
                                    multiline
                                    numberOfLines={2}
                                    value={projectDetails}
                                    editable={false}
                                    theme={theme}
                                    right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
                                    onPress={() => setProjectListVisible(true)}
                                    pointerEvents="none"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setBoqPopupVisible(true)} style={globalStyles.mb_10}>
                                <TextInput
                                    mode="outlined"
                                    label="Select BOQ"
                                    value={selectedBoq}
                                    multiline
                                    numberOfLines={2}
                                    editable={false}
                                    theme={theme}
                                    right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
                                    onPress={() => setBoqPopupVisible(true)}
                                    pointerEvents="none"
                                />
                            </TouchableOpacity>

                            <View style={[globalStyles.twoInputContainer, globalStyles.mb_10]}>
                                <TouchableOpacity onPress={() => setShowReqDatePicker(true)} style={globalStyles.container1}>
                                    <TextInput
                                        mode="outlined"
                                        label="Required Date"
                                        value={reqDate}
                                        editable={false}
                                        theme={theme}
                                        placeholder="DD/MMM/YYYY"
                                        right={<TextInput.Icon color={colors.text} icon="calendar" onPress={() => setShowReqDatePicker(true)} />}
                                        pointerEvents="none"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={openPriorityDropdown} style={globalStyles.container2}>
                                    <TextInput
                                        mode="outlined"
                                        label="Priority"
                                        value={priority}
                                        editable={false}
                                        theme={theme}
                                        right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
                                        pointerEvents="none"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                mode="outlined"
                                label="Remarks"
                                value={remarks}
                                onChangeText={setRemarks}
                                multiline
                                numberOfLines={2}
                                theme={theme}
                            />
                        </View>

                        <Text style={[globalStyles.subtitle, globalStyles.my_10]}>Status:</Text>
                    </ScrollView>

                    <PriorityDropdown visible={priorityModalVisible}
                        onClose={() => setPriorityModalVisible(false)}
                        onSelect={handlePrioritySelect} />

                    <GenericListPopup
                        visible={projectListVisible}
                        onClose={() => setProjectListVisible(false)}
                        onSelect={(project) => {
                            onProjectSelect(project);
                            setProjectListVisible(false);
                        }}
                        data={projectList}
                        mainLabelExtractor={(item) => item?.PROJECT_NO || ''}
                        labelExtractor={null}
                        subLabelExtractor={(item) => item.PROJECT_NAME || ''}
                        lastLabelExtractor={null}
                        searchKeyExtractor={(item) => `${item.PROJECT_NO || ''} ${item.PROJECT_NAME || ''}`}
                    />

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

                    {showReqDatePicker && (
                        <DateTimePicker
                            value={reqDateObj}
                            mode="date"
                            display="default"
                            onChange={onReqDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    {/* Action Buttons */}
                    <View style={globalStyles.bottomButtonContainer}>
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            theme={{
                                colors: {
                                    primary: colors.primary,
                                    disabled: colors.lightGray,
                                },
                            }}
                            loading={btnLoading}
                            disabled={btnLoading}
                        >
                            Next
                        </Button>
                    </View>
                </View>
            </View>
        </BackgroundGradient>
    );
};

export default MaterialRequest;

const styles = StyleSheet.create({
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