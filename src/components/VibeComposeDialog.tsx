import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import useIsDark from '../hooks/useIsDark';
import { Colors } from '../constants/Colors';
import { useProject } from '../context/ProjectContext';
import AIService from '../services/AIService';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';
import InlineNotice from './ui/InlineNotice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type ApplyMode = 'replace' | 'append' | 'prepend';

type VibeComposeDialogProps = {
  visible: boolean;
  onClose: () => void;
  onOpenAISettings?: () => void;
  isDark?: boolean;
};

const MODE_OPTIONS: Array<{ key: ApplyMode; label: string; icon: string }> = [
  { key: 'replace', label: 'applyModeReplace', icon: 'swap-horizontal' },
  { key: 'append', label: 'applyModeAppend', icon: 'plus-box-outline' },
  { key: 'prepend', label: 'applyModePrepend', icon: 'format-vertical-align-top' },
];

const summarize = (elements: any[]) => {
  const counts: Record<string, number> = {};
  for (const element of elements || []) {
    const type = typeof element?.type === 'string' ? element.type : 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
};

export default function VibeComposeDialog({
  visible,
  onClose,
  onOpenAISettings,
  isDark: isDarkProp,
}: VibeComposeDialogProps) {
  const { t } = useTranslation();
  const isDark = useIsDark(isDarkProp);
  const { geminiApiKey, applyElements } = useProject() as any;

  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<ApplyMode>('replace');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<any[]>([]);

  useEffect(() => {
    if (!visible) return;
    setPrompt('');
    setMode('replace');
    setGenerated([]);
    setLoading(false);
  }, [visible]);

  const counts = useMemo(() => summarize(generated), [generated]);
  const total = useMemo(() => generated.length, [generated.length]);

  const inputChrome = [
    styles.input,
    {
      backgroundColor: isDark ? 'rgba(2,6,23,0.35)' : 'rgba(255,255,255,0.80)',
      borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)',
      color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight,
    },
    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
  ];

  const placeholderTextColor = isDark ? 'rgba(226,232,240,0.45)' : 'rgba(15,23,42,0.45)';

  const canGenerate = !!String(prompt || '').trim() && !!String(geminiApiKey || '').trim();

  const handleGenerate = async () => {
    if (!String(geminiApiKey || '').trim()) {
      Alert.alert(t('error'), t('missingAiKey'));
      return;
    }
    const value = String(prompt || '').trim();
    if (!value) return;

    setLoading(true);
    try {
      const result = await AIService.magicCompose(value, geminiApiKey);
      const arr = Array.isArray(result) ? result : [];
      if (!arr.length) {
        Alert.alert(t('warning'), t('aiReturnedEmpty'));
        setGenerated([]);
        return;
      }
      setGenerated(arr);
    } catch (error: any) {
      Alert.alert(t('error'), error?.message || t('aiFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!generated.length) return;
    try {
      applyElements(generated, mode);
      onClose();
    } catch (error: any) {
      Alert.alert(t('error'), error?.message || t('applyFailed'));
    }
  };

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title={t('vibeCoding')}
      subtitle={t('vibeCodingSubtitle')}
      icon="auto-fix"
      maxWidth={860}
      scroll
      footer={
        <View style={styles.footer}>
          <SoftButton label={t('close').toUpperCase()} onPress={onClose} isDark={isDark} />
          <PrimaryButton
            label={t('generate').toUpperCase()}
            icon="sparkles"
            onPress={handleGenerate}
            loading={loading}
            disabled={!canGenerate || loading}
            style={{ marginLeft: 10 }}
          />
          <PrimaryButton
            label={t('apply').toUpperCase()}
            icon="check"
            tone="secondary"
            onPress={handleApply}
            disabled={!generated.length}
            style={{ marginLeft: 10 }}
          />
        </View>
      }
    >
      {!String(geminiApiKey || '').trim() ? (
        <InlineNotice
          isDark={isDark}
          variant="warning"
          icon="robot-outline"
          message={t('missingAiKey')}
          actionLabel={onOpenAISettings ? t('openAiSettings') : undefined}
          onAction={onOpenAISettings}
          style={{ marginBottom: 12 }}
        />
      ) : null}

      <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
        {t('prompt')}
      </Text>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder={t('vibePromptPlaceholder')}
        placeholderTextColor={placeholderTextColor}
        style={[inputChrome, styles.textarea]}
        multiline
        numberOfLines={10}
        textAlignVertical="top"
      />

      <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight, marginTop: 12 }]}>
        {t('applyMode')}
      </Text>
      <View style={styles.modeRow}>
        {MODE_OPTIONS.map((opt) => {
          const active = mode === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setMode(opt.key)}
              style={[
                styles.modeChip,
                {
                  backgroundColor: active
                    ? isDark
                      ? 'rgba(99,102,241,0.16)'
                      : 'rgba(99,102,241,0.12)'
                    : 'transparent',
                  borderColor: active
                    ? isDark
                      ? 'rgba(129,140,248,0.30)'
                      : 'rgba(99,102,241,0.22)'
                    : isDark
                      ? 'rgba(148,163,184,0.16)'
                      : 'rgba(15,23,42,0.10)',
                },
                Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : null,
              ]}
            >
              <View style={styles.modeChipInner}>
                <Icon name={opt.icon} size={16} color={active ? Colors.primary : (isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight)} />
                <Text style={[styles.modeChipText, { color: active ? Colors.primary : (isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight) }]}>
                  {t(opt.label)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {total ? (
        <View style={[styles.previewBox, { borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)' }]}>
          <Text style={[styles.previewTitle, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
            {t('generatedElements', { count: total })}
          </Text>
          <View style={styles.previewRow}>
            {Object.entries(counts).map(([key, value]) => (
              <View
                key={key}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
                    borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
                  },
                ]}
              >
                <Text style={[styles.pillText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
                  {key}: {value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <InlineNotice
          isDark={isDark}
          variant="neutral"
          icon="lightbulb-on-outline"
          message={t('vibeTip')}
          style={{ marginTop: 12 }}
        />
      )}
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 8 },
  input: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  textarea: { minHeight: 170 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  modeChip: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  modeChipInner: { flexDirection: 'row', alignItems: 'center' },
  modeChipText: { marginLeft: 8, fontSize: 12, fontWeight: '900', letterSpacing: 0.2 },
  previewBox: { marginTop: 8, borderWidth: 1, borderRadius: 16, padding: 12 },
  previewTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 0.2, marginBottom: 10 },
  previewRow: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  pillText: { fontSize: 11, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
});
