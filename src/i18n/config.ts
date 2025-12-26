import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import sw from './locales/sw.json';

const resources = {
  en: {
    common: en,
  },
  sw: {
    common: sw,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Fallback language
    fallbackLng: 'en',

    // Supported languages
    supportedLngs: ['en', 'sw'],

    // Default namespace
    defaultNS: 'common',

    // Namespaces
    ns: ['common'],

    // Resources (translations)
    resources,

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Detection options
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],

      // Keys to lookup language from
      lookupLocalStorage: 'preferredLanguage',

      // Cache user language
      caches: ['localStorage'],
    },

    // React i18next options
    react: {
      useSuspense: false, // Disable suspense for better compatibility
    },

    // Debug mode (set to false in production)
    debug: import.meta.env.DEV,

    // Ensure language changes trigger re-renders
    keySeparator: '.', // Use dot notation for nested keys
    nsSeparator: ':', // Namespace separator (not used since we have one namespace)
  });

export default i18n;

