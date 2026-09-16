import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useProject } from '../context/ProjectContext';
import useIsDark from '../hooks/useIsDark';
import Clipboard from '../platform/clipboard';
import DocumentationGenerator from '../services/DocumentationGenerator';
import FileGenerators from '../services/FileGenerators';
import LicenseGenerator from '../services/LicenseGenerator';
import AppDialog from './ui/AppDialog';
import ActionIconButton from './ui/ActionIconButton';
import SoftButton from './ui/SoftButton';

export default function ExtraFilesDialog({ visible, onClose, isDark: isDarkProp }) {
  const {
    variables,
    licenseType,
    includeContributing,
    includeSecurity,
    includeSupport,
    includeCodeOfConduct,
    includeIssueTemplates,
    setIncludeContributing,
    setIncludeSecurity,
    setIncludeSupport,
    setIncludeCodeOfConduct,
    setIncludeIssueTemplates,
  } = useProject();

  const isDark = useIsDark(isDarkProp);
  const [selectedFile, setSelectedFile] = useState('LICENSE');
  const [copied, setCopied] = useState(false);

  const licenseText = useMemo(() => {
    if (!licenseType || licenseType === 'None') return '';
    return LicenseGenerator.generate(
      licenseType,
      variables?.CURRENT_YEAR || new Date().getFullYear(),
      variables?.GITHUB_USERNAME || 'author',
    );
  }, [licenseType, variables]);

  const fileItems = useMemo(
    () => [
      { key: 'LICENSE', label: 'LICENSE', enabled: licenseType && licenseType !== 'None', content: licenseText },
      {
        key: 'CONTRIBUTING',
        label: 'CONTRIBUTING.md',
        enabled: includeContributing,
        onToggle: setIncludeContributing,
        content: FileGenerators.generateContributing(variables),
      },
      {
        key: 'SECURITY',
        label: 'SECURITY.md',
        enabled: includeSecurity,
        onToggle: setIncludeSecurity,
        content: DocumentationGenerator.generateSecurityPolicy(variables?.EMAIL || 'security@example.com'),
      },
      {
        key: 'SUPPORT',
        label: 'SUPPORT.md',
        enabled: includeSupport,
        onToggle: setIncludeSupport,
        content: DocumentationGenerator.generateSupport(variables?.EMAIL || 'support@example.com', variables?.DISCORD || ''),
      },
      {
        key: 'CODE_OF_CONDUCT',
        label: 'CODE_OF_CONDUCT.md',
        enabled: includeCodeOfConduct,
        onToggle: setIncludeCodeOfConduct,
        content: FileGenerators.generateCodeOfConduct(variables),
      },
      {
        key: 'ISSUE_TEMPLATES',
        label: 'Issue templates',
        enabled: includeIssueTemplates,
        onToggle: setIncludeIssueTemplates,
        content: `${FileGenerators.generateBugReportTemplate()}\n\n${FileGenerators.generateFeatureRequestTemplate()}`,
      },
    ],
    [
      includeCodeOfConduct,
      includeContributing,
      includeIssueTemplates,
      includeSecurity,
      includeSupport,
      licenseText,
      licenseType,
      setIncludeCodeOfConduct,
      setIncludeContributing,
      setIncludeIssueTemplates,
      setIncludeSecurity,
      setIncludeSupport,
      variables,
    ],
  );

  const preview = fileItems.find((item) => item.key === selectedFile) || fileItems[0];
  const previewContent = preview?.content || '';

  const handleCopy = async () => {
    await Clipboard.setString(previewContent || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
  };

  const foreground = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;
  const subtle = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title="Extra Files"
      subtitle="Preview and toggle common community files."
      icon="file-multiple-outline"
      maxWidth={980}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CLOSE" onPress={onClose} isDark={isDark} />
        </View>
      }
    >
      <View style={styles.layout}>
        <View style={styles.list}>
          <Text style={[styles.sectionTitle, { color: subtle }]}>FILES</Text>
          {fileItems.map((file) => {
            const active = selectedFile === file.key;
            const enabled = !!file.enabled;
            const borderColor = active
              ? isDark
                ? 'rgba(129,140,248,0.30)'
                : 'rgba(99,102,241,0.22)'
              : isDark
                ? 'rgba(148,163,184,0.16)'
                : 'rgba(15,23,42,0.10)';
            return (
              <Pressable
                key={file.key}
                onPress={() => setSelectedFile(file.key)}
                style={[
                  styles.fileItem,
                  {
                    backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
                    borderColor,
                  },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : null,
                ]}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.fileName, { color: foreground }]} numberOfLines={1}>
                    {file.label}
                  </Text>
                  <Text style={[styles.fileHint, { color: subtle }]}>{enabled ? 'Included' : 'Not included'}</Text>
                </View>
                {file.onToggle ? (
                  <Switch
                    value={enabled}
                    onValueChange={file.onToggle}
                    thumbColor={Colors.primary}
                    trackColor={{
                      false: isDark ? 'rgba(148,163,184,0.22)' : 'rgba(15,23,42,0.16)',
                      true: 'rgba(99,102,241,0.55)',
                    }}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.preview}>
          <View style={styles.previewHeader}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.sectionTitle, { color: subtle }]}>{preview?.label || 'PREVIEW'}</Text>
              <Text style={[styles.previewHint, { color: subtle }]} numberOfLines={1}>
                {preview?.enabled ? 'Included in export' : 'Currently disabled'}
              </Text>
            </View>
            <ActionIconButton
              icon={copied ? 'check' : 'content-copy'}
              onPress={handleCopy}
              isDark={isDark}
              active={copied}
              accessibilityLabel="Copy file content"
            />
          </View>
          <View
            style={[
              styles.previewBox,
              {
                backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
                borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
              },
            ]}
          >
            <ScrollView>
              <Text selectable style={[styles.previewText, { color: foreground }]}>
                {previewContent || 'No content available.'}
              </Text>
            </ScrollView>
          </View>
          {copied ? (
            <View style={styles.toastWrap} pointerEvents="none">
              <View style={styles.toast}>
                <Text style={styles.toastText}>Copied</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  layout: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  list: { width: '42%', minWidth: 280, paddingRight: 12 },
  preview: { width: '58%', minWidth: 320, paddingLeft: 12 },
  sectionTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 8 },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  fileName: { fontSize: 13, fontWeight: '900' },
  fileHint: { marginTop: 4, fontSize: 11, fontWeight: '700', opacity: 0.92 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  previewHint: { marginTop: 2, fontSize: 11, fontWeight: '700', opacity: 0.9 },
  previewBox: { borderWidth: 1, borderRadius: 14, padding: 12, minHeight: 280, maxHeight: 420 },
  previewText: { fontFamily: Platform.OS === 'web' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : 'monospace', fontSize: 12, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  toastWrap: { position: 'absolute', right: 12, bottom: 12 },
  toast: { backgroundColor: 'rgba(0,0,0,0.70)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  toastText: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 0.6 },
});
