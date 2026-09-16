import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform, Pressable } from 'react-native';
import { useProject } from '../context/ProjectContext';
import { useLibrary } from '../providers/LibraryProvider';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WebDnDBox from './WebDnDBox';
import GlassView from './ui/GlassView';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';

const ComponentsPanel = ({ isDark, style }) => {
  const [activeTab, setActiveTab] = useState('Elements');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveSnippet, setShowSaveSnippet] = useState(false);
  const [snippetName, setSnippetName] = useState('');
  const { addElement, addSnippet, selectedElement, dragPayload, startDrag, endDrag } = useProject();
  const { snippets, saveSnippet, deleteSnippet } = useLibrary();
  const isWeb = Platform.OS === 'web';

  const getDragProps = (payload) => {
    if (!isWeb) return {};
    return {
      draggable: true,
      onDragStart: (event) => {
        startDrag(payload);
        const dataTransfer = event?.dataTransfer || event?.nativeEvent?.dataTransfer;
        try {
          dataTransfer?.setData('text/plain', JSON.stringify(payload));
          dataTransfer.effectAllowed = 'copy';
        } catch (_) {
          // Ignore dataTransfer errors (not required for internal drag state)
        }
      },
      onDragEnd: () => endDrag(),
    };
  };

  const query = searchQuery.trim().toLowerCase();
  const tone = isDark ? 'dark' : 'light';
  const panelText = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;
  const subtle = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;

  const typographyItems = [
    { type: 'heading', label: 'Heading', icon: 'format-title' },
    { type: 'paragraph', label: 'Paragraph', icon: 'text' },
    { type: 'blockquote', label: 'Quote', icon: 'format-quote-close' },
    { type: 'codeBlock', label: 'Code', icon: 'xml' },
  ];

  const mediaItems = [
    { type: 'image', label: 'Image', icon: 'image-outline' },
    { type: 'icon', label: 'Icon', icon: 'emoticon-outline' },
    { type: 'linkButton', label: 'Button', icon: 'link-variant' },
    { type: 'badge', label: 'Badge', icon: 'shield-check-outline' },
    { type: 'socials', label: 'Socials', icon: 'share-variant' },
    { type: 'githubStats', label: 'GitHub Stats', icon: 'chart-bar' },
    { type: 'contributors', label: 'Contributors', icon: 'account-group-outline' },
    { type: 'dynamicWidget', label: 'Widgets', icon: 'puzzle-outline' },
  ];

  const structureItems = [
    { type: 'list', label: 'List', icon: 'format-list-bulleted' },
    { type: 'taskList', label: 'Task List', icon: 'checkbox-marked-outline' },
    { type: 'table', label: 'Table', icon: 'table' },
    { type: 'divider', label: 'Divider', icon: 'minus' },
    { type: 'collapsible', label: 'Foldout', icon: 'unfold-more-horizontal' },
  ];

  const advancedItems = [
    { type: 'toc', label: 'Table of Contents', icon: 'format-list-bulleted-square' },
    { type: 'mermaid', label: 'Mermaid', icon: 'graph-outline' },
    { type: 'raw', label: 'Raw HTML/CSS', icon: 'code-braces' },
    { type: 'embed', label: 'Embed', icon: 'application-braces-outline' },
  ];

  const filteredItems = (items) =>
    items.filter((item) => item.label.toLowerCase().includes(query));

  const renderSection = (title, items) => {
    const filtered = query ? filteredItems(items) : items;
    if (!filtered.length) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: subtle }]}>{title.toUpperCase()}</Text>
        <View style={styles.grid}>
          {filtered.map((item) => (
            <WebDnDBox
              key={item.type}
              style={[
                styles.item,
                isWeb && styles.grabCursor,
                { backgroundColor: isDark ? 'rgba(2,6,23,0.22)' : 'rgba(255,255,255,0.75)' },
                dragPayload?.kind === 'element' && dragPayload?.elementType === item.type ? { opacity: 0.6 } : null,
              ]}
              {...getDragProps({ kind: 'element', elementType: item.type })}
            >
              <TouchableOpacity style={styles.itemPressable} onPress={() => addElement(item.type)}>
                <Icon name={item.icon} size={20} color={Colors.primary} />
                <Text style={[styles.itemLabel, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>{item.label}</Text>
              </TouchableOpacity>
            </WebDnDBox>
          ))}
        </View>
      </View>
    );
  };

  const handleSaveSnippet = () => {
    if (!selectedElement || !snippetName.trim()) return;
    const json = selectedElement.toJson ? selectedElement.toJson() : selectedElement;
    saveSnippet({ name: snippetName.trim(), elementJson: JSON.stringify(json) });
    setSnippetName('');
    setShowSaveSnippet(false);
  };

  const snippetItems = useMemo(
    () => snippets.filter((snippet) => (!query ? true : snippet.name.toLowerCase().includes(query))),
    [snippets, query],
  );

  return (
    <GlassView tone={tone} style={[styles.container, style]}>
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: isDark ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.14)',
            borderColor: isDark ? 'rgba(148,163,184,0.14)' : 'rgba(15,23,42,0.10)',
          },
        ]}
      >
        <TabButton
          icon="shape-outline"
          label="Elements"
          active={activeTab === 'Elements'}
          isDark={isDark}
          onPress={() => setActiveTab('Elements')}
        />
        <TabButton
          icon="bookmark-outline"
          label="Snippets"
          active={activeTab === 'Snippets'}
          isDark={isDark}
          onPress={() => setActiveTab('Snippets')}
        />
      </View>

      <View
        style={[
          styles.searchRow,
          {
            backgroundColor: isDark ? 'rgba(2,6,23,0.22)' : 'rgba(255,255,255,0.70)',
            borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
          },
        ]}
      >
        <Icon name="magnify" size={16} color={subtle} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: panelText }, Platform.OS === 'web' ? { outlineStyle: 'none' } : null]}
          placeholder="Search..."
          placeholderTextColor={isDark ? 'rgba(226,232,240,0.42)' : 'rgba(15,23,42,0.42)'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery.trim().length ? (
          <Pressable
            onPress={() => setSearchQuery('')}
            style={Platform.OS === 'web' ? { cursor: 'pointer' } : null}
          >
            <Icon name="close-circle" size={16} color={subtle} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'Elements' ? (
          <View style={styles.scrollContent}>
            {renderSection('Typography', typographyItems)}
            {renderSection('Media & Graphics', mediaItems)}
            {renderSection('Structure', structureItems)}
            {renderSection('Advanced', advancedItems)}
          </View>
        ) : (
          <View style={styles.snippetContent}>
            {selectedElement && (
              <TouchableOpacity
                style={[styles.saveSnippetButton, { borderColor: Colors.primary }]}
                onPress={() => {
                  const defaultName = selectedElement.description || selectedElement.type || 'Snippet';
                  setSnippetName(defaultName);
                  setShowSaveSnippet(true);
                }}
              >
                <Icon name="bookmark-plus-outline" size={16} color={Colors.primary} />
                <Text style={styles.saveSnippetText}>Save selected</Text>
              </TouchableOpacity>
            )}

            {snippetItems.length === 0 ? (
              <View style={styles.centered}>
                <Icon name="bookmark-outline" size={48} color="grey" opacity={0.3} />
                <Text style={styles.emptyText}>No snippets saved yet.</Text>
              </View>
            ) : (
              snippetItems.map((snippet) => (
                <View
                  key={snippet.id}
                  style={[
                    styles.snippetCard,
                    {
                      backgroundColor: isDark ? 'rgba(2,6,23,0.20)' : 'rgba(255,255,255,0.75)',
                      borderColor: isDark ? 'rgba(148,163,184,0.14)' : 'rgba(15,23,42,0.10)',
                    },
                  ]}
                >
                  <WebDnDBox style={[{ flex: 1 }, isWeb && { cursor: 'grab' }]} {...getDragProps({ kind: 'snippet', snippet })}>
                    <TouchableOpacity style={styles.snippetTitleWrap} onPress={() => addSnippet(snippet)}>
                      <Icon name="bookmark-outline" size={16} color={Colors.primary} />
                      <Text style={[styles.snippetTitle, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>{snippet.name}</Text>
                    </TouchableOpacity>
                  </WebDnDBox>
                  <TouchableOpacity onPress={() => deleteSnippet(snippet.id)}>
                    <Icon name="close" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <AppDialog
        visible={showSaveSnippet}
        onClose={() => setShowSaveSnippet(false)}
        isDark={!!isDark}
        title="Save Snippet"
        subtitle="Store the selected element for quick reuse."
        icon="bookmark-outline"
        maxWidth={560}
        scroll={false}
        footer={
          <View style={styles.dialogFooter}>
            <SoftButton
              label="CANCEL"
              onPress={() => setShowSaveSnippet(false)}
              isDark={!!isDark}
              style={styles.footerBtn}
            />
            <PrimaryButton
              label="SAVE"
              icon="content-save-outline"
              onPress={handleSaveSnippet}
              disabled={!snippetName.trim() || !selectedElement}
              style={styles.footerBtn}
            />
          </View>
        }
      >
        <Text style={[styles.dialogLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
          Snippet name
        </Text>
        <TextInput
          style={[
            styles.dialogInput,
            {
              backgroundColor: isDark ? 'rgba(2,6,23,0.35)' : 'rgba(255,255,255,0.80)',
              borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)',
              color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight,
            },
          ]}
          placeholder="e.g. Hero heading"
          placeholderTextColor={isDark ? 'rgba(226,232,240,0.45)' : 'rgba(15,23,42,0.45)'}
          value={snippetName}
          onChangeText={setSnippetName}
        />
      </AppDialog>
    </GlassView>
  );
};

function TabButton({ icon, label, active, onPress, isDark }) {
  const activeBg = isDark ? 'rgba(99,102,241,0.16)' : 'rgba(99,102,241,0.12)';
  const activeBorder = isDark ? 'rgba(129,140,248,0.30)' : 'rgba(99,102,241,0.22)';
  const border = isDark ? 'transparent' : 'transparent';
  const text = active ? Colors.primary : isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        active ? { backgroundColor: activeBg, borderColor: activeBorder } : { borderColor: border },
        Platform.OS === 'web' ? { cursor: 'pointer' } : null,
      ]}
    >
      <Icon name={icon} size={16} color={text} />
      <Text style={[styles.tabText, { color: text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { width: 280 },
  tabBar: {
    flexDirection: 'row',
    margin: 12,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  tabText: { marginLeft: 8, fontSize: 12, fontWeight: '900', letterSpacing: 0.3 },
  searchRow: { marginHorizontal: 12, marginBottom: 10, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  scrollContent: { paddingHorizontal: 12 },
  section: { marginBottom: 20 },
  sectionHeader: { fontSize: 10, fontWeight: '900', color: 'grey', marginBottom: 10, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  item: {
    width: '48%',
    height: 70,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
    marginBottom: 8,
  },
  grabCursor: { cursor: 'grab' },
  itemPressable: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: { fontSize: 11, fontWeight: '600', marginTop: 6 },
  centered: { flex: 1, height: 300, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: 'grey', marginTop: 12, fontSize: 12 },
  snippetContent: { paddingHorizontal: 12, paddingBottom: 20 },
  snippetCard: { padding: 10, borderRadius: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1 },
  snippetTitleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  snippetTitle: { marginLeft: 8, fontSize: 12, fontWeight: '600' },
  saveSnippetButton: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  saveSnippetText: { marginLeft: 8, color: Colors.primary, fontWeight: '700', fontSize: 12 },
  dialogLabel: { fontSize: 12, fontWeight: '800', marginBottom: 6 },
  dialogInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  dialogFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerBtn: { marginLeft: 10 },
});

export default ComponentsPanel;
