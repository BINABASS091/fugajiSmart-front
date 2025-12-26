import { ReactNode, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

type Language = 'en' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
  i18n: any;
}

// Create a wrapper context for backward compatibility
import { createContext, useContext } from 'react';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n, t, ready } = useTranslation();
  const { user } = useAuth();
  
  // State to force re-render when language changes
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    (i18n.language || 'en') as Language
  );

  // Listen for language changes to trigger re-renders
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng as Language);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    // Set initial language
    const savedLang = localStorage.getItem('preferredLanguage') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'sw')) {
      if (i18n.language !== savedLang) {
        i18n.changeLanguage(savedLang);
      }
    }

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Load user language preference on mount
  useEffect(() => {
    if (user?.id) {
      // In the future, you can fetch user's preferred language from backend
      // For now, it uses localStorage (handled by i18next-browser-languagedetector)
    }
  }, [user]);

  const setLanguage = useCallback((lang: Language) => {
    i18n.changeLanguage(lang).then(() => {
      setCurrentLanguage(lang);
      // Language is automatically saved to localStorage by i18next-browser-languagedetector
    });
  }, [i18n]);

  const language = currentLanguage;

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    i18n,
  };

  // Wait for i18next to be ready before rendering
  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
