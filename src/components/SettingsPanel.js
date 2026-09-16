import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Clipboard from '../platform/clipboard';
import YouTubeHelperDialog from './YouTubeHelperDialog';
import CodePenHelperDialog from './CodePenHelperDialog';
import GistHelperDialog from './GistHelperDialog';
import { useTranslation } from 'react-i18next';
import { useProject } from '../context/ProjectContext';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ElementSettingsForm from '../widgets/ElementSettingsForm';
import MarkdownGenerator from '../services/MarkdownGenerator';
import GlassView from './ui/GlassView';
import PrimaryButton from './ui/PrimaryButton';
import ActionIconButton from './ui/ActionIconButton';

const SettingsPanel = ({ isDark, style }) => {
  const { t } = useTranslation();
  const {
    selectedElement,
    removeElement,
    moveElementUp,
    moveElementDown,
    addElement,
    variables,
    listBullet,
    sectionSpacing,
    targetLanguage,
  } = useProject();
  const [showYouTube, setShowYouTube] = useState(false);
  const [showCodePen, setShowCodePen] = useState(false);
  const [showGist, setShowGist] = useState(false);
  const [activeTab, setActiveTab] = useState('Settings');

  const renderSettingsTab = () => {
    if (!selectedElement) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Icon name="gesture-tap" size={64} color={Colors.primary} opacity={0.5} />
          </View>
          <Text style={[styles.emptyTitle, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
            {t('noElementSelected')}
          </Text>
          <Text style={[styles.emptySubtitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
            {t('noElementSelectedHint')}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.elementHeader}>
          <View style={[styles.typeIcon, { backgroundColor: Colors.primary }]}>
            <Icon name={getElementIcon(selectedElement.type)} size={16} color="white" />
          </View>
          <Text style={styles.elementTitle}>{selectedElement.description || selectedElement.type.toUpperCase()}</Text>
          <View style={styles.headerActions}>
            <ActionIconButton icon="chevron-up" onPress={() => moveElementUp(selectedElement.id)} isDark={isDark} size={18} style={styles.headerActionBtn} />
            <ActionIconButton icon="chevron-down" onPress={() => moveElementDown(selectedElement.id)} isDark={isDark} size={18} style={styles.headerActionBtn} />
            <ActionIconButton icon="trash-can-outline" onPress={() => removeElement(selectedElement.id)} isDark={isDark} size={18} color={Colors.error} style={styles.headerActionBtn} />
          </View>
        </View>

        <ElementSettingsForm element={selectedElement} />
      </ScrollView>
    );
  };

  const renderPreviewTab = () => {
    if (!selectedElement) {
      return (
        <View style={styles.previewEmpty}>
          <Text style={{ color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }}>
            {t('selectElementToPreview')}
          </Text>
        </View>
      );
    }
    const markdown = MarkdownGenerator.generate(
      [selectedElement],
      variables,
      listBullet,
      sectionSpacing,
      targetLanguage,
      true,
    );
    return (
      <View style={styles.tabContent}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
            {t('markdownSource')}
          </Text>
          <TouchableOpacity onPress={() => {
            Clipboard.setString(markdown);
            Alert.alert(t('copied'), t('markdownCopied'));
          }}>
            <Text style={styles.copyBtn}>{t('copy')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={[styles.codeBox, { backgroundColor: isDark ? '#0D1117' : '#F6F8FA' }]}>
          <Text style={[styles.codeText, { color: isDark ? '#C9D1D9' : '#24292F' }]}>{markdown}</Text>
        </ScrollView>
      </View>
    );
  };

  return (
    <GlassView tone={isDark ? 'dark' : 'light'} style={[styles.container, style]}> 
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Settings' && styles.activeTab]}
          onPress={() => setActiveTab('Settings')}
        >
          <Icon name="tune" size={16} color={activeTab === 'Settings' ? 'white' : 'grey'} />
          <Text style={[styles.tabLabel, { color: activeTab === 'Settings' ? 'white' : 'grey' }]}>{t('settings')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Preview' && styles.activeTab]}
          onPress={() => setActiveTab('Preview')}
        >
          <Icon name="code-tags" size={16} color={activeTab === 'Preview' ? 'white' : 'grey'} />
          <Text style={[styles.tabLabel, { color: activeTab === 'Preview' ? 'white' : 'grey' }]}>{t('preview')}</Text>
        </TouchableOpacity>
      </View>

      {/* Helper Dialogs Buttons */}
      <View style={styles.quickAddRow}>
        <PrimaryButton label="YouTube" icon="youtube" tone="danger" onPress={() => setShowYouTube(true)} style={styles.quickAddButton} />
        <PrimaryButton label="CodePen" icon="codepen" tone="primary" onPress={() => setShowCodePen(true)} style={styles.quickAddButton} />
        <PrimaryButton label="Gist" icon="github" tone="secondary" onPress={() => setShowGist(true)} style={styles.quickAddButton} />
      </View>

      <View style={styles.content}>
        {activeTab === 'Settings' ? renderSettingsTab() : renderPreviewTab()}
      </View>

      {/* Helper Dialogs */}
      <YouTubeHelperDialog
        visible={showYouTube}
        onClose={() => setShowYouTube(false)}
        onSelect={url => { addElement('youtube', { url }); setShowYouTube(false); }}
      />
      <CodePenHelperDialog
        visible={showCodePen}
        onClose={() => setShowCodePen(false)}
        onSelect={url => { addElement('codepen', { url }); setShowCodePen(false); }}
      />
      <GistHelperDialog
        visible={showGist}
        onClose={() => setShowGist(false)}
        onSelect={url => { addElement('gist', { url }); setShowGist(false); }}
      />
    </GlassView>
  );
};

  const getElementIcon = (type) => {
  switch (type) {
    case 'heading': return 'format-title';
    case 'paragraph': return 'text';
    case 'image': return 'image-outline';
    case 'code': return 'xml';
    case 'codeBlock': return 'xml';
    case 'blockquote': return 'format-quote-close';
    case 'list': return 'format-list-bulleted';
    case 'taskList': return 'checkbox-marked-outline';
    case 'table': return 'table';
    case 'badge': return 'shield-check-outline';
    case 'icon': return 'emoticon-outline';
    case 'button': return 'link-variant';
    case 'linkButton': return 'link-variant';
    case 'embed': return 'application-braces-outline';
    case 'socials': return 'share-variant-outline';
    case 'githubStats': return 'chart-bar';
    case 'contributors': return 'account-group-outline';
    case 'mermaid': return 'graph-outline';
    case 'toc': return 'format-list-bulleted-square';
    case 'collapsible': return 'unfold-more-horizontal';
    case 'dynamicWidget': return 'puzzle-outline';
    case 'raw': return 'code-braces';
    default: return 'widgets-outline';
  }
};

const styles = StyleSheet.create({
  container: { width: 340, height: '100%' },
  tabBar: { flexDirection: 'row', margin: 16, backgroundColor: 'rgba(148,163,184,0.12)', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: 'rgba(148,163,184,0.14)' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10 },
  activeTab: { backgroundColor: Colors.primary },
  tabLabel: { marginLeft: 6, fontWeight: 'bold', fontSize: 12 },
  content: { flex: 1 },
  quickAddRow: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 12, paddingBottom: 10 },
  quickAddButton: { marginHorizontal: 6 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIconContainer: { padding: 24, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 100, marginBottom: 24 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubtitle: { textAlign: 'center', color: 'grey', lineHeight: 20 },
  tabContent: { flex: 1 },
  elementHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 16, backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: 12 },
  typeIcon: { padding: 6, borderRadius: 8, marginRight: 10 },
  elementTitle: { fontWeight: 'bold', fontSize: 14, color: Colors.primary, flex: 1 },
  headerActions: { flexDirection: 'row' },
  headerActionBtn: { marginLeft: 8 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
  previewLabel: { fontSize: 10, fontWeight: '900', color: 'grey', letterSpacing: 1 },
  copyBtn: { color: Colors.primary, fontSize: 12, fontWeight: 'bold' },
  codeBox: { flex: 1, padding: 20 },
  codeText: { fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
  previewEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});

export default SettingsPanel;
