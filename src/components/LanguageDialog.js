import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import { useTranslation } from 'react-i18next';
import { useProject } from '../context/ProjectContext';
import AppDialog from './ui/AppDialog';
import SoftButton from './ui/SoftButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ja', name: '日本語' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
];

export default function LanguageDialog({ visible, onClose, onSelect, isDark: isDarkProp }) {
  const { locale } = useProject();
  const isDark = useIsDark(isDarkProp);
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) return;
    setSelected(locale || 'en');
    setQuery('');
  }, [visible, locale]);

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter((lang) => lang.code.toLowerCase().includes(q) || lang.name.toLowerCase().includes(q));
  }, [query]);

  const handleSelect = (lang) => {
    setSelected(lang.code);
    onSelect && onSelect(lang.code);
    onClose && onClose();
  };

  const inputChrome = [
    styles.search,
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
      title={t('changeLanguage')}
      subtitle={t('chooseLanguageSubtitle')}
      icon="translate"
      maxWidth={560}
      footer={
        <View style={styles.footer}>
          <SoftButton label={t('close').toUpperCase()} onPress={onClose} isDark={isDark} />
        </View>
      }
    >
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('searchLanguagePlaceholder')}
        placeholderTextColor={placeholderTextColor}
        style={inputChrome}
      />

      <View style={{ marginTop: 10 }}>
        {filtered.map((lang) => {
          const active = selected === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => handleSelect(lang)}
              style={[
                styles.row,
                {
                  backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
                  borderColor: active
                    ? isDark
                      ? 'rgba(129,140,248,0.30)'
                      : 'rgba(99,102,241,0.22)'
                    : isDark
                      ? 'rgba(148,163,184,0.16)'
                      : 'rgba(15,23,42,0.10)',
                },
                Platform.OS === 'web' ? { cursor: 'pointer' } : null,
              ]}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.name, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
                  {lang.name}
                </Text>
                <Text style={[styles.code, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
                  {lang.code.toUpperCase()}
                </Text>
              </View>
              <Icon name={active ? 'check-circle' : 'circle-outline'} size={18} color={active ? Colors.primary : (isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight)} />
            </Pressable>
          );
        })}
        {!filtered.length ? (
          <View style={styles.emptyWrap}>
            <Text style={[styles.empty, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {t('noLanguagesMatch')}
            </Text>
          </View>
        ) : null}
      </View>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  search: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  name: { fontSize: 13, fontWeight: '900' },
  code: { marginTop: 4, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, opacity: 0.9 },
  emptyWrap: { paddingVertical: 10 },
  empty: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
});
