// CanvasItem for React Native (stub)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CanvasItem({ element, isSelected, onPress }) {
  // TODO: Render element using ElementRenderer
  return (
    <TouchableOpacity style={[styles.item, isSelected && styles.selected]} onPress={onPress}>
      <Text>{element?.type || 'Element'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: { padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 8 },
  selected: { borderColor: '#2196F3', borderWidth: 2 },
});
