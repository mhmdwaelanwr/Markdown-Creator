import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useColorScheme,
  useWindowDimensions,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import GlassView from '../components/ui/GlassView';
import ActionIconButton from '../components/ui/ActionIconButton';
import AppDialog from '../components/ui/AppDialog';
import PrimaryButton from '../components/ui/PrimaryButton';
import SoftButton from '../components/ui/SoftButton';
import CommandPalette from '../components/CommandPalette';
import LivePreviewPanel from '../components/LivePreviewPanel';
import ComponentsPanel from '../components/ComponentsPanel';
import EditorCanvas from '../components/EditorCanvas';
import SettingsPanel from '../components/SettingsPanel';
import ProjectSettingsDialog from '../components/ProjectSettingsDialog';
import ImportMarkdownDialog from '../components/ImportMarkdownDialog';
import SaveToLibraryDialog from '../components/SaveToLibraryDialog';
import SnapshotsDialog from '../components/SnapshotsDialog';
import HealthCheckDialog from '../components/HealthCheckDialog';
import AISettingsDialog from '../components/AISettingsDialog';
import GenerateCodebaseDialog from '../components/GenerateCodebaseDialog';
import PublishToGitHubDialog from '../components/PublishToGitHubDialog';
import ExtraFilesDialog from '../components/ExtraFilesDialog';
import LanguageDialog from '../components/LanguageDialog';
import AboutAppDialog from '../components/AboutAppDialog';
import AboutDeveloperDialog from '../components/AboutDeveloperDialog';
import LoginDialog from '../components/LoginDialog';
import PaywallDialog from '../components/PaywallDialog';
import VibeComposeDialog from '../components/VibeComposeDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { Colors } from '../constants/Colors';
import { useProject } from '../context/ProjectContext';
import { useLibrary } from '../providers/LibraryProvider';
import { useSubscription } from '../providers/SubscriptionProvider';
import { useAuth } from '../providers/AuthProvider';
import { exportProject } from '../utils/projectExporter';
import { downloadJsonFile } from '../utils/downloader';
import { HealthCheckService } from '../services/healthCheckService';
import MarkdownGenerator from '../services/MarkdownGenerator';

const EditorScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    elements,
    variables,
    listBullet,
    sectionSpacing,
    targetLanguage,
    themeMode,
    deviceMode,
    setDeviceMode,
    undo,
    redo,
    toggleTheme,
    toggleGrid,
    isSaving,
    selectedElementId,
    exportToJson,
    importFromJson,
    clearElements,
    addElement,
    removeElement,
    duplicateElement,
    moveElementUp,
    moveElementDown,
    loadTemplate,
    snapshots,
    allTemplates,
    licenseType,
    includeContributing,
    includeSecurity,
    includeSupport,
    includeCodeOfConduct,
    includeIssueTemplates,
    exportHtml,
    githubToken,
    setGeminiApiKey,
    geminiApiKey,
    setLocale,
    saveSnapshot,
    restoreSnapshot,
    deleteSnapshot,
  } = useProject();
  const { saveProject } = useLibrary();
  const { isPro, isProFreeForAll } = useSubscription();
  const { user, signOut } = useAuth();
  const systemTheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 1100;
  const [activePanel, setActivePanel] = useState('Canvas');
  const [showPreview, setShowPreview] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showImportMarkdown, setShowImportMarkdown] = useState(false);
  const [showSaveLibrary, setShowSaveLibrary] = useState(false);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [showVibeCompose, setShowVibeCompose] = useState(false);
  const [showGenerateCodebase, setShowGenerateCodebase] = useState(false);
  const [showPublishGithub, setShowPublishGithub] = useState(false);
  const [showExtraFiles, setShowExtraFiles] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAboutDev, setShowAboutDev] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState(null);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportJson, setShowImportJson] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [healthIssues, setHealthIssues] = useState([]);
  const [loginInitialTab, setLoginInitialTab] = useState('github');

  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return systemTheme === 'dark';
  }, [themeMode, systemTheme]);

  const glassTone = isDark ? 'dark' : 'light';
  const githubNotice = !githubToken
    ? {
        icon: 'github',
        message: t('githubIntegrationInactive'),
        actionLabel: t('connectGitHub'),
        onAction: () => {
          setLoginInitialTab('github');
          setShowLogin(true);
        },
      }
    : null;

  const pageBackgroundStyle = useMemo(() => {
    const base = { backgroundColor: isDark ? Colors.darkBackground : Colors.lightBackground };
    if (Platform.OS !== 'web') return base;
    return {
      ...base,
      backgroundImage: isDark
        ? 'radial-gradient(1200px circle at 12% 8%, rgba(99,102,241,0.25), transparent 55%), radial-gradient(900px circle at 92% 6%, rgba(16,185,129,0.16), transparent 60%), radial-gradient(1100px circle at 50% 112%, rgba(244,63,94,0.10), transparent 60%)'
        : 'radial-gradient(1200px circle at 12% 8%, rgba(99,102,241,0.16), transparent 55%), radial-gradient(900px circle at 92% 6%, rgba(16,185,129,0.12), transparent 60%), radial-gradient(1100px circle at 50% 112%, rgba(244,63,94,0.08), transparent 60%)',
      backgroundAttachment: 'fixed',
    };
  }, [isDark]);

  const markdown = useMemo(
    () => MarkdownGenerator.generate(elements, variables, listBullet, sectionSpacing, targetLanguage, true),
    [elements, variables, listBullet, sectionSpacing, targetLanguage],
  );

  const score = useMemo(
    () => HealthCheckService.calculateDocumentationScore(elements),
    [elements],
  );

  const handleExport = useCallback(() => {
    exportProject({
      elements,
      variables,
      licenseType,
      includeContributing,
      includeSecurity,
      includeSupport,
      includeCodeOfConduct,
      includeIssueTemplates,
      listBullet,
      sectionSpacing,
      exportHtml,
      targetLanguage,
    });
  }, [
    elements,
    variables,
    licenseType,
    includeContributing,
    includeSecurity,
    includeSupport,
    includeCodeOfConduct,
    includeIssueTemplates,
    listBullet,
    sectionSpacing,
    exportHtml,
    targetLanguage,
  ]);

  const handleOpenHealth = useCallback(() => {
    const issues = HealthCheckService.analyze(elements);
    setHealthIssues(issues);
    setShowHealth(true);
  }, [elements]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const isEditableTarget = (target) => {
      if (!target) return false;
      const tag = target.tagName?.toLowerCase?.();
      return tag === 'input' || tag === 'textarea' || target.isContentEditable;
    };

    const handler = (event) => {
      if (!event) return;
      if (isEditableTarget(event.target)) return;

      const key = String(event.key || '').toLowerCase();
      const mod = !!(event.metaKey || event.ctrlKey);
      const alt = !!event.altKey;

      if (showCommandPalette) {
        if (key === 'escape') {
          event.preventDefault();
          setShowCommandPalette(false);
        }
        return;
      }

      if ((mod && (key === 'k' || key === 'p')) || (key === '?' && event.shiftKey)) {
        event.preventDefault();
        setShowCommandPalette(true);
        return;
      }

      if ((key === 'backspace' || key === 'delete') && selectedElementId) {
        event.preventDefault();
        removeElement(selectedElementId);
        return;
      }

      if (alt && (key === 'arrowup' || key === 'arrowdown') && selectedElementId) {
        event.preventDefault();
        if (key === 'arrowup') moveElementUp(selectedElementId);
        else moveElementDown(selectedElementId);
        return;
      }

      if (!mod) return;

      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
        return;
      }

      if (key === 'e') {
        event.preventDefault();
        handleExport();
        return;
      }

      if (key === 's') {
        event.preventDefault();
        setShowSaveLibrary(true);
        return;
      }

      if (key === 'g') {
        event.preventDefault();
        toggleGrid();
        return;
      }

      if (key === 'b') {
        event.preventDefault();
        setShowPreview((prev) => !prev);
        return;
      }

      if (key === 'd' && selectedElementId) {
        event.preventDefault();
        duplicateElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    duplicateElement,
    handleExport,
    moveElementDown,
    moveElementUp,
    redo,
    removeElement,
    selectedElementId,
    showCommandPalette,
    toggleGrid,
    undo,
  ]);

  const handleImportJson = () => {
    if (!importJsonText.trim()) return;
    importFromJson(importJsonText);
    setImportJsonText('');
    setShowImportJson(false);
  };

  const handleTemplateSelect = (template) => {
    setPendingTemplate(template);
    setShowTemplates(false);
    setShowTemplateConfirm(true);
  };

  const renderMobilePanel = () => {
    if (activePanel === 'Components') {
      return <ComponentsPanel isDark={isDark} style={styles.mobilePanel} />;
    }
    if (activePanel === 'Settings') {
      return <SettingsPanel isDark={isDark} style={styles.mobilePanel} />;
    }
    if (activePanel === 'Preview') {
      return (
        <LivePreviewPanel markdown={markdown} isDark={isDark} style={styles.previewMobile} />
      );
    }
    return <EditorCanvas isDark={isDark} notice={githubNotice} />;
  };

  const commandItems = useMemo(
    () => [
      { id: 'undo', title: 'Undo', subtitle: 'Ctrl/Cmd+Z', icon: 'undo', action: undo, keywords: ['history'] },
      { id: 'redo', title: 'Redo', subtitle: 'Ctrl/Cmd+Shift+Z', icon: 'redo', action: redo, keywords: ['history'] },
      {
        id: 'toggle-preview',
        title: showPreview ? 'Hide Preview' : 'Show Preview',
        subtitle: 'Ctrl/Cmd+B',
        icon: showPreview ? 'eye-off' : 'eye',
        action: () => setShowPreview((p) => !p),
        keywords: ['preview'],
      },
      {
        id: 'toggle-focus',
        title: isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode',
        icon: isFocusMode ? 'fullscreen-exit' : 'fullscreen',
        action: () => setIsFocusMode((p) => !p),
        keywords: ['focus'],
      },
      { id: 'toggle-grid', title: 'Toggle Canvas Grid', subtitle: 'Ctrl/Cmd+G', icon: 'grid', action: toggleGrid, keywords: ['canvas'] },
      {
        id: 'toggle-theme',
        title: 'Toggle Theme',
        icon: isDark ? 'white-balance-sunny' : 'moon-waning-crescent',
        action: toggleTheme,
        keywords: ['dark', 'light'],
      },
      { id: 'export', title: 'Export README + files', subtitle: 'Ctrl/Cmd+E', icon: 'rocket-launch-outline', action: handleExport, keywords: ['download'] },
      { id: 'save-library', title: 'Save to Library', subtitle: 'Ctrl/Cmd+S', icon: 'content-save-outline', action: () => setShowSaveLibrary(true), keywords: ['project'] },
      { id: 'templates', title: 'Open Templates', icon: 'file-document-outline', action: () => setShowTemplates(true), keywords: ['starter'] },
      { id: 'library', title: 'Open Projects Library', icon: 'library-shelves', action: () => navigation.navigate('ProjectsLibrary'), keywords: ['projects'] },
      { id: 'import-md', title: 'Import Markdown', icon: 'file-upload-outline', action: () => setShowImportMarkdown(true), keywords: ['import'] },
      { id: 'vibe', title: 'Vibe Coding', subtitle: 'AI compose', icon: 'auto-fix', action: () => setShowVibeCompose(true), keywords: ['ai', 'vibe', 'compose', 'gemini'] },
      { id: 'health', title: 'Health Check', icon: 'shield-check-outline', action: handleOpenHealth, keywords: ['quality', 'score'] },
      { id: 'project-settings', title: 'Project Settings', icon: 'cog-outline', action: () => setShowProjectSettings(true), keywords: ['settings'] },
      { id: 'clear', title: 'Clear Workspace', icon: 'delete-sweep-outline', action: () => setShowClearConfirm(true), keywords: ['reset'] },
      { id: 'duplicate', title: 'Duplicate Selected Element', subtitle: 'Ctrl/Cmd+D', icon: 'content-copy', action: () => selectedElementId && duplicateElement(selectedElementId), keywords: ['element'] },
      { id: 'delete', title: 'Delete Selected Element', subtitle: 'Delete / Backspace', icon: 'trash-can-outline', action: () => selectedElementId && removeElement(selectedElementId), keywords: ['element'] },
      { id: 'move-up', title: 'Move Selected Up', subtitle: 'Alt+↑', icon: 'chevron-up', action: () => selectedElementId && moveElementUp(selectedElementId), keywords: ['reorder'] },
      { id: 'move-down', title: 'Move Selected Down', subtitle: 'Alt+↓', icon: 'chevron-down', action: () => selectedElementId && moveElementDown(selectedElementId), keywords: ['reorder'] },
      { id: 'device-desktop', title: 'Device: Desktop', icon: 'monitor', action: () => setDeviceMode('desktop'), keywords: ['device'] },
      { id: 'device-tablet', title: 'Device: Tablet', icon: 'tablet', action: () => setDeviceMode('tablet'), keywords: ['device'] },
      { id: 'device-mobile', title: 'Device: Mobile', icon: 'cellphone', action: () => setDeviceMode('mobile'), keywords: ['device'] },
      { id: 'add-heading', title: 'Add Element: Heading', icon: 'format-title', action: () => addElement('heading'), keywords: ['element', 'typography'] },
      { id: 'add-paragraph', title: 'Add Element: Paragraph', icon: 'text', action: () => addElement('paragraph'), keywords: ['element', 'typography'] },
      { id: 'add-code', title: 'Add Element: Code Block', icon: 'xml', action: () => addElement('codeBlock'), keywords: ['element', 'code'] },
      { id: 'add-image', title: 'Add Element: Image', icon: 'image-outline', action: () => addElement('image'), keywords: ['element', 'media'] },
      { id: 'add-badge', title: 'Add Element: Badge', icon: 'shield-check-outline', action: () => addElement('badge'), keywords: ['element', 'media'] },
      { id: 'add-list', title: 'Add Element: List', icon: 'format-list-bulleted', action: () => addElement('list'), keywords: ['element', 'structure'] },
      { id: 'add-table', title: 'Add Element: Table', icon: 'table', action: () => addElement('table'), keywords: ['element', 'structure'] },
      { id: 'add-divider', title: 'Add Element: Divider', icon: 'minus', action: () => addElement('divider'), keywords: ['element', 'structure'] },
      { id: 'add-toc', title: 'Add Element: Table of Contents', icon: 'format-list-bulleted-square', action: () => addElement('toc'), keywords: ['element', 'advanced'] },
      { id: 'add-mermaid', title: 'Add Element: Mermaid', icon: 'graph-outline', action: () => addElement('mermaid'), keywords: ['element', 'advanced'] },
      { id: 'add-raw', title: 'Add Element: Raw HTML/CSS', icon: 'code-braces', action: () => addElement('raw'), keywords: ['element', 'advanced'] },
    ],
    [
      addElement,
      duplicateElement,
      handleExport,
      handleOpenHealth,
      isDark,
      isFocusMode,
      moveElementDown,
      moveElementUp,
      navigation,
      redo,
      removeElement,
      selectedElementId,
      setDeviceMode,
      showPreview,
      toggleGrid,
      toggleTheme,
      undo,
    ],
  );

  return (
    <SafeAreaView style={[styles.safe, pageBackgroundStyle]}>
      <GlassView
        tone={glassTone}
        style={[
          styles.topBar,
          {
            borderRadius: 20,
            marginHorizontal: 12,
            marginTop: 10,
            borderColor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.10)',
          },
        ]}
      >
        <View style={styles.brand}>
          <View style={[styles.brandDot, { backgroundColor: Colors.primary }]} />
          <View>
            <View style={styles.brandRow}>
              <Text style={[styles.title, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
                {t('appTitle')}
              </Text>
              {isPro ? (
                <>
                  <View style={styles.proBadge}>
                    <Text style={styles.proText}>PRO</Text>
                  </View>
                  {isProFreeForAll ? (
                    <View style={styles.freeBadge}>
                      <Text style={styles.freeText}>{t('freeBadge')}</Text>
                    </View>
                  ) : null}
                </>
              ) : null}
            </View>
            <Text style={styles.subtitle}>Creator</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {isWide && (
            <>
              <HeaderAction icon="undo" onPress={undo} isDark={isDark} label={t('undo')} />
              <HeaderAction icon="redo" onPress={redo} isDark={isDark} label={t('redo')} />
              <HeaderAction icon="magnify" onPress={() => setShowCommandPalette(true)} isDark={isDark} label={t('commands')} />
              <Divider />
              <HeaderAction icon="file-document-outline" onPress={() => setShowTemplates(true)} isDark={isDark} label={t('templates')} />
              <HeaderAction icon="library-shelves" onPress={() => navigation.navigate('ProjectsLibrary')} isDark={isDark} label={t('library')} />
              <Divider />
              <DeviceButton active={deviceMode === 'desktop'} icon="monitor" onPress={() => setDeviceMode('desktop')} isDark={isDark} />
              <DeviceButton active={deviceMode === 'tablet'} icon="tablet" onPress={() => setDeviceMode('tablet')} isDark={isDark} />
              <DeviceButton active={deviceMode === 'mobile'} icon="cellphone" onPress={() => setDeviceMode('mobile')} isDark={isDark} />
              <Divider />
              <HeaderAction icon={showPreview ? 'eye' : 'eye-off'} active={showPreview} onPress={() => setShowPreview(!showPreview)} isDark={isDark} label={t('showPreview')} />
              <HeaderAction icon={isFocusMode ? 'fullscreen-exit' : 'fullscreen'} active={isFocusMode} onPress={() => setIsFocusMode(!isFocusMode)} isDark={isDark} label={t('focusMode')} />
              <Divider />
              <HeaderAction icon="shield-check-outline" onPress={handleOpenHealth} isDark={isDark} label={t('healthCheck')} />
              <HeaderAction icon={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'} onPress={toggleTheme} isDark={isDark} label={t('toggleTheme')} />
              <HeaderAction icon="cog-outline" onPress={() => setShowProjectSettings(true)} isDark={isDark} label={t('projectSettings')} />
              <HeaderAction
                icon={user ? 'account-circle' : 'login'}
                onPress={() => {
                  if (user) {
                    signOut();
                    return;
                  }
                  setLoginInitialTab('github');
                  setShowLogin(true);
                }}
                isDark={isDark}
                label={user ? t('signOut') : t('signIn')}
              />
              <PrimaryButton label={t('export').toUpperCase()} icon="rocket-launch-outline" onPress={handleExport} style={styles.exportButton} />
            </>
          )}

          {!isWide && (
            <>
              <HeaderAction icon="undo" onPress={undo} isDark={isDark} label={t('undo')} />
              <HeaderAction icon="redo" onPress={redo} isDark={isDark} label={t('redo')} />
              <HeaderAction icon="magnify" onPress={() => setShowCommandPalette(true)} isDark={isDark} label={t('commands')} />
              <HeaderAction icon="eye" onPress={() => setActivePanel('Preview')} isDark={isDark} label={t('showPreview')} />
              <HeaderAction icon="menu" onPress={() => setShowMenu(true)} isDark={isDark} label={t('menu')} />
            </>
          )}

          {isWide && <HeaderAction icon="dots-grid" onPress={() => setShowMenu(true)} isDark={isDark} label={t('menu')} />}
        </View>
      </GlassView>

      {isWide ? (
        <View style={styles.workspaceWide}>
          {!isFocusMode && <ComponentsPanel isDark={isDark} style={styles.leftPanel} />}
          <View style={styles.canvasArea}>
            <EditorCanvas isDark={isDark} notice={githubNotice} />
          </View>
          {showPreview && <LivePreviewPanel markdown={markdown} isDark={isDark} style={styles.previewPanel} />}
          {!isFocusMode && <SettingsPanel isDark={isDark} style={styles.rightPanel} />}
        </View>
      ) : (
        <View style={styles.workspaceMobile}>
          <View style={[styles.mobileTabs, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderBottomColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            <MobileTab label={t('components')} icon="shape-outline" active={activePanel === 'Components'} onPress={() => setActivePanel('Components')} isDark={isDark} />
            <MobileTab label={t('canvas')} icon="pencil-ruler" active={activePanel === 'Canvas'} onPress={() => setActivePanel('Canvas')} isDark={isDark} />
            <MobileTab label={t('settings')} icon="tune" active={activePanel === 'Settings'} onPress={() => setActivePanel('Settings')} isDark={isDark} />
            <MobileTab label={t('preview')} icon="eye" active={activePanel === 'Preview'} onPress={() => setActivePanel('Preview')} isDark={isDark} />
          </View>
          {renderMobilePanel()}
        </View>
      )}

      <GlassView
        tone={glassTone}
        style={[
          styles.statusBar,
          {
            marginHorizontal: 12,
            marginBottom: 10,
            borderRadius: 18,
            borderColor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.10)',
          },
        ]}
      >
        <StatusItem icon="widgets-outline" label={`${elements.length} elements`} />
        <StatusItem icon="chart-line" label={`Doc quality: ${Math.round(score)}%`} color={score >= 70 ? Colors.success : Colors.warning} />
        <View style={{ flex: 1 }} />
        <StatusItem
          icon={isPro ? 'star' : 'lock-open-variant'}
          label={isPro ? (isProFreeForAll ? t('proFreeForAll') : t('proActive')) : t('freePlan')}
          color={isPro ? Colors.warning : (isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight)}
        />
        {isSaving ? (
          <View style={styles.saveIndicator}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.saveText}>Saving</Text>
          </View>
        ) : (
          <StatusItem icon="cloud-check" label="Synced" color={Colors.primary} />
        )}
      </GlassView>

      <CommandPalette
        visible={showCommandPalette}
        isDark={isDark}
        onClose={() => setShowCommandPalette(false)}
        items={commandItems}
      />

      <ProjectSettingsDialog visible={showProjectSettings} onClose={() => setShowProjectSettings(false)} />
      <ImportMarkdownDialog visible={showImportMarkdown} onClose={() => setShowImportMarkdown(false)} />
      <SaveToLibraryDialog
        visible={showSaveLibrary}
        onClose={() => setShowSaveLibrary(false)}
        onSave={(payload) => {
          saveProject({ name: payload.name, description: payload.desc, tags: [], jsonContent: exportToJson() });
        }}
      />
      <SnapshotsDialog
        visible={showSnapshots}
        onClose={() => setShowSnapshots(false)}
        snapshots={snapshots}
        onSave={saveSnapshot}
        onRestore={restoreSnapshot}
        onDelete={deleteSnapshot}
      />
      <HealthCheckDialog visible={showHealth} onClose={() => setShowHealth(false)} issues={healthIssues} />
      <AISettingsDialog
        visible={showAISettings}
        onClose={() => setShowAISettings(false)}
        apiKey={geminiApiKey}
        onSave={(key) => setGeminiApiKey(key)}
      />
      <VibeComposeDialog
        visible={showVibeCompose}
        onClose={() => setShowVibeCompose(false)}
        isDark={isDark}
        onOpenAISettings={() => {
          setShowVibeCompose(false);
          setShowAISettings(true);
        }}
      />
      <GenerateCodebaseDialog visible={showGenerateCodebase} onClose={() => setShowGenerateCodebase(false)} />
      <PublishToGitHubDialog
        visible={showPublishGithub}
        onClose={() => setShowPublishGithub(false)}
      />
      <ExtraFilesDialog visible={showExtraFiles} onClose={() => setShowExtraFiles(false)} files={[]} />
      <LanguageDialog
        visible={showLanguage}
        onClose={() => setShowLanguage(false)}
        onSelect={(lang) => {
          setLocale(lang);
        }}
      />
      <AboutAppDialog visible={showAbout} onClose={() => setShowAbout(false)} />
      <AboutDeveloperDialog visible={showAboutDev} onClose={() => setShowAboutDev(false)} />
      <LoginDialog visible={showLogin} onClose={() => setShowLogin(false)} initialTab={loginInitialTab} />
      <PaywallDialog visible={showPaywall} onClose={() => setShowPaywall(false)} />

      <TemplatePicker
        visible={showTemplates}
        isDark={isDark}
        templates={allTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
      />

      <ConfirmDialog
        visible={showTemplateConfirm}
        title="Load template"
        message="This will replace your current workspace. Continue?"
        onClose={() => setShowTemplateConfirm(false)}
        onConfirm={() => {
          if (pendingTemplate) loadTemplate(pendingTemplate);
          setShowTemplateConfirm(false);
        }}
      />

      <ConfirmDialog
        visible={showClearConfirm}
        title="Clear workspace"
        message="This will remove all elements. Continue?"
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clearElements();
          setShowClearConfirm(false);
        }}
      />

      <JsonImportDialog
        visible={showImportJson}
        isDark={isDark}
        value={importJsonText}
        onChangeText={setImportJsonText}
        onClose={() => setShowImportJson(false)}
        onImport={handleImportJson}
      />

      <MoreMenu
        visible={showMenu}
        isDark={isDark}
        onClose={() => setShowMenu(false)}
        onAction={(action) => {
          switch (action) {
            case 'save':
              setShowSaveLibrary(true);
              break;
            case 'snapshots':
              setShowSnapshots(true);
              break;
            case 'import_md':
              setShowImportMarkdown(true);
              break;
            case 'export_json':
              downloadJsonFile(exportToJson(), 'readme_project.json');
              break;
            case 'import_json':
              setShowImportJson(true);
              break;
            case 'clear':
              setShowClearConfirm(true);
              break;
            case 'gallery':
              navigation.navigate('Gallery');
              break;
            case 'social':
              navigation.navigate('SocialPreview');
              break;
            case 'actions':
              navigation.navigate('GitHubActions');
              break;
            case 'funding':
              navigation.navigate('FundingGenerator');
              break;
            case 'extra':
              setShowExtraFiles(true);
              break;
            case 'ai':
              if (isPro) setShowAISettings(true);
              else setShowPaywall(true);
              break;
            case 'vibe':
              if (isPro) setShowVibeCompose(true);
              else setShowPaywall(true);
              break;
            case 'codebase':
              if (isPro) setShowGenerateCodebase(true);
              else setShowPaywall(true);
              break;
            case 'publish':
              setShowPublishGithub(true);
              break;
            case 'lang':
              setShowLanguage(true);
              break;
            case 'about_dev':
              setShowAboutDev(true);
              break;
            case 'about':
              setShowAbout(true);
              break;
            default:
              break;
          }
        }}
      />
    </SafeAreaView>
  );
};

const HeaderAction = ({ icon, onPress, isDark, active = false, label }) => (
  <ActionIconButton
    icon={icon}
    onPress={onPress}
    isDark={isDark}
    active={active}
    accessibilityLabel={label}
    style={styles.headerAction}
  />
);

const Divider = () => <View style={styles.divider} />;

const DeviceButton = ({ icon, active, onPress, isDark }) => (
  <ActionIconButton icon={icon} onPress={onPress} active={active} isDark={isDark} size={16} style={styles.headerAction} />
);

const MobileTab = ({ label, icon, active, onPress, isDark }) => (
  <TouchableOpacity onPress={onPress} style={[styles.mobileTab, active && { borderBottomColor: Colors.primary }]}>
    <Icon name={icon} size={18} color={active ? Colors.primary : (isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight)} />
    <Text style={[styles.mobileTabText, { color: active ? Colors.primary : (isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight) }]}>{label}</Text>
  </TouchableOpacity>
);

const StatusItem = ({ icon, label, color }) => (
  <View style={styles.statusItem}>
    <Icon name={icon} size={14} color={color || '#94A3B8'} />
    <Text style={[styles.statusText, { color: color || '#94A3B8' }]}>{label}</Text>
  </View>
);

const TemplatePicker = ({ visible, onClose, templates, onSelect, isDark }) => {
  const { t } = useTranslation();

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title={t('templates')}
      subtitle="Start from a curated layout and iterate fast."
      icon="view-grid-outline"
      maxWidth={760}
      footer={
        <View style={styles.dialogFooter}>
          <SoftButton label={t('close').toUpperCase()} onPress={onClose} isDark={isDark} />
        </View>
      }
    >
      <View>
        {(templates || []).length ? (
          (templates || []).map((template) => (
            <TouchableOpacity
              key={template.name}
              style={[
                styles.templateItem,
                {
                  backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
                  borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
                },
                Platform.OS === 'web' ? { cursor: 'pointer' } : null,
              ]}
              onPress={() => onSelect(template)}
            >
              <Text style={[styles.templateTitle, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
                {template.name}
              </Text>
              <Text
                style={[styles.templateSubtitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}
                numberOfLines={2}
              >
                {template.description || 'No description available.'}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.dialogEmpty, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
            No templates available.
          </Text>
        )}
      </View>
    </AppDialog>
  );
};

const JsonImportDialog = ({ visible, onClose, onImport, value, onChangeText, isDark }) => {
  const { t } = useTranslation();

  return (
  <AppDialog
    visible={visible}
    onClose={onClose}
    isDark={isDark}
    title={t('importProjectJson')}
    subtitle="Paste a previously exported project JSON to restore it."
    icon="code-json"
    maxWidth={860}
    scroll={false}
    footer={
      <View style={styles.dialogFooter}>
        <SoftButton label={t('cancel').toUpperCase()} onPress={onClose} isDark={isDark} style={{ marginLeft: 10 }} />
        <PrimaryButton label={t('import').toUpperCase()} icon="download" onPress={onImport} disabled={!String(value || '').trim()} />
      </View>
    }
  >
    <TextInput
      style={[
        styles.jsonInput,
        {
          backgroundColor: isDark ? 'rgba(2,6,23,0.35)' : 'rgba(255,255,255,0.80)',
          borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)',
          color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight,
        },
      ]}
      multiline
      value={value}
      onChangeText={onChangeText}
      placeholder="Paste project JSON here…"
      placeholderTextColor={isDark ? 'rgba(226,232,240,0.45)' : 'rgba(15,23,42,0.45)'}
      textAlignVertical="top"
    />
  </AppDialog>
  );
};

const MoreMenu = ({ visible, onClose, onAction, isDark }) => {
  const { t } = useTranslation();
  const sections = [
    {
      title: 'Project & Files',
      items: [
        { key: 'save', icon: 'content-save-outline', label: t('saveProject') },
        { key: 'snapshots', icon: 'history', label: t('localSnapshots') },
        { key: 'import_md', icon: 'file-upload-outline', label: t('importMarkdown') },
        { key: 'export_json', icon: 'code-json', label: t('exportProjectJson') },
        { key: 'import_json', icon: 'file-download-outline', label: t('importProjectJson') },
        { key: 'clear', icon: 'delete-sweep-outline', label: t('clearWorkspace') },
      ],
    },
    {
      title: 'Tools & Generators',
      items: [
        { key: 'gallery', icon: 'view-gallery-outline', label: 'Showcase gallery' },
        { key: 'social', icon: 'chart-arc', label: t('socialPreviewDesigner') },
        { key: 'actions', icon: 'console', label: t('githubActionsGenerator') },
        { key: 'funding', icon: 'hand-heart-outline', label: 'Funding generator' },
        { key: 'extra', icon: 'file-plus-outline', label: 'Extra files' },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { key: 'vibe', icon: 'robot-outline', label: t('vibeCoding') },
        { key: 'ai', icon: 'brain', label: t('aiSettings') },
        { key: 'codebase', icon: 'auto-fix', label: t('generateFromCodebase') },
        { key: 'publish', icon: 'cloud-upload-outline', label: 'Publish to GitHub' },
      ],
    },
    {
      title: 'Application',
      items: [
        { key: 'lang', icon: 'translate', label: t('changeLanguage') },
        { key: 'about_dev', icon: 'account-outline', label: t('aboutDeveloper') },
        { key: 'about', icon: 'information-outline', label: t('aboutApp') },
      ],
    },
  ];

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title={t('menu')}
      subtitle={t('menuSubtitle')}
      icon="menu"
      maxWidth={720}
      footer={
        <View style={styles.dialogFooter}>
          <SoftButton label={t('close').toUpperCase()} onPress={onClose} isDark={isDark} />
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={[styles.menuTitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {section.title.toUpperCase()}
            </Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
                    borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
                  },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : null,
                ]}
                onPress={() => {
                  onAction(item.key);
                  onClose();
                }}
              >
                <View style={[styles.menuIcon, { backgroundColor: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.10)' }]}>
                  <Icon name={item.icon} size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.menuText, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
                  {item.label}
                </Text>
                <View style={{ flex: 1 }} />
                <Icon
                  name="chevron-right"
                  size={18}
                  color={isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight}
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </AppDialog>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  title: { fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
  subtitle: { fontSize: 10, color: '#64748B', letterSpacing: 1 },
  proBadge: { marginLeft: 8, backgroundColor: '#FBBF24', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  proText: { fontSize: 8, fontWeight: '900', color: '#1E1B4B', letterSpacing: 0.5 },
  freeBadge: { marginLeft: 6, backgroundColor: '#22C55E', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  freeText: { fontSize: 8, fontWeight: '900', color: '#052E16', letterSpacing: 0.5 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 },
  headerAction: { marginHorizontal: 4, marginVertical: 4 },
  divider: { width: 1, height: 20, backgroundColor: 'rgba(148,163,184,0.3)', marginHorizontal: 8 },
  exportButton: { marginLeft: 10, marginVertical: 4 },
  workspaceWide: { flex: 1, flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 12, paddingTop: 10 },
  workspaceMobile: { flex: 1, paddingHorizontal: 12, paddingBottom: 12, paddingTop: 10 },
  leftPanel: { marginRight: 12, borderRadius: 18, overflow: 'hidden' },
  rightPanel: { marginLeft: 12, borderRadius: 18, overflow: 'hidden' },
  canvasArea: { flex: 1, borderRadius: 18, overflow: 'hidden' },
  previewPanel: { width: 340, marginLeft: 12, borderRadius: 18, overflow: 'hidden' },
  previewMobile: { width: '100%', flex: 1, borderRadius: 18, overflow: 'hidden', marginTop: 12 },
  mobileTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
  },
  mobileTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mobileTabText: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  mobilePanel: { width: '100%' },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statusText: { fontSize: 10, fontWeight: '700', marginLeft: 6 },
  saveIndicator: { flexDirection: 'row', alignItems: 'center' },
  saveText: { fontSize: 10, fontWeight: '700', marginLeft: 6, color: Colors.primary },
  dialogFooter: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%' },
  dialogEmpty: { fontSize: 12, fontWeight: '700', textAlign: 'center', paddingVertical: 16 },
  templateItem: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  templateTitle: { fontSize: 13, fontWeight: '900' },
  templateSubtitle: { marginTop: 4, fontSize: 11, fontWeight: '700', lineHeight: 16, opacity: 0.92 },
  jsonInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 220,
    fontSize: 12,
    lineHeight: 18,
    textAlignVertical: 'top',
  },
  menuSection: { marginBottom: 12 },
  menuTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  menuIcon: { width: 34, height: 34, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuText: { fontSize: 13, fontWeight: '900' },
});

export default EditorScreen;
