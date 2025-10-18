import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet, Alert, Modal } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from "../../Components/Header";
import { useTheme } from "../../Context/ThemeContext";
import { GlobalStyles } from "../../Styles/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button, Card, AnimatedFAB } from "react-native-paper";
import BackgroundGradient from "../../Components/BackgroundGradient";
import GenericListPopup from "../../Modal/GenericListPopup";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MaterialIssueListScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  //Project Selection
  const [projectNo, setProjectNo] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectList, setprojectList] = useState([]);
  const [formData, setFormData] = useState({});

  const [modalVisible, setModalVisible] = useState(false);

  const [filteredData, setFilteredData] = useState([]);

  const [isPopupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    getProjectData();
    setFilteredData([
      { projectName: "bridge construction", checked: false },
      { projectName: "Balmoral Services", checked: false },
    ]);
  }, []);

  const getProjectData = async () => {
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

  const handleProjectSelect = (project) => {
    setProjectNo(project.PROJECT_NO);
    setProjectName(project.PROJECT_NAME);
    setFormData(prev => ({
      ...prev,
      PROJECT_NO: project.PROJECT_NO,
      PROJECT_NAME: project.PROJECT_NAME
    }));
    setPopupVisible(false);
  };

  const renderRequestCard = ({ item, index }) => {
    return (
      <View style={[globalStyles.my_5]}>
        <Card style={{ backgroundColor: colors.card }}>
          <Card.Content>
            {/* Top Row — Project Name */}
            <View>
              <Text style={[globalStyles.subtitle_3, { color: colors.primary }]}>
                {item.projectName || "MS Rod 16mm"}
              </Text>
            </View>

            {/* Divider */}
            <View style={[globalStyles.mt_5, { height: 1, backgroundColor: colors.outline }]} />

            {/* Bottom Row — Date & Status */}
            <View style={[globalStyles.twoInputContainer, globalStyles.mt_5]}>
              <View>
                <Text style={globalStyles.subtitle_4}>
                  Date : {" "}
                  <Text style={{ color: colors.success }}>
                    08-Sep-2025
                  </Text>
                </Text>
              </View>

              <View style={globalStyles.twoInputContainer1}>
                <View style={[styles.statusBadge, { backgroundColor: colors.surface, borderColor: 'grey' }]}>
                  <Text style={[globalStyles.subtitle_4, { fontSize: 10 }]}>
                    Pending
                  </Text>
                </View>

                <View>
                  <TouchableOpacity
                    style={[styles.statusBadge, { backgroundColor: colors.surface, borderColor: 'grey' }]}
                  >
                    <Text style={[globalStyles.subtitle_4, { color: colors.primary, fontSize: 10 }]}>
                      <Icon name="eye" size={15} /> View
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
          <Header title="Material Issue List" />

          <View>
            <TextInput
              mode="outlined"
              label="Project Name"
              theme={theme}
              onPressIn={() => setPopupVisible(true)}
              value={formData.PROJECT_NAME}
              onChangeText={text => handleChange('PROJECT_NAME', text)}
              style={globalStyles.height_45}
              placeholder="Enter Project Name"
              showSoftInputOnFocus={false}
            />

            <FlatList
              data={filteredData}
              renderItem={renderRequestCard}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={[globalStyles.alignItemsCenter]}>
                  <Icon name="inbox-outline" size={50} color={colors.disabled} />
                  <Text style={[globalStyles.subtitle_2, { color: colors.disabled, marginTop: 16 }]}>
                    No Items found.
                  </Text>
                </View>
              }
            />
          </View>

          <AnimatedFAB
            icon="plus"
            color={colors.white}
            style={[globalStyles.fab, { backgroundColor: colors.primary }]}
            onPress={() => { setModalVisible(true) }}
          />
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={[globalStyles.flex_1, globalStyles.justalignCenter, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[globalStyles.twoInputContainer]}>
              <Text style={[globalStyles.subtitle_2, { marginBottom: 10 }]}>
                Create Material Issue
              </Text>

              <Icon name="close" size={20} color={colors.error} onPress={() => setModalVisible(false)} />
            </View>

            <TextInput
              mode="outlined"
              theme={theme}
              label="Project"
              value={formData.PROJECT_NAME}
              style={[globalStyles.height_45, globalStyles.mb_10]}
              onPressIn={() => setPopupVisible(true)}
              showSoftInputOnFocus={false}
            />

            <TextInput
              mode="outlined"
              label="Date"
              value={new Date().toLocaleDateString()}
              editable={false}
              style={[globalStyles.height_45, globalStyles.mb_10]}
              theme={theme}
            />

            <TextInput
              mode="outlined"
              label="Remarks"
              placeholder="Enter remarks"
              style={[globalStyles.height_45, globalStyles.mb_10]}
              theme={theme}
            />

            <View style={[globalStyles.twoInputContainer, globalStyles.mt_10, globalStyles.justifyEnd]}>
              <Button
                mode="contained"
                theme={theme}
                textColor={colors.white}
                onPress={() => {
                  setModalVisible(false);
                  // proceed to next screen (e.g. Material Issue Details)
                }}
              >
                Create
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <GenericListPopup
        visible={isPopupVisible}
        onClose={() => setPopupVisible(false)}
        onSelect={handleProjectSelect}
        data={projectList}
        mainLabelExtractor={(item) => item?.PROJECT_NO || ''}
        labelExtractor={null}
        subLabelExtractor={(item) => item.PROJECT_NAME || ''}
        lastLabelExtractor={null}
        searchKeyExtractor={(item) => `${item.PROJECT_NO || ''} ${item.PROJECT_NAME || ''}`}
      />
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  statusBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MaterialIssueListScreen;