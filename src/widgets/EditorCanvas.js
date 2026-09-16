// EditorCanvas for React Native (stub)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EditorCanvas() {
  // TODO: Render CanvasItems and handle layout
  return (
    <View style={styles.canvas}>
      <Text>Editor Canvas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: '#e3e3e3', padding: 16, borderRadius: 12 },
});
