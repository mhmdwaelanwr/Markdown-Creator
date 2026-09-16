import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useProject } from '../context/ProjectContext';
import useIsDark from '../hooks/useIsDark';
import GitHubService from '../services/GitHubService';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';

export default function GenerateCodebaseDialog({ visible, onClose, isDark: isDarkProp }) {
  const { importMarkdown, githubToken } = useProject();
  const isDark = useIsDark(isDarkProp);
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('README.md');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setRepo('');
    setPath('README.md');
    setLoading(false);
  }, [visible]);

  const handleGenerate = async () => {
    if (!repo.trim()) return;
    setLoading(true);
    try {
      const [owner, name] = repo.trim().split('/');
      if (!owner || !name) throw new Error('Use the format owner/repo');
      const content = await GitHubService.fetchFileContent(owner, name, (path || 'README.md').trim() || 'README.md', githubToken || null);
      if (!content) throw new Error('Unable to fetch README from GitHub.');
      await importMarkdown(content);
      Alert.alert('Imported', 'README imported from repository.');
      onClose && onClose();
    } catch (e) {
      Alert.alert('Generate Failed', e?.message || 'Unable to generate from codebase.');
    } finally {
      setLoading(false);
    }
  };

  const inputChrome = [
    styles.input,
    {
      backgroundColor: isDark ? 'rgba(2,6,23,0.35)' : 'rgba(255,255,255,0.80)',
      borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)',
      color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight,
    },
  ];
  const placeholderTextColor = isDark ? 'rgba(226,232,240,0.45)' : 'rgba(15,23,42,0.45)';

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title="Generate from Codebase"
      subtitle="Import a README (or any markdown file) directly from GitHub."
      icon="github"
      maxWidth={720}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CANCEL" onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          <PrimaryButton
            label="IMPORT"
            icon="download"
            onPress={handleGenerate}
            loading={loading}
            disabled={!repo.trim()}
            style={styles.footerBtn}
          />
        </View>
      }
    >
      <View style={styles.form}>
        <Field label="Repository (owner/repo)" isDark={isDark}>
          <TextInput
            style={inputChrome}
            placeholder="mhmdwaelanwr/Markdown-Creator"
            placeholderTextColor={placeholderTextColor}
            value={repo}
            onChangeText={setRepo}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Field>

        <Field label="File path" hint="Defaults to README.md" isDark={isDark}>
          <TextInput
            style={inputChrome}
            placeholder="README.md"
            placeholderTextColor={placeholderTextColor}
            value={path}
            onChangeText={setPath}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Field>

        {!githubToken ? (
          <Text style={[styles.note, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
            No GitHub token found. Public repos work, private repos may require a token.
          </Text>
        ) : null}
      </View>
    </AppDialog>
  );
}

function Field({ label, hint, isDark, children }) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>{label}</Text>
        {hint ? (
          <Text style={[styles.hint, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>{hint}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { width: '100%' },
  field: { marginBottom: 12 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '800' },
  hint: { fontSize: 11, fontWeight: '700', opacity: 0.9 },
  input: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  note: { marginTop: 6, fontSize: 11, fontWeight: '700', lineHeight: 16, opacity: 0.9 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
