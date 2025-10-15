import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { DataTable, ActivityIndicator, Text, Card } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const PreviousBarcodesTable = ({ barcodes, loading }) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [page, setPage] = useState(0);
    const itemsPerPage = 5;

    // Pagination calculation
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, barcodes.length);

    if (loading) {
        return (
            <View style={[globalStyles.justalignCenter, globalStyles.my_20]}>
                <ActivityIndicator animating size="large" theme={theme} />
                <Text style={globalStyles.subtitle_2}>Loading barcodes...</Text>
            </View>
        );
    }

    if (!barcodes || barcodes.length === 0) {
        return (
            <Card style={[globalStyles.my_10, globalStyles.mx_5, globalStyles.borderRadius_15, { backgroundColor: colors.card }]}>
                <Card.Content>
                    <View style={[globalStyles.justalignCenter, globalStyles.p_10]}>
                        <Text style={globalStyles.subtitle}>📋 No previous barcodes found</Text>
                        <Text style={globalStyles.body}>Scan some items to see them here</Text>
                    </View>
                </Card.Content>
            </Card>
        );
    }

    return (
        <View>
            <View style={[globalStyles.twoInputContainer1, globalStyles.mb_10]}>
                <Text style={globalStyles.subtitle}>Scanned Barcodes</Text>
                <Text style={[globalStyles.subtitle_3, globalStyles.borderRadius_15, globalStyles.px_10,
                { backgroundColor: colors.card }]}>{barcodes.length} items</Text>
            </View>

            <DataTable style={[styles.dataTable, { backgroundColor: colors.card, width: '100%' }]}>
                {/* Table Header */}
                <DataTable.Header style={{ backgroundColor: colors.primary }}>
                    <DataTable.Title
                        style={[styles.leftColumn]}
                        textStyle={[globalStyles.subtitle_3, { color: colors.white }]}>
                        S.No
                    </DataTable.Title>
                    <DataTable.Title
                        style={[styles.centerColumn]}
                        textStyle={[globalStyles.subtitle_3, { color: colors.white }]}>
                        Barcodes
                    </DataTable.Title>
                    <DataTable.Title
                        style={[styles.rightColumn]}
                        textStyle={[globalStyles.subtitle_3, { color: colors.white }]}>
                        Added By
                    </DataTable.Title>
                </DataTable.Header>

                {/* Table Rows */}
                {barcodes.slice(from, to).map((item, index) => (
                    <DataTable.Row
                        key={`${item.REF_SERIAL_NO}-${index}`}
                        style={[
                            styles.tableRow,
                            index % 2 === 0 ? { backgroundColor: colors.card1 } : { backgroundColor: colors.card },
                        ]}>
                        <DataTable.Cell
                            style={[styles.leftColumn]}
                            textStyle={globalStyles.content}>
                            {item.REF_SERIAL_NO}
                        </DataTable.Cell>
                        <DataTable.Cell
                            style={[styles.centerColumn]}
                            textStyle={[globalStyles.content, styles.barcodeText]}>
                            {item.BARCODE_NO}
                        </DataTable.Cell>
                        <DataTable.Cell
                            style={[styles.rightColumn]}
                            textStyle={globalStyles.content}>
                            {item.USER_NAME}
                        </DataTable.Cell>
                    </DataTable.Row>
                ))}

                {/* Pagination */}
                <DataTable.Pagination
                    page={page}
                    numberOfPages={Math.ceil(barcodes.length / itemsPerPage)}
                    onPageChange={page => setPage(page)}
                    label={`${from + 1}-${to} of ${barcodes.length}`}
                    showFastPaginationControls
                    style={[styles.pagination, { backgroundColor: colors.white }]}
                />
            </DataTable>
        </View>
    );
};

const styles = StyleSheet.create({
    leftColumn: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    centerColumn: {
        flex: 2.5,
        justifyContent: 'center',
    },
    rightColumn: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    barcodeText: {
        fontFamily: 'monospace',
        fontWeight: '600',
        color: '#6200ee',
        backgroundColor: '#f3e5f5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        textAlign: 'center',
    },
    pagination: {
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        paddingVertical: 5,
    },
});

export default PreviousBarcodesTable;