import 'react-native-gesture-handler';
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import appConfig from './app.json';

if (Platform.OS === 'web') {
  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const renderFatalError = (title, message) => {
    const root = document.getElementById('root');
    if (!root) return;

    const hasLoading = !!root.querySelector?.('.app-loading');
    if (root.firstElementChild && !hasLoading) return;

    root.innerHTML = `
      <div style="padding: 18px; max-width: 980px;">
        <div style="font: 800 16px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
          ${escapeHtml(title)}
        </div>
        <pre style="margin: 12px 0 0; padding: 12px; border-radius: 12px; overflow: auto; background: rgba(0,0,0,0.08); color: inherit; white-space: pre-wrap;">
${escapeHtml(message)}
        </pre>
      </div>
    `;
  };

  window.addEventListener('error', (event) => {
    const message = event?.error?.stack || event?.message || 'Unknown error';
    renderFatalError('App crashed', message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const message = reason?.stack || String(reason || 'Unknown rejection');
    renderFatalError('Unhandled promise rejection', message);
  });

  const materialIconsFont = require('react-native-vector-icons/Fonts/MaterialIcons.ttf');
  const materialCommunityIconsFont = require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf');
  const styleId = 'vector-icon-fonts';

  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.type = 'text/css';
    style.appendChild(
      document.createTextNode(`
@font-face { src: url(${materialIconsFont}); font-family: MaterialIcons; }
@font-face { src: url(${materialCommunityIconsFont}); font-family: MaterialCommunityIcons; }
      `),
    );
    document.head.appendChild(style);
  }
}

const appName = appConfig.name;
AppRegistry.registerComponent(appName, () => App);

const rootTag = document.getElementById('root');
AppRegistry.runApplication(appName, { rootTag });
