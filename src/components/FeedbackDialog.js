import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';

export default function FeedbackDialog({ visible, onClose, isDark: isDarkProp }) {
  const isDark = useIsDark(isDarkProp);
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setFeedback('');
    setSending(false);
  }, [visible]);

  const handleSend = async () => {
    if (!feedback.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setFeedback('');
      Alert.alert('Thank you!', 'Your feedback has been sent.');
      onClose && onClose();
    }, 900);
  };

  const inputChrome = [
    styles.textarea,
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
      title="Send Feedback"
      subtitle="Tell us what to improve. Short, actionable notes are best."
      icon="message-text-outline"
      maxWidth={720}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CANCEL" onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          <PrimaryButton
            label={sending ? 'SENDING…' : 'SEND'}
            icon="send-outline"
            onPress={handleSend}
            loading={sending}
            disabled={!feedback.trim()}
            style={styles.footerBtn}
          />
        </View>
      }
    >
      <TextInput
        style={inputChrome}
        placeholder="Your feedback…"
        placeholderTextColor={placeholderTextColor}
        value={feedback}
        onChangeText={setFeedback}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
      />
      <Text style={[styles.hint, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
        You can also share screenshots and steps to reproduce issues.
      </Text>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  textarea: {
    width: '100%',
    minHeight: 160,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  hint: { marginTop: 10, fontSize: 11, fontWeight: '700', lineHeight: 16, opacity: 0.9 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
