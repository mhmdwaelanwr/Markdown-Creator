import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PreferenceKeys, PreferencesService } from '../services/preferencesService';
import MarkdownImporter from '../services/MarkdownImporter';
import FirestoreService from '../services/FirestoreService';
import { templates as localTemplates } from '../utils/templates';

const ProjectContext = createContext();
const DEFAULT_VARIABLES = {
  PROJECT_NAME: 'My Project',
  GITHUB_USERNAME: 'username',
  CURRENT_YEAR: new Date().getFullYear().toString(),
};

const DEFAULT_COLORS = {
  primary: '#6366F1',
  secondary: '#10B981',
};

const generateId = () => Math.random().toString(36).slice(2, 11);

const asString = (value, fallback = '') => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const asBool = (value, fallback = false) => (typeof value === 'boolean' ? value : fallback);

const asIntInRange = (value, min, max, fallback) => {
  const num = Number.parseInt(String(value), 10);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
};

const asStringArray = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => asString(item, '').trim())
        .filter(Boolean)
    : [];

const normalizeElement = (input) => {
  if (!input || typeof input !== 'object') return input;
  if (!input.type || typeof input.type !== 'string') return input;

  const type = input.type;
  const id = typeof input.id === 'string' && input.id.trim().length > 0 ? input.id : generateId();
  const base = { ...input, id, type };

  switch (type) {
    case 'heading':
      return {
        ...base,
        text: asString(base.text, ''),
        level: asIntInRange(base.level, 1, 6, 1),
      };
    case 'paragraph':
    case 'blockquote':
      return { ...base, text: asString(base.text, '') };
    case 'code':
    case 'codeBlock':
    case 'mermaid':
      return { ...base, code: asString(base.code, ''), language: asString(base.language, '') };
    case 'image':
      return {
        ...base,
        url: asString(base.url, ''),
        altText: asString(base.altText, ''),
        width: Number.isFinite(Number(base.width)) ? Number(base.width) : null,
      };
    case 'linkButton':
    case 'button':
      return { ...base, text: asString(base.text, ''), url: asString(base.url, '') };
    case 'list':
      return { ...base, items: asStringArray(base.items), isOrdered: asBool(base.isOrdered, false) };
    case 'taskList': {
      const items = Array.isArray(base.items)
        ? base.items
            .map((item) => {
              if (typeof item === 'string') return { text: item, checked: false };
              return { text: asString(item?.text, '').trim(), checked: asBool(item?.checked, false) };
            })
            .filter((item) => item.text.length > 0)
        : [];
      return { ...base, items };
    }
    case 'table': {
      const headers = Array.isArray(base.headers) ? base.headers.map((h) => asString(h, '').trim()) : [];
      const rowsRaw = Array.isArray(base.rows) ? base.rows : [];
      const rows = rowsRaw
        .map((row) => (Array.isArray(row) ? row.map((cell) => asString(cell, '').trim()) : []))
        .filter((row) => row.some((cell) => cell.length > 0));

      const columnCount = headers.length || Math.max(0, ...rows.map((r) => r.length));
      const safeHeaders =
        headers.length === columnCount
          ? headers
          : Array.from({ length: columnCount }, (_, i) => headers[i] || `Column ${i + 1}`);

      const alignmentsRaw = Array.isArray(base.alignments) ? base.alignments : [];
      const safeAlignments = Array.from({ length: columnCount }, (_, i) => {
        const value = asString(alignmentsRaw[i], 'left');
        if (value === 'center' || value === 'right') return value;
        return 'left';
      });

      const safeRows = rows.map((row) => Array.from({ length: columnCount }, (_, i) => row[i] || ''));

      return { ...base, headers: safeHeaders, rows: safeRows, alignments: safeAlignments };
    }
    case 'badge':
      return {
        ...base,
        label: asString(base.label, 'Badge'),
        imageUrl: asString(base.imageUrl, ''),
        targetUrl: asString(base.targetUrl, ''),
      };
    case 'icon':
      return { ...base, name: asString(base.name, ''), url: asString(base.url, ''), size: Number(base.size) || 40 };
    case 'embed':
    case 'youtube':
    case 'codepen':
    case 'gist':
      return { ...base, url: asString(base.url, ''), provider: asString(base.provider, type), typeName: asString(base.typeName, type) };
    case 'contributors':
      return { ...base, repoName: asString(base.repoName, ''), style: asString(base.style, 'avatar') };
    case 'githubStats':
      return {
        ...base,
        repoName: asString(base.repoName, ''),
        showStars: asBool(base.showStars, true),
        showForks: asBool(base.showForks, true),
        showIssues: asBool(base.showIssues, false),
        showLicense: asBool(base.showLicense, false),
      };
    case 'toc':
      return { ...base, title: asString(base.title, 'Table of Contents') };
    case 'socials': {
      const profiles = Array.isArray(base.profiles)
        ? base.profiles
            .map((p) => ({
              platform: asString(p?.platform, 'GitHub'),
              username: asString(p?.username, ''),
            }))
        : [];
      return { ...base, profiles, style: asString(base.style, 'for-the-badge') };
    }
    case 'collapsible':
      return { ...base, summary: asString(base.summary, ''), content: asString(base.content, '') };
    case 'dynamicWidget':
      return {
        ...base,
        widgetType: asString(base.widgetType, 'spotify'),
        identifier: asString(base.identifier, ''),
        theme: asString(base.theme, 'default'),
      };
    case 'raw':
      return { ...base, content: asString(base.content, ''), css: asString(base.css, '') };
    case 'divider':
      return base;
    default:
      return base;
  }
};

const elementToJson = (element) => (element && typeof element.toJson === 'function' ? element.toJson() : element);

const elementFromJson = (json) => {
  if (!json || !json.type) return json;
  return normalizeElement(json);
};

export const ProjectProvider = ({ children }) => {
  const [elements, setElementsState] = useState([]);
  const [variables, setVariablesState] = useState(DEFAULT_VARIABLES);
  const [themeMode, setThemeModeState] = useState('system');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [dragPayload, setDragPayload] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [cloudTemplates, setCloudTemplates] = useState([]);

  const [licenseType, setLicenseTypeState] = useState('None');
  const [includeContributing, setIncludeContributingState] = useState(false);
  const [includeSecurity, setIncludeSecurityState] = useState(false);
  const [includeSupport, setIncludeSupportState] = useState(false);
  const [includeCodeOfConduct, setIncludeCodeOfConductState] = useState(false);
  const [includeIssueTemplates, setIncludeIssueTemplatesState] = useState(false);
  const [primaryColor, setPrimaryColorState] = useState(DEFAULT_COLORS.primary);
  const [secondaryColor, setSecondaryColorState] = useState(DEFAULT_COLORS.secondary);
  const [showGrid, setShowGridState] = useState(true);
  const [snapshots, setSnapshotsState] = useState([]);
  const [listBullet, setListBulletState] = useState('*');
  const [sectionSpacing, setSectionSpacingState] = useState(1);
  const [deviceMode, setDeviceModeState] = useState('desktop');
  const [exportHtml, setExportHtmlState] = useState(false);
  const [geminiApiKey, setGeminiApiKeyState] = useState('');
  const [githubToken, setGithubTokenState] = useState('');
  const [locale, setLocaleState] = useState('en');
  const [targetLanguage, setTargetLanguageState] = useState('en');

  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedElementId) || null,
    [elements, selectedElementId]
  );

  const startDrag = (payload) => setDragPayload(payload);
  const endDrag = () => setDragPayload(null);

  const allTemplates = useMemo(() => [...localTemplates, ...cloudTemplates], [cloudTemplates]);

  useEffect(() => {
    loadPreferences();
    let unsubscribe = null;
    try {
      unsubscribe = FirestoreService.getPublicTemplates((templates) => {
        const normalized = (templates || []).map((template) => ({
          ...template,
          elements: (template.elements || []).map((el) => elementFromJson(el)),
        }));
        setCloudTemplates(normalized);
      });
    } catch (error) {
      console.warn('Cloud templates unavailable:', error?.message || error);
    }
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loadPreferences = async () => {
    try {
      const savedElements = await PreferencesService.getJson(PreferenceKeys.elements, []);
      if (savedElements?.length) setElementsState(savedElements.map((el) => elementFromJson(el)));

      const savedVariables = await PreferencesService.getJson(PreferenceKeys.variables, {});
      if (Object.keys(savedVariables || {}).length) setVariablesState({ ...DEFAULT_VARIABLES, ...savedVariables });

      const savedTheme = await PreferencesService.getString(PreferenceKeys.themeMode, 'system');
      if (savedTheme) setThemeModeState(savedTheme);

      const savedLicense = await PreferencesService.getString(PreferenceKeys.licenseType, 'None');
      setLicenseTypeState(savedLicense || 'None');

      setIncludeContributingState(await PreferencesService.getBool(PreferenceKeys.includeContributing, false));
      setIncludeSecurityState(await PreferencesService.getBool(PreferenceKeys.includeSecurity, false));
      setIncludeSupportState(await PreferencesService.getBool(PreferenceKeys.includeSupport, false));
      setIncludeCodeOfConductState(await PreferencesService.getBool(PreferenceKeys.includeCodeOfConduct, false));
      setIncludeIssueTemplatesState(await PreferencesService.getBool(PreferenceKeys.includeIssueTemplates, false));

      const pColor = await PreferencesService.getString(PreferenceKeys.primaryColor, DEFAULT_COLORS.primary);
      const sColor = await PreferencesService.getString(PreferenceKeys.secondaryColor, DEFAULT_COLORS.secondary);
      if (pColor) setPrimaryColorState(pColor);
      if (sColor) setSecondaryColorState(sColor);

      setShowGridState(await PreferencesService.getBool(PreferenceKeys.showGrid, true));
      setSnapshotsState(await PreferencesService.getStringList(PreferenceKeys.snapshots, []) || []);
      setListBulletState(await PreferencesService.getString(PreferenceKeys.listBullet, '*'));
      setSectionSpacingState(await PreferencesService.getInt(PreferenceKeys.sectionSpacing, 1));
      setDeviceModeState(await PreferencesService.getString(PreferenceKeys.deviceMode, 'desktop'));
      setExportHtmlState(await PreferencesService.getBool(PreferenceKeys.exportHtml, false));

      setGeminiApiKeyState(await PreferencesService.getString(PreferenceKeys.geminiApiKey, '') || '');
      setGithubTokenState(await PreferencesService.getString(PreferenceKeys.githubToken, '') || '');

      setLocaleState(await PreferencesService.getString(PreferenceKeys.locale, 'en'));
      setTargetLanguageState(await PreferencesService.getString(PreferenceKeys.targetLanguage, 'en'));
    } catch (e) {
      console.error('Failed to load preferences', e);
    }
  };

  const saveState = async (next = {}) => {
    setIsSaving(true);
    try {
      const nextElements = next.elements ?? elements;
      const nextVariables = next.variables ?? variables;
      const nextTheme = next.themeMode ?? themeMode;
      const nextLicenseType = next.licenseType ?? licenseType;
      const nextIncludeContributing = next.includeContributing ?? includeContributing;
      const nextIncludeSecurity = next.includeSecurity ?? includeSecurity;
      const nextIncludeSupport = next.includeSupport ?? includeSupport;
      const nextIncludeCodeOfConduct = next.includeCodeOfConduct ?? includeCodeOfConduct;
      const nextIncludeIssueTemplates = next.includeIssueTemplates ?? includeIssueTemplates;
      const nextPrimaryColor = next.primaryColor ?? primaryColor;
      const nextSecondaryColor = next.secondaryColor ?? secondaryColor;
      const nextShowGrid = next.showGrid ?? showGrid;
      const nextSnapshots = next.snapshots ?? snapshots;
      const nextListBullet = next.listBullet ?? listBullet;
      const nextSectionSpacing = next.sectionSpacing ?? sectionSpacing;
      const nextDeviceMode = next.deviceMode ?? deviceMode;
      const nextExportHtml = next.exportHtml ?? exportHtml;
      const nextGeminiApiKey = next.geminiApiKey ?? geminiApiKey;
      const nextGithubToken = next.githubToken ?? githubToken;
      const nextLocale = next.locale ?? locale;
      const nextTargetLanguage = next.targetLanguage ?? targetLanguage;

      await PreferencesService.setJson(PreferenceKeys.elements, nextElements.map((el) => elementToJson(el)));
      await PreferencesService.setJson(PreferenceKeys.variables, nextVariables);
      await PreferencesService.setString(PreferenceKeys.themeMode, nextTheme);
      await PreferencesService.setString(PreferenceKeys.licenseType, nextLicenseType);
      await PreferencesService.setBool(PreferenceKeys.includeContributing, nextIncludeContributing);
      await PreferencesService.setBool(PreferenceKeys.includeSecurity, nextIncludeSecurity);
      await PreferencesService.setBool(PreferenceKeys.includeSupport, nextIncludeSupport);
      await PreferencesService.setBool(PreferenceKeys.includeCodeOfConduct, nextIncludeCodeOfConduct);
      await PreferencesService.setBool(PreferenceKeys.includeIssueTemplates, nextIncludeIssueTemplates);
      await PreferencesService.setString(PreferenceKeys.primaryColor, nextPrimaryColor);
      await PreferencesService.setString(PreferenceKeys.secondaryColor, nextSecondaryColor);
      await PreferencesService.setBool(PreferenceKeys.showGrid, nextShowGrid);
      await PreferencesService.setStringList(PreferenceKeys.snapshots, nextSnapshots);
      await PreferencesService.setString(PreferenceKeys.listBullet, nextListBullet);
      await PreferencesService.setInt(PreferenceKeys.sectionSpacing, nextSectionSpacing);
      await PreferencesService.setString(PreferenceKeys.deviceMode, nextDeviceMode);
      await PreferencesService.setBool(PreferenceKeys.exportHtml, nextExportHtml);
      await PreferencesService.setString(PreferenceKeys.geminiApiKey, nextGeminiApiKey);
      await PreferencesService.setString(PreferenceKeys.githubToken, nextGithubToken);
      await PreferencesService.setString(PreferenceKeys.locale, nextLocale);
      await PreferencesService.setString(PreferenceKeys.targetLanguage, nextTargetLanguage);

      setTimeout(() => setIsSaving(false), 800);
    } catch (e) {
      console.error('Failed to save state', e);
      setIsSaving(false);
    }
  };

  const exportToJson = () =>
    JSON.stringify({
      elements: elements.map((el) => elementToJson(el)),
      variables,
    });

  const importFromJson = (jsonContent, { resetHistory = true } = {}) => {
    try {
      const data = JSON.parse(jsonContent);
      const nextElements = (data.elements || []).map((el) => elementFromJson(el));
      const nextVariables = data.variables || DEFAULT_VARIABLES;
      setElementsState(nextElements);
      setVariablesState({ ...DEFAULT_VARIABLES, ...nextVariables });
      setSelectedElementId(null);
      if (resetHistory) {
        setHistory([]);
        setRedoHistory([]);
      }
      saveState({ elements: nextElements, variables: nextVariables });
    } catch (error) {
      console.error('Import JSON failed', error);
    }
  };

  const recordHistory = () => {
    setHistory((prev) => [...prev, exportToJson()]);
    setRedoHistory([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoHistory((prev) => [...prev, exportToJson()]);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    importFromJson(previous, { resetHistory: false });
  };

  const redo = () => {
    if (redoHistory.length === 0) return;
    const next = redoHistory[redoHistory.length - 1];
    setRedoHistory((prev) => prev.slice(0, prev.length - 1));
    setHistory((prev) => [...prev, exportToJson()]);
    importFromJson(next, { resetHistory: false });
  };

  const setElements = (nextElements, { resetHistory = true } = {}) => {
    setElementsState(nextElements);
    if (resetHistory) {
      setHistory([]);
      setRedoHistory([]);
    }
    setSelectedElementId(null);
    saveState({ elements: nextElements });
  };

  const setVariables = (nextVariables) => {
    setVariablesState(nextVariables);
    saveState({ variables: nextVariables });
  };

  const setThemeMode = (mode) => {
    setThemeModeState(mode);
    saveState({ themeMode: mode });
  };

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
  };

  const createElement = (type, data = {}) => {
    const base = { id: generateId(), type };
    switch (type) {
      case 'heading':
        return { ...base, text: 'New Heading', level: 1, ...data };
      case 'paragraph':
        return { ...base, text: 'Enter text here...', ...data };
      case 'code':
      case 'codeBlock':
        return { ...base, code: '// Your code here', language: 'javascript', ...data };
      case 'blockquote':
        return { ...base, text: 'Quote something memorable.', ...data };
      case 'list':
        return { ...base, items: ['First item', 'Second item'], isOrdered: false, ...data };
      case 'taskList':
        return {
          ...base,
          items: [
            { text: 'Set up the project', checked: true },
            { text: 'Add documentation', checked: false },
          ],
          ...data,
        };
      case 'table':
        return {
          ...base,
          headers: ['Column 1', 'Column 2'],
          rows: [['Value 1', 'Value 2']],
          alignments: ['left', 'left'],
          ...data,
        };
      case 'badge':
        return {
          ...base,
          imageUrl: 'https://img.shields.io/badge/label-message-blue',
          label: 'Badge',
          targetUrl: '',
          badgeLabel: '',
          badgeMessage: '',
          badgeColor: '',
          badgeStyle: 'flat',
          badgeLogo: '',
          badgeLogoColor: '',
          badgeLabelColor: '',
          ...data,
        };
      case 'image':
        return { ...base, url: 'https://via.placeholder.com/600x300', altText: 'Image', width: null, ...data };
      case 'icon':
        return { ...base, name: 'React', url: '', size: 40, ...data };
      case 'linkButton':
      case 'button':
        return { ...base, text: 'Visit Link', url: 'https://example.com', ...data };
      case 'embed':
      case 'youtube':
      case 'codepen':
      case 'gist':
        return { ...base, url: '', provider: type, typeName: type, ...data };
      case 'githubStats':
        return { ...base, repoName: '', showStars: true, showForks: true, showIssues: false, showLicense: false, ...data };
      case 'contributors':
        return { ...base, repoName: '', style: 'avatar', ...data };
      case 'mermaid':
        return { ...base, code: 'graph TD;\n  A-->B;', ...data };
      case 'toc':
        return { ...base, title: 'Table of Contents', ...data };
      case 'socials':
        return { ...base, profiles: [{ platform: 'GitHub', username: '' }], style: 'for-the-badge', ...data };
      case 'collapsible':
        return { ...base, summary: 'Click to expand', content: 'Hidden content', ...data };
      case 'dynamicWidget':
        return { ...base, widgetType: 'spotify', identifier: '', theme: 'default', ...data };
      case 'raw':
        return { ...base, content: '', css: '', ...data };
      case 'divider':
        return { ...base };
      default:
        return { ...base, ...data };
    }
  };

  const addElement = (type, data = {}) => {
    recordHistory();
    const newElement = createElement(type, data);
    const nextElements = [...elements, newElement];
    setElementsState(nextElements);
    setSelectedElementId(newElement.id);
    saveState({ elements: nextElements });
  };

  const insertElement = (index, type, data = {}) => {
    recordHistory();
    const newElement = createElement(type, data);
    const nextElements = [...elements];
    nextElements.splice(Math.max(0, Math.min(index, nextElements.length)), 0, newElement);
    setElementsState(nextElements);
    setSelectedElementId(newElement.id);
    saveState({ elements: nextElements });
  };

  const addSnippet = (snippet) => {
    if (!snippet?.elementJson) return;
    recordHistory();
    const parsed = JSON.parse(snippet.elementJson);
    const newElement = elementFromJson(parsed);
    const nextElements = [...elements, newElement];
    setElementsState(nextElements);
    setSelectedElementId(newElement.id);
    saveState({ elements: nextElements });
  };

  const insertSnippet = (index, snippet) => {
    if (!snippet?.elementJson) return;
    recordHistory();
    const parsed = JSON.parse(snippet.elementJson);
    const newElement = elementFromJson(parsed);
    const nextElements = [...elements];
    nextElements.splice(Math.max(0, Math.min(index, nextElements.length)), 0, newElement);
    setElementsState(nextElements);
    setSelectedElementId(newElement.id);
    saveState({ elements: nextElements });
  };

  const removeElement = (id) => {
    recordHistory();
    const nextElements = elements.filter((element) => element.id !== id);
    setElementsState(nextElements);
    if (selectedElementId === id) setSelectedElementId(null);
    saveState({ elements: nextElements });
  };

  const clearElements = () => {
    recordHistory();
    setElementsState([]);
    setSelectedElementId(null);
    saveState({ elements: [] });
  };

  const moveElementUp = (id) => {
    const index = elements.findIndex((e) => e.id === id);
    if (index <= 0) return;
    recordHistory();
    const next = [...elements];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setElementsState(next);
    setSelectedElementId(id);
    saveState({ elements: next });
  };

  const moveElementDown = (id) => {
    const index = elements.findIndex((e) => e.id === id);
    if (index < 0 || index >= elements.length - 1) return;
    recordHistory();
    const next = [...elements];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setElementsState(next);
    setSelectedElementId(id);
    saveState({ elements: next });
  };

  const duplicateElement = (id) => {
    const index = elements.findIndex((e) => e.id === id);
    if (index < 0) return;
    recordHistory();
    const cloned = JSON.parse(JSON.stringify(elementToJson(elements[index])));
    cloned.id = generateId();
    const next = [...elements];
    next.splice(index + 1, 0, cloned);
    setElementsState(next);
    setSelectedElementId(cloned.id);
    saveState({ elements: next });
  };

  const reorderElements = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    recordHistory();
    const next = [...elements];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setElementsState(next);
    saveState({ elements: next });
  };

  const updateElementById = (id, patch) => {
    const next = elements.map((el) => (el.id === id ? { ...el, ...patch } : el));
    setElementsState(next);
    saveState({ elements: next });
  };

  const updateElement = () => {
    setElementsState([...elements]);
    saveState({ elements });
  };

  const toggleGrid = () => {
    const next = !showGrid;
    setShowGridState(next);
    saveState({ showGrid: next });
  };

  const setDeviceMode = (mode) => {
    setDeviceModeState(mode);
    saveState({ deviceMode: mode });
  };
  const setLocale = (value) => {
    setLocaleState(value);
    saveState({ locale: value });
  };
  const setTargetLanguage = (value) => {
    setTargetLanguageState(value);
    saveState({ targetLanguage: value });
  };

  const setLicenseType = (value) => {
    setLicenseTypeState(value);
    saveState({ licenseType: value });
  };

  const setIncludeContributing = (value) => {
    setIncludeContributingState(value);
    saveState({ includeContributing: value });
  };

  const setIncludeSecurity = (value) => {
    setIncludeSecurityState(value);
    saveState({ includeSecurity: value });
  };

  const setIncludeSupport = (value) => {
    setIncludeSupportState(value);
    saveState({ includeSupport: value });
  };

  const setIncludeCodeOfConduct = (value) => {
    setIncludeCodeOfConductState(value);
    saveState({ includeCodeOfConduct: value });
  };

  const setIncludeIssueTemplates = (value) => {
    setIncludeIssueTemplatesState(value);
    saveState({ includeIssueTemplates: value });
  };

  const setPrimaryColor = (value) => {
    setPrimaryColorState(value);
    saveState({ primaryColor: value });
  };

  const setSecondaryColor = (value) => {
    setSecondaryColorState(value);
    saveState({ secondaryColor: value });
  };

  const setExportHtml = (value) => {
    setExportHtmlState(value);
    saveState({ exportHtml: value });
  };

  const setListBullet = (value) => {
    setListBulletState(value);
    saveState({ listBullet: value });
  };

  const setSectionSpacing = (value) => {
    setSectionSpacingState(value);
    saveState({ sectionSpacing: value });
  };

  const setGeminiApiKey = (value) => {
    setGeminiApiKeyState(value);
    saveState({ geminiApiKey: value });
  };

  const setGithubToken = (value) => {
    setGithubTokenState(value);
    saveState({ githubToken: value });
  };

  const saveSnapshot = () => {
    const snapshot = exportToJson();
    const next = [snapshot, ...snapshots].slice(0, 20);
    setSnapshotsState(next);
    saveState({ snapshots: next });
  };

  const restoreSnapshot = (index) => {
    if (index < 0 || index >= snapshots.length) return;
    importFromJson(snapshots[index], { resetHistory: true });
  };

  const deleteSnapshot = (index) => {
    if (index < 0 || index >= snapshots.length) return;
    const next = snapshots.filter((_, i) => i !== index);
    setSnapshotsState(next);
    saveState({ snapshots: next });
  };

  const loadTemplate = (template) => {
    if (!template?.elements) return;
    recordHistory();
    const normalized = template.elements.map((element) => elementFromJson(elementToJson(element)));
    setElementsState(normalized);
    setSelectedElementId(null);
    saveState({ elements: normalized });
  };

  const importMarkdown = async (markdown) => {
    recordHistory();
    const imported = MarkdownImporter.parse(markdown);
    const normalized = (imported || []).map((el) => elementFromJson(el));
    setElementsState(normalized);
    setSelectedElementId(null);
    saveState({ elements: normalized });
  };

  const applyElements = (incoming, mode = 'append') => {
    const raw = Array.isArray(incoming) ? incoming : [];
    const normalized = raw.map((el) => elementFromJson(el)).filter((el) => el && el.type);
    if (!normalized.length) return;

    recordHistory();

    let next = elements;
    if (mode === 'replace') {
      next = normalized;
    } else if (mode === 'prepend') {
      next = [...normalized, ...elements];
    } else {
      next = [...elements, ...normalized];
    }

    setElementsState(next);
    setSelectedElementId(normalized[0]?.id || null);
    saveState({ elements: next });
  };

  return (
    <ProjectContext.Provider
      value={{
        elements,
        variables,
        themeMode,
        isSaving,
        selectedElementId,
        dragPayload,
        selectedElement,
        licenseType,
        includeContributing,
        includeSecurity,
        includeSupport,
        includeCodeOfConduct,
        includeIssueTemplates,
        primaryColor,
        secondaryColor,
        showGrid,
        snapshots,
        listBullet,
        sectionSpacing,
        deviceMode,
        exportHtml,
        geminiApiKey,
        githubToken,
        locale,
        targetLanguage,
        allTemplates,
        addElement,
        insertElement,
        addSnippet,
        insertSnippet,
        removeElement,
        clearElements,
        moveElementUp,
        moveElementDown,
        duplicateElement,
        reorderElements,
        updateElementById,
        updateElement,
        startDrag,
        endDrag,
        setSelectedElementId,
        setElements,
        setVariables,
        setThemeMode,
        toggleTheme,
        toggleGrid,
        setDeviceMode,
        setLocale,
        setTargetLanguage,
        setLicenseType,
        setIncludeContributing,
        setIncludeSecurity,
        setIncludeSupport,
        setIncludeCodeOfConduct,
        setIncludeIssueTemplates,
        setPrimaryColor,
        setSecondaryColor,
        setExportHtml,
        setListBullet,
        setSectionSpacing,
        setGeminiApiKey,
        setGithubToken,
        saveSnapshot,
        restoreSnapshot,
        deleteSnapshot,
        loadTemplate,
        importMarkdown,
        applyElements,
        exportToJson,
        importFromJson,
        undo,
        redo,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
