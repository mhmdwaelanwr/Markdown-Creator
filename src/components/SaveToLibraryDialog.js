import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';

export default function SaveToLibraryDialog({ visible, onClose, onSave, isDark: isDarkProp }) {
  const isDark = useIsDark(isDarkProp);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName('');
    setDesc('');
    setTags('');
  }, [visible]);

  const tagList = useMemo(
    () =>
      (tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags],
  );

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }
    onSave && onSave({ name: name.trim(), desc: desc.trim(), tags: tagList });
    Alert.alert('Saved', 'Project saved to library!');
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
      title="Save to Library"
      subtitle="Store this project locally so you can reuse it later."
      icon="content-save-outline"
      maxWidth={640}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CANCEL" onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          <PrimaryButton label="SAVE" icon="content-save-outline" onPress={handleSave} style={styles.footerBtn} />
        </View>
      }
    >
      <View style={styles.form}>
        <Field label="Project name" isDark={isDark}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="My Awesome README"
            placeholderTextColor={placeholderTextColor}
            style={inputChrome}
          />
        </Field>

        <Field label="Description" hint="Optional" isDark={isDark}>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            placeholder="Short summary…"
            placeholderTextColor={placeholderTextColor}
            style={inputChrome}
          />
        </Field>

        <Field label="Tags" hint="Comma-separated" isDark={isDark}>
          <TextInput
            value={tags}
            onChangeText={setTags}
            placeholder="react, docs, portfolio"
            placeholderTextColor={placeholderTextColor}
            style={inputChrome}
          />
          {tagList.length ? (
            <Text style={[styles.tagsHint, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              Tags: {tagList.slice(0, 8).join(' · ')}
              {tagList.length > 8 ? ' …' : ''}
            </Text>
          ) : null}
        </Field>
      </View>
    </AppDialog>
  );
}

function Field({ label, hint, isDark, children }) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
          {label}
        </Text>
        {hint ? (
          <Text style={[styles.hint, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { width: '100%' },
  field: { marginBottom: 12 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '800' },
  hint: { fontSize: 11, fontWeight: '700', opacity: 0.9 },
  input: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  tagsHint: { marginTop: 8, fontSize: 11, fontWeight: '700', opacity: 0.9 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
