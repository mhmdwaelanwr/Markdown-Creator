import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AuthService from '../services/AuthService';
import GitHubService from '../services/GitHubService';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../providers/AuthProvider';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import InlineNotice from './ui/InlineNotice';

const TABS = [
  { key: 'github', icon: 'github', labelKey: 'github' },
  { key: 'phone', icon: 'phone', labelKey: 'phone' },
  { key: 'email', icon: 'email-outline', labelKey: 'email' },
];

export default function LoginDialog({ visible, onClose, initialTab = 'github', isDark: isDarkProp }) {
  const { t } = useTranslation();
  const isDark = useIsDark(isDarkProp);
  const { githubToken, setGithubToken, variables, setVariables } = useProject();
  const { setLocalUser } = useAuth();

  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState(githubToken || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!visible) return;
    setTab(initialTab || 'github');
    setLoading(false);
    setToken(githubToken || '');
    setPhone('');
    setEmail('');
    setPassword('');
  }, [githubToken, initialTab, visible]);

  const inputChrome = [
    styles.input,
    {
      backgroundColor: isDark ? 'rgba(2,6,23,0.35)' : 'rgba(255,255,255,0.80)',
      borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)',
      color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight,
    },
  ];

  const placeholderTextColor = isDark ? 'rgba(226,232,240,0.45)' : 'rgba(15,23,42,0.45)';

  const footer = useMemo(() => {
    if (tab === 'github') {
      return (
        <View style={styles.footer}>
          <SoftButton label={t('close').toUpperCase()} onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          {githubToken ? (
            <PrimaryButton
              label={t('disconnect').toUpperCase()}
              icon="link-off"
              tone="secondary"
              onPress={async () => {
                setGithubToken('');
                setToken('');
                Alert.alert(t('success'), t('githubDisconnected'));
                onClose && onClose();
              }}
              style={styles.footerBtn}
            />
          ) : (
            <PrimaryButton
              label={t('connectGitHub').toUpperCase()}
              icon="link-variant"
              onPress={async () => {
                const value = String(token || '').trim();
                if (!value) return;
                setLoading(true);
                try {
                  const viewer = await GitHubService.fetchViewer(value);
                  setGithubToken(value);
                  const login = viewer?.login ? String(viewer.login) : '';
                  if (login) {
                    setVariables({ ...(variables || {}), GITHUB_USERNAME: login });
                  }
                  Alert.alert(t('success'), login ? t('githubConnectedAs', { login }) : t('githubConnected'));
                  onClose && onClose();
                } catch (error) {
                  Alert.alert(t('error'), error?.message || t('githubConnectFailed'));
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
              disabled={!String(token || '').trim()}
              style={styles.footerBtn}
            />
          )}
        </View>
      );
    }

    if (tab === 'phone') {
      return (
        <View style={styles.footer}>
          <SoftButton label={t('close').toUpperCase()} onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          <PrimaryButton
            label={t('continue').toUpperCase()}
            icon="check"
            onPress={async () => {
              const value = String(phone || '').trim();
              if (!value) return;
              setLoading(true);
              try {
                await setLocalUser({ provider: 'phone', phoneNumber: value, displayName: value });
                Alert.alert(t('success'), t('signedInWithPhone'));
                onClose && onClose();
              } catch (error) {
                Alert.alert(t('error'), error?.message || t('signInFailed'));
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}
            disabled={!String(phone || '').trim()}
            style={styles.footerBtn}
          />
        </View>
      );
    }

    return (
      <View style={styles.footer}>
        <SoftButton label={t('close').toUpperCase()} onPress={onClose} isDark={isDark} style={styles.footerBtn} />
        <PrimaryButton
          label={t('signIn').toUpperCase()}
          icon="login"
          onPress={async () => {
            setLoading(true);
            try {
              await AuthService.signInWithEmail(email, password);
              Alert.alert(t('success'), t('signedIn'));
              onClose && onClose();
            } catch (error) {
              Alert.alert(t('error'), error?.message || t('signInFailed'));
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
          disabled={!email.trim() || !password}
          style={styles.footerBtn}
        />
      </View>
    );
  }, [email, githubToken, isDark, onClose, password, phone, setGithubToken, setLocalUser, setVariables, t, tab, token, variables]);

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title={t('signIn')}
      subtitle={t('signInSubtitle')}
      icon="account-circle-outline"
      maxWidth={640}
      scroll={false}
      footer={footer}
    >
      <View style={styles.tabRow}>
        {TABS.map((item) => (
          <TabChip
            key={item.key}
            icon={item.icon}
            label={t(item.labelKey)}
            active={tab === item.key}
            isDark={isDark}
            onPress={() => setTab(item.key)}
          />
        ))}
      </View>

      {tab === 'github' ? (
        <View>
          <InlineNotice
            isDark={isDark}
            variant="info"
            icon="github"
            message={t('githubConnectHint')}
            style={{ marginBottom: 12 }}
          />
          <Field label={t('personalAccessToken')} isDark={isDark}>
            <TextInput
              style={inputChrome}
              placeholder="ghp_..."
              placeholderTextColor={placeholderTextColor}
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </Field>
          <View style={styles.miniRow}>
            <Icon name="shield-check-outline" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.note, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {t('githubScopesHint')}
            </Text>
          </View>
          <Pressable
            onPress={() => Linking.openURL('https://github.com/settings/tokens/new')}
            style={[styles.linkRow, Platform.OS === 'web' ? { cursor: 'pointer' } : null]}
          >
            <Icon name="open-in-new" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.linkText, { color: Colors.primary }]}>{t('createToken')}</Text>
          </Pressable>
        </View>
      ) : null}

      {tab === 'phone' ? (
        <View>
          <InlineNotice
            isDark={isDark}
            variant="neutral"
            icon="phone"
            message={t('phoneSignInHint')}
            style={{ marginBottom: 12 }}
          />
          <Field label={t('phoneNumber')} isDark={isDark}>
            <TextInput
              style={inputChrome}
              placeholder="+20 10 0000 0000"
              placeholderTextColor={placeholderTextColor}
              value={phone}
              onChangeText={setPhone}
              autoCorrect={false}
              keyboardType={Platform.OS === 'web' ? 'default' : 'phone-pad'}
            />
          </Field>
        </View>
      ) : null}

      {tab === 'email' ? (
        <View>
          <InlineNotice
            isDark={isDark}
            variant="warning"
            icon="email-outline"
            message={t('emailSignInHint')}
            style={{ marginBottom: 12 }}
          />
          <Field label={t('email')} isDark={isDark}>
            <TextInput
              style={inputChrome}
              placeholder="you@example.com"
              placeholderTextColor={placeholderTextColor}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </Field>
          <Field label={t('password')} isDark={isDark}>
            <TextInput
              style={inputChrome}
              placeholder={t('password')}
              placeholderTextColor={placeholderTextColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Field>
        </View>
      ) : null}
    </AppDialog>
  );
}

function Field({ label, isDark, children }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
        {label}
      </Text>
      {children}
    </View>
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
        {icon ? <Icon name={icon} size={15} color={text} /> : null}
        <Text style={[styles.tabChipText, { color: text, marginLeft: icon ? 8 : 0 }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  tabChip: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  tabChipInner: { flexDirection: 'row', alignItems: 'center' },
  tabChipText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.4 },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '800', marginBottom: 6 },
  input: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  note: { fontSize: 11, fontWeight: '700', lineHeight: 16, opacity: 0.95, flex: 1 },
  miniRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  linkText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.2 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
