import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import { useProject } from '../context/ProjectContext';
import useIsDark from '../hooks/useIsDark';
import GitHubService from '../services/GitHubService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';

export default function ImportMarkdownDialog({ visible, onClose, isDark: isDarkProp }) {
  const { importMarkdown, githubToken } = useProject();
  const isDark = useIsDark(isDarkProp);
  const { t } = useTranslation();
  const [tab, setTab] = useState('paste'); // paste | url | github
  const [markdown, setMarkdown] = useState('');
  const [url, setUrl] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('README.md');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTab('paste');
    setMarkdown('');
    setUrl('');
    setRepo('');
    setPath('README.md');
    setLoading(false);
  }, [visible]);

  const tabs = useMemo(
    () => [
      { key: 'paste', label: 'Paste', icon: 'content-paste' },
      { key: 'url', label: 'From URL', icon: 'link-variant' },
      { key: 'github', label: 'GitHub', icon: 'github' },
    ],
    [],
  );

  const handleImport = async () => {
    setLoading(true);
    try {
      let content = markdown;
      if (tab === 'url') {
        if (!url.trim()) throw new Error('Please enter a URL');
        const response = await fetch(url.trim());
        content = await response.text();
      } else if (tab === 'github') {
        if (!repo.trim()) throw new Error('Please enter the repository in the format owner/repo');
        const [owner, name] = repo.trim().split('/');
        if (!owner || !name) throw new Error('Use the format owner/repo');
        const fileContent = await GitHubService.fetchFileContent(
          owner,
          name,
          (path || 'README.md').trim() || 'README.md',
          githubToken || null,
        );
        if (!fileContent) throw new Error('Unable to load file from GitHub.');
        content = fileContent;
      } else {
        if (!markdown.trim()) throw new Error('Please paste markdown content first');
      }
      await importMarkdown(content);
      Alert.alert('Imported', 'Markdown imported successfully!');
      onClose && onClose();
    } catch (e) {
      Alert.alert('Import Failed', e?.message || 'Could not import markdown');
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

  const canImport =
    !loading &&
    ((tab === 'paste' && markdown.trim().length > 0) ||
      (tab === 'url' && url.trim().length > 0) ||
      (tab === 'github' && repo.trim().length > 0));

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title={t('importMarkdown')}
      subtitle="Bring existing markdown into your workspace."
      icon="file-import-outline"
      maxWidth={780}
      scroll={false}
      footer={
        <View style={styles.footer}>
          <SoftButton label={t('cancel').toUpperCase()} onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          <PrimaryButton
            label={t('import').toUpperCase()}
            icon="download"
            onPress={handleImport}
            loading={loading}
            disabled={!canImport}
            style={styles.footerBtn}
          />
        </View>
      }
    >
      <View style={styles.tabRow}>
        {tabs.map((item) => (
          <TabPill
            key={item.key}
            label={item.label}
            icon={item.icon}
            isDark={isDark}
            active={tab === item.key}
            onPress={() => setTab(item.key)}
          />
        ))}
      </View>

      {tab === 'paste' ? (
        <TextInput
          style={[inputChrome, styles.textarea]}
          placeholder="Paste your markdown here…"
          placeholderTextColor={placeholderTextColor}
          value={markdown}
          onChangeText={setMarkdown}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
        />
      ) : null}

      {tab === 'url' ? (
        <View>
          <Text style={[styles.hint, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
            Tip: Use a raw GitHub URL for best results.
          </Text>
          <TextInput
            style={inputChrome}
            placeholder="https://example.com/README.md"
            placeholderTextColor={placeholderTextColor}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ) : null}

      {tab === 'github' ? (
        <View>
          <Text style={[styles.hint, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
            Uses your saved GitHub token if available.
          </Text>
          <TextInput
            style={inputChrome}
            placeholder="owner/repo"
            placeholderTextColor={placeholderTextColor}
            value={repo}
            onChangeText={setRepo}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[inputChrome, { marginTop: 10 }]}
            placeholder="README.md"
            placeholderTextColor={placeholderTextColor}
            value={path}
            onChangeText={setPath}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ) : null}

      {tab === 'github' && !githubToken ? (
        <View style={[styles.note, { backgroundColor: isDark ? 'rgba(99,102,241,0.10)' : 'rgba(99,102,241,0.08)', borderColor: isDark ? 'rgba(129,140,248,0.25)' : 'rgba(99,102,241,0.18)' }]}>
          <Text style={[styles.noteText, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
            No GitHub token found. Public repos still work, but private repos may fail.
          </Text>
        </View>
      ) : null}
    </AppDialog>
  );
}

function TabPill({ label, icon, active, isDark, onPress }) {
  const activeBg = isDark ? 'rgba(99,102,241,0.16)' : 'rgba(99,102,241,0.12)';
  const activeBorder = isDark ? 'rgba(129,140,248,0.30)' : 'rgba(99,102,241,0.22)';
  const border = isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)';
  const text = active ? Colors.primary : isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tabPill,
        active ? { backgroundColor: activeBg, borderColor: activeBorder } : { borderColor: border },
        Platform.OS === 'web' ? { cursor: 'pointer' } : null,
      ]}
    >
      <View style={styles.tabPillInner}>
        {icon ? <Icon name={icon} size={15} color={text} /> : null}
        <Text style={[styles.tabPillText, { color: text, marginLeft: icon ? 8 : 0 }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', marginBottom: 12 },
  tabPill: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
  },
  tabPillInner: { flexDirection: 'row', alignItems: 'center' },
  tabPillText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.4 },
  hint: { fontSize: 11, lineHeight: 16, marginBottom: 8 },
  input: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  textarea: { minHeight: 180 },
  note: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noteText: { fontSize: 11, lineHeight: 16, fontWeight: '700', opacity: 0.95 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
