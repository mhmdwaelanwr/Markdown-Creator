import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Colors } from './Colors';

export const AppTheme = {
  light: {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: Colors.primary,
      secondary: Colors.secondary,
      error: Colors.error,
      background: Colors.lightBackground,
      surface: Colors.lightBackground,
      onSurface: Colors.textPrimaryLight,
    },
    roundness: 18,
  },
  dark: {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: Colors.primary,
      secondary: Colors.secondary,
      error: Colors.error,
      background: Colors.darkBackground,
      surface: Colors.darkBackground,
      onSurface: Colors.textPrimaryDark,
    },
    roundness: 18,
  },
};
