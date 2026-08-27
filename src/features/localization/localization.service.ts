import { storage } from '@/shared/storage';

import type { SupportedInterfaceLanguage } from './localization.types';
import { EXTRA_UI_TRANSLATIONS } from './translations';
import { getUiTranslations, getUiTranslationsSync, preloadLanguage } from './data';
import { UI_TRANSLATIONS } from './localization.data'; // fallback sync data

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

  /**
   * Synchronous translation — uses in-memory cache or static fallback.
   * After initial language load, this is instant.
   */
  translate(key: string, language: SupportedInterfaceLanguage): string {
    const ui = getUiTranslationsSync(language) ?? (UI_TRANSLATIONS[language] as Record<string, string>);
    const uiEn = getUiTranslationsSync('en') ?? (UI_TRANSLATIONS.en as Record<string, string>);
    const extra = EXTRA_UI_TRANSLATIONS[language] as Record<string, string>;
    const extraEn = EXTRA_UI_TRANSLATIONS.en as Record<string, string>;
    return ui[key] ?? extra[key] ?? uiEn[key] ?? extraEn[key] ?? key;
  },

  /**
   * Async translation — loads language chunk on first call, then cached.
   */
  async translateAsync(key: string, language: SupportedInterfaceLanguage): Promise<string> {
    const ui = await getUiTranslations(language);
    const uiEn = await getUiTranslations('en');
    const extra = EXTRA_UI_TRANSLATIONS[language] as Record<string, string>;
    const extraEn = EXTRA_UI_TRANSLATIONS.en as Record<string, string>;
    return ui[key] ?? extra[key] ?? uiEn[key] ?? extraEn[key] ?? key;
  },

  /**
   * Preload a language chunk in the background.
   */
  preloadLanguage(language: SupportedInterfaceLanguage): void {
    preloadLanguage(language);
  },
};
