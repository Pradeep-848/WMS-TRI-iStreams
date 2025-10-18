import React from "react";
import { View, Text, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import BackgroundGradient from "../../Components/BackgroundGradient";
import Timeline from 'react-native-timeline-flatlist';
import PdfComponent from "../../Components/PdfComponent";
import { displayLocalNotification } from "../../Utils/notificationUtils";

const GrnDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  // Timeline data for verification checklist
  const timelineData = [
    {
      time: '',
      title: 'Quantities Match LPO',
      description: 'Verify received quantities match purchase order',
      circleColor: colors.success,
      lineColor: colors.success,
      icon: 'checkmark-circle-outline',
      status: 'completed'
    },
    {
      time: '',
      title: 'Documents Uploaded',
      circleColor: colors.success,
      lineColor: colors.success,
      icon: 'document-outline',
      status: 'completed'
    },
    {
      time: '',
      title: 'Material Photos Reviewed',
      circleColor: colors.warning,
      lineColor: colors.gray,
      icon: 'camera-outline',
      status: 'in-progress'
    },
    {
      time: '',
      title: 'Quality Inspection Completed',
      circleColor: colors.gray,
      lineColor: colors.gray,
      icon: 'shield-checkmark-outline',
      status: 'pending'
    }
  ];

  // Custom renderer for timeline items
  const renderDetail = (rowData) => {
    let title = <Text style={[globalStyles.subtitle_3, { color: colors.text, marginBottom: 5 }]}>{rowData.title}</Text>;
    let desc = rowData.description ? (
      <Text style={[globalStyles.subtitle_4, { color: colors.gray }]}>{rowData.description}</Text>
    ) : null;

    return (
      <View style={[globalStyles.flex_1, globalStyles.p_10, globalStyles.borderRadius_10, globalStyles.mb_10, { backgroundColor: colors.background }]}>
        {title}
        {desc}
        <View style={[globalStyles.twoInputContainer, globalStyles.mt_5]}>
          <Ionicons
            name={rowData.status === 'completed' ? 'checkmark-circle' :
              rowData.status === 'in-progress' ? 'time' : 'ellipse-outline'}
            size={16}
            color={rowData.status === 'completed' ? colors.success :
              rowData.status === 'in-progress' ? colors.warning : colors.gray}
          />
          <Text style={[globalStyles.subtitle_4, {
            color: rowData.status === 'completed' ? colors.success :
              rowData.status === 'in-progress' ? colors.warning : colors.gray,
            marginLeft: 5
          }]}>
            {rowData.status === 'completed' ? 'Completed' :
              rowData.status === 'in-progress' ? 'In Progress' : 'Pending'}
          </Text>
        </View>
      </View>
    );
  };

  // Custom icon renderer
  const renderEvent = (rowData) => {
    let iconColor = rowData.circleColor;
    let iconName = rowData.icon;

    return (
      <View style={[globalStyles.justifyContentCenter, globalStyles.alignItemsCenter, globalStyles.borderRadius_10, {
        width: 24,
        height: 24,
        backgroundColor: iconColor,
      }]}>
        <Ionicons
          name={iconName}
          size={16}
          color={colors.white}
        />
      </View>
    );
  };

  const handleProceed = () => {
    const title = '✅ GRN Completed';
    const body = 'Ready for Putaway';
    displayLocalNotification(title, body);
  };

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>

        <Header title="GRN Details" />

        <View style={globalStyles.twoInputContainer1}>
          {/* GRN Number */}
          <View style={[globalStyles.container1]}>
            <Text style={[globalStyles.subtitle_3, { color: colors.gray }]}>GRN</Text>
            <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>GRN-2130423902</Text>
          </View>

          {/* Status */}
          <View style={[globalStyles.container2]}>
            <Text style={[globalStyles.subtitle_3, { color: colors.gray }]}>Status</Text>
            <Text style={[globalStyles.subtitle_2, { color: colors.warning }]}>Pending Approval</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Timeline Component */}
          <View style={[globalStyles.globalCard, globalStyles.mt_10]}>
            <Text style={[globalStyles.subtitle_2, globalStyles.txt_center, { color: colors.primary }]}>Verification Checklist</Text>

            <Timeline
              data={timelineData}
              circleSize={10}
              circleColor={colors.primary}
              lineColor={colors.outline}
              renderDetail={renderDetail}
              renderEvent={renderEvent}
              showTime={false}
              options={{
                scrollEnabled: false,
                style: { padding: 12 }
              }}
            />
          </View>

          <View style={[globalStyles.globalCard, globalStyles.mt_5]}>
            <Text style={[globalStyles.subtitle_2, globalStyles.ml_5, globalStyles.txt_center, globalStyles.mb_5, { color: colors.primary }]}>Digital Signatures</Text>

            <View style={[globalStyles.twoInputContainer, globalStyles.p_10, globalStyles.justifySpaceBetween]}>
              <Text style={globalStyles.subtitle_3}>Security Sign</Text>
              <Text style={globalStyles.subtitle_3}>Receiver Sign</Text>
              <Text style={globalStyles.subtitle_3}>Approver Sign</Text>
            </View>

            <View style={[globalStyles.twoInputContainer, globalStyles.p_10, globalStyles.justifySpaceBetween]}>
              <Text style={[globalStyles.subtitle_3, { color: colors.gray }]}>Joseph K</Text>
              <Text style={[globalStyles.subtitle_3, { color: colors.gray }]}>Lincoln</Text>
              <Text style={[globalStyles.subtitle_3, { color: colors.gray }]}>Manikkam</Text>
            </View>
          </View>
        </ScrollView>

        <PdfComponent
          colors={colors}
          globalStyles={globalStyles}
          theme={theme}
          label="Upload GRN PDF"
        />

        {/* Submit Button */}
        <Button
          mode="contained"
          theme={theme}
          icon={"file"}
          textColor={colors.white}
          style={globalStyles.bottomButtonContainer}
          onPress={handleProceed}
        >
          Proceed
        </Button>
      </View>
    </BackgroundGradient>
  );
};

export default GrnDetailsScreen;