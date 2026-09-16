import { useColorScheme } from 'react-native';
import { useProject } from '../context/ProjectContext';

export default function useIsDark(explicit?: boolean) {
  const systemTheme = useColorScheme();
  const { themeMode } = useProject();

  if (typeof explicit === 'boolean') return explicit;

  if (themeMode === 'dark') return true;
  if (themeMode === 'light') return false;
  return systemTheme === 'dark';
}

