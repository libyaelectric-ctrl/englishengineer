import { storage } from '@/shared/storage';

import { UI_TRANSLATIONS } from './localization.data';
import type { SupportedInterfaceLanguage } from './localization.types';
import { EXTRA_UI_TRANSLATIONS } from './translations';

const STORAGE_KEY = 'EngVox_interface_language';

const SUPPORTED_LANGUAGES: SupportedInterfaceLanguage[] = [
  'en',
  'tr',
  'ar',
  'de',
  'es',
  'pt',
  'fr',
  'ru',
  'zh',
  'ja',
  'it',
  'vi',
  'pl',
  'id',
  'nl',
];

/**
 * Detects the best language from browser's navigator.language.
 * Maps full locale codes (e.g. "tr-TR", "zh-CN") to supported language codes.
 * Falls back to 'en' if no match found.
 */
const detectBrowserLanguage = (): SupportedInterfaceLanguage => {
  const browserLang = navigator.language?.split('-')[0]?.toLowerCase() ?? 'en';
  return SUPPORTED_LANGUAGES.includes(browserLang as SupportedInterfaceLanguage)
    ? (browserLang as SupportedInterfaceLanguage)
    : 'en';
};

export const LocalizationService = {
  getLanguage(): SupportedInterfaceLanguage {
    const stored = storage.globalGet<SupportedInterfaceLanguage>(STORAGE_KEY);
    if (stored) return stored;
    // First visit: auto-detect from browser and persist
    const detected = detectBrowserLanguage();
    storage.globalSet(STORAGE_KEY, detected);
    return detected;
  },

  setLanguage(language: SupportedInterfaceLanguage): void {
    storage.globalSet(STORAGE_KEY, language);
  },

  translate(key: string, language: SupportedInterfaceLanguage): string {
    const ui = UI_TRANSLATIONS[language] as Record<string, string>;
    const uiEn = UI_TRANSLATIONS.en as Record<string, string>;
    const extra = EXTRA_UI_TRANSLATIONS[language] as Record<string, string>;
    const extraEn = EXTRA_UI_TRANSLATIONS.en as Record<string, string>;
    return ui[key] ?? extra[key] ?? uiEn[key] ?? extraEn[key] ?? key;
  },
};
