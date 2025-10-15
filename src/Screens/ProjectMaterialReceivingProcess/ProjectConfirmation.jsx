import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Button, Card, Chip } from "react-native-paper";
import Header from "../../Components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import BackgroundGradient from "../../Components/BackgroundGradient";

const ProjectConfirmation = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [securitySignature, setSecuritySignature] = useState(false);
  const [receiverSignature, setReceiverSignature] = useState(false);
  const [fileDocumentChecked, setFileDocumentChecked] = useState(false);

  const reportedQty = "50";
  const expectedQty = "90";
  const hasDiscrepancy = reportedQty !== expectedQty;

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="GRN & Project Confirmation" />

        <ScrollView
          contentContainerStyle={globalStyles.p_20}
        >
          <Card style={[globalStyles.globalCard, globalStyles.p_20]}>
            <Text style={[globalStyles.subtitle_2]}>System Entry Dashboard</Text>

            <Text style={[globalStyles.subtitle_3, globalStyles.mt_10]}>Verification Status</Text>
            <View style={[globalStyles.mt_10]}>
              <Chip
                mode="outlined"
                selected={securitySignature}
                icon={securitySignature ? "check" : "shield-outline"}
                onPress={() => setSecuritySignature(!securitySignature)}
                style={[globalStyles.mb_10, { borderColor: colors.primary }]}
                textStyle={globalStyles.subtitle_4}
                theme={theme}
              >
                Security Signature: {securitySignature ? "Vignesh M" : ""}
              </Chip>

              <Chip
                mode="outlined"
                selected={receiverSignature}
                icon={receiverSignature ? "check" : "account-outline"}
                onPress={() => setReceiverSignature(!receiverSignature)}
                style={{ borderColor: colors.primary }}
                textStyle={globalStyles.subtitle_4}
                theme={theme}
              >
                Receiver Signature: {receiverSignature ? "Manikkam D" : ""}
              </Chip>
            </View>

            <View style={[globalStyles.mt_10, { borderWidth: 1, borderColor: colors.gray, borderStyle: "dashed" }]} />

            <Text style={[globalStyles.subtitle_3, globalStyles.mt_5]}>Quantity Check</Text>
            <View style={[globalStyles.twoInputContainer, globalStyles.mt_10]}>
              <View style={globalStyles.container1}>
                <Text style={[globalStyles.subtitle_4]}>
                  Reported Qty - {" "}
                  <Text style={{ color: hasDiscrepancy ? colors.warning : colors.text }}>
                    {reportedQty}
                  </Text>
                </Text>
              </View>

              <View style={globalStyles.container2}>
                <Text style={[globalStyles.subtitle_4]}>
                  Expected Qty -{" "}
                  <Text style={{ color: hasDiscrepancy ? colors.error : colors.text }}>
                    {expectedQty}
                  </Text>
                </Text>
              </View>
            </View>

            {hasDiscrepancy && (
              <Text style={[globalStyles.subtitle_4, globalStyles.mt_10, { color: colors.error }]}>
                ⚠ Quantities do not match! Please verify before proceeding.
              </Text>
            )}
          </Card>

          {hasDiscrepancy && (
            <View
              style={[globalStyles.mt_10, globalStyles.bottomButtonContainer]}
            >
              <Button
                mode="contained"
                theme={theme}
                onPress={() => console.log("Email Project Head")}
                style={{ backgroundColor: colors.error }}
              >
                <Text style={[globalStyles.subtitle_4]}>
                  Email Project Head for Discrepancy
                </Text>
              </Button>
            </View>
          )}

          <View style={[globalStyles.mt_10, globalStyles.twoInputContainer, globalStyles.justifyEnd]}>
            <Chip
              mode="outlined"
              selected={fileDocumentChecked}
              icon={fileDocumentChecked ? "check" : "file-document-outline"}
              onPress={() => setFileDocumentChecked(!fileDocumentChecked)}
              style={{ borderColor: colors.success, width: "50%" }}
              textStyle={globalStyles.subtitle_4}
              theme={theme}
            >
              Mark File Document (Completed)
            </Chip>
          </View>

          <View style={[globalStyles.mt_10]}>
            <Button
              mode="contained"
              theme={theme}
              style={[globalStyles.mt_5, globalStyles.bottomButtonContainer, { backgroundColor: colors.success }]}
            >
              <Text style={globalStyles.subtitle_4}>
                Project Head Confirmation
              </Text>
            </Button>
          </View>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <Button
          mode="contained"
          theme={theme}
          style={globalStyles.bottomButtonContainer}
          onPress={() => console.log("Book GRN & Email Confirmation")}
        >
          <Text style={[globalStyles.subtitle_4]}>
            Book GRN & Email Confirmation
          </Text>
        </Button>
      </View>
    </BackgroundGradient>
  );
};

export default ProjectConfirmation;