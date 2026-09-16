import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useProject } from '../context/ProjectContext';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import Clipboard from '../platform/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppDialog from './ui/AppDialog';
import SoftButton from './ui/SoftButton';
import ColorPickerDialog from './ui/ColorPickerDialog';
import PrimaryButton from './ui/PrimaryButton';
import ActionIconButton from './ui/ActionIconButton';

const LICENSES = ['None', 'MIT', 'Apache 2.0', 'GPLv3', 'BSD 3-Clause'];
const BULLET_OPTIONS = ['*', '-', '+'];
const SPACING_OPTIONS = [0, 1, 2];
const LOCKED_VARIABLE_KEYS = ['PROJECT_NAME', 'GITHUB_USERNAME', 'CURRENT_YEAR'];

const normalizeHex = (value) => {
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

export default function ProjectSettingsDialog({ visible, onClose, isDark: isDarkProp }) {
  const { t } = useTranslation();
  const {
    variables,
    setVariables,
    licenseType,
    setLicenseType,
    includeContributing,
    includeSecurity,
    includeSupport,
    includeCodeOfConduct,
    includeIssueTemplates,
    setIncludeContributing,
    setIncludeSecurity,
    setIncludeSupport,
    setIncludeCodeOfConduct,
    setIncludeIssueTemplates,
    primaryColor,
    secondaryColor,
    setPrimaryColor,
    setSecondaryColor,
    listBullet,
    sectionSpacing,
    setListBullet,
    setSectionSpacing,
    exportHtml,
    setExportHtml,
  } = useProject();

  const isDark = useIsDark(isDarkProp);
  const [activeTab, setActiveTab] = useState('Variables');
  const [colorPickerTarget, setColorPickerTarget] = useState(null);
  const [newVariableKey, setNewVariableKey] = useState('');
  const [newVariableValue, setNewVariableValue] = useState('');

  const variableEntries = useMemo(() => Object.entries(variables || {}), [variables]);

  useEffect(() => {
    if (!visible) return;
    setActiveTab('Variables');
    setColorPickerTarget(null);
    setNewVariableKey('');
    setNewVariableValue('');
  }, [visible]);

  const updateVariable = (key, value) => {
    setVariables({ ...(variables || {}), [key]: value });
  };

  const normalizeVariableKey = (value) => {
    const key = String(value || '').trim();
    if (!key) return '';
    return key
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const addVariable = () => {
    const key = normalizeVariableKey(newVariableKey);
    if (!key) return;
    setVariables({ ...(variables || {}), [key]: String(newVariableValue ?? '') });
    setNewVariableKey('');
    setNewVariableValue('');
  };

  const removeVariable = (key) => {
    const next = { ...(variables || {}) };
    delete next[key];
    setVariables(next);
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

  const tabs = [
    { key: 'Variables', icon: 'variable', label: t('variables') },
    { key: 'License', icon: 'file-certificate-outline', label: t('license') },
    { key: 'Community', icon: 'account-group-outline', label: t('community', 'Community') },
    { key: 'Colors', icon: 'palette-outline', label: t('colors') },
    { key: 'Formatting', icon: 'format-list-bulleted', label: t('formatting') },
  ];

  const openColorPicker = (target) => {
    setColorPickerTarget(target);
  };

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title={t('projectSettings')}
      subtitle={t('projectSettingsSubtitle')}
      icon="tune-variant"
      maxWidth={980}
      scroll={false}
      footer={
        <View style={styles.footer}>
          <SoftButton label={t('close').toUpperCase()} onPress={onClose} isDark={isDark} />
        </View>
      }
    >
      <View style={styles.tabRow}>
        {tabs.map((item) => (
          <TabChip
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.key}
            isDark={isDark}
            onPress={() => setActiveTab(item.key)}
          />
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'Variables' && (
          <View>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {t('variables')}
            </Text>
            <View
              style={[
                styles.variableComposer,
                {
                  borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
                  backgroundColor: isDark ? 'rgba(2,6,23,0.26)' : 'rgba(99,102,241,0.06)',
                },
              ]}
            >
              <View style={styles.variableComposerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
                    Key
                  </Text>
                  <TextInput
                    style={inputChrome}
                    value={newVariableKey}
                    onChangeText={(value) => setNewVariableKey(value)}
                    placeholder="e.g. PROJECT_TAGLINE"
                    placeholderTextColor={placeholderTextColor}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
                    Value
                  </Text>
                  <TextInput
                    style={inputChrome}
                    value={newVariableValue}
                    onChangeText={setNewVariableValue}
                    placeholder="e.g. Build faster docs"
                    placeholderTextColor={placeholderTextColor}
                  />
                </View>
              </View>
              <View style={styles.variableComposerActions}>
                <Text style={[styles.variableHint, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
                  Use <Text style={{ color: Colors.primary, fontWeight: '900' }}>[KEY]</Text> inside text fields.
                </Text>
                <PrimaryButton
                  label="ADD"
                  icon="plus"
                  onPress={addVariable}
                  disabled={!normalizeVariableKey(newVariableKey)}
                />
              </View>
            </View>
            {variableEntries.map(([key, value]) => (
              <View key={key} style={styles.field}>
                <View style={styles.variableRowHeader}>
                  <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
                    {key}
                  </Text>
                  <View style={styles.variableRowActions}>
                    <ActionIconButton
                      icon="content-copy"
                      isDark={isDark}
                      size={16}
                      onPress={() => Clipboard.setString(`[${key}]`)}
                      accessibilityLabel="Copy placeholder"
                    />
                    <ActionIconButton
                      icon="trash-can-outline"
                      isDark={isDark}
                      size={16}
                      disabled={LOCKED_VARIABLE_KEYS.includes(key)}
                      color={Colors.error}
                      onPress={() => removeVariable(key)}
                      accessibilityLabel="Delete variable"
                      style={{ marginLeft: 6 }}
                    />
                  </View>
                </View>
                <TextInput
                  style={inputChrome}
                  value={String(value ?? '')}
                  onChangeText={(text) => updateVariable(key, text)}
                  placeholder={key}
                  placeholderTextColor={placeholderTextColor}
                />
              </View>
            ))}
          </View>
        )}

        {activeTab === 'License' && (
          <View>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {t('license')}
            </Text>
            {LICENSES.map((option) => (
              <Pressable
                key={option}
                onPress={() => setLicenseType(option)}
                style={[
                  styles.optionRow,
                  licenseType === option && styles.optionRowActive,
                  licenseType === option && {
                    borderColor: isDark ? 'rgba(129,140,248,0.30)' : 'rgba(99,102,241,0.22)',
                    backgroundColor: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.10)',
                  },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : null,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight },
                    licenseType === option && { color: Colors.primary },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {activeTab === 'Community' && (
          <View>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {t('community', 'Community')}
            </Text>
            <SwitchRow label="CONTRIBUTING.md" value={includeContributing} onValueChange={setIncludeContributing} isDark={isDark} />
            <SwitchRow label="SECURITY.md" value={includeSecurity} onValueChange={setIncludeSecurity} isDark={isDark} />
            <SwitchRow label="SUPPORT.md" value={includeSupport} onValueChange={setIncludeSupport} isDark={isDark} />
            <SwitchRow label="CODE_OF_CONDUCT.md" value={includeCodeOfConduct} onValueChange={setIncludeCodeOfConduct} isDark={isDark} />
            <SwitchRow label="Issue templates" value={includeIssueTemplates} onValueChange={setIncludeIssueTemplates} isDark={isDark} />
          </View>
        )}

        {activeTab === 'Colors' && (
          <View>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {t('colors')}
            </Text>
            <View style={styles.field}>
              <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
                {t('primaryColor')}
              </Text>
              <View style={styles.colorRow}>
                <Pressable
                  onPress={() => openColorPicker('primary')}
                  hitSlop={10}
                  style={Platform.OS === 'web' ? { cursor: 'pointer' } : null}
                >
                  <View style={[styles.colorPreview, { backgroundColor: primaryColor }]} />
                </Pressable>
                <TextInput
                  style={[inputChrome, styles.colorInput]}
                  value={primaryColor}
                  onChangeText={setPrimaryColor}
                  onBlur={() => {
                    const normalized = normalizeHex(primaryColor);
                    if (normalized && normalized !== primaryColor) setPrimaryColor(normalized);
                  }}
                  placeholder="#6366F1"
                  placeholderTextColor={placeholderTextColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => openColorPicker('primary')}
                  hitSlop={10}
                  style={[styles.pickBtn, Platform.OS === 'web' ? { cursor: 'pointer' } : null]}
                >
                  <Icon name="eyedropper-variant" size={16} color={Colors.primary} />
                </Pressable>
              </View>
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
                {t('secondaryColor')}
              </Text>
              <View style={styles.colorRow}>
                <Pressable
                  onPress={() => openColorPicker('secondary')}
                  hitSlop={10}
                  style={Platform.OS === 'web' ? { cursor: 'pointer' } : null}
                >
                  <View style={[styles.colorPreview, { backgroundColor: secondaryColor }]} />
                </Pressable>
                <TextInput
                  style={[inputChrome, styles.colorInput]}
                  value={secondaryColor}
                  onChangeText={setSecondaryColor}
                  onBlur={() => {
                    const normalized = normalizeHex(secondaryColor);
                    if (normalized && normalized !== secondaryColor) setSecondaryColor(normalized);
                  }}
                  placeholder="#10B981"
                  placeholderTextColor={placeholderTextColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => openColorPicker('secondary')}
                  hitSlop={10}
                  style={[styles.pickBtn, Platform.OS === 'web' ? { cursor: 'pointer' } : null]}
                >
                  <Icon name="eyedropper-variant" size={16} color={Colors.primary} />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'Formatting' && (
          <View>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {t('export')}
            </Text>
            <SwitchRow label={t('exportHtml')} value={exportHtml} onValueChange={setExportHtml} isDark={isDark} />

            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {t('formatting')}
            </Text>
            <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {t('listBulletStyle')}
            </Text>
            <View style={styles.optionGroup}>
              {BULLET_OPTIONS.map((option) => (
                <TabChip
                  key={option}
                  label={option}
                  active={listBullet === option}
                  isDark={isDark}
                  onPress={() => setListBullet(option)}
                  style={styles.chip}
                />
              ))}
            </View>
            <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {t('sectionSpacing')}
            </Text>
            <View style={styles.optionGroup}>
              {SPACING_OPTIONS.map((option) => (
                <TabChip
                  key={String(option)}
                  label={option === 0 ? 'Compact' : option === 1 ? 'Standard' : 'Spacious'}
                  active={sectionSpacing === option}
                  isDark={isDark}
                  onPress={() => setSectionSpacing(option)}
                  style={styles.chip}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <ColorPickerDialog
        visible={!!colorPickerTarget}
        onClose={() => setColorPickerTarget(null)}
        isDark={isDark}
        title={
          colorPickerTarget === 'primary'
            ? t('primaryColor')
            : colorPickerTarget === 'secondary'
              ? t('secondaryColor')
              : t('colors')
        }
        value={colorPickerTarget === 'primary' ? primaryColor : secondaryColor}
        onApply={(hex) => {
          if (colorPickerTarget === 'primary') setPrimaryColor(hex);
          if (colorPickerTarget === 'secondary') setSecondaryColor(hex);
        }}
      />
    </AppDialog>
  );
}

function SwitchRow({ label, value, onValueChange, isDark }) {
  const foreground = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;
  const trackColor = {
    false: isDark ? 'rgba(148,163,184,0.22)' : 'rgba(15,23,42,0.16)',
    true: 'rgba(99,102,241,0.55)',
  };
  return (
    <View style={styles.switchRow}>
      <Text style={[styles.switchLabel, { color: foreground }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} thumbColor={Colors.primary} trackColor={trackColor} />
    </View>
  );
}

function TabChip({ icon, label, active, isDark, onPress, style }) {
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
        style,
      ]}
    >
      <View style={styles.tabChipInner}>
        {icon ? <Icon name={icon} size={15} color={text} /> : null}
        <Text style={[styles.tabText, { color: text, marginLeft: icon ? 8 : 0 }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tabChip: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  tabChipInner: { flexDirection: 'row', alignItems: 'center' },
  tabText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.4 },
  content: {
    paddingTop: 6,
    maxHeight: 520,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  field: { marginBottom: 12 },
  variableComposer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  variableComposerRow: { flexDirection: 'row' },
  variableComposerActions: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variableHint: { fontSize: 11, fontWeight: '700', opacity: 0.9 },
  variableRowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  variableRowActions: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '800', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  colorInput: { flex: 1 },
  pickBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  optionRow: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionRowActive: {},
  optionText: { fontSize: 13, fontWeight: '800' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLabel: { fontSize: 13, fontWeight: '800' },
  colorRow: { flexDirection: 'row', alignItems: 'center' },
  colorPreview: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  optionGroup: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, marginTop: 6 },
  chip: { marginRight: 8, marginBottom: 8, paddingVertical: 7, paddingHorizontal: 10 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%' },
});
