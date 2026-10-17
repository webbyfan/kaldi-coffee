import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'kaldi_language_v1';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    // Update HTML lang attribute for accessibility & SEO
    document.documentElement.lang = lang === 'am' ? 'am' : 'en';
  }, [lang]);

  const toggleLanguage = () => setLang((prev) => (prev === 'en' ? 'am' : 'en'));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within a LanguageProvider');
  return context;
}
