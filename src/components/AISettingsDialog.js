import React, { useState, useEffect } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import AppDialog from './ui/AppDialog';
import ActionIconButton from './ui/ActionIconButton';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';

export default function AISettingsDialog({ visible, onClose, apiKey = '', onSave, isDark: isDarkProp }) {
  const isDark = useIsDark(isDarkProp);
  const [key, setKey] = useState(apiKey);
  const [obscured, setObscured] = useState(true);

  useEffect(() => {
    if (visible) setKey(apiKey || '');
  }, [visible, apiKey]);

  const handleSave = () => {
    if (!key.trim()) {
      Alert.alert('Error', 'API key cannot be empty');
      return;
    }
    onSave && onSave(key);
    onClose && onClose();
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

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title="AI Settings"
      subtitle="Configure your Gemini API key for AI-assisted generation."
      icon="robot-outline"
      maxWidth={720}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CANCEL" onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          <PrimaryButton
            label="SAVE"
            icon="content-save-outline"
            onPress={handleSave}
            disabled={!key.trim()}
            style={styles.footerBtn}
          />
        </View>
      }
    >
      <Text style={[styles.section, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
        API CONFIGURATION
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[inputChrome, { paddingRight: 44 }]}
          placeholder="Gemini API Key"
          placeholderTextColor={placeholderTextColor}
          value={key}
          onChangeText={setKey}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={obscured}
        />
        <View style={styles.eye}>
          <ActionIconButton
            icon={obscured ? 'eye-outline' : 'eye-off-outline'}
            onPress={() => setObscured((prev) => !prev)}
            isDark={isDark}
            accessibilityLabel={obscured ? 'Show API key' : 'Hide API key'}
          />
        </View>
      </View>

      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: isDark ? 'rgba(99,102,241,0.10)' : 'rgba(99,102,241,0.08)',
            borderColor: isDark ? 'rgba(129,140,248,0.25)' : 'rgba(99,102,241,0.18)',
          },
        ]}
      >
        <Text style={[styles.infoText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
          Your API key is stored locally and is only used to communicate with Google Gemini AI services.
        </Text>
      </View>

      <Pressable
        onPress={() => {
          if (Platform.OS === 'web') {
            window.open('https://aistudio.google.com/app/apikey', '_blank');
          }
        }}
        style={[
          styles.helpRow,
          { borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)' },
          Platform.OS === 'web' ? { cursor: 'pointer' } : null,
        ]}
      >
        <Text style={[styles.helpText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
          Need an API key? Open Gemini API Keys page
        </Text>
      </Pressable>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  section: {
    fontWeight: 'bold',
    marginBottom: 8,
    alignSelf: 'flex-start',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  inputRow: {
    marginBottom: 12,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    width: '100%',
  },
  eye: { position: 'absolute', right: 6, top: 6 },
  infoBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 6,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    opacity: 0.95,
  },
  helpRow: { marginTop: 10, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  helpText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
