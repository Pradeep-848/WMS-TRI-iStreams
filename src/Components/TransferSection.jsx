import React from "react";
import { View, Text } from "react-native";
import { TextInput } from "react-native-paper";

const TransferSection = ({
  title,
  colors,
  globalStyles,
  location,
  setLocation,
  rack,
  setRack,
  bin,
  setBin,
  projectNo,
  setProjectNo,
  projectName,
  setProjectName,
  onLocationPress,
  onProjectPress,
}) => {
  return (
    <View style={globalStyles.mt_10}>
      <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}>
        {title}
      </Text>
      <View style={globalStyles.mb_5}>
        <TextInput
          mode="outlined"
          label="Location"
          theme={{ colors }}
          value={location}
          showSoftInputOnFocus={false}
          onPress={onLocationPress}
          onChangeText={setLocation}
        />
      </View>
      <View style={[globalStyles.twoInputContainer, globalStyles.mb_5]}>
        <View style={globalStyles.container1}>
          <TextInput
            mode="outlined"
            label="Rack"
            theme={{ colors }}
            value={rack}
            onChangeText={setRack}
            editable={false}
          />
        </View>

        <View style={globalStyles.container2}>
          <TextInput
            mode="outlined"
            label="Bin"
            theme={{ colors }}
            editable={false}
            value={bin}
            onChangeText={setBin}
          />
        </View>
      </View>
      <View style={[globalStyles.twoInputContainer, { gap: 7 }]}>
        <View style={{ width: "35%" }}>
          <TextInput
            mode="outlined"
            label="Project No"
            theme={{ colors }}
            value={projectNo}
            showSoftInputOnFocus={false}
            onPress={onProjectPress}
            onChangeText={setProjectNo}
          />
        </View>

        <View style={globalStyles.container2}>
          <TextInput
            mode="outlined"
            label="Project Name"
            theme={{ colors }}
            editable={false}
            value={projectName}
            onChangeText={setProjectName}
          />
        </View>
      </View>
    </View>
  );
};

export default TransferSection;