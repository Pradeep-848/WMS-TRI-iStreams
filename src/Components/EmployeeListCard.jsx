// import React, { useEffect, useState } from 'react';
// import {
//     View,
//     Text,
//     FlatList,
//     ActivityIndicator,
//     Image,
//     StyleSheet,
//     TouchableOpacity,
// } from 'react-native';
// import { GlobalStyles } from '../Styles/styles';
// import { useTheme } from '../Context/ThemeContext';
// import { callSoapService } from '../SoapRequestAPI/callSoapService';
// import { useAuth } from '../Context/AuthContext';
// import FontAwesomeIcon6 from 'react-native-vector-icons/FontAwesome6';
// import { Alert } from 'react-native';

// const EmployeeListCard = ({ navigation, showChangeButton = true, selectedEmp }) => {
//     const { theme } = useTheme();
//     const colors = theme.colors;
//     const globalStyles = GlobalStyles(colors);
//     const [empCardLoading, setEmpCardLoading] = useState(false);
//     const [requestedEmp, setRequestedEmp] = useState(selectedEmp || []);
//     const { userData } = useAuth();

//     const getEmpData = async () => {
//         setEmpCardLoading(true);
//         try {
//             const empData = await callSoapService(userData.clientURL, 'Get_Emp_BasicInfo', {
//                 EmpNo: userData.userEmployeeNo
//             });

//             if (empData.length > 0) {
//                 const empDataWithAvatar = empData.map(emp => ({
//                     ...emp,
//                     EMP_IMAGE: userData.userAvatar
//                 }));
//                 setRequestedEmp(empDataWithAvatar);
//             }
//         } catch (e) {
//             console.error('Failed to retrieve data:', e);
//             Alert.alert('Error', 'Failed to load employee data.');
//         } finally {
//             setEmpCardLoading(false);
//         }
//     };

//     const fetchImage = async (employee) => {
//         try {
//             const empImage = await callSoapService(userData.clientURL, 'getpic_bytearray', {
//                 EmpNo: employee.EMP_NO,
//             });
//             employee.avatar = empImage;
//         } catch (error) {
//             console.error('Failed to fetch image:', error);
//         }
//     };

//     useEffect(() => {
//         if (!selectedEmp || selectedEmp.length === 0) {
//             getEmpData();
//         } else {
//             setRequestedEmp(selectedEmp);
//         }
//     }, [selectedEmp]);

//     const handleChangePress = (item) => {
//         navigation.navigate('EmployeeList', {
//             onSelect: async (selectedEmployees) => {
//                 if (selectedEmployees.length !== 1) {
//                     Alert.alert('Please select only one employee.');
//                     return;
//                 }
//                 const employee = selectedEmployees[0];
//                 setEmpCardLoading(true);
//                 try {
//                     const empImage = await callSoapService(userData.clientURL, 'getpic_bytearray', {
//                         EmpNo: employee.EMP_NO,
//                     });
//                     //const cleanedImage = empImage.replace(/(\r\n|\n|\r)/gm, "");
//                     const updatedEmployee = {
//                         ...employee,
//                         EMP_IMAGE: empImage,
//                     };
//                     setRequestedEmp([updatedEmployee]);
//                 } catch (error) {
//                     console.error('Failed to fetch image:', error);
//                     Alert.alert('Error', 'Failed to fetch employee image.');
//                 } finally {
//                     setEmpCardLoading(false);
//                 }
//             }
//         });
//     };

//     return (
//         <View style={globalStyles.flex_1}>
//             {empCardLoading ? (
//                 <View style={styles.loaderContainer}>
//                     <ActivityIndicator size="large" color={colors.primary} />
//                 </View>
//             ) : (
//                 <FlatList
//                     data={requestedEmp}
//                     scrollEnabled={false}
//                     keyExtractor={(item) => item.EMP_NO.toString()}
//                     showsVerticalScrollIndicator={false}
//                     renderItem={({ item }) => (
//                         <View
//                             style={[styles.container, { backgroundColor: colors.card }]}
//                         >
//                             <Image
//                                 source={
//                                     item.EMP_IMAGE
//                                         ? {
//                                             uri: item.EMP_IMAGE.startsWith('data:image')
//                                                 ? item.EMP_IMAGE
//                                                 : `data:image/png;base64,${item.EMP_IMAGE.replace(/(\r\n|\n|\r)/gm, "")}`
//                                         }
//                                         : require('../../assets/images.png')
//                                 }
//                                 style={globalStyles.empImageInList}
//                             />
//                             <View style={styles.innerContainer}>
//                                 <Text style={[globalStyles.subtitle_3, { color: colors.primary }]}>{item.EMP_NO}</Text>
//                                 <Text
//                                     style={[globalStyles.subtitle_3, { flexShrink: 1 }]}
//                                     numberOfLines={2}
//                                     ellipsizeMode="tail"
//                                 >
//                                     {item.EMP_NAME}
//                                 </Text>
//                                 <Text style={globalStyles.small_text}>{item.DESIGNATION}</Text>
//                             </View>

//                             {showChangeButton && (
//                                 <TouchableOpacity
//                                     style={[styles.changeButton, { backgroundColor: colors.card }]}
//                                     onPress={() => handleChangePress(item)}
//                                 >
//                                     <FontAwesomeIcon6
//                                         name="pencil"
//                                         size={18}
//                                         color={colors.primary}
//                                     />
//                                     <Text style={[globalStyles.subtitle_4, { color: colors.primary }]}>Change</Text>
//                                 </TouchableOpacity>
//                             )}
//                         </View>
//                     )}
//                 />
//             )}
//         </View>
//     );
// };


// export default EmployeeListCard;

// const styles = StyleSheet.create({
//     loaderContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingVertical: 20,
//     },
//     container: {
//         flexDirection: 'row',
//         borderRadius: 15,
//         padding: 10,
//         marginBottom: 10,
//         alignItems: 'center',
//     },
//     innerContainer: {
//         flex: 1,
//         marginLeft: 10,
//         justifyContent: 'center',
//     },
//     changeButton: {
//         alignItems: 'center',
//         padding: 8,
//         borderRadius: 8,
//     },
// });
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { useAuth } from '../Context/AuthContext';
import FontAwesomeIcon6 from 'react-native-vector-icons/FontAwesome6';
import GenericListPopup from '../Modal/GenericListPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EmployeeListCard = ({ showChangeButton = true, onEmployeeChange }) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [empCardLoading, setEmpCardLoading] = useState(false);

    // selected employee (card)
    const [requestedEmp, setRequestedEmp] = useState([]);
    const { userData } = useAuth();

    // popup state
    const [popupVisible, setPopupVisible] = useState(false);
    const [allEmployees, setAllEmployees] = useState([]);

    // load employees from AsyncStorage
    const getEmpData = async () => {
        setEmpCardLoading(true);
        try {
            const storedData = await AsyncStorage.getItem('EmployeeList');
            const parsedData = storedData ? JSON.parse(storedData) : [];

            if (parsedData.length > 0) {
                // keep all employees for popup
                setAllEmployees(parsedData);

                // find logged-in employee
                const loginEmp = parsedData.find(
                    (emp) => emp.EMP_NO === userData.userEmployeeNo
                );

                if (loginEmp) {
                    setRequestedEmp([{
                        ...loginEmp,
                        EMP_IMAGE: userData.userAvatar, // from login
                    }]);

                    onEmployeeChange && onEmployeeChange(loginEmp);
                }
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
            Alert.alert('Error', 'Failed to load employee data.');
        } finally {
            setEmpCardLoading(false);
        }
    };

    useEffect(() => {
        getEmpData();
    }, []);

    // handle selecting employee from popup
    const handleEmployeeSelect = async (employee) => {
        setEmpCardLoading(true);
        setPopupVisible(false);
        try {
            const empImage = await callSoapService(userData.clientURL, 'getpic_bytearray', {
                EmpNo: employee.EMP_NO,
            });

            const updatedEmployee = {
                ...employee,
                EMP_IMAGE: empImage,
            };

            setRequestedEmp([updatedEmployee]);

            onEmployeeChange && onEmployeeChange(updatedEmployee);
        } catch (error) {
            console.error('Failed to fetch image:', error);
            Alert.alert('Error', 'Failed to fetch employee image.');
        } finally {
            setPopupVisible(false); // close popup
            setEmpCardLoading(false);
        }
    };

    return (
        <View style={globalStyles.flex_1}>
            {empCardLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={requestedEmp} // show only selected employee
                    scrollEnabled={false}
                    keyExtractor={(item) => item.EMP_NO.toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={[styles.container, { backgroundColor: colors.card }]}>
                            <Image
                                source={
                                    item.EMP_IMAGE
                                        ? {
                                            uri: item.EMP_IMAGE.startsWith('data:image')
                                                ? item.EMP_IMAGE
                                                : `data:image/png;base64,${item.EMP_IMAGE.replace(
                                                    /(\r\n|\n|\r)/gm,
                                                    '',
                                                )}`,
                                        }
                                        : require('../../assets/images.png')
                                }
                                style={globalStyles.empImageInList}
                            />
                            <View style={styles.innerContainer}>
                                <Text
                                    style={[globalStyles.subtitle_3, { color: colors.primary }]}>
                                    {item.EMP_NO}
                                </Text>
                                <Text
                                    style={[globalStyles.subtitle_3, { flexShrink: 1 }]}
                                    numberOfLines={2}
                                    ellipsizeMode="tail">
                                    {item.EMP_NAME}
                                </Text>
                                <Text style={globalStyles.small_text}>{item.DESIGNATION}</Text>
                            </View>

                            {showChangeButton && (
                                <TouchableOpacity
                                    style={[styles.changeButton, { backgroundColor: colors.card }]}
                                    onPress={() => setPopupVisible(true)}>
                                    <FontAwesomeIcon6
                                        name="pencil"
                                        size={18}
                                        color={colors.primary}
                                    />
                                    <Text
                                        style={[globalStyles.subtitle_4, { color: colors.primary }]}>
                                        Change
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                />
            )}

            {/* Popup with all employees */}
            <GenericListPopup
                visible={popupVisible}
                onClose={() => setPopupVisible(false)}
                onSelect={handleEmployeeSelect}
                data={allEmployees}
                mainLabelExtractor={(item) => item.EMP_NO}
                labelExtractor={null}
                subLabelExtractor={(item) => item.EMP_NAME}
                lastLabelExtractor={(item) => item.DESIGNATION}
                searchKeyExtractor={(item) =>
                    `${item.EMP_NO} ${item.EMP_NAME} ${item.DESIGNATION}`
                }
            />
        </View>
    );
};

export default EmployeeListCard;

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    container: {
        flexDirection: 'row',
        borderRadius: 15,
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    innerContainer: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    changeButton: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
    },
});