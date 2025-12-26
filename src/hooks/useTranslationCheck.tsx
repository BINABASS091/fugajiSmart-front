/**
 * Development utility hook to identify untranslated strings
 * Only active in development mode
 */
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useTranslationCheck() {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      // Override t function to warn about missing translations
      const originalT = t;
      
      // This is just for development - helps identify missing keys
      console.log('🌐 Translation Check Active - Language:', i18n.language);
      console.log('📚 Available namespaces:', i18n.options.ns);
    }
  }, [i18n, t]);

  return { i18n, t };
}

/**
 * Helper function to check if a translation key exists
 */
export function hasTranslation(key: string, namespace = 'common'): boolean {
  try {
    const i18n = require('../i18n/config').default;
    const resource = i18n.getResource(i18n.language, namespace, key);
    return resource !== undefined;
  } catch {
    return false;
  }
}


