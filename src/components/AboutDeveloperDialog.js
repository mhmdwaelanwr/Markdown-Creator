import React, { useMemo, useState } from 'react';
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import AppDialog from './ui/AppDialog';
import SoftButton from './ui/SoftButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TABS = [
  { key: 'social', label: 'Socials', icon: 'share-variant' },
  { key: 'contact', label: 'Contact', icon: 'email-outline' },
  { key: 'support', label: 'Support', icon: 'heart-outline' },
];

export default function AboutDeveloperDialog({ visible, onClose, isDark: isDarkProp }) {
  const isDark = useIsDark(isDarkProp);
  const [tab, setTab] = useState('social');

  const content = useMemo(() => {
    if (tab === 'contact') {
      return {
        title: 'Contact',
        items: [
          { icon: 'email-outline', label: 'Email', value: 'mhmdwaelanwr@gmail.com', url: 'mailto:mhmdwaelanwr@gmail.com' },
          { icon: 'email-outline', label: 'Alt Email', value: 'mhmdwaelanwr@outlook.com', url: 'mailto:mhmdwaelanwr@outlook.com' },
          { icon: 'phone-outline', label: 'Phone', value: '+201010373387', url: 'tel:+201010373387' },
          { icon: 'whatsapp', label: 'WhatsApp', value: '+201010412724', url: 'https://wa.me/201010412724' },
        ],
        footer: null,
      };
    }
    if (tab === 'support') {
      return {
        title: 'Support',
        items: [
          { icon: 'star-outline', label: 'Star on GitHub', value: 'Stargazers', url: 'https://github.com/mhmdwaelanwr/Markdown-Creator/stargazers' },
          { icon: 'hand-heart-outline', label: 'GitHub Sponsors', value: 'Sponsor', url: 'https://github.com/sponsors/mhmdwaelanwr' },
          { icon: 'coffee-outline', label: 'Buy Me a Coffee', value: 'Donate', url: 'https://www.buymeacoffee.com/mhmdwaelanwr' },
        ],
        footer: 'Your support helps keep this project alive and growing. Thank you!',
      };
    }
    return {
      title: 'Social Profiles',
      items: [
        { icon: 'github', label: 'GitHub', value: 'mhmdwaelanwr', url: 'https://github.com/mhmdwaelanwr' },
        { icon: 'twitter', label: 'Twitter', value: '@mhmdwaelanwr', url: 'https://twitter.com/mhmdwaelanwr' },
        { icon: 'linkedin', label: 'LinkedIn', value: 'mhmdwaelanwr', url: 'https://linkedin.com/in/mhmdwaelanwr' },
        { icon: 'whatsapp', label: 'WhatsApp', value: '+201010412724', url: 'https://wa.me/201010412724' },
      ],
      footer: 'Passionate about building modern, scalable apps. Open source advocate. Always learning.',
    };
  }, [tab]);

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title="About the Developer"
      subtitle="Links, contact details, and support."
      icon="account-outline"
      maxWidth={860}
      scroll={false}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CLOSE" onPress={onClose} isDark={isDark} />
        </View>
      }
    >
      <View style={styles.headerCard}>
        <Image source={{ uri: 'https://avatars.githubusercontent.com/u/50760238?v=4' }} style={styles.avatar} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.name, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
            Mohamed Anwar
          </Text>
          <Text style={[styles.role, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
            Full Stack Developer
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tabObj) => (
          <TabChip
            key={tabObj.key}
            icon={tabObj.icon}
            label={tabObj.label}
            active={tab === tabObj.key}
            isDark={isDark}
            onPress={() => setTab(tabObj.key)}
          />
        ))}
      </View>

      <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
          {content.title.toUpperCase()}
        </Text>
        {content.items.map((item) => (
          <LinkRow key={`${item.label}-${item.value}`} item={item} isDark={isDark} />
        ))}
        {content.footer ? (
          <View style={[styles.note, { borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)' }]}>
            <Text style={[styles.noteText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {content.footer}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </AppDialog>
  );
}

function TabChip({ icon, label, active, isDark, onPress }) {
  const activeBg = isDark ? 'rgba(99,102,241,0.16)' : 'rgba(99,102,241,0.12)';
  const activeBorder = isDark ? 'rgba(129,140,248,0.30)' : 'rgba(99,102,241,0.22)';
  const border = isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)';
  const text = active ? Colors.primary : isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tabChip,
        active ? { backgroundColor: activeBg, borderColor: activeBorder } : { borderColor: border },
        Platform.OS === 'web' ? { cursor: 'pointer' } : null,
      ]}
    >
      <View style={styles.tabChipInner}>
        <Icon name={icon} size={15} color={text} />
        <Text style={[styles.tabChipText, { color: text }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

function LinkRow({ item, isDark }) {
  const foreground = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;
  const subtle = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;
  return (
    <Pressable
      onPress={() => Linking.openURL(item.url)}
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
        <Icon name={item.icon} size={16} color={Colors.primary} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.linkLabel, { color: foreground }]}>{item.label}</Text>
        <Text style={[styles.linkValue, { color: subtle }]} numberOfLines={1}>
          {item.value}
        </Text>
      </View>
      <Icon name="open-in-new" size={16} color={isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 18, marginRight: 12 },
  name: { fontSize: 15, fontWeight: '900' },
  role: { marginTop: 4, fontSize: 12, fontWeight: '700', opacity: 0.9 },
  tabs: { flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap' },
  tabChip: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  tabChipInner: { flexDirection: 'row', alignItems: 'center' },
  tabChipText: { marginLeft: 8, fontSize: 12, fontWeight: '900', letterSpacing: 0.4 },
  sectionTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 8, marginTop: 8 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  linkIcon: { width: 34, height: 34, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  linkLabel: { fontSize: 13, fontWeight: '900' },
  linkValue: { marginTop: 2, fontSize: 11, fontWeight: '700', opacity: 0.95 },
  note: { marginTop: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  noteText: { fontSize: 11, fontWeight: '700', lineHeight: 16, textAlign: 'center', opacity: 0.95 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
});
