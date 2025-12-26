# Complete Language Implementation Guide

## Overview

This guide ensures that language switching works **throughout the entire application** - on every page, in every component, with all content properly translated.

## ✅ Current Setup

The application now uses **react-i18next** which automatically:
- ✅ Detects language from localStorage
- ✅ Persists language preference across page refreshes
- ✅ Triggers re-renders when language changes
- ✅ Works across all pages and components

## How Language Changes Propagate

### 1. Language Context Provider

The `LanguageProvider` wraps the entire app in `App.tsx`:

```typescript
<LanguageProvider>
  <App />
</LanguageProvider>
```

This ensures **all components** have access to translations.

### 2. Automatic Re-rendering

When language changes:
1. `i18n.changeLanguage()` is called
2. `languageChanged` event is emitted
3. All components using `useLanguage()` or `useTranslation()` automatically re-render
4. All `t()` calls return new translations

### 3. Language Persistence

- Language is saved to `localStorage` (key: `preferredLanguage`)
- Persists across page refreshes
- Detected on app startup

## Implementation Checklist

### ✅ Step 1: Use Translation Hook in Every Component

**Every page and component should use:**

```typescript
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
    </div>
  );
}
```

### ✅ Step 2: Replace All Hardcoded Text

**Before:**
```typescript
<h1>Welcome Back</h1>
<button>Sign In</button>
```

**After:**
```typescript
<h1>{t('auth.welcomeBack')}</h1>
<button>{t('auth.loginButton')}</button>
```

### ✅ Step 3: Add Missing Translation Keys

If a translation key doesn't exist, add it to `src/translations/index.ts`:

```typescript
export const translations = {
  en: {
    auth: {
      welcomeBack: 'Welcome Back',
      // ... other keys
    },
  },
  sw: {
    auth: {
      welcomeBack: 'Karibu Tena',
      // ... other keys
    },
  },
};
```

## Pages That Need Translation Updates

### High Priority (User-Facing)

1. **Login Page** (`src/pages/Login.tsx`) - ✅ Updated
   - Welcome message
   - Form labels
   - Buttons
   - Error messages

2. **Signup Page** (`src/pages/Signup.tsx`)
   - Form labels
   - Validation messages
   - Success messages

3. **Dashboard Pages**
   - `src/pages/farmer/FarmerDashboard.tsx`
   - `src/pages/admin/AdminDashboard.tsx`
   - Statistics labels
   - Section titles

4. **Management Pages**
   - Farms, Batches, Devices, etc.
   - Table headers
   - Action buttons
   - Empty states

### Medium Priority

5. **Forms and Modals**
   - All form labels
   - Placeholder text
   - Validation messages
   - Button labels

6. **Alerts and Notifications**
   - Alert messages
   - Toast notifications
   - Success/error messages

## Quick Reference: Translation Keys

### Common Keys (Available Everywhere)

```typescript
t('common.save')           // "Save" / "Hifadhi"
t('common.cancel')         // "Cancel" / "Ghairi"
t('common.delete')         // "Delete" / "Futa"
t('common.edit')           // "Edit" / "Hariri"
t('common.add')            // "Add" / "Ongeza"
t('common.search')        // "Search" / "Tafuta"
t('common.loading')       // "Loading..." / "Inapakia..."
t('common.error')         // "Error" / "Kosa"
t('common.success')       // "Success" / "Imefaulu"
```

### Auth Keys

```typescript
t('auth.login')           // "Login" / "Ingia"
t('auth.email')           // "Email Address" / "Barua Pepe"
t('auth.password')        // "Password" / "Nywila"
t('auth.loginButton')     // "Login" / "Ingia"
t('auth.welcomeBack')     // "Welcome Back" / "Karibu Tena"
```

### Dashboard Keys

```typescript
t('dashboard.title')      // "Dashboard" / "Dashibodi"
t('dashboard.welcome')     // "Welcome back" / "Karibu tena"
t('dashboard.totalFarms')  // "Total Farms" / "Mashamba Jumla"
```

## Best Practices

### 1. Always Use Translation Function

**❌ Bad:**
```typescript
<h1>Welcome</h1>
<button>Click Me</button>
```

**✅ Good:**
```typescript
<h1>{t('common.welcome')}</h1>
<button>{t('common.clickMe')}</button>
```

### 2. Use Fallback Values

```typescript
// If translation key doesn't exist, fallback is shown
t('new.key', 'Fallback Text')
```

### 3. Organize Translation Keys

Use namespaces for organization:
- `common.*` - Common UI elements
- `auth.*` - Authentication
- `dashboard.*` - Dashboard
- `farms.*` - Farm management
- `batches.*` - Batch management

### 4. Keep Keys Consistent

```typescript
// ✅ Consistent naming
t('farms.addFarm')
t('farms.editFarm')
t('farms.deleteFarm')

// ❌ Inconsistent
t('farms.add')
t('editFarm')
t('delete_farm')
```

## Testing Language Switching

### Manual Test

1. Start the application
2. Navigate to any page
3. Click language switcher in header
4. Verify:
   - ✅ Text changes immediately
   - ✅ All text on page changes
   - ✅ Navigation persists
   - ✅ Language persists after refresh

### Automated Test (Future)

```typescript
// Example test
it('should change language and update all text', () => {
  const { getByText } = render(<MyComponent />);
  expect(getByText('Welcome')).toBeInTheDocument();
  
  fireEvent.click(getByText('SW'));
  expect(getByText('Karibu')).toBeInTheDocument();
});
```

## Common Issues & Solutions

### Issue 1: Text Doesn't Change

**Problem:** Language changes but text stays the same

**Solution:**
1. Ensure component uses `useLanguage()` or `useTranslation()`
2. Check that translation key exists in both languages
3. Verify `LanguageProvider` wraps the component

### Issue 2: Translation Key Not Found

**Problem:** See the key instead of translation (e.g., "auth.login")

**Solution:**
1. Add the key to `src/translations/index.ts`
2. Add it to both `en` and `sw` objects
3. Use dot notation: `t('auth.login')` not `t('auth/login')`

### Issue 3: Language Doesn't Persist

**Problem:** Language resets on page refresh

**Solution:**
1. Check `localStorage.getItem('preferredLanguage')`
2. Verify i18next detection is configured
3. Check browser console for errors

## Migration Strategy

### Phase 1: Core Pages (Done)
- ✅ Login page
- ✅ Language context setup

### Phase 2: High-Traffic Pages
- [ ] Dashboard pages
- [ ] Farm management
- [ ] Batch management

### Phase 3: All Pages
- [ ] Admin pages
- [ ] Settings pages
- [ ] Forms and modals

### Phase 4: Polish
- [ ] Error messages
- [ ] Tooltips
- [ ] Placeholder text

## Adding New Translations

### Step 1: Add to English

```typescript
// src/translations/index.ts
export const translations = {
  en: {
    myNewSection: {
      title: 'My New Title',
      description: 'My description',
    },
  },
  // ...
};
```

### Step 2: Add to Swahili

```typescript
export const translations = {
  // ...
  sw: {
    myNewSection: {
      title: 'Kichwa Kipya',
      description: 'Maelezo yangu',
    },
  },
};
```

### Step 3: Use in Component

```typescript
const { t } = useLanguage();
<h1>{t('myNewSection.title')}</h1>
<p>{t('myNewSection.description')}</p>
```

## Verification Checklist

For each page, verify:

- [ ] All headings use `t()`
- [ ] All buttons use `t()`
- [ ] All labels use `t()`
- [ ] All messages use `t()`
- [ ] Language switcher works
- [ ] Text changes on language switch
- [ ] Language persists after refresh
- [ ] No hardcoded English/Swahili text

## Example: Complete Page Translation

### Before (Hardcoded)

```typescript
export function MyPage() {
  return (
    <div>
      <h1>My Page Title</h1>
      <p>Welcome to my page</p>
      <button>Click Me</button>
    </div>
  );
}
```

### After (Translated)

```typescript
import { useLanguage } from '../contexts/LanguageContext';

export function MyPage() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('myPage.title')}</h1>
      <p>{t('myPage.welcome')}</p>
      <button>{t('myPage.clickMe')}</button>
    </div>
  );
}
```

### Translation File

```typescript
// src/translations/index.ts
export const translations = {
  en: {
    myPage: {
      title: 'My Page Title',
      welcome: 'Welcome to my page',
      clickMe: 'Click Me',
    },
  },
  sw: {
    myPage: {
      title: 'Kichwa cha Ukurasa Wangu',
      welcome: 'Karibu kwenye ukurasa wangu',
      clickMe: 'Bofya Hapa',
    },
  },
};
```

## Tools & Utilities

### Find Untranslated Text

```bash
# Search for hardcoded English text
grep -r "Welcome\|Sign in\|Add\|Delete" src/pages --include="*.tsx"
```

### Check Translation Coverage

```typescript
// Add to a component to see missing keys
const { t, i18n } = useLanguage();
console.log('Current language:', i18n.language);
console.log('Available keys:', Object.keys(i18n.getResourceBundle(i18n.language, 'common')));
```

## Performance Considerations

### Lazy Loading Translations (Future)

For large applications, you can lazy load translations:

```typescript
// i18n/config.ts
import enCommon from './locales/en/common.json';
import swCommon from './locales/sw/common.json';

// Load on demand
i18n.addResourceBundle('en', 'common', enCommon);
i18n.addResourceBundle('sw', 'common', swCommon);
```

## Next Steps

1. **Review all pages** - Identify hardcoded text
2. **Add translation keys** - For missing translations
3. **Update components** - Replace hardcoded text with `t()`
4. **Test thoroughly** - Verify language switching works everywhere
5. **Add more languages** - Easy to extend in the future

---

## Quick Start: Translating a New Page

1. **Import the hook:**
   ```typescript
   import { useLanguage } from '../contexts/LanguageContext';
   ```

2. **Use in component:**
   ```typescript
   const { t } = useLanguage();
   ```

3. **Replace text:**
   ```typescript
   <h1>{t('page.title')}</h1>
   ```

4. **Add translations:**
   ```typescript
   // In src/translations/index.ts
   en: { page: { title: 'Title' } },
   sw: { page: { title: 'Kichwa' } },
   ```

5. **Test:**
   - Switch language
   - Verify text changes
   - Check both languages work

---

**Status**: ✅ Language system is ready - Now migrate pages to use translations!


