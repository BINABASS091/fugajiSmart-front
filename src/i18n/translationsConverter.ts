/**
 * Converter utility to migrate from old translations format to i18next format
 * This allows gradual migration while maintaining backward compatibility
 */
import { translations } from '../translations';

// Convert the nested TypeScript translations object to i18next format
export function getTranslationsForI18n() {
  return {
    en: {
      common: translations.en,
    },
    sw: {
      common: translations.sw,
    },
  };
}


