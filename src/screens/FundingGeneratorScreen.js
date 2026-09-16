import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, useWindowDimensions } from 'react-native';
import Clipboard from '../platform/clipboard';
import { Colors } from '../constants/Colors';

const FundingGeneratorScreen = () => {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [github, setGithub] = useState('');
  const [patreon, setPatreon] = useState('');
  const [openCollective, setOpenCollective] = useState('');
  const [koFi, setKoFi] = useState('');
  const [custom, setCustom] = useState([]);
  const [customInput, setCustomInput] = useState('');

  const yaml = useMemo(() => {
    const buffer = [];
    if (github) buffer.push(github.includes(',') ? `github: [${github}]` : `github: ${github}`);
    if (patreon) buffer.push(`patreon: ${patreon}`);
    if (openCollective) buffer.push(`open_collective: ${openCollective}`);
    if (koFi) buffer.push(`ko_fi: ${koFi}`);
    if (custom.length) buffer.push(`custom: [${custom.join(', ')}]`);
    return buffer.join('\n');
  }, [github, patreon, openCollective, koFi, custom]);

  const addCustom = () => {
    if (!customInput.trim()) return;
    setCustom((prev) => [...prev, customInput.trim()]);
    setCustomInput('');
  };

  return (
    <View style={[styles.container, !isWide && styles.containerStack]}>
      <View style={[styles.controls, !isWide && styles.controlsStack]}>
        <ScrollView>
          <Text style={styles.title}>Funding Generator</Text>
          <Text style={styles.subtitle}>Generate a .github/FUNDING.yml file.</Text>
          <TextInput style={styles.input} value={github} onChangeText={setGithub} placeholder="GitHub usernames (comma separated)" />
          <TextInput style={styles.input} value={patreon} onChangeText={setPatreon} placeholder="Patreon username" />
          <TextInput style={styles.input} value={openCollective} onChangeText={setOpenCollective} placeholder="Open Collective" />
          <TextInput style={styles.input} value={koFi} onChangeText={setKoFi} placeholder="Ko-fi username" />
          <Text style={styles.sectionTitle}>Custom Links</Text>
          <View style={styles.customRow}>
            <TextInput
              style={[styles.input, styles.customInput]}
              value={customInput}
              onChangeText={setCustomInput}
              placeholder="https://paypal.me/user"
            />
            <TouchableOpacity style={styles.addButton} onPress={addCustom}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          {custom.map((link) => (
            <View key={link} style={styles.customChip}>
              <Text style={styles.customText}>{link}</Text>
              <TouchableOpacity onPress={() => setCustom((prev) => prev.filter((item) => item !== link))}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={styles.preview}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>FUNDING.yml</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => {
              Clipboard.setString(yaml);
              Alert.alert('Copied', 'YAML copied to clipboard.');
            }}
          >
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.codeBox}>
          <Text style={styles.codeText}>{yaml || '# Add sponsorship details'}</Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#F8FAFC' },
  containerStack: { flexDirection: 'column' },
  controls: { width: 340, backgroundColor: '#FFFFFF', padding: 16, borderRightWidth: 1, borderRightColor: '#E2E8F0' },
  controlsStack: { width: '100%', borderRightWidth: 0, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#64748B', marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginTop: 16, marginBottom: 8, letterSpacing: 1 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 10, marginBottom: 10 },
  customRow: { flexDirection: 'row', alignItems: 'center' },
  customInput: { flex: 1, marginBottom: 0 },
  addButton: { marginLeft: 8, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  addButtonText: { color: '#FFFFFF', fontWeight: '700' },
  customChip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, backgroundColor: '#EEF2FF', marginTop: 8 },
  customText: { fontSize: 12, color: '#1F2937', flex: 1 },
  removeText: { color: '#EF4444', fontWeight: '700', fontSize: 12 },
  preview: { flex: 1, padding: 16 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  previewTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  copyButton: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  copyText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  codeBox: { backgroundColor: '#0F172A', borderRadius: 10, padding: 12 },
  codeText: { fontFamily: 'monospace', color: '#E2E8F0', fontSize: 12, lineHeight: 18 },
});

export default FundingGeneratorScreen;
