import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { markOnboardingComplete } from '../utils/onboardingHelper';
import { Colors } from '../constants/Colors';

const OnboardingScreen = ({ navigation }) => {
  const handleStart = async () => {
    await markOnboardingComplete();
    navigation.replace('Editor');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Markdown Creator</Text>
      <Text style={styles.subtitle}>
        Build beautiful README files with blocks, templates, and live previews.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Build faster</Text>
        <Text style={styles.cardText}>Compose sections with smart elements and snippets.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Export anywhere</Text>
        <Text style={styles.cardText}>Download Markdown, JSON, and extra community files.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Publish with confidence</Text>
        <Text style={styles.cardText}>Health checks help you ship a polished README.</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12, color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, width: '100%', marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6, color: '#0F172A' },
  cardText: { fontSize: 13, color: '#64748B' },
  button: { marginTop: 12, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#FFFFFF', fontWeight: '800' },
});

export default OnboardingScreen;
