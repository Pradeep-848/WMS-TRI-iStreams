import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import {
    Camera as VisionCamera,
    useCameraDevices,
    useCodeScanner,
    useCameraPermission,
    getCameraDevice,
} from 'react-native-vision-camera';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import { Button } from 'react-native-paper';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const frameSize = 290;
const sideWidth = (windowWidth - frameSize) / 2;
const verticalMargin = 40;
const topHeight = (windowHeight - frameSize) / 2 - verticalMargin / 2;


const QRBarcodeScanner = ({ onScanned, onClose }) => {
    const { hasPermission, requestPermission } = useCameraPermission();
    const [torchOn, setTorchOn] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [cameraPosition] = useState('back');
    const devices = useCameraDevices();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const cameraDevice = useMemo(() => {
        return (
            getCameraDevice(devices, cameraPosition) ||
            devices.back ||
            devices.front
        );
    }, [devices, cameraPosition]);

    useEffect(() => {
        if (!hasPermission) requestPermission();
    }, [hasPermission]);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13', 'code-128', 'code-39', 'code-93', 'upc-a', 'upc-e'
        ],
        onCodeScanned: (codes) => {
            const value = codes[0]?.value;
            if (value && !scanned) {
                setScanned(true);
                onScanned?.(value);
            }
        },
    });

    if (hasPermission === null) return <Text>Requesting camera permission...</Text>;
    if (hasPermission === false) return <Text>Camera permission denied</Text>;
    if (cameraDevice == null) return <Text>Loading camera...</Text>;

    return (
        <View style={globalStyles.flex_1}>
            <VisionCamera
                style={globalStyles.flex_1}
                device={cameraDevice}
                isActive={true}
                codeScanner={codeScanner}
                torch={torchOn ? 'on' : 'off'}
            />

            {/* Overlays around transparent frame */}
            {/* <View style={[styles.overlayBlock, { top: 0, height: topHeight }]} />
            <View
                style={[
                    styles.overlayBlock,
                    { top: topHeight, left: 0, height: frameSize, width: sideWidth },
                ]}
            />
            <View
                style={[
                    styles.overlayBlock,
                    { top: topHeight, right: 0, height: frameSize, width: sideWidth },
                ]}
            />
            <View
                style={[
                    styles.overlayBlock,
                    { bottom: 0, height: bottomHeight },
                ]}
            /> */}


            {/* Transparent Scanner Frame with Corners */}
            <View style={styles.scannerFrameWrapper}>
                <View style={styles.cornerTopLeft} />
                <View style={styles.cornerTopRight} />
                <View style={styles.cornerBottomLeft} />
                <View style={styles.cornerBottomRight} />
            </View>

            {/* Bottom content */}
            <View style={styles.bottomContent}>
                <Button mode="contained" icon={"image"} theme={{ colors: { primary: colors.background, onPrimary: colors.text } }}>
                    Upload from Gallery
                </Button>
                <Text style={[globalStyles.body, { color: colors.white }]}>Scan any QR code / Barcode</Text>

            </View>

            <View style={[globalStyles.twoInputContainer1, styles.torchButton]}>
                <TouchableOpacity
                    onPress={() => onClose()}
                >
                    <Icon name="window-close" size={28} color={colors.white} />
                </TouchableOpacity>

                <View style={globalStyles.twoInputContainer1}>
                    {/* Torch / Flashlight Button (Top-Right) */}
                    <TouchableOpacity
                        style={globalStyles.px_10}
                        onPress={() => setTorchOn(prev => !prev)}
                    >
                        <Icon name={torchOn ? 'flashlight' : 'flashlight-off'} size={28} color={colors.white} />
                    </TouchableOpacity>

                    {/* More Options Button */}
                    <TouchableOpacity
                        onPress={() => {
                            console.log("More options");
                        }}
                    >
                        <Icon1 name="more-vert" size={28} color={colors.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // overlayBlock: {
    //     position: 'absolute',
    //     backgroundColor: 'rgba(0, 0, 0, 0.6)',
    //     width: '100%',
    // },

    scannerFrameWrapper: {
        position: 'absolute',
        top: topHeight,
        left: sideWidth,
        width: frameSize,
        height: frameSize,
        zIndex: 2,
    },
    cornerTopLeft: {
        position: 'absolute',
        top: -6,
        left: -6,
        width: 50,
        height: 50,
        borderTopWidth: 6,
        borderLeftWidth: 6,
        borderColor: '#FF6B6B',
        borderTopLeftRadius: 20,
    },
    cornerTopRight: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 50,
        height: 50,
        borderTopWidth: 6,
        borderRightWidth: 6,
        borderColor: '#FFA500',
        borderTopRightRadius: 20,
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: -6,
        left: -6,
        width: 50,
        height: 50,
        borderBottomWidth: 6,
        borderLeftWidth: 6,
        borderColor: '#1E90FF',
        borderBottomLeftRadius: 20,
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: -6,
        right: -6,
        width: 50,
        height: 50,
        borderBottomWidth: 6,
        borderRightWidth: 6,
        borderColor: '#32CD32',
        borderBottomRightRadius: 20,
    },

    // Bottom UI elements
    bottomContent: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
        gap: 6,
    },
    torchButton: {
        position: 'absolute',
        right: 0,
        left: 0,
        padding: 15,
    },
});

export default QRBarcodeScanner;