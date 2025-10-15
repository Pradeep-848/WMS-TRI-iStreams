import { StyleSheet, Text, View, ImageBackground, Image, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';
import Timeline from 'react-native-timeline-flatlist';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../Components/Header';
import { Button } from 'react-native-paper';
import MaterialMsgTimeLinePopup from '../Modal/MaterialMsgTimeLinePopup';
import { useAuth } from '../Context/AuthContext';
import BackgroundGradient from '../Components/BackgroundGradient';
import { callSoapService } from '../SoapRequestAPI/callSoapService';

const MaterialListTimeLine = ({ route }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { userData } = useAuth();

    const { MR_REF_NO, REQUIRED_DATE, REQUISITION_NO, REQUISITION_DATE, EMP_NAME } = route.params;
    const [isLoading, setIsLoading] = useState(false);

    const [currentStep, setCurrentStep] = useState();
    const [timelineData, setTimelineData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [lastStage, setLastStage] = useState("");

    const formatDate = (dateString) => {
        if (!dateString) return null;

        // Handle /Date(timestamp)/ format
        const match = dateString.match(/\/Date\((\d+)\)\//);
        if (match) {
            const timestamp = parseInt(match[1]);
            const date = new Date(timestamp);
            const day = String(date.getDate()).padStart(2, '0');
            const month = date.toLocaleString('en-US', { month: 'short' });
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }
        return dateString;
    };

    const mapResponseToTimeline = (mr) => {
        return [
            {
                id: 1,
                title: "QS Approved",
                description: "QS Approved",
                waitingDescription: "Waiting for approvals",
                date: formatDate(mr.QS_APPROVED_DATE),
                assignedBy: mr.QS_USER_NAME,
                status: mr.QS_STATUS ? "completed" : "upcoming",
            },
            {
                id: 2,
                title: "Procurement",
                description: "PO Issued to Supplier",
                waitingDescription: "Waiting for Release PO",
                date: formatDate(mr.PO_DATE),
                poNo: mr.PO_REF_NO,
                assignedBy: mr.PO_USER_NAME,
                status: mr.PO_STATUS ? "completed" : "upcoming",
            },
            {
                id: 3,
                title: "Supplier",
                description: "Delivered by Supplier",
                waitingDescription: "Awaiting for delivery",
                date: formatDate(mr.SUPPLIER_DATE),
                assignedBy: mr.SUPPLIER_NAME,
                status: mr.SUPPLIER_STATUS ? "completed" : "upcoming",
            },
            {
                id: 4,
                title: "Store",
                description: "Store Received",
                waitingDescription: "Awaiting for Supplier delivery",
                date: formatDate(mr.GRN_DATE),
                grnNo: mr.GRN_NO,
                assignedBy: mr.GRN_USER_NAME,
                status: mr.STORE_STATUS ? "completed" : "upcoming",
            },
            {
                id: 5,
                title: "Delivery to Site",
                description: "Issued to Site",
                waitingDescription: "Yet to Issue",
                date: formatDate(mr.GIN_DATE),
                refNo: mr.GIN_NO,
                assignedBy: mr.GIN_USER_NAME,
                status: mr.SITE_DELIVERY_STATUS ? "completed" : "upcoming",
            },
            {
                id: 6,
                title: "Received at Site",
                description: "Material Issued",
                waitingDescription: "Yet to Receive",
                date: null,
                assignedBy: null,
                status: "upcoming",
            },
        ];
    };

    const getStatus = (index) => {
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'current';
        return 'upcoming';
    };

    const getColor = (status) => {
        switch (status) {
            case 'completed': return colors.success;
            case 'current': return colors.warning;
            case 'upcoming': return colors.gray;
            default: return colors.textSecondary;
        }
    };

    useEffect(() => {
        fetchTimeline();
    }, []);

    const fetchTimeline = async () => {
        setIsLoading(true);
        try {
            const MR_TimeLine_Params = {
                CompanyCode: userData.companyCode,
                BranchCode: userData.branchCode,
                RequisitionNo: REQUISITION_NO,
                RequisitionDate: REQUISITION_DATE,
            };

            const response = await callSoapService(
                userData.clientURL,
                "MR_Get_MR_TimeLine",
                MR_TimeLine_Params
            );

            if (response && response.length > 0) {
                const mapped = mapResponseToTimeline(response[0]);

                // find first upcoming step → current step
                const firstUpcoming = mapped.findIndex((x) => x.status === "upcoming");
                setCurrentStep(firstUpcoming === -1 ? mapped.length : firstUpcoming);

                // assign colors based on current step
                const finalData = mapped.map((item, index) => {
                    const st = getStatus(index);
                    return {
                        ...item,
                        status: st,
                        circleColor: getColor(st),
                        lineColor: getColor(st),
                    };
                });

                setTimelineData(finalData);

                const lastCompleted = finalData.find((item) => item.status === "current");
                setLastStage(lastCompleted ? lastCompleted.title : "N/A");
            }
        } catch (err) {
            console.error("Failed to retrieve data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderDetail = (rowData) => {
        const iconMap = {
            'QS Approved': { icon: 'check-decagram', image: require('../../assets/timeLine/qs_approved.jpg') },
            'Procurement': { icon: 'file-document-outline', image: require('../../assets/timeLine/procurement.jpg') },
            'Supplier': { icon: 'account-details' },
            'Store': { icon: 'package-variant-closed', image: require('../../assets/timeLine/store.jpg') },
            'Delivery to Site': { icon: 'package-variant', image: require('../../assets/timeLine/delivery.jpg') },
            'Received at Site': { icon: 'truck-check', image: require('../../assets/timeLine/received.jpg') },
        };

        const titleText = rowData.status === 'completed' ? rowData.description : rowData.title;
        const showWaitingDescription = rowData.status !== 'completed';

        const isSupplierStep = rowData.title === 'Supplier';
        const isStoreStep = rowData.title === 'Store';

        return (
            <View
                style={{
                    backgroundColor: `${rowData.circleColor}22`,
                    borderLeftWidth: 4,
                    borderLeftColor: rowData.circleColor,
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                }}
            >
                <View style={{ flex: 1 }}>
                    <Text style={[globalStyles.subtitle_3, {
                        color: rowData.status === 'upcoming' ? colors.textSecondary : colors.text
                    }]}>
                        <MaterialCommunityIcons
                            name={iconMap[rowData.title]?.icon || 'circle-outline'}
                            size={20}
                            color={rowData.circleColor}
                            style={{ marginRight: 8 }}
                        />
                        {' '}{titleText}
                    </Text>

                    {showWaitingDescription && (
                        <Text style={[globalStyles.content2, {
                            color: rowData.status === 'current' ? colors.warning : colors.textSecondary,
                            marginTop: 4,
                            fontStyle: rowData.status === 'upcoming' ? 'italic' : 'normal',
                            fontSize: 12
                        }]}>
                            {rowData.waitingDescription}
                        </Text>
                    )}

                    {rowData.poNo && rowData.status === 'completed' && (
                        <Text style={[globalStyles.content2, { color: colors.textSecondary, marginTop: 4 }]}>
                            {rowData.poNo}
                        </Text>
                    )}

                    {rowData.grnNo && rowData.status === 'completed' && (
                        <Text style={[globalStyles.content2, { color: colors.textSecondary, marginTop: 4 }]}>
                            {rowData.grnNo}
                        </Text>
                    )}

                    {rowData.refNo && rowData.status === 'completed' && (
                        <Text style={[globalStyles.content2, { color: colors.textSecondary, marginTop: 4 }]}>
                            {rowData.refNo}
                        </Text>
                    )}

                    {!isSupplierStep && !isStoreStep && rowData.date && rowData.status === 'completed' && (
                        <Text style={[globalStyles.content2, { color: rowData.circleColor, marginTop: 4 }]}>
                            {rowData.date}
                        </Text>
                    )}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                    {isSupplierStep && rowData.date && (rowData.status === 'completed' || rowData.status === 'current') && (
                        <Text style={[globalStyles.content2, {
                            color: rowData.status === 'completed' ? rowData.circleColor : colors.textSecondary,
                            marginBottom: 4,
                            textAlign: 'right'
                        }]}>
                            {rowData.date}
                        </Text>
                    )}

                    {isStoreStep && (
                        <>
                            {rowData.date && (rowData.status === 'completed' || rowData.status === 'current') && (
                                <Text style={[globalStyles.content2, {
                                    color: rowData.circleColor,
                                    marginBottom: 4,
                                    textAlign: 'right'
                                }]}>
                                    {rowData.date}
                                </Text>
                            )}

                            {rowData.assignedBy && rowData.status === 'current' && (
                                <Text style={[globalStyles.subtitle_4, {
                                    color: colors.textSecondary,
                                    textAlign: 'right'
                                }]}>
                                    {rowData.assignedBy}
                                </Text>
                            )}
                        </>
                    )}

                    {rowData.status === 'completed' && !isSupplierStep && iconMap[rowData.title]?.image && (
                        <Image
                            source={iconMap[rowData.title].image}
                            style={[globalStyles.timeLineImage]}
                        />
                    )}

                    {rowData.assignedBy && rowData.status === 'completed' && (
                        <Text style={[globalStyles.subtitle_4, {
                            color: colors.textSecondary,
                            textAlign: 'right'
                        }]}>
                            {rowData.assignedBy}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title='Material List Timeline' navigationType='back' />

                <ImageBackground
                    source={require('../../assets/header_bg.jpg')}
                    style={styles.headerBackground}
                    imageStyle={{ borderRadius: 8 }}
                >
                    <View style={[globalStyles.twoInputContainer1, { padding: 6 }]}>
                        <View>
                            <Text style={[globalStyles.subtitle_4, { color: colors.white, fontWeight: '600', textAlign: 'center' }]}>
                                {/* MR RefNo. */}Req No.
                            </Text>
                            <Text style={[globalStyles.subtitle_2, { color: colors.white, textAlign: 'center' }]}>
                                {/* {MR_REF_NO} */}{REQUISITION_NO}
                            </Text>
                        </View>

                        <View>
                            <Text style={[globalStyles.subtitle_4, { color: colors.white, fontWeight: '600', textAlign: 'center' }]}>
                                <MaterialCommunityIcons name="card-account-details" size={15} />{' '} {EMP_NAME}
                            </Text>
                            <Text style={[globalStyles.subtitle_4, { color: colors.white, textAlign: 'center' }]}>
                                {/* {REQUIRED_DATE} */}{REQUISITION_DATE}
                            </Text>
                        </View>
                    </View>
                </ImageBackground>

                <Timeline
                    data={timelineData}
                    circleSize={10}
                    circleColor={colors.primary}
                    lineColor={colors.outline}
                    options={{ style: { padding: 12 } }}
                    renderDetail={renderDetail}
                    showTime={false}
                    isUsingFlatlist={true}
                    style={{ marginTop: 20, paddingHorizontal: 16 }}
                />

                <View style={[globalStyles.camButtonContainer, globalStyles.my_20]}>
                    <Button mode='contained' theme={theme} onPress={() => setModalVisible(true)}>
                        Follow up {' '}<MaterialCommunityIcons name="arrow-up-right" size={15} />
                    </Button>
                </View>

                <MaterialMsgTimeLinePopup
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    lastStage={lastStage}
                />
            </View>
        </BackgroundGradient>
    );
};

export default MaterialListTimeLine;

const styles = StyleSheet.create({
    headerBackground: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 8,
        padding: 12,
        overflow: 'hidden',
    },
    stageButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
});


// import { StyleSheet, Text, View, ImageBackground, Image, ScrollView, TouchableOpacity } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useTheme } from '../Context/ThemeContext';
// import { GlobalStyles } from '../Styles/styles';
// import Timeline from 'react-native-timeline-flatlist';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import Header from '../Components/Header';
// import { Button } from 'react-native-paper';
// import MaterialMsgTimeLinePopup from '../Modal/MaterialMsgTimeLinePopup';
// import { useAuth } from '../Context/AuthContext';
// import BackgroundGradient from '../Components/BackgroundGradient';

// const MaterialListTimeLine = ({ route }) => {
//     const insets = useSafeAreaInsets();
//     const { theme } = useTheme();
//     const colors = theme.colors;
//     const globalStyles = GlobalStyles(colors);
//     const { userData } = useAuth();

//     const { MR_REF_NO, REQUIRED_DATE, REQUISITION_NO, REQUISITION_DATE } = route.params;

//     console.log(REQUISITION_NO, REQUISITION_DATE);

//     const [isLoading, setIsLoading] = useState(false);

//     const [currentStep, setCurrentStep] = useState(1);
//     const [timelineData, setTimelineData] = useState([]);
//     const [modalVisible, setModalVisible] = useState(false);
//     const [lastStage, setLastStage] = useState("");

//     // Add this function to handle step changes
//     const gettimeLineData = async () => {
//         setIsLoading(true);
//         try {
//             const MR_TimeLine_Params = {
//                 CompanyCode: userData.companyCode,
//                 BranchCode: userData.branchCode,
//                 RequisitionNo: REQUISITION_NO,
//                 RequisitionDate: REQUISITION_DATE,
//             };

//             const response = await callSoapService(
//                 userData.clientURL,
//                 "MR_Get_MR_TimeLine",
//                 MR_TimeLine_Params
//             );

//             if (response !== null) {
//                 setMRRequestList(response);
//             }
//         } catch (e) {
//             console.error('Failed to retrieve data:', e);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const initialTimelineData = [
//         {
//             id: 1,
//             date: '13-Sep-2025',
//             title: 'QS Approved',
//             description: 'QS Approved',
//             waitingDescription: 'Waiting for approvals',
//             assignedBy: 'Gopinathan',
//             status: 'completed',
//         },
//         {
//             id: 2,
//             date: '14-Sep-2025',
//             title: 'Procurement',
//             description: 'PO Issued to Supplier',
//             waitingDescription: 'Waiting for Release PO',
//             poNo: 'PO#3434',
//             assignedBy: 'John Doe',
//             status: 'completed',
//         },
//         {
//             id: 3,
//             date: '14-Sep-2025',
//             title: 'Supplier',
//             description: 'Delivered by Supplier',
//             waitingDescription: 'Awaiting for delivery',
//             assignedBy: 'Abdul Razack',
//             status: 'completed',
//         },
//         {
//             id: 4,
//             date: '15-Sep-2025',
//             title: 'Store',
//             description: 'Store Received',
//             waitingDescription: 'Awaiting for Supplier delivery',
//             grnNo: 'GRN#2025/198',
//             assignedBy: 'Sowmya',
//             status: 'current',
//         },
//         {
//             id: 5,
//             date: '16-Sep-2025',
//             title: 'Delivery to Site',
//             description: 'Issued to Site',
//             waitingDescription: 'Yet to Issue',
//             refNo: 'DFG-1234',
//             assignedBy: 'Greese',
//             status: 'upcoming',
//         },
//         {
//             id: 6,
//             date: '16-Sep-2025',
//             title: 'Received at Site',
//             description: 'Material Issued',
//             waitingDescription: 'Yet to Receive',
//             assignedBy: 'Arafath',
//             status: 'upcoming',
//         },
//     ];

//     // Function to determine status
//     const getStatus = (index) => {
//         if (index < currentStep) return 'completed';
//         if (index === currentStep) return 'current';
//         return 'upcoming';
//     };

//     // Function to get color
//     const getColor = (status) => {
//         switch (status) {
//             case 'completed': return colors.success;
//             case 'current': return colors.warning;
//             case 'upcoming': return colors.gray;
//             default: return colors.textSecondary;
//         }
//     };

//     useEffect(() => {
//         const updatedData = initialTimelineData.map((item, index) => {
//             const stepIndex = index + 1; // since stages are 1–6
//             return {
//                 ...item,
//                 status: getStatus(stepIndex),
//                 circleColor: getColor(getStatus(stepIndex)),
//                 lineColor: getColor(getStatus(stepIndex)),
//             };
//         });

//         setTimelineData(updatedData);

//         const lastCompleted = updatedData.find((item) => item.status === "current");
//         setLastStage(lastCompleted ? lastCompleted.title : "N/A");
//     }, [currentStep]);


//     const renderDetail = (rowData) => {
//         const iconMap = {
//             'QS Approved': { icon: 'check-decagram', image: require('../../assets/timeLine/qs_approved.jpg') },
//             'Procurement': { icon: 'file-document-outline', image: require('../../assets/timeLine/procurement.jpg') },
//             'Supplier': { icon: 'account-details' }, // No image for supplier
//             'Store': { icon: 'package-variant-closed', image: require('../../assets/timeLine/store.jpg') },
//             'Delivery to Site': { icon: 'package-variant', image: require('../../assets/timeLine/delivery.jpg') },
//             'Received at Site': { icon: 'truck-check', image: require('../../assets/timeLine/received.jpg') },
//         };

//         const titleText = rowData.status === 'completed' ? rowData.description : rowData.title;
//         const showWaitingDescription = rowData.status !== 'completed';

//         const isSupplierStep = rowData.title === 'Supplier';
//         const isStoreStep = rowData.title === 'Store';

//         return (
//             <View
//                 style={{
//                     backgroundColor: `${rowData.circleColor}22`,
//                     borderLeftWidth: 4,
//                     borderLeftColor: rowData.circleColor,
//                     padding: 10,
//                     borderRadius: 8,
//                     marginBottom: 12,
//                     flexDirection: 'row',
//                     justifyContent: 'space-between',
//                     alignItems: 'flex-start',
//                 }}
//             >
//                 <View style={{ flex: 1 }}>
//                     <Text style={[globalStyles.subtitle_3, {
//                         color: rowData.status === 'upcoming' ? colors.textSecondary : colors.text
//                     }]}>
//                         <MaterialCommunityIcons
//                             name={iconMap[rowData.title]?.icon || 'circle-outline'}
//                             size={20}
//                             color={rowData.circleColor}
//                             style={{ marginRight: 8 }}
//                         />
//                         {' '}{titleText}
//                     </Text>

//                     {showWaitingDescription && (
//                         <Text style={[globalStyles.content2, {
//                             color: rowData.status === 'current' ? colors.warning : colors.textSecondary,
//                             marginTop: 4,
//                             fontStyle: rowData.status === 'upcoming' ? 'italic' : 'normal',
//                             fontSize: 12
//                         }]}>
//                             {rowData.waitingDescription}
//                         </Text>
//                     )}

//                     {rowData.poNo && rowData.status === 'completed' && (
//                         <Text style={[globalStyles.content2, { color: colors.textSecondary, marginTop: 4 }]}>
//                             {rowData.poNo}
//                         </Text>
//                     )}

//                     {rowData.grnNo && rowData.status === 'completed' && (
//                         <Text style={[globalStyles.content2, { color: colors.textSecondary, marginTop: 4 }]}>
//                             {rowData.grnNo}
//                         </Text>
//                     )}

//                     {rowData.refNo && rowData.status === 'completed' && (
//                         <Text style={[globalStyles.content2, { color: colors.textSecondary, marginTop: 4 }]}>
//                             {rowData.refNo}
//                         </Text>
//                     )}

//                     {/* Left-side date → only if NOT Supplier or Store */}
//                     {!isSupplierStep && !isStoreStep && rowData.date && rowData.status === 'completed' && (
//                         <Text style={[globalStyles.content2, { color: rowData.circleColor, marginTop: 4 }]}>
//                             {rowData.date}
//                         </Text>
//                     )}
//                 </View>

//                 <View style={{ alignItems: 'flex-end' }}>
//                     {/* For Supplier step only, show date on the right side top - for both completed and current states */}
//                     {isSupplierStep && rowData.date && (rowData.status === 'completed' || rowData.status === 'current') && (
//                         <Text style={[globalStyles.content2, {
//                             color: rowData.status === 'completed' ? rowData.circleColor : colors.textSecondary,
//                             marginBottom: 4,
//                             textAlign: 'right'
//                         }]}>
//                             {rowData.date}
//                         </Text>
//                     )}

//                     {/* Store special handling */}
//                     {isStoreStep && (
//                         <>
//                             {/* Right side if completed OR current */}
//                             {rowData.date && (rowData.status === 'completed' || rowData.status === 'current') && (
//                                 <Text style={[globalStyles.content2, {
//                                     color: rowData.circleColor,
//                                     marginBottom: 4,
//                                     textAlign: 'right'
//                                 }]}>
//                                     {rowData.date}
//                                 </Text>
//                             )}

//                             {/* Show assignedBy also if current */}
//                             {rowData.assignedBy && rowData.status === 'current' && (
//                                 <Text style={[globalStyles.subtitle_4, {
//                                     color: colors.textSecondary,
//                                     textAlign: 'right'
//                                 }]}>
//                                     {rowData.assignedBy}
//                                 </Text>
//                             )}
//                         </>
//                     )}

//                     {rowData.status === 'completed' && !isSupplierStep && iconMap[rowData.title]?.image && (
//                         <Image
//                             source={iconMap[rowData.title].image}
//                             style={[globalStyles.timeLineImage]}
//                         />
//                     )}

//                     {rowData.assignedBy && rowData.status === 'completed' && (
//                         <Text style={[globalStyles.subtitle_4, {
//                             color: colors.textSecondary,
//                             textAlign: 'right'
//                         }]}>
//                             {rowData.assignedBy}
//                         </Text>
//                     )}
//                 </View>
//             </View>
//         );
//     };

//     return (
//         <BackgroundGradient>
//             <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
//                 <Header title='Material List Timeline' navigationType='back' />

//                 <ImageBackground
//                     source={require('../../assets/header_bg.jpg')}
//                     style={styles.headerBackground}
//                     imageStyle={{ borderRadius: 8 }}
//                 >
//                     <View style={[globalStyles.twoInputContainer1, { padding: 6 }]}>
//                         <View>
//                             <Text style={[globalStyles.subtitle_4, { color: colors.white, fontWeight: '600', textAlign: 'center' }]}>
//                                 MR RefNo.
//                             </Text>
//                             <Text style={[globalStyles.subtitle_2, { color: colors.white, textAlign: 'center' }]}>
//                                 {MR_REF_NO}
//                             </Text>
//                         </View>

//                         <View>
//                             <Text style={[globalStyles.subtitle_4, { color: colors.white, fontWeight: '600', textAlign: 'center' }]}>
//                                 <MaterialCommunityIcons name="card-account-details" size={15} />{' '} {userData.userName}
//                             </Text>
//                             <Text style={[globalStyles.subtitle_4, { color: colors.white, textAlign: 'center' }]}>
//                                 {REQUIRED_DATE}
//                             </Text>
//                         </View>
//                     </View>
//                 </ImageBackground>

//                 <Timeline
//                     data={timelineData}
//                     circleSize={10}
//                     circleColor={colors.primary}
//                     lineColor={colors.outline}
//                     options={{ style: { padding: 12 } }}
//                     renderDetail={renderDetail}
//                     showTime={false}
//                     isUsingFlatlist={true}
//                     style={{ marginTop: 20, paddingHorizontal: 16 }}
//                 />

//                 <View style={[globalStyles.camButtonContainer, globalStyles.my_20]}>
//                     <Button mode='contained' theme={theme} onPress={() => setModalVisible(true)}>
//                         Follow up {' '}<MaterialCommunityIcons name="arrow-up-right" size={15} />
//                     </Button>
//                 </View>
//                 {/* Follow Up Modal */}
//                 <MaterialMsgTimeLinePopup
//                     visible={modalVisible}
//                     onClose={() => setModalVisible(false)}
//                     lastStage={lastStage}
//                 />
//             </View>
//         </BackgroundGradient>
//     );
// };

// export default MaterialListTimeLine;

// const styles = StyleSheet.create({
//     headerBackground: {
//         marginHorizontal: 16,
//         marginTop: 12,
//         borderRadius: 8,
//         padding: 12,
//         overflow: 'hidden',
//     },
//     stageButton: {
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderRadius: 20,
//         borderWidth: 1,
//         marginRight: 8,
//     },
// });