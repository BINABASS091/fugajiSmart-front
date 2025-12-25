# 🏗️ Bilingual Language System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                         │
│  (src/App.tsx)                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LanguageProvider                              │
│  (src/contexts/LanguageContext.tsx)                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ State:                                                  │   │
│  │ • language: 'en' | 'sw'                               │   │
│  │ • localStorage: 'preferredLanguage'                   │   │
│  │ • Function: t(key: string) → string                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │                    │                      │
          ▼                    ▼                      ▼
    ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
    │  Welcome.tsx │    │  Header.tsx  │    │  Other Pages     │
    │ (100% trans) │    │ (Dashboard)  │    │ (Partial trans)  │
    │              │    │              │    │                  │
    │ Uses:        │    │ Uses:        │    │ Status:          │
    │ • t() calls  │    │ • Language   │    │ • Some imported  │
    │ • Language   │    │   dropdown   │    │ • Mostly hard-   │
    │   Switcher   │    │ • Header     │    │   coded text     │
    │              │    │   menu       │    │                  │
    └──────────────┘    └──────────────┘    └──────────────────┘
```

## Data Flow

```
User Selects Language (EN/SW)
            │
            ▼
┌───────────────────────────┐
│  Language Switcher        │
│  • Welcome navbar         │
│  • Header dropdown        │
└───────────────┬───────────┘
                │
                ▼
┌───────────────────────────┐
│  setLanguage('sw')        │
│  LanguageContext.tsx      │
└───────────────┬───────────┘
                │
                ├─→ Update state: language = 'sw'
                ├─→ Save to localStorage
                └─→ Trigger re-render
                    │
                    ▼
┌───────────────────────────────────┐
│  All Components Re-render          │
│  useLanguage hook triggered        │
└───────────────┬───────────────────┘
                │
                ▼
┌───────────────────────────────────┐
│  t() Function Resolves Keys        │
│  translations[language][section]   │
│  [subsection][key]                │
└───────────────┬───────────────────┘
                │
                ▼
┌───────────────────────────────────┐
│  UI Text Updates in Real-time       │
│  All language-aware components     │
│  display new text                  │
└───────────────────────────────────┘
```

## Translation Key Resolution

```
t('welcome.features.ai.title')
         │
         ▼
Split by '.' → ['welcome', 'features', 'ai', 'title']
         │
         ▼
Start with: translations['sw'] (or 'en')
         │
         ├─→ translations['sw']['welcome']
         │   │
         │   ├─→ translations['sw']['welcome']['features']
         │   │   │
         │   │   ├─→ translations['sw']['welcome']['features']['ai']
         │   │   │   │
         │   │   │   └─→ translations['sw']['welcome']['features']['ai']['title']
         │   │   │       │
         │   │   │       ▼
         │   │   │   Return: "Utambuzi wa mapema wa magonjwa"
         │   │   │
         │   │   └─→ OR if missing, fallback to 'en'
         │   │
         │   └─→ OR if section missing, log warning & return key
         │
         └─→ OR on error, return key as-is
```

## Component Hierarchy

```
main.tsx
  │
  └─ <LanguageProvider>
      │
      └─ <App />
          │
          ├─ <Welcome />
          │  ├─ <LanguageSwitcher />  ← Language selector
          │  ├─ <AnimatedChickenOverlay />
          │  └─ All content uses t()
          │
          ├─ <Login />
          │  ├─ Import useLanguage
          │  ├─ Some t() calls
          │  └─ Mostly hardcoded
          │
          ├─ <Signup />
          │  ├─ Import useLanguage
          │  ├─ Some t() calls
          │  └─ Mostly hardcoded
          │
          └─ <DashboardLayout>
              │
              ├─ <Header />
              │  └─ Language dropdown menu  ← Language selector
              │
              ├─ <Sidebar />
              │
              └─ Page Content
                 ├─ <FarmerDashboard />  (25% translated)
                 ├─ <FarmsManagement />  (20% translated)
                 ├─ <BatchesManagement /> (20% translated)
                 └─ Other pages...
```

## Translation Dictionary Structure

```
src/translations/index.ts
│
├─ export const translations = {
│   │
│   ├─ en: {                          ← English translations
│   │   ├─ common: {...}              ← Save, Cancel, Next, etc.
│   │   ├─ auth: {...}                ← Login, Signup
│   │   ├─ sidebar: {...}             ← Navigation menu
│   │   ├─ dashboard: {...}           ← Dashboard UI
│   │   ├─ farmers: {...}             ← Farmer management
│   │   ├─ farms: {...}               ← Farm management
│   │   ├─ batches: {...}             ← Batch management
│   │   ├─ breeds: {...}              ← Breed configuration
│   │   ├─ knowledge: {...}           ← Knowledge base
│   │   ├─ activities: {...}          ← Activity tracking
│   │   ├─ alerts: {...}              ← Alert system
│   │   ├─ profile: {...}             ← User profile
│   │   ├─ devices: {...}             ← IoT devices
│   │   ├─ settings: {...}            ← System settings
│   │   └─ welcome: {                 ← Welcome page (100% used)
│   │       ├─ title
│   │       ├─ subtitle
│   │       ├─ features: {
│   │       │   ├─ ai: {title, description}
│   │       │   ├─ iot: {title, description}
│   │       │   └─ ops: {title, description}
│   │       ├─ steps: {
│   │       │   ├─ step1: {title, description}
│   │       │   ├─ step2: {title, description}
│   │       │   ├─ step3: {title, description}
│   │       │   └─ step4: {title, description}
│   │       ├─ benefits: {...}
│   │       ├─ testimonial: {...}
│   │       ├─ cta: {...}
│   │       ├─ tools: {...}
│   │       └─ footer: {...}
│   │
│   └─ sw: {                          ← Swahili translations
│       ├─ common: {...}              ← Same structure as 'en'
│       ├─ auth: {...}
│       ├─ sidebar: {...}
│       ├─ ... (all sections)
│       └─ welcome: {...}             ← Swahili versions
│
└─ }
```

## State Management Flow

```
User Action: Click "EN" button
    │
    ▼
LanguageSwitcher.tsx
    │
    ├─ onClick={() => setLanguage('en')}
    │
    ▼
LanguageContext.tsx - setLanguage()
    │
    ├─ setLanguageState('en')
    ├─ localStorage.setItem('preferredLanguage', 'en')
    ├─ (Optional) API call to save user preference
    │
    ▼
React Re-render
    │
    ├─ Trigger component update
    ├─ useLanguage() returns new context
    │
    ▼
t() Function Called
    │
    ├─ Resolve: translations['en']['section'][key]
    │
    ▼
UI Updates
    │
    └─ New text displays instantly
```

## Feature Support Matrix

```
Feature                    Status         Location
────────────────────────────────────────────────────
Language Context           ✅ Complete    LanguageContext.tsx
Translation Dictionary     ✅ Complete    translations/index.ts
Welcome Page (100%)        ✅ Complete    Welcome.tsx
Language Switcher          ✅ Complete    LanguageSwitcher.tsx
Header Language Menu       ✅ Complete    Header.tsx
localStorage Persistence  ✅ Complete    LanguageContext.tsx
Error Handling             ✅ Complete    LanguageContext.tsx
─────────────────────────────────────────────────────
Login/Signup Translation   ⚠️  Partial    Login.tsx, Signup.tsx
Dashboard Translation      ⚠️  Partial    FarmerDashboard.tsx
Admin Translation          ⚠️  Partial    AdminDashboard.tsx
Other Pages Translation    ⚠️  Minimal    Various
─────────────────────────────────────────────────────
User Profile Language Pref ❌ Pending    Settings (backend)
Language Selection UI      ❌ Pending    ProfilePage.tsx
API Integration           ❌ Pending    Backend integration
```

## File Dependency Map

```
main.tsx
  │
  ├─ imports LanguageProvider
  │   └─ LanguageContext.tsx
  │      ├─ uses translations/index.ts
  │      ├─ uses localStorage API
  │      └─ exports useLanguage hook
  │
  ├─ App.tsx
  │  ├─ Welcome.tsx
  │  │  ├─ imports useLanguage
  │  │  ├─ imports LanguageSwitcher
  │  │  └─ uses all welcome translations
  │  │
  │  ├─ Login.tsx
  │  │  ├─ imports useLanguage
  │  │  └─ uses some auth translations
  │  │
  │  └─ DashboardLayout
  │     ├─ Header.tsx
  │     │  ├─ imports useLanguage
  │     │  ├─ uses language state
  │     │  └─ language dropdown menu
  │     │
  │     └─ Pages
  │        ├─ FarmerDashboard.tsx
  │        ├─ FarmsManagement.tsx
  │        └─ etc.
  │
  └─ /translations/index.ts (referenced by LanguageContext)
```

## Performance Considerations

```
✓ Optimizations Already Implemented:
  • useContext for efficient state updates
  • localStorage caching (no API calls needed)
  • Immediate re-renders on language change
  • No performance impact on page load
  • Translation object flat structure (fast lookup)

⚠️  Future Optimizations:
  • Lazy load translation files (if > 1MB)
  • Code split translations by language
  • Backend caching of user preference
  • Service worker for offline translations
  • Compression for production
```

## Error Handling Strategy

```
Missing Translation Key
    │
    ▼
t() function checks: translations[lang][section]....[key]
    │
    ├─ If found → Return translated text
    │
    └─ If NOT found:
        ├─ Log warning to console
        ├─ Return fallback (the key itself)
        └─ Component renders with fallback

This prevents:
  • App crashes
  • White screens
  • Silent failures
  • Lost translations
```

## Testing Checklist

```
✓ Language Switching
  [ ] EN button works
  [ ] SW button works
  [ ] Text updates instantly
  [ ] Active state displays correctly

✓ Persistence
  [ ] Refresh page → language persists
  [ ] Close/reopen browser → language persists
  [ ] Clear localStorage → defaults to English

✓ Translation Keys
  [ ] No console warnings for used keys
  [ ] All sections display correctly
  [ ] Nested keys resolve properly

✓ UI/UX
  [ ] Language switcher visible
  [ ] Mobile responsive
  [ ] Animations work
  [ ] Performance acceptable
```

---

**Generated:** December 17, 2025  
**Architecture Version:** 1.0  
**Status:** Complete & Documented ✅
