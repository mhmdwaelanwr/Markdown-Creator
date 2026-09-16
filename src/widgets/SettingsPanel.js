// SettingsPanel for React Native (stub)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsPanel() {
  // TODO: Add tabs and settings forms
  return (
    <View style={styles.panel}>
      <Text>Settings Panel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 16, backgroundColor: '#f5f5f5', flex: 1 },
});
