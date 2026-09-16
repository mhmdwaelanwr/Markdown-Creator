import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import useIsDark from '../hooks/useIsDark';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';

export default function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  isDark: isDarkProp,
  tone = 'danger',
}) {
  const isDark = useIsDark(isDarkProp);

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title={title}
      subtitle={message}
      icon={tone === 'danger' ? 'alert-circle-outline' : 'help-circle-outline'}
      scroll={false}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CANCEL" onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          <PrimaryButton
            label="CONFIRM"
            icon={tone === 'danger' ? 'check' : 'check'}
            tone={tone === 'danger' ? 'danger' : 'primary'}
            onPress={onConfirm}
            style={styles.footerBtn}
          />
        </View>
      }
    >
      <Text style={[styles.message, { color: isDark ? 'rgba(226,232,240,0.92)' : 'rgba(15,23,42,0.86)' }]}>
        {message}
      </Text>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: 13,
    lineHeight: 20,
  },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
