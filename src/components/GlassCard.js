// GlassCard component for React Native
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

export default function GlassCard({ children, color = '#fff', opacity = 0.05, borderRadius = 16, padding = 16, onPress }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: color + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
            borderRadius,
            padding,
            borderColor: color + '20',
          },
        ]}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
