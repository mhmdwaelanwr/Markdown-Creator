let lastValue = '';

const canWrite = () =>
  typeof navigator !== 'undefined' &&
  navigator.clipboard &&
  typeof navigator.clipboard.writeText === 'function';

const canRead = () =>
  typeof navigator !== 'undefined' &&
  navigator.clipboard &&
  typeof navigator.clipboard.readText === 'function';

const setString = async (text) => {
  const next = text == null ? '' : String(text);
  lastValue = next;

  if (canWrite()) {
    try {
      await navigator.clipboard.writeText(next);
      return;
    } catch (error) {
      console.warn('Clipboard write failed, falling back:', error?.message || error);
    }
  }

  if (typeof document === 'undefined') return;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = next;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  } catch (error) {
    console.warn('Clipboard fallback failed:', error?.message || error);
  }
};

const getString = async () => {
  if (canRead()) {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.warn('Clipboard read failed, falling back:', error?.message || error);
    }
  }
  return lastValue;
};

const hasString = async () => {
  const value = await getString();
  return Boolean(value);
};

export default {
  setString,
  getString,
  hasString,
};
