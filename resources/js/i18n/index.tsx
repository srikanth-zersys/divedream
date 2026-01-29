import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translations
import en from './translations/en.json';
import es from './translations/es.json';

type Translations = typeof en;
type Language = 'en' | 'es';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const translations: Record<Language, Translations> = {
  en,
  es,
};

const availableLanguages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Get nested value from object using dot notation
const getNestedValue = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
};

// Interpolate parameters into string
const interpolate = (str: string, params?: Record<string, string | number>): string => {
  if (!params) return str;
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }, str);
};

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  defaultLanguage = 'en',
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dx-language') as Language;
      if (stored && translations[stored]) {
        return stored;
      }
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      if (translations[browserLang]) {
        return browserLang;
      }
    }
    return defaultLanguage;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dx-language', language);
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[language], key);
    if (value === undefined) {
      // Fallback to English
      const fallback = getNestedValue(translations.en, key);
      if (fallback === undefined) {
        console.warn(`Translation missing: ${key}`);
        return key;
      }
      return interpolate(fallback, params);
    }
    return interpolate(value, params);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// HOC for class components (if needed)
export const withI18n = <P extends object>(
  Component: React.ComponentType<P & I18nContextType>
) => {
  return (props: P) => {
    const i18n = useI18n();
    return <Component {...props} {...i18n} />;
  };
};

export default I18nProvider;
