import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import old translations for backward compatibility
import { translations } from '../translations';

// Convert nested translation structure to i18next format
// The old format has: translations.en.common, translations.en.auth, etc.
// We'll flatten them into a single namespace for now, or use dot notation
const flattenTranslations = (obj: any, prefix = ''): any => {
  const result: any = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      // Recursively flatten nested objects
      const flattened = flattenTranslations(obj[key], prefix ? `${prefix}.${key}` : key);
      Object.assign(result, flattened);
    } else {
      // Add the key with the full path
      result[prefix ? `${prefix}.${key}` : key] = obj[key];
    }
  }
  return result;
};

// Prepare resources with all namespaces flattened into 'common'
const resources = {
  en: {
    common: flattenTranslations(translations.en),
  },
  sw: {
    common: flattenTranslations(translations.sw),
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

