import React, { useState, useEffect } from 'react'
import { Text, ScrollView, KeyboardAvoidingView, View, Platform, Image } from 'react-native';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput, Button } from 'react-native-paper';
import { LocationService } from '../Logics/LocationService';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';
import { useNavigation } from '@react-navigation/native';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import ManualImageCaptureModal from '../Modal/ManualImageCaptureModal';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import GenericListPopup from '../Modal/GenericListPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handlePickImageOptimized } from '../Utils/nativeCameraFunction';
import BackgroundGradient from '../Components/BackgroundGradient';
import { useSnackbar } from '../Context/SnackbarContext';

const DPR = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { showSnackbar } = useSnackbar();

    const [locationName, setLocationName] = useState('Fetching location...');
    const [projectNo, setProjectNo] = useState('');
    const [projectName, setProjectName] = useState('');
    const [entryDate, setEntryDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [btnloading, setbtnLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [activity, setActivity] = useState('');
    const [compQty, setCompQty] = useState('');
    const [percentage, setPercentage] = useState('');
    const [boqNo, setBoqNo] = useState('');
    const [projectList, setprojectList] = useState([]);
    const [useNativeCamera, setUseNativeCamera] = useState(false);

    const [boqList, setBoqList] = useState([]);
    const [isBoqPopupVisible, setBoqPopupVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [cameraVisible, setCameraVisible] = useState(false);

    useEffect(() => {
        LocationService(setLocationName, setCoordinates, setAddress);
        getData();

        const now = new Date();
        setEntryDate(formatDate(now));

        const currentTimeFormatted = formatTime(now);

        const oneHourLater = new Date(now);
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        const oneHourLaterFormatted = formatTime(oneHourLater);

        setStartTime(currentTimeFormatted);
        setEndTime(oneHourLaterFormatted);
    }, []);

    const getData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('ProjectList');
            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setprojectList(parsedData);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    const handleProjectSelect = async (project) => {
        setProjectNo(project.PROJECT_NO);
        setProjectName(project.PROJECT_NAME);

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

    useEffect(() => {
        const loadPreference = async () => {
            const value = await AsyncStorage.getItem('USE_MANUAL_CAPTURE');

            if (value !== null) {
                setUseNativeCamera(JSON.parse(value));
            }
        };
        loadPreference();
    }, []);

    const handleCapturePress = () => {
        if (useNativeCamera) {
            handlePickImageOptimized(setCapturedImage);
        } else {
            setCameraVisible(true);
        }
    };

    const handleProjectBOQSelect = (boq) => {
        setBoqNo(`${boq.BOQ_NO} - ${boq.BOQ_DESCRIPTION}`);
    };

    const handleNavigation = () => {
        setbtnLoading(true);
        try {
            if (!projectNo) {
                showSnackbar('Select Project', 'warning');
                return;
            }
            else if (!boqNo) {
                showSnackbar('Select BOQ', 'warning');
                return;
            }
            else if (!activity && !compQty && !percentage) {
                showSnackbar('Enter DPR Details', 'warning');
                return;
            }
            else if (!capturedImage) {
                showSnackbar('Capture DPR Image', 'warning');
                return;
            }
            else {
                navigation.navigate('DPREmp', {
                    startTime, endTime, projectNo, activity, compQty,
                    percentage, capturedImage, locationName, boqNo
                });
            }
        } catch (error) {
            console.error('Error in handleNavigation:', error);
        }
        finally {
            setbtnLoading(false);
        }
    };
    return (
        <BackgroundGradient>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}>

                <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                    <Header title="DPR" />
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View>
                            <View style={globalStyles.locationContainer}>
                                <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                                <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
                            </View>
                        </View>

                        <View style={[globalStyles.twoInputContainer, globalStyles.my_10]}>
                            <TextInput
                                mode="outlined"
                                label="Start Time"
                                value={startTime}
                                style={globalStyles.container1}
                                theme={theme}
                                editable={false}
                            />

                            <TextInput
                                mode="outlined"
                                label="End Time"
                                value={endTime}
                                style={globalStyles.container2}
                                theme={theme}
                                editable={false}
                            />
                        </View>

                        <Text style={globalStyles.subtitle_1}>Project Details</Text>
                        <View style={[globalStyles.twoInputContainer, globalStyles.my_10]}>
                            <TextInput
                                mode="outlined"
                                label="Project No"
                                onPressIn={() => setPopupVisible(true)}
                                value={projectNo}
                                style={globalStyles.container1}
                                theme={theme}
                                placeholder="Enter Project No"
                                showSoftInputOnFocus={false} />
                            <TextInput
                                mode="outlined"
                                label="Entry Date"
                                theme={theme}
                                style={globalStyles.container2}
                                value={entryDate}
                                editable={false}
                            />
                        </View>

                        <TextInput
                            mode="outlined"
                            label="Project Name"
                            value={projectName}
                            theme={theme}
                            multiline
                            numberOfLines={2}
                            editable={false}
                        />

                        <View style={globalStyles.my_10}>
                            <Text style={globalStyles.subtitle_1}>BOQ Details</Text>
                            <TextInput
                                mode="outlined"
                                label="BOQ No"
                                value={boqNo}
                                theme={theme}
                                onPressIn={() => setBoqPopupVisible(true)}
                                showSoftInputOnFocus={false}
                            />

                            <TextInput
                                mode="outlined"
                                label="Activity"
                                placeholder='Enter the Activity taken place'
                                value={activity}
                                theme={theme}
                                onChangeText={setActivity}
                            />

                            <TextInput
                                mode="outlined"
                                label="Completed Quantity"
                                value={compQty}
                                theme={theme}
                                onChangeText={setCompQty}
                            />

                            <TextInput
                                mode="outlined"
                                label="Percentage"
                                value={percentage}
                                theme={theme}
                                onChangeText={setPercentage}
                            />

                            <View style={globalStyles.camButtonContainer}>
                                <Button icon="camera" mode="contained"
                                    theme={{
                                        colors: {
                                            primary: colors.primary,
                                            disabled: colors.lightGray,
                                        },
                                    }}
                                    onPress={handleCapturePress}
                                >
                                    Capture Image
                                </Button>
                                <ManualImageCaptureModal
                                    visible={cameraVisible}
                                    onClose={() => setCameraVisible(false)}
                                    onCapture={(uri) => {
                                        setCapturedImage(uri);
                                        setCameraVisible(false);
                                    }}
                                />
                            </View>
                            <View style={globalStyles.imageContainer}>
                                <Image
                                    source={{ uri: capturedImage }}
                                    style={globalStyles.fullImage}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View style={globalStyles.bottomButtonContainer}>
                        <Button mode="contained"
                            onPress={handleNavigation}
                            theme={{
                                colors: {
                                    primary: colors.primary,
                                    disabled: colors.lightGray,
                                },
                            }}
                            loading={btnloading}
                            disabled={btnloading}>
                            Next
                        </Button>
                    </View>
                </View>

                <GenericListPopup
                    visible={isPopupVisible}
                    onClose={() => setPopupVisible(false)}
                    onSelect={(project) => {
                        handleProjectSelect(project);
                        setPopupVisible(false);
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
            </KeyboardAvoidingView>
        </BackgroundGradient>
    );
};

export default DPR;