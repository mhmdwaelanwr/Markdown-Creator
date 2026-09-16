// PreferencesService (React Native)
// Uses AsyncStorage for persistent storage
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PreferenceKeys = {
  themeMode: 'themeMode',
  elements: 'elements',
  variables: 'variables',
  licenseType: 'licenseType',
  includeContributing: 'includeContributing',
  includeSecurity: 'includeSecurity',
  includeSupport: 'includeSupport',
  includeCodeOfConduct: 'includeCodeOfConduct',
  includeIssueTemplates: 'includeIssueTemplates',
  primaryColor: 'primaryColor',
  secondaryColor: 'secondaryColor',
  showGrid: 'showGrid',
  snapshots: 'snapshots',
  listBullet: 'listBullet',
  sectionSpacing: 'sectionSpacing',
  deviceMode: 'deviceMode',
  exportHtml: 'exportHtml',
  geminiApiKey: 'gemini_api_key',
  githubToken: 'github_token',
  locale: 'locale',
  targetLanguage: 'targetLanguage',
  savedProjects: 'saved_projects',
  savedSnippets: 'saved_snippets',
  hasSeenOnboarding: 'hasSeenOnboarding',
  localUser: 'local_user',
};

export class PreferencesService {
  static async setJson(key, value) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  static async getJson(key, defaultValue = null) {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  static async setString(key, value) {
    await AsyncStorage.setItem(key, value);
  }

  static async getString(key, defaultValue = null) {
    const value = await AsyncStorage.getItem(key);
    return value ?? defaultValue;
  }

  static async setBool(key, value) {
    await AsyncStorage.setItem(key, value ? 'true' : 'false');
  }

  static async getBool(key, defaultValue = null) {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return defaultValue;
    return value === 'true';
  }

  static async setInt(key, value) {
    await AsyncStorage.setItem(key, String(value));
  }

  static async getInt(key, defaultValue = null) {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return defaultValue;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }

  static async setStringList(key, value) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  static async getStringList(key, defaultValue = null) {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  static async removeItem(key) {
    await AsyncStorage.removeItem(key);
  }
}
