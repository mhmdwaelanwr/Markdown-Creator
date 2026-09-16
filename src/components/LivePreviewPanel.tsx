import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Clipboard from '../platform/clipboard';
import { Colors } from '../constants/Colors';
import GlassView from './ui/GlassView';
import ActionIconButton from './ui/ActionIconButton';
import { downloadReadme } from '../utils/downloader';

type PreviewTab = 'rendered' | 'source';

type LivePreviewPanelProps = {
  markdown: string;
  isDark: boolean;
  style?: any;
};

const countWords = (value: string) => {
  const trimmed = (value || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

const countLines = (value: string) => (value ? value.split(/\r?\n/).length : 0);

export default function LivePreviewPanel({ markdown, isDark, style }: LivePreviewPanelProps) {
  const [tab, setTab] = useState<PreviewTab>('rendered');
  const [copied, setCopied] = useState(false);

  const tone = isDark ? 'dark' : 'light';
  const foreground = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;
  const subtle = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;

  const stats = useMemo(() => {
    const words = countWords(markdown);
    const lines = countLines(markdown);
    const minutes = Math.max(1, Math.round(words / 220));
    return { words, lines, minutes };
  }, [markdown]);

  const handleCopy = async () => {
    await Clipboard.setString(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
  };

  const handleDownload = async () => {
    await downloadReadme(markdown);
  };

  return (
    <GlassView tone={tone} style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.title, { color: foreground }]} numberOfLines={1}>
            Live Preview
          </Text>
          <Text style={[styles.subtitle, { color: subtle }]} numberOfLines={1}>
            {stats.words} words · {stats.lines} lines · ~{stats.minutes} min read
          </Text>
        </View>

        <View style={styles.headerActions}>
          <ActionIconButton
            icon={copied ? 'check' : 'content-copy'}
            onPress={handleCopy}
            isDark={isDark}
            active={copied}
            accessibilityLabel="Copy markdown"
          />
          <ActionIconButton
            icon="download"
            onPress={handleDownload}
            isDark={isDark}
            style={{ marginLeft: 8 }}
            accessibilityLabel="Download README.md"
          />
        </View>
      </View>

      <View style={styles.tabRow}>
        <TabButton
          label="Rendered"
          active={tab === 'rendered'}
          isDark={isDark}
          onPress={() => setTab('rendered')}
        />
        <TabButton
          label="Markdown"
          active={tab === 'source'}
          isDark={isDark}
          onPress={() => setTab('source')}
        />
        <View style={{ flex: 1 }} />
        {Platform.OS === 'web' ? (
          <View style={styles.hintPill}>
            <Text style={styles.hintText}>Live</Text>
          </View>
        ) : null}
      </View>

      {tab === 'rendered' ? (
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <Markdown style={markdownStyles(isDark)}>{markdown}</Markdown>
        </ScrollView>
      ) : (
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <Text selectable style={[styles.code, { color: foreground }]}>
            {markdown}
          </Text>
        </ScrollView>
      )}

      {copied ? (
        <View style={styles.toastWrap} pointerEvents="none">
          <View style={styles.toast}>
            <Text style={styles.toastText}>Copied</Text>
          </View>
        </View>
      ) : null}
    </GlassView>
  );
}

function TabButton({
  label,
  active,
  isDark,
  onPress,
}: {
  label: string;
  active: boolean;
  isDark: boolean;
  onPress: () => void;
}) {
  const textColor = active
    ? Colors.primary
    : isDark
      ? Colors.textSecondaryDark
      : Colors.textSecondaryLight;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        active && {
          backgroundColor: isDark ? 'rgba(99,102,241,0.16)' : 'rgba(99,102,241,0.12)',
          borderColor: isDark ? 'rgba(129,140,248,0.30)' : 'rgba(99,102,241,0.22)',
        },
        !active && { borderColor: 'rgba(148,163,184,0.12)' },
        Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : null,
      ]}
    >
      <Text style={[styles.tabText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const markdownStyles = (isDark: boolean) =>
  ({
  body: { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight, fontSize: 14, lineHeight: 22 },
  heading1: { fontSize: 24, fontWeight: '900' },
  heading2: { fontSize: 20, fontWeight: '800' },
  heading3: { fontSize: 18, fontWeight: '700' },
  code_inline: {
    backgroundColor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.06)',
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  link: { color: Colors.primary },
} as any);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontSize: 14, fontWeight: '900', letterSpacing: 0.2 },
  subtitle: { fontSize: 11, marginTop: 2, opacity: 0.9 },
  headerActions: { flexDirection: 'row' },
  tabRow: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  tabText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.3 },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 14, paddingBottom: 18 },
  code: {
    fontFamily: Platform.select({
      web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      default: 'monospace',
    }),
    fontSize: 12,
    lineHeight: 18,
  },
  hintPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(2,6,23,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  hintText: {
    color: 'rgba(226,232,240,0.78)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: 'rgba(2,6,23,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  toastText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
});
