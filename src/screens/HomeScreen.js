import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Markdown Creator Pro</Text>
      <Text style={styles.subtitle}>The ultimate tool to craft stunning Markdown documentation in minutes.</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Editor')}>
        <Text style={styles.primaryButtonText}>Open Editor</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default HomeScreen;
