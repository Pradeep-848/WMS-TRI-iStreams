import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Card, Text, Checkbox, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../Context/ThemeContext';
import { GlobalStyles } from '../../Styles/styles';
import { useAuth } from '../../Context/AuthContext';
import BackgroundGradient from '../../Components/BackgroundGradient';
import Header from '../../Components/Header';

const SystemEntry = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { userData } = useAuth();

    return (
        <BackgroundGradient>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]} >
                {/* Header */}
                <Header title="3rd Party System Entry" />

                {/* Security Verification */}
                <Card style={[globalStyles.globalCard, globalStyles.p_20]}>
                    <View style={globalStyles.twoInputContainer}>
                        <Text style={globalStyles.subtitle_2}>Verification Status</Text>

                        <View style={globalStyles.twoInputContainer}>
                            <Text>Security Signature</Text>
                            <Text>Receiver Signature</Text>
                        </View>
                    </View>
                </Card>
            </View>

            {/* Final Actions */}
            <View style={globalStyles.bottomButtonContainer}>
                <Button
                    mode="contained"
                    theme={theme}
                    icon="check-all"
                >
                    Book Receipt & Finalize Entry
                </Button>
            </View>
        </BackgroundGradient>
    );
};

const styles = StyleSheet.create({
});

export default SystemEntry;


// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useAuth } from '../../Context/AuthContext';
// import { useNavigation } from '@react-navigation/native';
// import Header from '../../Components/Header';
// import BackgroundGradient from '../../Components/BackgroundGradient';
// import { GlobalStyles } from '../../Styles/styles';
// import { useTheme } from '../../Context/ThemeContext';

// const SystemEntry = () => {
//     const insets = useSafeAreaInsets();
//     const navigation = useNavigation();
//     const { theme } = useTheme();
//     const colors = theme.colors;
//     const globalStyles = GlobalStyles(colors);
//     const { userData } = useAuth();

//     return (
//         <BackgroundGradient>
//             <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
//                 <Header title="Pre-Arrival Confirmation" />
//                 <View>
//                     <Text style={[globalStyles.text, { fontSize: 18 }]}>Pre-Arrival Confirmation Screen</Text>
//                 </View>
//             </View>
//         </BackgroundGradient>
//     )
// }

// export default SystemEntry

// const styles = StyleSheet.create({})