import React, { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import AboutDeveloperDialog from './AboutDeveloperDialog';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AboutAppDialog({ visible, onClose, isDark: isDarkProp }) {
  const isDark = useIsDark(isDarkProp);
  const [showDev, setShowDev] = useState(false);

  return (
    <>
      <AppDialog
        visible={visible}
        onClose={onClose}
        isDark={isDark}
        title="About Markdown Studio"
        subtitle="A modern tool to craft beautiful Markdown documentation."
        icon="information-outline"
        maxWidth={860}
        footer={
          <View style={styles.footer}>
            <SoftButton label="CLOSE" onPress={onClose} isDark={isDark} style={styles.footerBtn} />
            <PrimaryButton
              label="GITHUB"
              icon="github"
              onPress={() => Linking.openURL('https://github.com/mhmdwaelanwr/Markdown-Creator')}
              style={styles.footerBtn}
            />
          </View>
        }
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 4 }} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View
              style={[
                styles.logo,
                {
                  backgroundColor: isDark ? 'rgba(99,102,241,0.16)' : 'rgba(99,102,241,0.12)',
                  borderColor: isDark ? 'rgba(129,140,248,0.30)' : 'rgba(99,102,241,0.22)',
                },
              ]}
            >
              <Icon name="language-markdown-outline" size={26} color={Colors.primary} />
            </View>
            <Text style={[styles.title, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
              Markdown Studio
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              Create documentation faster with live preview, smart components, and export tools.
            </Text>
          </View>

          <View style={styles.cards}>
            <InfoCard isDark={isDark} icon="tag-outline" title="Version" value="1.0.0" />
            <InfoCard isDark={isDark} icon="shield-check-outline" title="License" value="Open Source" />
            <InfoCard isDark={isDark} icon="rocket-launch-outline" title="Build" value="React Native + Web" />
          </View>

          <View style={styles.actions}>
            <LinkRow
              isDark={isDark}
              icon="star-outline"
              title="Support with a Star"
              subtitle="Help the project reach more creators"
              onPress={() => Linking.openURL('https://github.com/mhmdwaelanwr/Markdown-Creator/stargazers')}
            />
            <LinkRow
              isDark={isDark}
              icon="account-outline"
              title="About the Developer"
              subtitle="Links and contact details"
              onPress={() => setShowDev(true)}
            />
            <LinkRow
              isDark={isDark}
              icon="file-document-outline"
              title="Legal & Transparency"
              subtitle="Privacy policy and terms"
              onPress={() =>
                Linking.openURL('https://github.com/mhmdwaelanwr/Markdown-Creator#-privacy-policy--terms')
              }
            />
          </View>

          <View style={styles.techFooter}>
            <Text style={[styles.techTitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              BUILT WITH MODERN TECH
            </Text>
            <View style={styles.techRow}>
              <TechPill isDark={isDark} icon="react" label="React Native" />
              <TechPill isDark={isDark} icon="language-typescript" label="TypeScript" />
              <TechPill isDark={isDark} icon="webpack" label="Webpack" />
              <TechPill isDark={isDark} icon="robot-outline" label="AI" />
              <TechPill isDark={isDark} icon="language-markdown-outline" label="Markdown" />
            </View>
          </View>
        </ScrollView>
      </AppDialog>

      <AboutDeveloperDialog visible={showDev} onClose={() => setShowDev(false)} isDark={isDark} />
    </>
  );
}

function InfoCard({ icon, title, value, isDark }) {
  const foreground = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;
  const subtle = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;
  return (
    <View
      style={[
        styles.infoCard,
        {
          backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
          borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
        },
      ]}
    >
      <View style={[styles.infoIcon, { backgroundColor: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.10)' }]}>
        <Icon name={icon} size={16} color={Colors.primary} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.infoTitle, { color: subtle }]}>{title}</Text>
        <Text style={[styles.infoValue, { color: foreground }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function LinkRow({ icon, title, subtitle, onPress, isDark }) {
  const foreground = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;
  const subtle = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.linkRow,
        {
          backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
          borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
        },
        Platform.OS === 'web' ? { cursor: 'pointer' } : null,
      ]}
    >
      <View style={[styles.linkIcon, { backgroundColor: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.10)' }]}>
        <Icon name={icon} size={16} color={Colors.primary} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.linkTitle, { color: foreground }]}>{title}</Text>
        <Text style={[styles.linkSubtitle, { color: subtle }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color={subtle} />
    </Pressable>
  );
}

function TechPill({ icon, label, isDark }) {
  const border = isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)';
  const bg = isDark ? 'rgba(2,6,23,0.22)' : 'rgba(255,255,255,0.70)';
  const text = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;
  return (
    <View style={[styles.techPill, { borderColor: border, backgroundColor: bg }]}>
      <Icon name={icon} size={14} color={Colors.primary} />
      <Text style={[styles.techPillText, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 8 },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: { marginTop: 12, fontSize: 18, fontWeight: '900' },
  subtitle: { marginTop: 6, fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 18, opacity: 0.92 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12 },
  infoCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  infoIcon: { width: 34, height: 34, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  infoValue: { marginTop: 4, fontSize: 12, fontWeight: '900' },
  actions: { marginTop: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  linkIcon: { width: 34, height: 34, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  linkTitle: { fontSize: 13, fontWeight: '900' },
  linkSubtitle: { marginTop: 2, fontSize: 11, fontWeight: '700', opacity: 0.95 },
  techFooter: { marginTop: 16 },
  techTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.6, marginBottom: 10 },
  techRow: { flexDirection: 'row', flexWrap: 'wrap' },
  techPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7, marginRight: 8, marginBottom: 8 },
  techPillText: { marginLeft: 8, fontSize: 11, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
