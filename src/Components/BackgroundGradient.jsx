// BackgroundGradient.js
import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../Context/ThemeContext';

const BackgroundGradient = ({ children }) => {
  const { darkMode } = useTheme();

  const colors = darkMode
    ? ['#1e293b', '#2c3e50', '#3a4a6a'] // darker shades for dark mode
    : ['#68aee0', '#c3def8', '#ffffff']; // lighter shades for light mode

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BackgroundGradient;