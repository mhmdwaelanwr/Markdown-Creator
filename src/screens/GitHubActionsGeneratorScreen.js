import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, ScrollView, Alert, useWindowDimensions } from 'react-native';
import Clipboard from '../platform/clipboard';
import { Colors } from '../constants/Colors';

const GitHubActionsGeneratorScreen = () => {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [cronSchedule, setCronSchedule] = useState('0 0 * * *');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [workflowDispatchEnabled, setWorkflowDispatchEnabled] = useState(true);
  const [checkout, setCheckout] = useState(true);
  const [setupNode, setSetupNode] = useState(false);
  const [updateFeed, setUpdateFeed] = useState(false);
  const [feedUrl, setFeedUrl] = useState('');
  const [commitChanges, setCommitChanges] = useState(true);

  const yaml = useMemo(() => {
    const buffer = [];
    buffer.push('name: Update README');
    buffer.push('');
    buffer.push('on:');
    if (scheduleEnabled) {
      buffer.push('  schedule:');
      buffer.push(`    - cron: "${cronSchedule}"`);
    }
    if (pushEnabled) {
      buffer.push('  push:');
      buffer.push('    branches: [ main, master ]');
    }
    if (workflowDispatchEnabled) {
      buffer.push('  workflow_dispatch:');
    }
    buffer.push('');
    buffer.push('jobs:');
    buffer.push('  build:');
    buffer.push('    runs-on: ubuntu-latest');
    buffer.push('    steps:');
    if (checkout) {
      buffer.push('      - uses: actions/checkout@v3');
    }
    if (setupNode) {
      buffer.push('      - uses: actions/setup-node@v3');
      buffer.push('        with:');
      buffer.push('          node-version: 16');
    }
    if (updateFeed && feedUrl) {
      buffer.push('      - name: Update Feed');
      buffer.push('        uses: sarisia/actions-readme-feed@v1');
      buffer.push('        with:');
      buffer.push(`          url: "${feedUrl}"`);
      buffer.push('          file: "README.md"');
    }
    if (commitChanges) {
      buffer.push('      - name: Commit changes');
      buffer.push('        run: |');
      buffer.push('          git config --global user.name "GitHub Actions Bot"');
      buffer.push('          git config --global user.email "actions@github.com"');
      buffer.push('          git add README.md');
      buffer.push('          git commit -m "Update README" || exit 0');
      buffer.push('          git push');
    }
    return buffer.join('\n');
  }, [scheduleEnabled, cronSchedule, pushEnabled, workflowDispatchEnabled, checkout, setupNode, updateFeed, feedUrl, commitChanges]);

  return (
    <View style={[styles.container, !isWide && styles.containerStack]}>
      <View style={[styles.controls, !isWide && styles.controlsStack]}>
        <ScrollView>
          <Text style={styles.title}>GitHub Actions Generator</Text>
          <Text style={styles.sectionTitle}>Triggers</Text>
          <SwitchRow label="Schedule (Cron)" value={scheduleEnabled} onValueChange={setScheduleEnabled} />
          {scheduleEnabled && (
            <TextInput style={styles.input} value={cronSchedule} onChangeText={setCronSchedule} placeholder="0 0 * * *" />
          )}
          <SwitchRow label="Push to main/master" value={pushEnabled} onValueChange={setPushEnabled} />
          <SwitchRow label="Manual Dispatch" value={workflowDispatchEnabled} onValueChange={setWorkflowDispatchEnabled} />
          <Text style={styles.sectionTitle}>Steps</Text>
          <SwitchRow label="Checkout Repo" value={checkout} onValueChange={setCheckout} />
          <SwitchRow label="Setup Node.js" value={setupNode} onValueChange={setSetupNode} />
          <SwitchRow label="Update RSS Feed" value={updateFeed} onValueChange={setUpdateFeed} />
          {updateFeed && (
            <TextInput style={styles.input} value={feedUrl} onChangeText={setFeedUrl} placeholder="https://example.com/feed.xml" />
          )}
          <SwitchRow label="Commit Changes" value={commitChanges} onValueChange={setCommitChanges} />
        </ScrollView>
      </View>
      <View style={styles.preview}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>preview.yml</Text>
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
          <Text style={styles.codeText}>{yaml}</Text>
        </ScrollView>
      </View>
    </View>
  );
};

const SwitchRow = ({ label, value, onValueChange }) => (
  <View style={styles.switchRow}>
    <Text style={styles.label}>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} thumbColor={Colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#F8FAFC' },
  containerStack: { flexDirection: 'column' },
  controls: { width: 340, backgroundColor: '#FFFFFF', padding: 16, borderRightWidth: 1, borderRightColor: '#E2E8F0' },
  controlsStack: { width: '100%', borderRightWidth: 0, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginTop: 16, marginBottom: 8, letterSpacing: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 10, marginBottom: 10 },
  preview: { flex: 1, padding: 16 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  previewTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  copyButton: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  copyText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  codeBox: { backgroundColor: '#0F172A', borderRadius: 10, padding: 12 },
  codeText: { fontFamily: 'monospace', color: '#E2E8F0', fontSize: 12, lineHeight: 18 },
});

export default GitHubActionsGeneratorScreen;
