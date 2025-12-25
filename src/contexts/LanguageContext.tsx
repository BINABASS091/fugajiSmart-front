import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { translations } from '../translations';
import { mockDataService } from '../services/mockData';

type Language = 'en' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadUserLanguage();
  }, [user]);

  const loadUserLanguage = async () => {
    // Load from localStorage first
    const savedLang = localStorage.getItem('preferredLanguage') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'sw')) {
      setLanguageState(savedLang);
    }

    // If user is logged in, try to get from user data
    if (user?.id) {
      try {
        const userData = mockDataService.getUserById(user.id);
        // Note: We don't have preferred_language in our mock user model
        // So we'll just use localStorage for now
        // In a real app, you'd add this field to the User interface
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);

    // Update user preference in mock data if user is logged in
    if (user?.id) {
      try {
        // Note: We can't update preferred_language in mock data yet
        // as it's not in the User interface, but localStorage will persist it
        // This is fine for a frontend-only solution
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
