import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar } from "react-native-paper";
import { View } from "react-native";
import { GlobalStyles } from "../Styles/styles";
import { useTheme } from "./ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [type, setType] = useState("info"); // success | error | warning | info

    const showSnackbar = useCallback((msg, snackbarType = "info") => {
        setMessage(msg);
        setType(snackbarType);
        setVisible(true);
    }, []);

    const hideSnackbar = useCallback(() => {
        setVisible(false);
        setMessage("");
        setType("info");
    }, []);

    // Pick background color by type
    const getBackgroundColor = () => {
        switch (type) {
            case "success":
                return "#4CAF50"; // green
            case "error":
                return "#F44336"; // red
            case "warning":
                return "#FF9800"; // orange
            default:
                return "#2196F3"; // blue for info
        }
    };

    return (
        <SafeAreaProvider>
            <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
                {children}
                <View>
                    <Snackbar
                        visible={visible}
                        onDismiss={hideSnackbar}
                        theme={theme}
                        duration={2000}
                        style={{ backgroundColor: getBackgroundColor() }}
                        action={{
                            label: "OK",
                            textColor: colors.background,
                            onPress: hideSnackbar,
                        }}
                    >
                        {message}
                    </Snackbar>
                </View>
            </SnackbarContext.Provider>
        </SafeAreaProvider>
    );
};
