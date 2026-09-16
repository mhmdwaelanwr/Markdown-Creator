import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';

export default function CodePenHelperDialog({ visible, onClose, initialUrl = '', onSelect, isDark: isDarkProp }) {
  const isDark = useIsDark(isDarkProp);
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    if (!visible) return;
    setUrl(initialUrl || '');
  }, [visible, initialUrl]);

  const handleInsert = () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a CodePen URL');
      return;
    }
    onSelect && onSelect(url.trim());
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
      title="Insert CodePen"
      subtitle="Paste a CodePen URL to embed it into your document."
      icon="codepen"
      maxWidth={640}
      scroll={false}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CANCEL" onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          <PrimaryButton label="INSERT" icon="plus" onPress={handleInsert} disabled={!url.trim()} style={styles.footerBtn} />
        </View>
      }
    >
      <View>
        <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>CodePen URL</Text>
        <TextInput
          style={inputChrome}
          placeholder="https://codepen.io/…"
          placeholderTextColor={placeholderTextColor}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '800', marginBottom: 6 },
  input: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
