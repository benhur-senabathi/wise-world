import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import en, { type TranslationKey, type Translations } from '../translations/en';
import es from '../translations/es';
import de from '../translations/de';
import fr from '../translations/fr';

export type Language = 'en' | 'es' | 'de' | 'fr';

const dictionaries: Record<Language, Partial<Translations>> = { en, es, de, fr };

function resolvePlural(template: string, count: number): string {
  // Match {count, plural, one {...} other {...}} — supports nested {var} inside forms
  return template.replace(
    /\{(\w+),\s*plural,\s*one\s*\{([^{}]*(?:\{[^}]*\}[^{}]*)*)\}\s*other\s*\{([^{}]*(?:\{[^}]*\}[^{}]*)*)\}\}/g,
    (_match, varName, oneForm, otherForm) => {
      const value = varName === 'count' ? count : 0;
      return value === 1 ? oneForm : otherForm;
    },
  );
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;

  // First resolve plurals
  let result = template;
  if (template.includes('plural,')) {
    const countVal = typeof vars.count === 'number' ? vars.count : parseInt(String(vars.count), 10) || 0;
    result = resolvePlural(result, countVal);
  }

  // Then replace simple {var} placeholders
  return result.replace(/\{(\w+)\}/g, (_match, key) => {
    return vars[key] !== undefined ? String(vars[key]) : `{${key}}`;
  });
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key, vars?) => {
    const template = en[key] ?? key;
    return vars ? interpolate(template, vars) : template;
  },
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const dict = dictionaries[language];
      const template = dict[key] ?? en[key] ?? key;
      return vars ? interpolate(template, vars) : template;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTxLabels() {
  const { t } = useLanguage();
  return {
    sent: t('tx.sent'),
    sentByYou: t('tx.sentByYou'),
    added: t('tx.added'),
    addedByYou: t('tx.addedByYou'),
    moved: t('tx.moved'),
    movedByYou: t('tx.movedByYou'),
    spentByYou: t('tx.spentByYou'),
  };
}
