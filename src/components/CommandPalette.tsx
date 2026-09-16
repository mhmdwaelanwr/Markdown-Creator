import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';
import GlassView from './ui/GlassView';

export type CommandPaletteItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  keywords?: string[];
  action: () => void;
};

type CommandPaletteProps = {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  items: CommandPaletteItem[];
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\s+/g, ' ')
    .trim();

export default function CommandPalette({ visible, isDark, onClose, items }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<TextInput | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return items;
    return items.filter((item) => {
      const haystack = normalize(
        [item.title, item.subtitle, ...(item.keywords || [])].filter(Boolean).join(' '),
      );
      return haystack.includes(q);
    });
  }, [items, query]);

  const safeSelectedIndex = Math.min(Math.max(0, selectedIndex), Math.max(0, filtered.length - 1));

  useEffect(() => {
    if (!visible) return;
    setQuery('');
    setSelectedIndex(0);

    const timer = setTimeout(() => inputRef.current?.focus?.(), 60);
    return () => clearTimeout(timer);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (Platform.OS !== 'web') return;

    const handler = (event: KeyboardEvent) => {
      const key = String(event.key || '').toLowerCase();
      if (key === 'escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (key === 'arrowdown') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, Math.max(0, filtered.length - 1)));
        return;
      }

      if (key === 'arrowup') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (key === 'enter') {
        const item = filtered[safeSelectedIndex];
        if (!item) return;
        event.preventDefault();
        item.action();
        onClose();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, onClose, safeSelectedIndex, visible]);

  const handleRun = (item: CommandPaletteItem) => {
    item.action();
    onClose();
  };

  const tone = isDark ? 'dark' : 'light';
  const foreground = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;
  const subtle = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dialogWrap} onPress={() => {}}>
          <GlassView tone={tone} style={styles.dialog}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Icon name="magnify" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={[styles.title, { color: foreground }]}>Command Palette</Text>
                  <Text style={[styles.subtitle, { color: subtle }]}>Type to search, Enter to run</Text>
                </View>
              </View>

              {Platform.OS === 'web' ? (
                <View style={styles.hintPill}>
                  <Text style={styles.hintText}>Ctrl / Cmd + K</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.searchRow}>
              <Icon name="lightning-bolt-outline" size={16} color={subtle} style={styles.searchIcon} />
              <TextInput
                ref={(ref) => {
                  inputRef.current = ref;
                }}
                value={query}
                onChangeText={(value) => {
                  setQuery(value);
                  setSelectedIndex(0);
                }}
                placeholder="Search commands..."
                placeholderTextColor={isDark ? 'rgba(226,232,240,0.45)' : 'rgba(15,23,42,0.45)'}
                style={[
                  styles.searchInput,
                  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
                  { color: foreground },
                ]}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {filtered.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={[styles.emptyText, { color: subtle }]}>No commands found</Text>
                </View>
              ) : (
                filtered.map((item, index) => {
                  const active = index === safeSelectedIndex;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleRun(item)}
                      onHoverIn={Platform.OS === 'web' ? () => setSelectedIndex(index) : undefined}
                      style={[
                        styles.item,
                        active && {
                          backgroundColor: isDark
                            ? 'rgba(99, 102, 241, 0.16)'
                            : 'rgba(99, 102, 241, 0.12)',
                          borderColor: isDark ? 'rgba(129,140,248,0.30)' : 'rgba(99,102,241,0.22)',
                        },
                        !active && { borderColor: 'transparent' },
                        Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : null,
                      ]}
                    >
                      <View style={styles.itemIcon}>
                        <Icon
                          name={item.icon || 'flash'}
                          size={16}
                          color={active ? Colors.primary : subtle}
                        />
                      </View>
                      <View style={styles.itemBody}>
                        <Text style={[styles.itemTitle, { color: foreground }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        {item.subtitle ? (
                          <Text style={[styles.itemSubtitle, { color: subtle }]} numberOfLines={1}>
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </GlassView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.55)',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dialogWrap: {
    width: '100%',
    maxWidth: 920,
    marginTop: 70,
  },
  dialog: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.10)',
    marginRight: 10,
  },
  title: { fontSize: 14, fontWeight: '900', letterSpacing: 0.3 },
  subtitle: { fontSize: 11, marginTop: 2 },
  hintPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(2,6,23,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  hintText: {
    color: 'rgba(226,232,240,0.78)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.14)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.14)',
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  list: { maxHeight: 460 },
  listContent: { padding: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemIcon: { width: 28, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  itemBody: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: 13, fontWeight: '800' },
  itemSubtitle: { fontSize: 11, marginTop: 2, opacity: 0.85 },
  empty: { padding: 22, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 12, fontWeight: '700' },
});
