import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { locales, zhCN, type Locale } from './locales';

interface I18nContextType {
  locale: Locale;
  t: typeof zhCN;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'zh',
  t: zhCN,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('dashboard-locale');
    return (saved === 'en' ? 'en' : 'zh') as Locale;
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('dashboard-locale', l);
  }, []);

  const t = locales[locale];

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// Non-React accessor for use in utility functions (reads from localStorage)

export function getCurrentLocaleLabels() {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('dashboard-locale') : null;
  const locale = saved === 'en' ? 'en' : 'zh';
  return locales[locale];
}
