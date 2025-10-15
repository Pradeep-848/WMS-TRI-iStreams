import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, Card, Text, Chip } from 'react-native-paper';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../Context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackgroundGradient from '../Components/BackgroundGradient';
import { parseSoapDateintoIstFormat } from '../Utils/dataTimeUtils';
import { callSoapService } from '../SoapRequestAPI/callSoapService';

const MaterialRequestList = ({ route, onBack }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);
  const { REQUISITION_NO, REQUISITION_DATE } = route.params || {};
  const { userData } = useAuth();

  console.log(REQUISITION_NO, REQUISITION_DATE);
  

  const [mrRequestList, setMRRequestList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getMR_Details();
  }, []);

  const getMR_Details = async () => {
    setIsLoading(true);
    try {
      const MR_Details_Params = {
        CompanyCode: userData.companyCode,
        BranchCode: userData.branchCode,
        RequisitionNo: REQUISITION_NO,
        RequisitionDate: REQUISITION_DATE,
      };

      const response = await callSoapService(
        userData.clientURL,
        "MR_Get_MR_Details",
        MR_Details_Params
      );

      if (response !== null) {
        setMRRequestList(response);
      }
    } catch (e) {
      console.error('Failed to retrieve data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedData = useMemo(() => {
    const groups = {};
    mrRequestList.forEach(item => {
      if (!groups[item.REQUISITION_NO]) {
        groups[item.REQUISITION_NO] = {
          MR_REF_NO: item.MR_REF_NO,
          MR_STATUS: item.MR_STATUS,
          EMP_NAME: item.EMP_NAME,
          REQUISITION_NO: item.REQUISITION_NO,
          PROJECT_NO: item.PROJECT_NO,
          PROJECT_NAME: item.PROJECT_NAME,
          REQUIRED_DATE: parseSoapDateintoIstFormat(item.REQUIRED_DATE),
          REQUISITION_DATE: parseSoapDateintoIstFormat(item.REQUISITION_DATE),
          items: []
        };
      }
      groups[item.REQUISITION_NO].items.push(item);
    });
    return Object.values(groups);
  }, [mrRequestList]);

  // Common Header Card Component
  const MRHeaderCard = ({ mrData }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'approved': return colors.success || '#4CAF50';
        case 'pending': return colors.warning || '#FF9800';
        case 'rejected': return colors.error || '#F44336';
        default: return colors.primary;
      }
    };

    return (
      <Card style={[globalStyles.borderRadius_15, globalStyles.my_10, { backgroundColor: colors.card1 }]} elevation={2}>
        <Card.Content>
          <View style={[globalStyles.twoInputContainer1, globalStyles.mb_5]}>
            <Text style={[globalStyles.subtitle_3, globalStyles.flex_1, { color: colors.primary }]}>
              {mrData.MR_REF_NO}
            </Text>
            <View style={[globalStyles.twoInputContainer, globalStyles.alignItemsCenter]}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color={colors.text} />
              <Text style={[globalStyles.subtitle_3, globalStyles.ml_5]}>
                {mrData.REQUISITION_DATE}
              </Text>
            </View>
          </View>

          <View style={[globalStyles.twoInputContainer1, globalStyles.mb_5]}>
            <Text style={[globalStyles.subtitle_3, globalStyles.flex_1, { color: colors.primary }]}>
              REF NO : {mrData.REQUISITION_NO}
            </Text>
            <Chip
              mode="outlined"
              compact
              textStyle={[globalStyles.subtitle_5, globalStyles.justalignCenter, {
                lineHeight: 12
              }]}
              style={{
                backgroundColor: getStatusColor(mrData.MR_STATUS) + '15',
                borderColor: getStatusColor(mrData.MR_STATUS),
                height: 28,         // enough height for text
                justifyContent: 'center',
              }}
            >
              {mrData.MR_STATUS}
            </Chip>

          </View>

          <Text style={[globalStyles.subtitle_4, globalStyles.my_5]}>
            Requested By: {mrData.EMP_NAME}
          </Text>

          <Text style={[globalStyles.subtitle_4, globalStyles.mb_5]}>
            Project Name:
            <Text style={[globalStyles.subtitle_4, { color: colors.primary }]}> {mrData.PROJECT_NO} - {mrData.PROJECT_NAME} </Text>
          </Text>

          <Text style={[globalStyles.subtitle_4]}>
            Required By: {mrData.REQUIRED_DATE}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  // Individual Item Card Component
  const ItemCard = ({ item, index }) => {
    const getApprovalStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'approved': return colors.success || '#4CAF50';
        case 'pending': return colors.warning || '#FF9800';
        case 'rejected': return colors.error || '#F44336';
        default: return colors.text;
      }
    };

    return (
      <Card style={[globalStyles.borderRadius_10, globalStyles.mb_5, { backgroundColor: colors.card }]} elevation={1}>
        <Card.Content>
          <View style={globalStyles.twoInputContainer1}>
            <Text style={[globalStyles.subtitle_3]}>
              {item.ITEM_CODE} - {item.SUB_MATERIAL_NO}
            </Text>
            <Chip
              mode="outlined"
              compact
              textStyle={[globalStyles.subtitle_5, globalStyles.justalignCenter, {
                lineHeight: 12, color: getApprovalStatusColor(item.APPROVAL_STATUS)
              }]}
              style={{
                backgroundColor: getApprovalStatusColor(item.APPROVAL_STATUS) + '15',
                borderColor: getApprovalStatusColor(item.APPROVAL_STATUS),
                height: 28,         // enough height for text
                justifyContent: 'center',
              }}
            >
              {item.APPROVAL_STATUS}
            </Chip>
          </View>

          <View>
            <Text style={[globalStyles.subtitle_3]}>
              {item.ITEM_NAME}
            </Text>

            <View style={globalStyles.twoInputContainer1}>
              <Text style={[globalStyles.subtitle_4, globalStyles.flex_1]}>
                {item.REMARKS}
              </Text>
              <View style={[globalStyles.twoInputContainer, globalStyles.justifyEnd]}>
                <View style={[globalStyles.twoInputContainer1, globalStyles.px_10,
                globalStyles.borderRadius_15, { backgroundColor: '#E8F5E8', paddingVertical: 3 }]}>
                  <MaterialCommunityIcons name="package-variant" size={14} color={colors.primary} />
                  <Text style={[globalStyles.subtitle_4, { color: colors.primary }]}>
                    {item.QTY} {item.UOM}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Main MR Group Component
  const MRGroupCard = ({ item }) => (
    <View>
      {/* Header Card */}
      <MRHeaderCard mrData={item} />

      {/* Items Section */}


      {item.items.map((subItem, index) => (
        <ItemCard key={subItem.SERIAL_NO} item={subItem} index={index} />
      ))}
    </View>
  );

  // return (
  //   <BackgroundGradient>
  //     <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
  //       <Header title="Material Requests" navigationType="back" />

  //       {isLoading ? (
  //         <View style={[globalStyles.flex_1, globalStyles.justalignCenter]}>
  //           <ActivityIndicator size="large" color={colors.primary} />
  //           <Text style={[globalStyles.subtitle_2, globalStyles.mt_10]}>
  //             Loading requests...
  //           </Text>
  //         </View>
  //       ) : (
  //         groupedData.length > 0 && (
  //           <>
  //             {/* Fixed (non-scrollable) MR Header Card */}
  //             <MRHeaderCard mrData={groupedData[0]} />

  //             <View>
  //               <Text style={[globalStyles.subtitle_2, globalStyles.my_5]}>
  //                 Items ({groupedData[0].items.length})
  //               </Text>
  //             </View>

  //             {/* Scrollable Items List */}
  //             <FlatList
  //               data={groupedData[0].items} // only the items part
  //               renderItem={({ item, index }) => (
  //                 <ItemCard item={item} index={index} />
  //               )}
  //               keyExtractor={(item) => item.SERIAL_NO.toString()}
  //               contentContainerStyle={[
  //                 globalStyles.mt_10,
  //                 globalStyles.px_5,
  //                 { paddingBottom: 40 },
  //               ]}
  //               showsVerticalScrollIndicator={false}
  //             />
  //           </>
  //         )
  //       )}
  //     </View>
  //   </BackgroundGradient>
  // );

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="Material Requests" navigationType="back" />

        {isLoading ? (
          <View style={[globalStyles.flex_1, globalStyles.justalignCenter]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[globalStyles.subtitle_2, globalStyles.mt_10]}>
              Loading requests...
            </Text>
          </View>
        ) : groupedData.length > 0 ? (
          <>
            {/* Fixed (non-scrollable) MR Header Card */}
            <MRHeaderCard mrData={groupedData[0]} />

            <View>
              <Text style={[globalStyles.subtitle_2, globalStyles.my_5]}>
                Items ({groupedData[0].items.length})
              </Text>
            </View>

            {/* Scrollable Items List */}
            <FlatList
              data={groupedData[0].items} // only the items part
              renderItem={({ item, index }) => <ItemCard item={item} index={index} />}
              keyExtractor={(item) => item.SERIAL_NO.toString()}
              contentContainerStyle={[
                globalStyles.mt_10,
                globalStyles.px_5,
                { paddingBottom: 40 },
              ]}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <View style={[globalStyles.flex_1, globalStyles.justalignCenter]}>
            <MaterialCommunityIcons name="inbox-outline" size={50} color={colors.disabled} />
            <Text style={[globalStyles.subtitle_2, { color: colors.disabled, marginTop: 16 }]}>
              No requests found.
            </Text>
            <Text style={[globalStyles.subtitle_4, { color: colors.disabled, marginTop: 4 }]}>
              Try adjusting your filters
            </Text>
          </View>
        )}
      </View>
    </BackgroundGradient>
  );

};


export default MaterialRequestList;