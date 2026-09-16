import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import ProjectSettingsDialog from '../components/ProjectSettingsDialog';
import ImportMarkdownDialog from '../components/ImportMarkdownDialog';
import FeedbackDialog from '../components/FeedbackDialog';
import AboutAppDialog from '../components/AboutAppDialog';
import PaywallDialog from '../components/PaywallDialog';
import LanguageDialog from '../components/LanguageDialog';
import { useProject } from '../context/ProjectContext';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import GlassView from '../components/ui/GlassView';

const SettingsScreen = () => {
  const { setLocale } = useProject();
  const isDark = useIsDark();
  const { t } = useTranslation();
  const [showProject, setShowProject] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? Colors.editorBackgroundDark : Colors.editorBackgroundLight },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
          {t('settings')}
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
          Manage your preferences and app settings.
        </Text>
      </View>

      <GlassView tone={isDark ? 'dark' : 'light'} style={styles.card}>
        <SettingRow
          icon="tune-variant"
          label={t('projectSettings')}
          subtitle={`${t('variables')}, ${t('license')}, ${t('formatting')}`}
          isDark={isDark}
          onPress={() => setShowProject(true)}
        />
        <SettingRow
          icon="file-import-outline"
          label={t('importMarkdown')}
          subtitle="Paste, URL, or GitHub"
          isDark={isDark}
          onPress={() => setShowImport(true)}
        />
        <SettingRow
          icon="message-text-outline"
          label="Send feedback"
          subtitle="Help us improve the experience"
          isDark={isDark}
          onPress={() => setShowFeedback(true)}
        />
        <SettingRow
          icon="information-outline"
          label={t('aboutApp')}
          subtitle="Version, links, and credits"
          isDark={isDark}
          onPress={() => setShowAbout(true)}
        />
        <SettingRow
          icon="star-outline"
          label={t('proDialogTitle')}
          subtitle={t('proFreeForAll')}
          isDark={isDark}
          onPress={() => setShowPaywall(true)}
          accent
        />
        <SettingRow
          icon="translate"
          label={t('changeLanguage')}
          subtitle="Choose UI language"
          isDark={isDark}
          onPress={() => setShowLanguage(true)}
        />
      </GlassView>

      {/* Dialogs */}
      <ProjectSettingsDialog visible={showProject} onClose={() => setShowProject(false)} />
      <ImportMarkdownDialog visible={showImport} onClose={() => setShowImport(false)} />
      <FeedbackDialog visible={showFeedback} onClose={() => setShowFeedback(false)} />
      <AboutAppDialog visible={showAbout} onClose={() => setShowAbout(false)} />
      <PaywallDialog visible={showPaywall} onClose={() => setShowPaywall(false)} />
      <LanguageDialog
        visible={showLanguage}
        onClose={() => setShowLanguage(false)}
        onSelect={(lang) => setLocale(lang)}
      />
    </ScrollView>
  );
};

const SettingRow = ({ icon, label, subtitle, onPress, isDark, accent = false }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.row,
      {
        backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
        borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
      },
    ]}
  >
    <View style={[styles.rowIcon, { backgroundColor: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.10)' }]}>
      <Icon name={icon} size={18} color={accent ? Colors.accent : Colors.primary} />
    </View>
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={[styles.rowLabel, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
        {label}
      </Text>
      <Text style={[styles.rowSubtitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
    <Icon name="chevron-right" size={22} color={isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: { width: '100%', maxWidth: 720, marginBottom: 14 },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    opacity: 0.9,
  },
  card: { width: '100%', maxWidth: 720, borderRadius: 18, padding: 12, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  rowIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowLabel: { fontSize: 13, fontWeight: '900' },
  rowSubtitle: { marginTop: 2, fontSize: 11, fontWeight: '700', opacity: 0.92 },
});

export default SettingsScreen;
