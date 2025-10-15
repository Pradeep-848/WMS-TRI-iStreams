import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, TextInput, Checkbox, Button } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../Context/AuthContext';
import Header from '../Components/Header';
import BackgroundGradient from '../Components/BackgroundGradient';

const MRItemView = ({ onBack }) => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const { item, materialName } = route.params;

    const [empData, setEmpData] = useState({ empName: '' });

    const [budgetValues, setBudgetValues] = React.useState({
        budget: '31,000',
        forBoq: '',
        mrReceived: '',
        ordered: '',
        yetToOrder: '',
        budgetBalance: '',
        qtyInHand: '',
        overall: '31,000',
        freeStock: '',
        projectStock: '',
        consumed: '',
        otherProject1: '',
        otherProject2: '',
        otherProject3: ''
    });

    const [isApproved, setIsApproved] = React.useState(false);
    const [approvalValues, setApprovalValues] = React.useState({
        toIssue: '',
        toTransfer: '',
        toProcess: '',
        unApprove: ''
    });

    useEffect(() => {
        setEmpData({
            empName: userData?.userName || '',
        })
    }, [userData]);

    const handleValueChange = (key, value) => {
        setBudgetValues(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleApprovalChange = (key, value) => {
        setApprovalValues(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        console.log("Saved values:", { budgetValues, approvalValues, isApproved });
    };

    return (
        <BackgroundGradient>
            <Header title="Item View for Approval" navigationType='back' />
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* MR Reference and Date */}
                <ImageBackground
                    source={require('../../assets/header_bg.jpg')}
                    style={[styles.headerBackground]}
                    imageStyle={{ borderRadius: 8 }}
                >
                    <View style={[globalStyles.twoInputContainer1, { padding: 6 }]}>
                        <View>
                            <Text style={[globalStyles.subtitle_4, globalStyles.txt_center, { color: colors.white, fontWeight: '600' }]}>MR RefNo.</Text>
                            <Text style={[globalStyles.subtitle_2, globalStyles.txt_center, { color: colors.white }]}>{materialName}</Text>
                        </View>
                        <View>
                            <Text style={[globalStyles.subtitle_4, { color: colors.white, fontWeight: '600', textAlign: 'right' }]}>
                                <MaterialCommunityIcons name="card-account-details" size={15} />{' '}
                                {empData.empName}
                            </Text>
                            <Text style={[globalStyles.subtitle_4, { color: colors.white, textAlign: 'right' }]}>10-Sep-2025</Text>
                        </View>
                    </View>
                </ImageBackground>

                {/* Selected Item */}
                <Card style={[styles.cardContainer, { backgroundColor: colors.card }]}>
                    <Card.Content>
                        <View style={globalStyles.twoInputContainer}>
                            <View style={globalStyles.container1}>
                                <Text style={[globalStyles.subtitle_4, { fontSize: 14, color: colors.primary, marginLeft: 4, textAlign: 'left' }]}>
                                    <MaterialCommunityIcons name="cube" color={colors.primary} size={16} /> {item.itemCode}
                                </Text>
                            </View>
                            <View style={[globalStyles.container2, { alignItems: 'flex-end' }]}>
                                <Text style={[globalStyles.subtitle_4, { fontSize: 14, color: colors.primary }]}>
                                    {item.itemName}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Budget Card */}
                <Card style={[styles.cardContainer, { backgroundColor: colors.card }]}>
                    <Card.Content>
                        <View style={[globalStyles.twoInputContainer]}>
                            <Text style={[globalStyles.subtitle_4, globalStyles.flex_1, { textAlign: "left" }]}>Qty</Text>
                            <Text style={[globalStyles.subtitle_4, globalStyles.flex_1, { textAlign: "center" }]}>For Project</Text>
                            <Text style={[globalStyles.subtitle_4, globalStyles.flex_1, { textAlign: "center" }]}>For BOQ</Text>
                        </View>

                        <View style={[globalStyles.twoInputContainer1, {flexWrap: 'wrap'}, globalStyles.alignItemsCenter]}>
                            <Text style={[globalStyles.subtitle_4, globalStyles.flex_1]}>Budget</Text>
                            <TextInput
                                value={budgetValues.budget}
                                onChangeText={v => handleValueChange('budget', v)}
                                style={[globalStyles.input, styles.input]}
                                textColor='green'
                                mode='outlined'
                                theme={theme}
                                dense
                            />
                            <TextInput
                                value={budgetValues.forBoq}
                                onChangeText={v => handleValueChange('forBoq', v)}
                                style={[globalStyles.input, styles.input]}
                                textColor='green'
                                mode='outlined'
                                theme={theme}
                                dense
                            />
                        </View>

                        <View style={[globalStyles.twoInputContainer1, {flexWrap: 'wrap'}, globalStyles.alignItemsCenter]}>
                            <Text style={[globalStyles.subtitle_4, { flex: 1, fontSize: 12 }]}>MR Received</Text>
                            <TextInput
                                value={budgetValues.mrReceived}
                                mode='outlined'
                                onChangeText={v => handleValueChange('mrReceived', v)}
                                style={[globalStyles.input, styles.input]}
                                theme={theme}
                                dense
                            />
                            <View style={{ flex: 1 }} />
                        </View>

                        <View style={[globalStyles.twoInputContainer1, {flexWrap: 'wrap'}, globalStyles.alignItemsCenter]}>
                            <Text style={[globalStyles.subtitle_4, { flex: 1, fontSize: 12 }]}>Ordered</Text>
                            <TextInput
                                mode='outlined'
                                value={budgetValues.ordered}
                                onChangeText={v => handleValueChange('ordered', v)}
                                style={[globalStyles.input, styles.input]}
                                theme={theme}
                                dense
                            />
                            <View style={{ flex: 1 }} />
                        </View>

                        <View style={[globalStyles.twoInputContainer1, {flexWrap: 'wrap'}, globalStyles.alignItemsCenter]}>
                            <Text style={[globalStyles.subtitle_4, { flex: 1, fontSize: 12 }]}>Yet to Order</Text>
                            <TextInput
                                mode='outlined'
                                value={budgetValues.yetToOrder}
                                onChangeText={v => handleValueChange('yetToOrder', v)}
                                style={[globalStyles.input, styles.input]}
                                theme={theme}
                                dense
                            />
                            <View style={{ flex: 1 }} />
                        </View>

                        <View style={[globalStyles.twoInputContainer1, {flexWrap: 'wrap'}, globalStyles.alignItemsCenter]}>
                            <Text style={[globalStyles.subtitle_4, { flex: 1, fontSize: 12 }]}>Budget Balance</Text>
                            <TextInput
                                mode='outlined'
                                value={budgetValues.budgetBalance}
                                onChangeText={v => handleValueChange('budgetBalance', v)}
                                style={[globalStyles.input, styles.input]}
                                theme={theme}
                                dense
                            />
                            <TextInput
                                mode='outlined'
                                value={budgetValues.forBoqBudgetBalance}
                                onChangeText={v => handleValueChange('forBoqBudgetBalance', v)}
                                style={[globalStyles.input, styles.input]}
                                theme={theme}
                                dense
                            />
                        </View>
                    </Card.Content>
                </Card>

                {/* Qty In Hand */}
                <Card style={[styles.cardContainer, { backgroundColor: colors.card }]}>
                    <Card.Content>
                        <Text style={[globalStyles.txt_center, globalStyles.subtitle_2, { fontSize: 14, marginBottom: 5 }]}>
                            Qty In Hand
                        </Text>

                        <View style={[globalStyles.twoInputContainer1, {flexWrap: 'wrap'}, globalStyles.alignItemsCenter]}>
                            <Text style={[globalStyles.subtitle_4, globalStyles.flex_1, {color: colors.gray}]}>Overall</Text>
                            <TextInput
                                value={budgetValues.overall}
                                onChangeText={v => handleValueChange('overall', v)}
                                style={[globalStyles.input, styles.input]}
                                textColor='green'
                                mode='outlined'
                                theme={theme}
                                dense
                            />
                        </View>

                        <View style={[globalStyles.twoInputContainer1, globalStyles.mb_5]}>
                            <Text style={[globalStyles.subtitle_4, globalStyles.flex_1, globalStyles.txt_center]}>Free Stock</Text>
                            <Text style={[globalStyles.subtitle_4, globalStyles.flex_1, globalStyles.txt_center]}>Project Stock</Text>
                            <Text style={[globalStyles.subtitle_4, globalStyles.flex_1, globalStyles.txt_center]}>Consumed</Text>
                        </View>

                        <View style={globalStyles.twoInputContainer1}>
                            <TextInput
                                mode='outlined'
                                value={budgetValues.freeStock}
                                onChangeText={v => handleValueChange('freeStock', v)}
                                style={[globalStyles.input, styles.input]}
                                theme={theme}
                                dense
                            />
                            <TextInput
                                mode='outlined'
                                value={budgetValues.projectStock}
                                onChangeText={v => handleValueChange('projectStock', v)}
                                style={[globalStyles.input, styles.input]}
                                theme={theme}
                                dense
                            />
                            <TextInput
                                mode='outlined'
                                value={budgetValues.consumed}
                                onChangeText={v => handleValueChange('consumed', v)}
                                style={[globalStyles.input, styles.input]}
                                theme={theme}
                                dense
                            />
                        </View>

                        <Text style={[globalStyles.subtitle_4, { color: colors.gray }]}>Other Projects</Text>
                        <View style={[globalStyles.twoInputContainer1, {flexWrap: 'wrap'}, globalStyles.alignItemsCenter]}>
                            <TextInput
                                mode='outlined'
                                value={budgetValues.otherProject1}
                                onChangeText={v => handleValueChange('otherProject1', v)}
                                style={[globalStyles.input, styles.input]}
                                theme={theme}
                                dense
                            />
                            <TextInput
                                mode='outlined'
                                value={budgetValues.otherProject2}
                                onChangeText={v => handleValueChange('otherProject2', v)}
                                style={[globalStyles.input, styles.input]}
                                theme={theme}
                                dense
                            />
                            <TextInput
                                mode='outlined'
                                value={budgetValues.otherProject3}
                                onChangeText={v => handleValueChange('otherProject3', v)}
                                style={[globalStyles.input, styles.input]}
                                theme={theme}
                                dense
                            />
                        </View>
                    </Card.Content>
                </Card>

                {/* Approval Card */}
                <Card style={[styles.cardContainer, { backgroundColor: colors.card }]}>
                    <Card.Content>
                        <View style={[globalStyles.twoInputContainer, globalStyles.justifyStart, globalStyles.alignItemsCenter]}>
                            <Checkbox
                                status={isApproved ? "checked" : "unchecked"}
                                onPress={() => setIsApproved(!isApproved)}
                                color="green"
                                uncheckedColor="grey"
                            />
                            <Text style={[globalStyles.subtitle_2, { color: colors.success }]}>
                                Approved
                            </Text>
                        </View>

                        <View style={[globalStyles.twoInputContainer, globalStyles.my_10]}>
                            <Text style={[globalStyles.subtitle_4, globalStyles.txt_center, globalStyles.flex_1, { color: colors.primary }]}>To Issue</Text>
                            <Text style={[globalStyles.subtitle_4, globalStyles.txt_center, globalStyles.flex_1, { color: colors.primary }]}>To Transfer</Text>
                            <Text style={[globalStyles.subtitle_4, globalStyles.txt_center, globalStyles.flex_1, { color: colors.primary }]}>To Procure</Text>
                            <Text style={[globalStyles.subtitle_4, globalStyles.txt_center, globalStyles.flex_1, { color: "red" }]}>Unapproved</Text>
                        </View>

                        <View style={globalStyles.twoInputContainer1}>
                            {["toIssue", "toTransfer", "toProcess", "unApprove"].map((key, i) => (
                                <TextInput
                                    mode='outlined'
                                    key={i}
                                    theme={theme}
                                    value={approvalValues[key]}
                                    onChangeText={v => handleApprovalChange(key, v)}
                                    style={[globalStyles.input, styles.input]}
                                    dense
                                />
                            ))}
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>

            {/* Save Button */}
            <Button
                mode="contained"
                style={[globalStyles.bottomButtonContainer, globalStyles.mx_10]}
                onPress={handleSave}
                theme={theme}
            >
                Submit
            </Button>
        </BackgroundGradient>
    );
};

const styles = StyleSheet.create({
    input: {
        flex: 1,
        height: 28,
        fontSize: 14,
        textAlign: "center",
    },
    headerBackground: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        marginHorizontal: 16,
        marginVertical: 3,
        marginBottom: 8,
        elevation: 2,
        overflow: 'hidden',
        marginTop: 8,
    },
    cardContainer: {
        borderRadius: 10,
        marginHorizontal: 16,
        marginVertical: 3,
        elevation: 2,
        marginBottom: 8,
        overflow: 'hidden',
    },
});

export default MRItemView;