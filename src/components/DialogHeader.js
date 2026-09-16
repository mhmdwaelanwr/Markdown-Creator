// DialogHeader component for React Native
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function DialogHeader({ title, icon, color = '#2196F3' }) {
  return (
    <View style={styles.row}>
      {icon && (
        <View style={[styles.iconContainer, { borderColor: color + '40' }]}> 
          <MaterialIcons name={icon} size={22} color={color} />
        </View>
      )}
      <Text style={[styles.title, { color }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
});
