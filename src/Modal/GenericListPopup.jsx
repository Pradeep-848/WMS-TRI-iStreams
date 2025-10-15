import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const GenericListPopup = ({
    visible,
    onClose,
    onSelect,
    data = [],
    mainLabelExtractor = null,
    labelExtractor = null,
    subLabelExtractor = null,
    lastLabelExtractor = null,
    searchKeyExtractor = null
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const filteredData = data.filter((item) =>
        searchKeyExtractor(item)?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={globalStyles.backdrop} onPress={onClose} />
            <View style={[globalStyles.popup, { backgroundColor: colors.background }]}>
                {/* Search Input */}
                <Searchbar
                    style={[globalStyles.my_10, { backgroundColor: colors.card }]}
                    placeholderTextColor={colors.text}
                    iconColor={colors.text}
                    theme={theme}
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                <FlatList
                    data={filteredData}
                    keyExtractor={(item, index) => `${mainLabelExtractor(item)}_${index}`}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[globalStyles.item, { backgroundColor: colors.card }]}
                            onPress={() => onSelect(item)}
                        >
                            <View style={[globalStyles.twoInputContainer1, { justifyContent: 'flex-start' }]}>
                                <Text style={[globalStyles.subtitle_2, { color: '#0685de' }]}>
                                    {mainLabelExtractor(item)}
                                </Text>
                                {labelExtractor && (
                                    <Text style={globalStyles.subtitle_2}>
                                        {labelExtractor(item)}
                                    </Text>
                                )}
                            </View>
                            {subLabelExtractor && (
                                <View>
                                    <Text style={globalStyles.subtitle_3}>
                                        {subLabelExtractor(item)}
                                    </Text>
                                </View>
                            )}
                            {lastLabelExtractor && (
                                <View>
                                    <Text style={globalStyles.content}>
                                        {lastLabelExtractor(item)}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View style={[globalStyles.item, { backgroundColor: colors.card }]}>
                            <Text style={globalStyles.subtitle_2}>No data found for "{searchQuery}"</Text>
                        </View>
                    )}
                />
            </View>
        </Modal>
    );
};

export default GenericListPopup;