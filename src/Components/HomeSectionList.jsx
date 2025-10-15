import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';

const HomeSectionList = ({
    title,
    actions,
    horizontal = false,
    itemWidth = 100,
    iconType = 'material',
    colors,
    globalStyles
}) => {
    return (
        <View style={[styles.container, { backgroundColor: colors.card1 }]}>
            <Text style={[globalStyles.subtitle_1, { marginHorizontal: 10, marginBottom: 5 }]}>
                {title}
            </Text>

            {horizontal ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {actions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.actionHorizontal, { width: itemWidth, backgroundColor: colors.card1 }]}
                            onPress={action.onPress}
                        >
                            <View style={styles.iconWrapperHorizontal}>
                                {iconType === 'material' ? (
                                    <Icon name={action.icon} size={28} color="#002D72" />
                                ) : (
                                    <FontAwesome6Icon name={action.icon} size={20} color="#002D72" />
                                )}
                            </View>
                            <Text style={[globalStyles.subtitle_3, { textAlign: 'center' }]}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                <View style={globalStyles.twoInputContainer}>
                    {actions.map((action, index) => (
                        <TouchableOpacity key={index} style={styles.actionGrid} onPress={action.onPress}>
                            <View style={styles.iconWrapperGrid}>
                                <Icon name={action.icon} size={30} color="#fff" />
                            </View>
                            <Text style={[globalStyles.subtitle_4, { textAlign: 'center' }]}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

export default HomeSectionList;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        borderRadius: 16,
        marginVertical: 5
    },
    actionGrid: { alignItems: 'center', width: 80 },
    iconWrapperGrid: { backgroundColor: '#002D72', borderRadius: 16, padding: 12, marginBottom: 6 },
    actionHorizontal: {
        height: 120, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
        marginHorizontal: 5, paddingHorizontal: 10, marginBottom: 5, elevation: 2
    },
    iconWrapperHorizontal: {
        width: 50, height: 50, borderRadius: 25,
        justifyContent: 'center', alignItems: 'center', marginBottom: 10,
        backgroundColor: '#E3F2FD'
    }
});
