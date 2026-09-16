import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import PrimaryButton from './ui/PrimaryButton';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
  stack: string | null;
};

export default class ErrorBoundary extends React.PureComponent<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, stack: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error, stack: error?.stack || null };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  handleReload = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    const { error, stack } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            The app hit an unexpected error. You can reload and continue.
          </Text>

          {__DEV__ ? (
            <ScrollView style={styles.stack} contentContainerStyle={styles.stackContent}>
              <Text style={styles.stackText}>{stack || String(error)}</Text>
            </ScrollView>
          ) : null}

          <View style={styles.actions}>
            <PrimaryButton label="RELOAD" icon="reload" onPress={this.handleReload} />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.editorBackgroundDark,
  },
  card: {
    width: '100%',
    maxWidth: 920,
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimaryDark,
  },
  subtitle: {
    marginTop: 6,
    color: Colors.textSecondaryDark,
    lineHeight: 20,
  },
  stack: {
    marginTop: 12,
    maxHeight: 240,
    borderRadius: 14,
    backgroundColor: 'rgba(2,6,23,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
  },
  stackContent: {
    padding: 12,
  },
  stackText: {
    color: Colors.textPrimaryDark,
    fontFamily: Platform.select({ web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', default: 'monospace' }),
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
