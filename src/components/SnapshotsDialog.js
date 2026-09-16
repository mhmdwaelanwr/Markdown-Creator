import React, { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SnapshotsDialog({
  visible,
  onClose,
  snapshots = [],
  onSave,
  onRestore,
  onDelete,
  isDark: isDarkProp,
}) {
  const isDark = useIsDark(isDarkProp);

  const snapshotMeta = useMemo(
    () =>
      (snapshots || []).map((payload) => {
        try {
          const parsed = JSON.parse(payload);
          const count = Array.isArray(parsed?.elements) ? parsed.elements.length : 0;
          const vars = parsed?.variables ? Object.keys(parsed.variables).length : 0;
          return { elements: count, variables: vars };
        } catch (_) {
          return { elements: null, variables: null };
        }
      }),
    [snapshots],
  );

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title="Snapshots"
      subtitle="Save and restore your workspace states (up to 20)."
      icon="history"
      maxWidth={760}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CLOSE" onPress={onClose} isDark={isDark} style={styles.footerBtn} />
          <PrimaryButton
            label="SAVE SNAPSHOT"
            icon="content-save-outline"
            onPress={onSave}
            style={styles.footerBtn}
          />
        </View>
      }
    >
      <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
        {snapshots.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Icon name="bookmark-outline" size={42} color={isDark ? 'rgba(148,163,184,0.55)' : 'rgba(15,23,42,0.40)'} />
            <Text style={[styles.empty, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              No snapshots yet. Save one to quickly restore later.
            </Text>
          </View>
        ) : (
          snapshots.map((snap, idx) => {
            const meta = snapshotMeta[idx];
            const labelIndex = snapshots.length - idx;
            const sub = meta?.elements != null ? `${meta.elements} elements · ${meta.variables ?? 0} vars` : 'Unknown content';
            return (
              <View
                key={idx}
                style={[
                  styles.snapshotRow,
                  {
                    backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
                    borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
                  },
                ]}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.snapshotLabel, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
                    Snapshot #{labelIndex}
                  </Text>
                  <Text style={[styles.snapshotSub, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]} numberOfLines={1}>
                    {sub}
                  </Text>
                </View>
                <View style={styles.snapshotActions}>
                  <MiniAction
                    label="Restore"
                    icon="restore"
                    isDark={isDark}
                    onPress={() => onRestore && onRestore(idx)}
                  />
                  <MiniAction
                    label="Delete"
                    icon="trash-can-outline"
                    isDark={isDark}
                    danger
                    onPress={() => onDelete && onDelete(idx)}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </AppDialog>
  );
}

function MiniAction({ label, icon, isDark, danger = false, onPress, style }) {
  const bg = danger
    ? isDark
      ? 'rgba(239,68,68,0.12)'
      : 'rgba(239,68,68,0.10)'
    : isDark
      ? 'rgba(148,163,184,0.10)'
      : 'rgba(15,23,42,0.05)';
  const border = danger
    ? isDark
      ? 'rgba(239,68,68,0.22)'
      : 'rgba(239,68,68,0.18)'
    : isDark
      ? 'rgba(148,163,184,0.16)'
      : 'rgba(15,23,42,0.10)';
  const color = danger ? Colors.error : Colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.miniAction,
        { backgroundColor: bg, borderColor: border },
        Platform.OS === 'web' ? { cursor: 'pointer' } : null,
        style,
      ]}
    >
      <Icon name={icon} size={14} color={color} />
      <Text style={[styles.miniActionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { paddingVertical: 20, alignItems: 'center' },
  snapshotRow: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  snapshotLabel: {
    fontWeight: '900',
    fontSize: 13,
  },
  snapshotSub: { marginTop: 4, fontSize: 11, fontWeight: '700', opacity: 0.92 },
  snapshotActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  miniActionText: { marginLeft: 8, fontWeight: '900', fontSize: 12, letterSpacing: 0.4 },
  empty: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});
