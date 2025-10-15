import React, { useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { FAB, Appbar, Text, IconButton } from 'react-native-paper';
import DocumentScanner from 'react-native-document-scanner-plugin';

export default function DocumentScannerComponent({ onScanComplete }) {
    const [scannedDocs, setScannedDocs] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleScan = async () => {
        try {
            const { scannedImages } = await DocumentScanner.scanDocument({
                letUserAdjustCrop: true,
                croppedImageQuality: 100,
            });

            if (scannedImages?.length) {
                setScannedDocs((prev) => [...prev, ...scannedImages]);

                // 🔑 Send scanned images to parent
                if (onScanComplete) {
                    onScanComplete(scannedImages);
                }
            }
        } catch (error) {
            console.error('Document scan failed:', error);
        }
    };

    const handleRemove = (index) => {
        const updatedDocs = scannedDocs.filter((_, i) => i !== index);
        setScannedDocs(updatedDocs);
    };

    return (
        <View style={styles.container}>

            {/* Scanned images list */}
            <ScrollView style={styles.results}>
                {scannedDocs.length === 0 ? (
                    <Text style={styles.emptyText}>No documents scanned yet</Text>
                ) : (
                    scannedDocs.map((uri, index) => (
                        <TouchableOpacity key={index} onPress={() => setSelectedImage(uri)}>
                            <View style={styles.imageContainer}>
                                <Image source={{ uri }} style={styles.image} resizeMode="contain" />
                                <IconButton
                                    icon="delete"
                                    size={24}
                                    style={styles.deleteButton}
                                    onPress={() => handleRemove(index)}
                                />
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Floating Scan Button */}
            <FAB
                icon="camera"
                style={styles.fab}
                onPress={handleScan}
                label="Scan"
            />

            {/* Modal for Full Image View */}
            <Modal visible={!!selectedImage} transparent={true} animationType="fade">
                <View style={styles.modalBackground}>
                    <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
                    <IconButton
                        icon="close"
                        size={30}
                        style={styles.closeButton}
                        onPress={() => setSelectedImage(null)}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    results: { flex: 1, padding: 10 },
    imageContainer: { position: 'relative', marginBottom: 15 },
    image: { width: '100%', height: 300, borderRadius: 8 },
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'white',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: 'gray',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: { width: '90%', height: '80%' },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'white',
    },
});
