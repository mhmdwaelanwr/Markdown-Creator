import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import AppDialog from './ui/AppDialog';
import SoftButton from './ui/SoftButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HealthCheckDialog({ visible, onClose, issues = [], isDark: isDarkProp }) {
  const isDark = useIsDark(isDarkProp);
  const hasIssues = (issues || []).length > 0;
  const icon = hasIssues ? 'alert-circle-outline' : 'shield-check-outline';

  const normalized = useMemo(
    () =>
      (issues || []).map((issue) => ({
        message: issue?.message || String(issue),
        suggestion: issue?.suggestion,
        severity: issue?.severity || 'warn',
      })),
    [issues],
  );

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title="Health Check"
      subtitle={hasIssues ? 'We found a few things you can improve.' : 'Everything looks good.'}
      icon={icon}
      maxWidth={780}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CLOSE" onPress={onClose} isDark={isDark} />
        </View>
      }
    >
      <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
        {!hasIssues ? (
          <View style={styles.successWrap}>
            <Icon name="shield-check-outline" size={46} color={Colors.success} />
            <Text style={[styles.success, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
              No issues found. Your project is healthy!
            </Text>
            <Text style={[styles.successHint, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              Keep shipping - your documentation setup is in great shape.
            </Text>
          </View>
        ) : (
          normalized.map((issue, idx) => (
            <View
              key={idx}
              style={[
                styles.issueCard,
                {
                  backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
                  borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
                },
              ]}
            >
              <View style={styles.issueHeader}>
                <Icon name="alert-circle-outline" size={16} color={Colors.warning} />
                <Text style={[styles.issueTitle, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
                  {issue.message}
                </Text>
              </View>
              {issue.suggestion ? (
                <Text style={[styles.issueHint, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
                  {issue.suggestion}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  successWrap: { paddingVertical: 18, alignItems: 'center' },
  issueCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  issueHeader: { flexDirection: 'row', alignItems: 'center' },
  issueTitle: {
    fontWeight: '900',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  issueHint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
  },
  success: {
    marginTop: 10,
    fontWeight: '900',
    fontSize: 14,
    textAlign: 'center',
  },
  successHint: { marginTop: 6, fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 18 },
});
