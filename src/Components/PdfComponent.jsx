import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, Linking } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ProgressBar, Button } from "react-native-paper";
import { pick, viewDocument } from "@react-native-documents/picker";

const PdfComponent = ({ colors, globalStyles, theme, label }) => {
    const [uploadedPdf, setUploadedPdf] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // Upload PDF
    const handlePdfUpload = async () => {
        try {
            setIsUploading(true);
            setUploadProgress(0);

            const [result] = await pick({
                mode: "open",
                type: ["application/pdf"],
            });

            // simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 1) {
                        clearInterval(progressInterval);
                        setIsUploading(false);
                        return 1;
                    }
                    return prev + 0.1;
                });
            }, 100);

            setUploadedPdf(result);
        } catch (err) {
            setIsUploading(false);
            setUploadProgress(0);
            if (err && err.message !== "User canceled document picker") {
                console.warn(err);
            }
        }
    };

    const handleViewPdf = async () => {
        if (!uploadedPdf) return;
        const url = Platform.OS === "android" ? uploadedPdf.uri : uploadedPdf.fileCopyUri || uploadedPdf.uri;
        try {
            await Linking.openURL(url);
        } catch (err) {
            console.warn("Error viewing PDF:", err);
        }
    };

    // Remove PDF
    const handleRemovePdf = () => {
        setUploadedPdf(null);
        setUploadProgress(0);
    };

    return (
        <View style={[globalStyles.mt_10]}>
            {/* Uploading Progress */}
            {isUploading && (
                <View style={globalStyles.mb_10}>
                    <Text style={[globalStyles.subtitle_4, globalStyles.mb_5, { color: colors.gray }]}>
                        Uploading... {Math.round(uploadProgress * 100)}%
                    </Text>
                    <ProgressBar progress={uploadProgress} theme={theme} />
                </View>
            )}

            {/* Uploaded PDF Info */}
            {uploadedPdf && !isUploading && (
                <View
                    style={[
                        globalStyles.twoInputContainer,
                        globalStyles.p_10,
                        globalStyles.mb_10,
                        globalStyles.borderRadius_10,
                        {
                            backgroundColor: colors.surfaceVariant,
                            borderWidth: 1,
                            borderColor: colors.primary,
                            justifyContent: "space-between",
                            alignItems: "center",
                        },
                    ]}
                >
                    {/* Tap to view PDF */}
                    <TouchableOpacity
                        onPress={handleViewPdf}
                        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                    >
                        <Ionicons name="document-text" size={24} color={colors.primary} />
                        <View style={[globalStyles.flex_1, globalStyles.ml_10]}>
                            <Text style={[globalStyles.subtitle_3, { color: colors.text }]} numberOfLines={1}>
                                {uploadedPdf.name}
                            </Text>
                            <Text style={[globalStyles.subtitle_4, { color: colors.gray }]}>
                                {uploadedPdf.size ? `${(uploadedPdf.size / 1024).toFixed(2)} KB` : "Size unknown"}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Remove button */}
                    <TouchableOpacity onPress={handleViewPdf}>
                        <Ionicons name="eye-outline" size={22} color={colors.primary} />
                    </TouchableOpacity>

                    {/* Remove button */}
                    <TouchableOpacity onPress={handleRemovePdf}>
                        <Ionicons name="trash-outline" size={22} color={colors.error} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Upload Button */}
            <Button
                mode="contained-tonal"
                theme={theme}
                icon="file-outline"
                onPress={handlePdfUpload}
                disabled={isUploading}
            >
                <Text style={[globalStyles.subtitle_4, globalStyles.ml_5]}>
                    {uploadedPdf ? "Change PDF" : label}
                </Text>
            </Button>
        </View>
    );
};

export default PdfComponent;