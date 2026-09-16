import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PaywallDialog({ visible, onClose, isDark: isDarkProp }) {
  const isDark = useIsDark(isDarkProp);
  const { t } = useTranslation();

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title={t('proDialogTitle')}
      subtitle={t('proDialogSubtitle')}
      icon="star-outline"
      maxWidth={720}
      footer={
        <View style={styles.footer}>
          <SoftButton label={t('close').toUpperCase()} onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          <PrimaryButton
            label={t('supportDevelopment').toUpperCase()}
            icon="heart-outline"
            tone="danger"
            onPress={() => Linking.openURL('https://www.buymeacoffee.com/mhmdwaelanwr')}
            style={styles.footerBtn}
          />
        </View>
      }
    >
      <View style={styles.hero}>
        <Icon name="crown-outline" size={42} color={Colors.accent} />
        <Text style={[styles.heroTitle, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
          Pro Features
        </Text>
        <Text style={[styles.heroSubtitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
          Professional workflow, faster creation, more exports.
        </Text>
      </View>

      <View style={styles.list}>
        <Feature isDark={isDark} icon="lightning-bolt-outline" title="Faster editing" subtitle="Command palette, shortcuts, and smart panels." />
        <Feature isDark={isDark} icon="palette-outline" title="Premium themes" subtitle="Liquid glass UI and polished templates." />
        <Feature isDark={isDark} icon="rocket-launch-outline" title="Advanced export" subtitle="Export markdown/HTML and share-ready assets." />
        <Feature isDark={isDark} icon="cloud-sync-outline" title="Sync-ready" subtitle="Login and cloud features as they roll out." />
      </View>

      <View style={[styles.note, { borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)' }]}>
        <Text style={[styles.noteText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
          Sponsorship directly supports ongoing improvements to MD Studio.
        </Text>
      </View>
    </AppDialog>
  );
}

function Feature({ icon, title, subtitle, isDark }) {
  const foreground = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;
  const subtle = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;
  return (
    <View style={styles.feature}>
      <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.10)' }]}>
        <Icon name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.featureTitle, { color: foreground }]}>{title}</Text>
        <Text style={[styles.featureSubtitle, { color: subtle }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 8 },
  heroTitle: { marginTop: 10, fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },
  heroSubtitle: { marginTop: 6, fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 18, opacity: 0.9 },
  list: { marginTop: 12 },
  feature: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  featureTitle: { fontWeight: '900', fontSize: 13 },
  featureSubtitle: { marginTop: 2, fontWeight: '700', fontSize: 11, lineHeight: 16, opacity: 0.95 },
  note: { marginTop: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  noteText: { fontSize: 11, lineHeight: 16, fontWeight: '700', textAlign: 'center', opacity: 0.95 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
