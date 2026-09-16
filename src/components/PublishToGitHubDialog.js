import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useProject } from '../context/ProjectContext';
import useIsDark from '../hooks/useIsDark';
import MarkdownGenerator from '../services/MarkdownGenerator';
import GitHubPublisherService from '../services/githubPublisherService';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';

export default function PublishToGitHubDialog({ visible, onClose, isDark: isDarkProp }) {
  const {
    elements,
    variables,
    listBullet,
    sectionSpacing,
    targetLanguage,
    githubToken,
    setGithubToken,
  } = useProject();

  const isDark = useIsDark(isDarkProp);
  const [token, setToken] = useState(githubToken || '');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [path, setPath] = useState('README.md');
  const [message, setMessage] = useState('Update README');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setToken(githubToken || '');
    setOwner('');
    setRepo('');
    setBranch('main');
    setPath('README.md');
    setMessage('Update README');
    setLoading(false);
  }, [visible, githubToken]);

  const handlePublish = async () => {
    if (!owner.trim() || !repo.trim()) return;
    setLoading(true);
    try {
      GitHubPublisherService.setToken(token || '');
      const markdown = MarkdownGenerator.generate(elements, variables, listBullet, sectionSpacing, targetLanguage, false);
      await GitHubPublisherService.publishReadme({
        owner: owner.trim(),
        repo: repo.trim(),
        content: markdown,
        branchName: (branch || 'main').trim() || 'main',
        commitMessage: (message || 'Update README').trim() || 'Update README',
        path: (path || 'README.md').trim() || 'README.md',
      });
      if (token) setGithubToken(token);
      Alert.alert('Published', 'README published to GitHub successfully.');
      onClose && onClose();
    } catch (e) {
      Alert.alert('Publish Failed', e?.message || 'Unable to publish README.');
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
      title="Publish to GitHub"
      subtitle="Commit your generated README directly to a repository."
      icon="github"
      maxWidth={860}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CANCEL" onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          <PrimaryButton
            label="PUBLISH"
            icon="cloud-upload-outline"
            onPress={handlePublish}
            loading={loading}
            disabled={!owner.trim() || !repo.trim()}
            style={styles.footerBtn}
          />
        </View>
      }
    >
      <View style={styles.form}>
        <Field label="Personal access token" hint="Stored locally (optional)" isDark={isDark}>
          <TextInput
            style={inputChrome}
            placeholder="ghp_..."
            placeholderTextColor={placeholderTextColor}
            value={token}
            onChangeText={setToken}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Owner" hint="User or org" isDark={isDark}>
              <TextInput
                style={inputChrome}
                placeholder="mhmdwaelanwr"
                placeholderTextColor={placeholderTextColor}
                value={owner}
                onChangeText={setOwner}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Field>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Field label="Repository" hint="Name only" isDark={isDark}>
              <TextInput
                style={inputChrome}
                placeholder="Markdown-Creator"
                placeholderTextColor={placeholderTextColor}
                value={repo}
                onChangeText={setRepo}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Field>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Branch" hint="Default main" isDark={isDark}>
              <TextInput
                style={inputChrome}
                placeholder="main"
                placeholderTextColor={placeholderTextColor}
                value={branch}
                onChangeText={setBranch}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Field>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Field label="Path" hint="README.md" isDark={isDark}>
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
          </View>
        </View>

        <Field label="Commit message" isDark={isDark}>
          <TextInput
            style={inputChrome}
            placeholder="Update README"
            placeholderTextColor={placeholderTextColor}
            value={message}
            onChangeText={setMessage}
          />
        </Field>

        <View style={[styles.note, { borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)' }]}>
          <Text style={[styles.noteText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
            Tip: If you publish frequently, store a token once and it will be reused for future publishes.
          </Text>
        </View>
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
  row: { flexDirection: 'row' },
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
  note: { marginTop: 8, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  noteText: { fontSize: 11, fontWeight: '700', lineHeight: 16, opacity: 0.92 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
