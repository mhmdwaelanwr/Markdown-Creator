// Downloader utility for React Native (web/mobile)
import { Platform, Share } from 'react-native';

export async function downloadReadme(content) {
  // On mobile, use Share API; on web, trigger download
  if (Platform.OS === 'web') {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    await Share.share({ message: content, title: 'README.md' });
  }
}

export async function downloadZipFile(bytes, filename) {
  if (Platform.OS === 'web') {
    const blob = new Blob([bytes], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    await Share.share({ message: 'ZIP file export is not available on mobile yet.' });
  }
}

export async function downloadImageFile(bytes, filename) {
  if (Platform.OS === 'web') {
    const blob = new Blob([bytes], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  if (typeof bytes === 'string') {
    const url = bytes.startsWith('data:') ? bytes : `data:image/png;base64,${bytes}`;
    await Share.share({ url, title: filename || 'image.png' });
    return;
  }

  await Share.share({ message: 'Image export is not available on this platform yet.' });
}

export async function downloadJsonFile(content, filename) {
  const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  if (Platform.OS === 'web') {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    await Share.share({ message: text, title: filename || 'export.json' });
  }
}

export async function downloadTextFile(content, filename) {
  const text = typeof content === 'string' ? content : String(content || '');
  if (Platform.OS === 'web') {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    await Share.share({ message: text, title: filename || 'export.txt' });
  }
}
