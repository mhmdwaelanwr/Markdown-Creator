import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import AppDialog from './AppDialog';
import ActionIconButton from './ActionIconButton';
import PrimaryButton from './PrimaryButton';
import SoftButton from './SoftButton';

const DEFAULT_SWATCHES = [
  '#6366F1',
  '#818CF8',
  '#A855F7',
  '#F43F5E',
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#22C55E',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#0EA5E9',
  '#0F172A',
  '#111827',
  '#334155',
  '#64748B',
  '#94A3B8',
  '#CBD5E1',
  '#E2E8F0',
  '#F1F5F9',
  '#FFFFFF',
];

const normalizeHex = (value: string) => {
  let v = String(value || '').trim();
  if (!v) return null;
  if (!v.startsWith('#')) v = `#${v}`;

  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    v = `#${r}${r}${g}${g}${b}${b}`;
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(v)) return null;
  return `#${v.slice(1).toUpperCase()}`;
};

const openWebColorPicker = (initial: string, onPick: (hex: string) => void) => {
  if (Platform.OS !== 'web') return false;
  if (typeof document === 'undefined') return false;

  try {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = normalizeHex(initial) || '#6366F1';
    input.setAttribute('aria-label', 'Color picker');
    input.style.position = 'fixed';
    input.style.left = '-1000px';
    input.style.top = '0';
    input.style.width = '1px';
    input.style.height = '1px';
    input.style.opacity = '0';

    const cleanup = () => {
      try {
        input.remove();
      } catch (_) {
        // ignore
      }
    };

    input.addEventListener('input', () => {
      onPick?.(input.value);
    });
    input.addEventListener('change', () => {
      onPick?.(input.value);
      cleanup();
    });
    input.addEventListener('blur', cleanup);

    document.body.appendChild(input);
    input.click();
    return true;
  } catch {
    return false;
  }
};

type ColorPickerDialogProps = {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  title?: string;
  value: string;
  onApply: (color: string) => void;
  swatches?: string[];
};

export default function ColorPickerDialog({
  visible,
  onClose,
  isDark,
  title = 'Pick a color',
  value,
  onApply,
  swatches = DEFAULT_SWATCHES,
}: ColorPickerDialogProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value || '#6366F1');

  useEffect(() => {
    if (!visible) return;
    setDraft(value || '#6366F1');
  }, [value, visible]);

  const normalizedDraft = useMemo(() => normalizeHex(draft), [draft]);
  const previewColor = normalizedDraft || normalizeHex(value) || '#6366F1';

  const inputChrome = useMemo(
    () => [
      styles.input,
      {
        backgroundColor: isDark ? 'rgba(2,6,23,0.35)' : 'rgba(255,255,255,0.80)',
        borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)',
        color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight,
      },
    ],
    [isDark],
  );

  const placeholderTextColor = isDark ? 'rgba(226,232,240,0.45)' : 'rgba(15,23,42,0.45)';

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title={title}
      subtitle="Choose a swatch or enter a HEX color."
      icon="palette-outline"
      maxWidth={640}
      scroll={false}
      footer={
        <View style={styles.footer}>
          <SoftButton label={t('cancel').toUpperCase()} onPress={onClose} isDark={isDark} />
          <PrimaryButton
            label={t('save').toUpperCase()}
            icon="check"
            onPress={() => {
              const next = normalizedDraft;
              if (!next) return;
              onApply(next);
              onClose();
            }}
            disabled={!normalizedDraft}
            style={{ marginLeft: 10 }}
          />
        </View>
      }
    >
      <View style={styles.row}>
        <View style={[styles.preview, { backgroundColor: previewColor }]} />
        <View style={{ flex: 1 }}>
          <View style={styles.labelRow}>
            <Text
              style={[
                styles.label,
                styles.labelInline,
                { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight },
              ]}
            >
              HEX
            </Text>
            {Platform.OS === 'web' ? (
              <ActionIconButton
                icon="eyedropper-variant"
                onPress={() => {
                  openWebColorPicker(previewColor, (hex) => setDraft(hex));
                }}
                isDark={isDark}
                accessibilityLabel="Pick color"
              />
            ) : null}
          </View>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="#6366F1"
            placeholderTextColor={placeholderTextColor}
            autoCapitalize="none"
            autoCorrect={false}
            style={inputChrome as any}
          />
          {!normalizedDraft ? (
            <Text style={[styles.error, { color: isDark ? 'rgba(248,113,113,0.9)' : '#DC2626' }]}>
              Enter a valid HEX like #6366F1
            </Text>
          ) : null}
        </View>
      </View>

      <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>SWATCHES</Text>
      <View style={styles.swatches}>
        {swatches.map((hex) => {
          const normalized = normalizeHex(hex) || hex;
          const active = normalizeHex(draft) === normalizeHex(hex);
          return (
            <Pressable
              key={hex}
              onPress={() => setDraft(normalized)}
              style={[
                styles.swatch,
                {
                  backgroundColor: normalized,
                  borderColor: active ? Colors.primary : isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.12)',
                },
                Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : null,
              ]}
            />
          );
        })}
      </View>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  preview: {
    width: 46,
    height: 46,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 8 },
  labelInline: { marginBottom: 0 },
  input: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  error: { fontSize: 11, fontWeight: '700', marginTop: 8 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap' },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
  },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
});
