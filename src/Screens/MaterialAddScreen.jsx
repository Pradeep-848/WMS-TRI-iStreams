import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import Header from '../Components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GlobalStyles } from '../Styles/styles';
import { useAuth } from '../Context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import MaterialListCard from '../Components/MaterialListCard';
import MaterialEditPopup from '../Components/MaterialEditPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundGradient from '../Components/BackgroundGradient';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { convertDataModelToStringData } from '../Utils/dataModelConverter';
import { formatDateForSQL } from '../Utils/dataTimeUtils';
import { useSnackbar } from '../Context/SnackbarContext';

const MaterialAddScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { showSnackbar } = useSnackbar();

    const [btnloading, setbtnLoading] = useState(false);
    const { projectDetails, entryDate, selectedBoq, requestedEmp,
        reqDate, priority, remarks, boqList } = route.params || {};
    const [selectedMaterial, setSelectedMaterial] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [currentMaterial, setCurrentMaterial] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isBoqPopupVisible, setBoqPopupVisible] = useState(false);
    const [overallRemarks, setOverallRemarks] = useState(remarks || '');;
    const [didLoad, setDidLoad] = useState(false);

    const [masterFormData, setMasterFormData] = useState({
        COMPANY_CODE: userData.companyCode,
        BRANCH_CODE: userData.branchCode,
        ISSUED_QTY: '',
        CANCELED_QTY: '',
        BALANCE_QTY: '',
        ELEMENT_NO: 0,
        VALUA_COMPONENT_NO: 0,
        PLANNING_SERIAL_NO: 0,
        BUDGET_QTY: '',
        BUDGET_QTY_PROJECT: '',
        CONSUMED_QTY: '',
        CONSUMED_QTY_PROJECT: '',
        BUDGET_BALANCE_QTY: '',
        BUDGET_BALANCE_QTY_PROJECT: '',
        ISSUE_FROM_STOCK_QTY: 0,
        PURCHASE_REQ_QTY: 0,
        QTY_IN_HAND: 0,
        QTY_IN_HAND_PROJECT: '',
        QTY_IN_HAND_BOQ: '',
        PURCHASE_BALANCE_QTY: '',
        PURCHASE_BALANCE_QTY_PROJECT: '',
        BUDGET_STATUS_DATE: '',
        CONSUMPTION_STATUS_DATE: '',
        STOCK_STATUS_DATE: '',
        APPROVAL_STATUS: '',
        IS_CLOSED: '',
        PURCHASE_ORDER_QTY: '',
        REF_DOC_CATEGORY: '',
        REF_DOCUMENT_NO: '',
        DMS_REF_SEQ_NO: '',
        REF_DOCUMENT_DMS_REF_SEQ_NO: '',
        PR_REQUISITION_NO: '',
        PR_REQUISITION_DATE: '',
        ORDER_NO: '',
        ORDER_DATE: '',
        PREVIOUS_MR_QTY: '',
        MR_UNORDERED_QTY: '',
        IS_APPROVED: 'F',
        APPROVAL_REMARKS: '',
        APPROVAL_OVERALL_REMARKS: '',
        PR_REQUISITION_SERIAL_NO: '',
        QTY_IN_HAND_OTHER_PROJECTS: '',
        QTY_IN_HAND_FREESTOCK: '',
        TRANSFER_QTY: 0,
        FORCE_CLOSED: '',
        APPROVED_DATE: '',
        UNAPPROVED_QTY: '',
    })

    const userName = userData.userName;
    const clientURL = userData.clientURL;
    const companyCode = userData.companyCode;
    const branchCode = userData.branchCode;

    useEffect(() => {
        const loadSelectedMaterials = async () => {
            try {
                const storedMaterials = await AsyncStorage.getItem('selectedMaterials');
                if (storedMaterials !== null) {
                    setSelectedMaterial(JSON.parse(storedMaterials));
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
            setSelectedMaterial([]);
        } catch (error) {
            console.error('Error clearing materials:', error);
        }
    };

    useEffect(() => {
        if (errorMessage) {
            Alert.alert('Error', errorMessage, [
                { text: 'OK', onPress: () => setErrorMessage('') }
            ]);
        }
    }, [errorMessage]);

    const handleMaterialPress = (material) => {
        setCurrentMaterial({
            ...material,
            Qty: material?.Qty ?? '1',
            RequiredDate: material?.RequiredDate ?? reqDate,
            Priority: material?.Priority ?? priority,
            Remarks: material?.Remarks ?? remarks,
            BOQRef: material?.BOQRef ?? selectedBoq,
        });
        setModalVisible(true);
    };

    const handleSelect = (newSelection) => {
        setSelectedMaterial(newSelection);
    };

    const saveMaterialEdit = () => {
        if (!currentMaterial) return;

        setSelectedMaterial((prev) =>
            prev.map((mat) =>
                mat.ITEM_CODE === currentMaterial.ITEM_CODE &&
                    mat.SUB_MATERIAL_NO === currentMaterial.SUB_MATERIAL_NO
                    ? { ...currentMaterial } // overwrite with edits
                    : mat
            )
        );
    };

    const handleDeleteMaterial = (item) => {
        setSelectedMaterial((prev) =>
            prev.filter(
                mat => mat.ITEM_CODE !== item.ITEM_CODE || mat.SUB_MATERIAL_NO !== item.SUB_MATERIAL_NO
            )
        );
    };

    // Step 1 - Get Requisition Number
    const getMR_Get_NewQuisitionNo = async () => {
        try {
            const RequisitionNo_Params = {
                CompanyCode: companyCode,
                BranchCode: branchCode,
                RequisitionDate: new Date().toISOString(),
            };

            const response = await callSoapService(
                userData.clientURL,
                "MR_Get_NewQuisitionNo",
                RequisitionNo_Params
            );

            if (response) return response;

            throw new Error("No response while fetching Requisition No.");
        } catch (error) {
            console.error("Error getting Requisition Number:", error);
            throw error;
        }
    };

    // Step 2 - Get MR Ref No
    const getMR_Get_MRRefNo = async (RequisitionNo) => {
        try {
            const MRRefNo_Params = {
                CompanyCode: companyCode,
                BranchCode: branchCode,
                RequisitionNo,
                RequisitionDate: new Date().toISOString(),
            };

            const response = await callSoapService(
                userData.clientURL,
                "MR_Convert_To_MRRefNo",
                MRRefNo_Params
            );

            if (response) return response;

            throw new Error("No response while fetching MR Ref No.");
        } catch (error) {
            console.error("Error getting MR Ref No:", error);
            throw error;
        }
    };

    const getMR_ApprovalStatus = async (RequisitionNo) => {
        try {
            const MRRefNo_Params = {
                CompanyCode: companyCode,
                BranchCode: branchCode,
                RequisitionNo,
                RequisitionDate: new Date().toISOString(),
            };

            const response = await callSoapService(
                userData.clientURL,
                "MR_GenerateApprovals",
                MRRefNo_Params
            );

            console.log("getMR_ApprovalStatus", response);

        } catch (error) {
            console.error("Error getting MR Ref No:", error);
            throw error;
        }
    };

    // Step 3 - Prepare Master Data
    const prepareMasterData = useCallback(
        (RequisitionNo, MRRefNo) => {
            return {
                ...masterFormData,
                COMPANY_CODE: companyCode,
                BRANCH_CODE: branchCode,
                REQUISITION_NO: RequisitionNo,
                MR_REF_NO: MRRefNo,
                REQUISITION_DATE: formatDateForSQL(entryDate),
                PROJECT_NO: projectDetails.split("-")[0].trim(),
                USER_NAME: userData.userName,
                EMP_NO: requestedEmp[0]?.EMP_NO,
                ENT_DATE: formatDateForSQL(entryDate),
            };
        },
        [masterFormData, entryDate, projectDetails, userData, requestedEmp]
    );

    // Step 4 - Prepare Detail Data
    const prepareDetailData = useCallback((item, masterData, index) => {
        return {
            COMPANY_CODE: masterData.COMPANY_CODE,
            BRANCH_CODE: masterData.BRANCH_CODE,
            REQUISITION_NO: masterData.REQUISITION_NO,
            REQUISITION_DATE: masterData.REQUISITION_DATE,
            EMP_NO: masterData.EMP_NO,
            PROJECT_NO: masterData.PROJECT_NO,
            SERIAL_NO: index + 1,
            ITEM_CODE: item.ITEM_CODE,
            QTY: item.Qty,
            REQUIRED_DATE: formatDateForSQL(item.RequiredDate),
            REMARKS: item.Remarks || "",
            USER_NAME: masterData.USER_NAME,
            ENT_DATE: masterData.ENT_DATE,
            UOM: item.UOM_STOCK || "",
            BOQ_NO: (item.BOQRef || selectedBoq || "").split("-")[0].trim(),
            KEY_VALUE: `COMPANY_CODE=${companyCode} AND BRANCH_CODE=${branchCode} AND REQUISITION_NO=${masterData.REQUISITION_NO}`,
            SUB_MATERIAL_NO: item.SUB_MATERIAL_NO || "",
            MR_REF_NO: masterData.MR_REF_NO,
            ITEM_NAME: item.ITEM_NAME,
        };
    }, []);

    // Step 5 - Save MR
    const SaveMR = async () => {
        setbtnLoading(true);

        if (!selectedMaterial || selectedMaterial.length === 0) {
            showSnackbar("Please add at least one material.", "warning");
            setbtnLoading(false);
            return;
        }

        if(!selectedMaterial.QTY) {
            showSnackbar("Essential fields are missing. Add Qty, Required Date and Remarks.", "warning");
            setbtnLoading(false);
            return;
        }
        try {
            // 1. Generate new requisition no
            const RequisitionNo = await getMR_Get_NewQuisitionNo();

            // 2. Generate MR Ref no
            const MRRefNo = await getMR_Get_MRRefNo(RequisitionNo);

            console.log("MRRefNo", MRRefNo);

            // 3. Build master data
            const masterData = prepareMasterData(RequisitionNo, MRRefNo);

            // 4. Build detail list
            const MRDataList = selectedMaterial.map((mat, index) =>
                prepareDetailData(mat, masterData, index)
            );

            for (let i = 0; i < MRDataList.length; i++) {

                const item = MRDataList[i];

                // 5. Convert into backend format
                const convertedDataModel = convertDataModelToStringData(
                    "INVT_MATERIAL_REQUISITION",
                    item
                );

                // 6. Call SOAP service
                const materialRequest_Parameter = {
                    UserName: userData.userName,
                    DModelData: convertedDataModel,
                };

                const response = await callSoapService(
                    userData.clientURL,
                    "DataModel_SaveData",
                    materialRequest_Parameter
                );

                if (response) {
                    if (response.includes("Error")) {
                        showSnackbar(response, "error");
                    }
                }

                const Approval_Status = await getMR_ApprovalStatus(RequisitionNo);

                console.log("Approval_Status", Approval_Status);
            }

            // Navigate on success
            navigation.navigate("MaterialSuccessScreen", {
                request: MRDataList, empName: requestedEmp[0]?.EMP_NAME,
                refSNo: MRRefNo,
                requiredDate: formatDateForSQL(reqDate)
            });

            // Clear state
            await clearSelectedMaterials();
            setSelectedMaterial([]);
        } catch (error) {
            showSnackbar(error.message, "error");
        } finally {
            setbtnLoading(false);
        }
    };

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Add Materials" />

                <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 5 }} />

                <Text style={[globalStyles.subtitle_2, globalStyles.my_5, { color: colors.primary }]}>{projectDetails}</Text>

                <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 5 }} />

                <View style={globalStyles.flex_1}>
                    <View>
                        <View style={[globalStyles.camButtonContainer, globalStyles.mt_5]}>
                            <Button
                                icon="plus"
                                mode="contained"
                                theme={{
                                    colors: {
                                        primary: colors.primary,
                                        disabled: colors.lightGray,
                                    }
                                }}
                                onPress={() =>
                                    navigation.navigate('MaterialList', {
                                        selectedMaterial: selectedMaterial, // pass current selection
                                        onSelect: handleSelect,
                                    })
                                }
                            >
                                Select Materials
                            </Button>
                        </View>

                        <View style={[globalStyles.twoInputContainer, globalStyles.my_5]}>
                            <Text style={[globalStyles.subtitle, { color: colors.text }]}>
                                Selected Materials
                            </Text>

                            {selectedMaterial.length > 0 && (
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
                    </View>

                    {/* FlatList scrolls only through materials */}
                    <FlatList
                        data={selectedMaterial}
                        keyExtractor={(item) => item.ITEM_CODE + item.SUB_MATERIAL_NO}
                        renderItem={({ item }) => (
                            <MaterialListCard
                                loading={loading}
                                selectedMaterial={[item]}
                                onPress={handleMaterialPress}
                                onDelete={(item) => handleDeleteMaterial(item)}
                            />
                        )}
                        ListEmptyComponent={
                            <Text style={[globalStyles.body, { padding: 10, textAlign: 'center' }]}>
                                No Materials selected.
                            </Text>
                        }
                    />
                </View>



                <View style={globalStyles.my_2}>
                    <TextInput
                        mode="outlined"
                        label="Remarks"
                        value={overallRemarks}
                        onChangeText={setOverallRemarks}
                        multiline
                        numberOfLines={2}
                        theme={theme}
                    />
                </View>

                <View style={globalStyles.bottomButtonContainer}>
                    <Button mode="contained"
                        onPress={SaveMR}
                        theme={{
                            colors: {
                                primary: colors.primary,
                                disabled: colors.lightGray,
                            }
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
                    isBoqPopupVisible={isBoqPopupVisible}
                    setBoqPopupVisible={setBoqPopupVisible}
                    boqList={boqList}
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
    );
};

export default MaterialAddScreen;