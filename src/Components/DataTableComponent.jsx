import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { DataTable } from 'react-native-paper';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';

const DataTableComponent = ({
    data,
    columns,
    minWidth,
    striped,
    showHorizontalScroll,
}) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    // Default styles
    const defaultHeaderBg = colors.lightGray;
    const defaultRowBg = colors.background;
    const defaultAltRowBg = colors.background;

    const renderCellContent = (item, column) => {
        const value = column.key ? item[column.key] : column.render ? column.render(item) : '';

        if (column.render) {
            return column.render(item);
        }

        return (
            <Text
                numberOfLines={column.numberOfLines || 1}
                ellipsizeMode={column.ellipsizeMode || "tail"}
                style={column.textStyle}
            >
                {value}
            </Text>
        );
    };

    const TableContent = () => (
        <DataTable>
            {/* Table Header */}
            <DataTable.Header style={{ backgroundColor: defaultHeaderBg }}>
                {columns.map((column, index) => (
                    <DataTable.Title
                        key={index}
                        style={{ width: column.width }}
                        numeric={column.numeric}
                    >
                        <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[globalStyles.subtitle_3, {
                                color: colors.text
                            }]}
                        >
                            {column.title}
                        </Text>
                    </DataTable.Title>
                ))}
            </DataTable.Header>

            {/* Table Rows */}
            {data.map((item, rowIndex) => (
                <DataTable.Row
                    key={rowIndex}
                    style={{
                        backgroundColor: striped && rowIndex % 2 === 0 ? defaultAltRowBg : defaultRowBg,
                    }}
                >
                    {columns.map((column, colIndex) => (
                        <DataTable.Cell
                            key={colIndex}
                            style={{ width: column.width }}
                            numeric={column.numeric}
                        >
                            {renderCellContent(item, column)}
                        </DataTable.Cell>
                    ))}
                </DataTable.Row>
            ))}
        </DataTable>
    );

    return (
        <View>
            {showHorizontalScroll ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ minWidth }}>
                        <TableContent />
                    </View>
                </ScrollView>
            ) : (
                <TableContent />
            )}
        </View>
    );
};

export default DataTableComponent;