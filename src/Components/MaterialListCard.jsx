import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons'; // or your preferred icon library
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MaterialListCard = ({ loading, selectedMaterial, onPress, onDelete }) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [expandedItems, setExpandedItems] = useState({});

    const toggleExpanded = (itemKey) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemKey]: !prev[itemKey]
        }));
    };

    const getpriorityColor = (priority) => {
        const priorityColors = {
            'Low': '#10B981',
            'Medium': '#F59E0B',
            'High': '#f54949',
        };
        return priorityColors[priority] || colors.text;
    };

    const getpriorityBgColor = (priority) => {
        const priorityBgColors = {
            'Low': '#D1FAE5',
            'Medium': '#FEF3C7',
            'High': '#ffe0e0',
        };
        return priorityBgColors[priority] || `${colors.text}20`;
    };

    const renderMaterialItem = ({ item, index }) => {
        const itemKey = item.ITEM_CODE + item.SUB_MATERIAL_NO;
        const isExpanded = expandedItems[itemKey];

        return (
            <TouchableOpacity
                onPress={() => onPress?.(item)}
                style={[
                    styles.cardContainer,
                    globalStyles.mb_10,
                    {
                        backgroundColor: `${colors.purple}30`
                    }
                ]}
                activeOpacity={0.8}>

                <View style={globalStyles.flex_1}>
                    <View style={[globalStyles.twoInputContainer, globalStyles.justalignCenter, { gap: 10 }]}>
                        <Text style={[globalStyles.subtitle, { color: colors.primary }]}>
                            <MaterialCommunityIcons name="cube" size={15} />{' '}{item.ITEM_CODE}
                        </Text>

                        {item.SUB_MATERIAL_NO && (
                            <View style={[styles.subMaterialBadge, { backgroundColor: `${colors.primary}50` }]}>
                                <Text style={[globalStyles.subtitle, { color: colors.primary }]}>
                                    {item.SUB_MATERIAL_NO}
                                </Text>
                            </View>
                        )}

                        <View style={[globalStyles.twoInputContainer1, { marginLeft: 'auto' }]}>
                            {/* Delete Button */}
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    Alert.alert(
                                        "Confirm Delete",
                                        "Are you sure you want to delete this material?",
                                        [
                                            {
                                                text: "Cancel",
                                                style: "cancel"
                                            },
                                            {
                                                text: "Delete",
                                                style: "destructive",
                                                onPress: () => onDelete?.(item)
                                            }
                                        ]
                                    );
                                }}
                                style={[styles.expandButton, { backgroundColor: colors.card }]}
                                activeOpacity={0.7}
                            >
                                <Icon name="delete" size={15} color={colors.error || '#f44336'} />
                            </TouchableOpacity>

                            {/* Expand/Collapse Button */}
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation(); // Prevent parent onPress
                                    toggleExpanded(itemKey);
                                }}
                                style={[styles.expandButton, { backgroundColor: colors.card }]}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                    size={15}
                                    color={colors.primary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[globalStyles.twoInputContainer, globalStyles.my_2]}>
                        <Text style={globalStyles.subtitle_3} numberOfLines={2}>
                            {item.ITEM_NAME}
                        </Text>
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.detailsSection}>
                    <View style={[globalStyles.twoInputContainer, globalStyles.my_2, globalStyles.justifySpaceBetween]}>
                        <View style={globalStyles.flex_1}>
                            <Text style={[globalStyles.subtitle_3, { color: colors.gray }]}>{item.UOM_STOCK}</Text>
                        </View>
                        <View style={globalStyles.flex_1}>
                            <Text style={[globalStyles.subtitle_4, styles.detailLabel, { color: colors.textSecondary }]}>
                                Quantity
                            </Text>
                            <Text style={[globalStyles.subtitle_4]}>
                                {item.Qty || '-'}
                            </Text>
                        </View>
                        <View style={globalStyles.flex_1}>
                            <Text style={[globalStyles.subtitle_4, styles.detailLabel, { color: colors.textSecondary }]}>
                                Required Date
                            </Text>
                            <Text style={[globalStyles.subtitle_4]}>
                                {item.RequiredDate || '-'}
                            </Text>
                        </View>
                    </View>

                    {/* Expandable section - BOQ Ref and priority */}
                    {isExpanded && (
                        <View style={styles.expandableSection}>
                            <View style={[globalStyles.twoInputContainer]}>
                                <View style={globalStyles.flex_1}>
                                    <Text style={[globalStyles.subtitle_4, styles.detailLabel, { color: colors.textSecondary }]}>
                                        BOQ Ref
                                    </Text>
                                    <Text style={[globalStyles.subtitle_4, { color: colors.text }]} numberOfLines={1}>
                                        {item.BOQRef || '-'}
                                    </Text>
                                </View>
                                <View style={globalStyles.flex_1}>
                                    <Text style={[globalStyles.subtitle_4, styles.detailLabel, { color: colors.textSecondary }]}>
                                        Priority
                                    </Text>
                                    <View style={[
                                        styles.priorityBadge,
                                        { backgroundColor: getpriorityBgColor(item.Priority) }
                                    ]}>
                                        <Text style={[
                                            globalStyles.subtitle_4, styles.detailLabel,
                                            { color: getpriorityColor(item.Priority) }
                                        ]}>
                                            {item.Priority || '-'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Remarks - also in expandable section */}
                                {item.Remarks && item.Remarks !== '-' && (
                                    <View style={globalStyles.flex_1}>
                                        <Text style={[globalStyles.subtitle_4, styles.detailLabel, { color: colors.textSecondary }]}>
                                            Remarks
                                        </Text>
                                        <Text style={[globalStyles.content2, { color: colors.text, fontStyle: 'italic' }]} numberOfLines={2}>
                                            {item.Remarks}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={globalStyles.flex_1}>
            {loading ? (
                <View style={[
                    globalStyles.flex_1,
                    globalStyles.justalignCenter,
                    globalStyles.py_10
                ]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[globalStyles.subtitle_2, { color: colors.textSecondary }]}>
                        Loading materials...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={selectedMaterial}
                    keyExtractor={(item) => item.ITEM_CODE + item.SUB_MATERIAL_NO}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderMaterialItem}
                    contentContainerStyle={styles.listContainer}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 16,
        padding: 9,
    },
    subMaterialBadge: {
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    expandButton: {
        marginLeft: 'auto',
        padding: 6,
        borderRadius: 12,
    },
    detailsSection: {
        gap: 5,
    },
    expandableSection: {
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    detailLabel: {
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
});

export default MaterialListCard;