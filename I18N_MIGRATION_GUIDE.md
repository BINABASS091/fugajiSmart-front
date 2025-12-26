# i18next Migration Guide

## Overview

The application has been migrated from a custom language context to **react-i18next**, the industry-standard internationalization library for React applications.

## What Changed

### Before (Custom Implementation)
```typescript
const { t, language, setLanguage } = useLanguage();
const text = t('auth.login'); // Returns translation
```

### After (react-i18next)
```typescript
const { t, i18n } = useTranslation();
const text = t('auth.login'); // Same API, but powered by i18next
```

**Good News:** The API is **backward compatible**! Your existing code using `useLanguage()` will continue to work.

## Installation

The following packages have been installed:
- `i18next` - Core internationalization framework
- `react-i18next` - React bindings for i18next
- `i18next-browser-languagedetector` - Automatic language detection

## Features

### ✅ Automatic Language Detection
- Detects language from `localStorage` (key: `preferredLanguage`)
- Falls back to browser language
- Automatically saves language preference

### ✅ Backward Compatibility
- Existing `useLanguage()` hook still works
- All existing translation keys work the same way
- No breaking changes to your code

### ✅ Enhanced Features
- **Pluralization**: Support for plural forms
- **Interpolation**: Variable substitution in translations
- **Namespaces**: Organize translations by feature
- **Lazy Loading**: Load translations on demand
- **Type Safety**: Full TypeScript support

## Usage Examples

### Basic Usage (Same as Before)

```typescript
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
      <button onClick={() => setLanguage('sw')}>
        Switch to Swahili
      </button>
    </div>
  );
}
```

### Using react-i18next Directly (Advanced)

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  // Change language
  const changeLanguage = (lng: 'en' | 'sw') => {
    i18n.changeLanguage(lng);
  };
  
  // Get current language
  const currentLang = i18n.language;
  
  // Translation with interpolation
  const message = t('welcome.message', { name: 'John' });
  
  // Translation with pluralization
  const items = t('items.count', { count: 5 });
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button onClick={() => changeLanguage('sw')}>
        {t('common.switchLanguage')}
      </button>
    </div>
  );
}
```

### Translation with Variables

```typescript
// In your translation file:
{
  "welcome": "Welcome, {{name}}!",
  "items": "You have {{count}} items"
}

// In your component:
const { t } = useTranslation();
const welcomeMsg = t('welcome', { name: 'John' });
// Result: "Welcome, John!"

const itemCount = t('items', { count: 5 });
// Result: "You have 5 items"
```

### Pluralization

```typescript
// In your translation file:
{
  "items_one": "You have {{count}} item",
  "items_other": "You have {{count}} items"
}

// In your component:
const { t } = useTranslation();
const msg1 = t('items', { count: 1 }); // "You have 1 item"
const msg5 = t('items', { count: 5 }); // "You have 5 items"
```

## Translation Key Structure

Translations are organized by namespace. Currently, all translations are in the `common` namespace:

```
common.auth.login          → "Login" / "Ingia"
common.dashboard.title     → "Dashboard" / "Dashibodi"
common.farms.addFarm       → "Add Farm" / "Ongeza Shamba"
```

### Accessing Nested Keys

```typescript
// Old format (still works):
t('auth.login')           // ✅ Works
t('dashboard.title')      // ✅ Works
t('farms.addFarm')        // ✅ Works

// Dot notation (recommended):
t('auth.login')           // ✅ Recommended
t('dashboard.title')      // ✅ Recommended
```

## Configuration

The i18next configuration is in `src/i18n/config.ts`:

```typescript
{
  fallbackLng: 'en',           // Default language
  supportedLngs: ['en', 'sw'], // Supported languages
  defaultNS: 'common',          // Default namespace
  detection: {
    order: ['localStorage', 'navigator'],
    lookupLocalStorage: 'preferredLanguage',
    caches: ['localStorage'],
  },
}
```

## Language Switching

### Method 1: Using useLanguage Hook (Recommended)
```typescript
const { setLanguage } = useLanguage();
setLanguage('sw'); // Switch to Swahili
setLanguage('en'); // Switch to English
```

### Method 2: Using i18next Directly
```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
i18n.changeLanguage('sw');
```

## Adding New Translations

### Option 1: Add to JSON Files (Recommended for New Translations)

Add to `src/i18n/locales/en.json`:
```json
{
  "common": {
    "newKey": "New Translation"
  }
}
```

Add to `src/i18n/locales/sw.json`:
```json
{
  "common": {
    "newKey": "Tafsiri Mpya"
  }
}
```

### Option 2: Add to TypeScript File (Temporary - for backward compatibility)

Add to `src/translations/index.ts`:
```typescript
export const translations = {
  en: {
    common: {
      newKey: 'New Translation',
      // ... existing translations
    },
  },
  sw: {
    common: {
      newKey: 'Tafsiri Mpya',
      // ... existing translations
    },
  },
};
```

## Migration Checklist

- [x] Install react-i18next packages
- [x] Create i18next configuration
- [x] Update LanguageContext to use i18next
- [x] Initialize i18next in main.tsx
- [x] Maintain backward compatibility
- [ ] Gradually migrate components to use useTranslation directly (optional)
- [ ] Convert all translations to JSON format (optional, for better organization)

## Benefits of react-i18next

1. **Industry Standard**: Most widely used i18n library for React
2. **Rich Features**: Pluralization, interpolation, namespaces, lazy loading
3. **Better Performance**: Optimized for React rendering
4. **Type Safety**: Full TypeScript support
5. **Ecosystem**: Many plugins and tools available
6. **Maintenance**: Actively maintained and well-documented

## Troubleshooting

### Translation Not Found

If you see the translation key instead of the translation:
```typescript
// Check if the key exists in translations
console.log(i18n.getResource('en', 'common', 'your.key'));

// Check current language
console.log(i18n.language);
```

### Language Not Persisting

The language is automatically saved to `localStorage` with key `preferredLanguage`. Check:
```javascript
localStorage.getItem('preferredLanguage'); // Should return 'en' or 'sw'
```

### TypeScript Errors

If you get TypeScript errors, make sure:
1. `@types/i18next` is installed (if needed)
2. Translation keys match the structure

## Next Steps

1. **Test the implementation**: Verify language switching works
2. **Gradual migration**: Optionally migrate components to use `useTranslation` directly
3. **Convert to JSON**: Gradually move translations from TypeScript to JSON files
4. **Add more languages**: Easy to add more languages in the future

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Best Practices](https://www.i18next.com/principles/best-practices)

---

**Status**: ✅ Migration Complete - Backward Compatible


