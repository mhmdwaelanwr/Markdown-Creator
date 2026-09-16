import React, { useEffect } from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProjectProvider } from './src/context/ProjectContext';
import { LibraryProvider } from './src/providers/LibraryProvider';
import { SubscriptionProvider } from './src/providers/SubscriptionProvider';
import { AuthProvider } from './src/providers/AuthProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useProject } from './src/context/ProjectContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import i18n from './src/i18n';
import { I18nextProvider } from 'react-i18next';

const MainApp = () => {
  const { themeMode, locale } = useProject();
  const systemTheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemTheme === 'dark' : themeMode === 'dark';

  useEffect(() => {
    if (locale) i18n.changeLanguage(locale);
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.lang = locale || 'en';
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }
  }, [locale]);

  return (
    <I18nextProvider i18n={i18n}>
      <PaperProvider theme={isDark ? MD3DarkTheme : MD3LightTheme}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <ErrorBoundary>
          <AppNavigator />
        </ErrorBoundary>
      </PaperProvider>
    </I18nextProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ProjectProvider>
        <LibraryProvider>
          <SubscriptionProvider>
            <AuthProvider>
              <MainApp />
            </AuthProvider>
          </SubscriptionProvider>
        </LibraryProvider>
      </ProjectProvider>
    </SafeAreaProvider>
  );
}
