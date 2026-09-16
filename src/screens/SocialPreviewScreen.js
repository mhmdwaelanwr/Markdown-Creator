import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, ScrollView, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { useProject } from '../context/ProjectContext';

const SocialPreviewScreen = () => {
  const { variables } = useProject();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const previewWidth = Math.max(280, Math.min(width - 48, 800));
  const previewHeight = previewWidth / 2;
  const [title, setTitle] = useState(variables.PROJECT_NAME || 'Project Name');
  const [description, setDescription] = useState('Awesome project description goes here.');
  const [useGradient, setUseGradient] = useState(false);
  const [bgColor, setBgColor] = useState('#0F172A');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [gradientStart, setGradientStart] = useState('#3B82F6');
  const [gradientEnd, setGradientEnd] = useState('#A855F7');

  return (
    <View style={[styles.container, !isWide && styles.containerStack]}>
      <View style={[styles.controls, !isWide && styles.controlsStack]}>
        <ScrollView>
          <Text style={styles.title}>Social Preview Designer</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
          />
          <View style={styles.switchRow}>
            <Text style={styles.label}>Use Gradient</Text>
            <Switch value={useGradient} onValueChange={setUseGradient} thumbColor={Colors.primary} />
          </View>
          {useGradient ? (
            <>
              <Text style={styles.label}>Gradient Start</Text>
              <TextInput style={styles.input} value={gradientStart} onChangeText={setGradientStart} placeholder="#3B82F6" />
              <Text style={styles.label}>Gradient End</Text>
              <TextInput style={styles.input} value={gradientEnd} onChangeText={setGradientEnd} placeholder="#A855F7" />
            </>
          ) : (
            <>
              <Text style={styles.label}>Background Color</Text>
              <TextInput style={styles.input} value={bgColor} onChangeText={setBgColor} placeholder="#0F172A" />
            </>
          )}
          <Text style={styles.label}>Text Color</Text>
          <TextInput style={styles.input} value={textColor} onChangeText={setTextColor} placeholder="#FFFFFF" />
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => Alert.alert('Export', 'Image export is not available in this build.')}
          >
            <Text style={styles.exportText}>Export Image</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={[styles.preview, !isWide && styles.previewStack]}>
        <View style={[styles.previewFrame, { width: previewWidth, height: previewHeight }]}>
          {useGradient ? (
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={gradientStart} stopOpacity="1" />
                  <Stop offset="1" stopColor={gradientEnd} stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#grad)" />
            </Svg>
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} />
          )}
          <View style={styles.previewContent}>
            <Text style={[styles.previewTitle, { color: textColor }]} numberOfLines={2}>{title}</Text>
            <Text style={[styles.previewDesc, { color: textColor }]} numberOfLines={3}>{description}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#0B1220' },
  containerStack: { flexDirection: 'column' },
  controls: { width: 320, padding: 16, backgroundColor: '#FFFFFF' },
  controlsStack: { width: '100%' },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 10, marginBottom: 8 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  exportButton: { backgroundColor: Colors.primary, padding: 12, borderRadius: 10, marginTop: 12, alignItems: 'center' },
  exportText: { color: '#FFFFFF', fontWeight: '800' },
  preview: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  previewStack: { padding: 16 },
  previewFrame: { borderRadius: 16, overflow: 'hidden', alignSelf: 'center' },
  previewContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  previewTitle: { fontSize: 40, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  previewDesc: { fontSize: 20, textAlign: 'center', opacity: 0.9 },
});

export default SocialPreviewScreen;
