'use client';

import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { createTranslator, type Language } from '@/i18n/messages';

type LocaleContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: ReturnType<typeof createTranslator>;
};

const STORAGE_KEY = 'app_language';
const DEFAULT_LANGUAGE: Language = 'th';

let currentLanguage: Language = DEFAULT_LANGUAGE;
const listeners = new Set<() => void>();

function emitLanguageChange() {
  listeners.forEach((listener) => listener());
}

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'th' || saved === 'en') return saved;
  const browserLang = window.navigator.language.toLowerCase();
  return browserLang.startsWith('en') ? 'en' : 'th';
}

function setLanguageStore(next: Language) {
  currentLanguage = next;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next === 'th' ? 'th' : 'en';
    document.documentElement.dataset.language = next;
    document.title = next === 'th' ? 'ระบบปรึกษาแพทย์พิษณุโลก' : 'Phitsanulok Med Consultation';
  }

  emitLanguageChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentLanguage;
}

function getServerSnapshot() {
  return DEFAULT_LANGUAGE;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const stored = readStoredLanguage();
    if (stored !== currentLanguage) {
      setLanguageStore(stored);
    } else {
      // Keep DOM attributes in sync even when the store already matches.
      document.documentElement.lang = currentLanguage === 'th' ? 'th' : 'en';
      document.documentElement.dataset.language = currentLanguage;
      document.title = currentLanguage === 'th' ? 'ระบบปรึกษาแพทย์พิษณุโลก' : 'Phitsanulok Med Consultation';
    }
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const t = createTranslator(language);
    return {
      language,
      setLanguage: setLanguageStore,
      toggleLanguage: () => setLanguageStore(language === 'th' ? 'en' : 'th'),
      t,
    };
  }, [language]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}
