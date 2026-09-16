import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './l10n/en.json';
import ar from './l10n/ar.json';
import de from './l10n/de.json';
import es from './l10n/es.json';
import fr from './l10n/fr.json';
import hi from './l10n/hi.json';
import ja from './l10n/ja.json';
import pt from './l10n/pt.json';
import ru from './l10n/ru.json';
import zh from './l10n/zh.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  de: { translation: de },
  es: { translation: es },
  fr: { translation: fr },
  hi: { translation: hi },
  ja: { translation: ja },
  pt: { translation: pt },
  ru: { translation: ru },
  zh: { translation: zh },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;

