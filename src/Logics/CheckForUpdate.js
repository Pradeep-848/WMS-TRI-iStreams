import React from "react";
import { Alert, Linking } from "react-native";
import DeviceInfo from "react-native-device-info";

const VersionCheckUrl = "http://103.168.19.35:8040/api/Version";

export const checkForUpdate = async () => {
    try {
        const versionName = DeviceInfo.getVersion();      // e.g. "1.1.0"
        const buildNumber = DeviceInfo.getBuildNumber();  // e.g. "2"

        // 2. Fetch server version info
        const response = await fetch(VersionCheckUrl);
        if (!response.ok) {
            throw new Error("Failed to check version");
        }
        const serverData = await response.json();

        // 3. Compare version codes
        if (serverData.versionCode > versionName) {
            Alert.alert(
                "Update Available",
                `A new version ${serverData.versionName} is available. Click OK to update?`,
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                    {
                        text: "OK",
                        onPress: () => openInBrowser(serverData.apkUrl),
                    },
                ]
            );
        }
    } catch (error) {
        Alert.alert("Error", error.message || "Something went wrong");
    }
};

export const openInBrowser = async (url) => {
    try {
        // Try to open with Chrome
        await Linking.openURL(`googlechrome://navigate?url=${url}`);
    } catch {
        // Fallback: open with default browser
        await Linking.openURL(url);
    }
};