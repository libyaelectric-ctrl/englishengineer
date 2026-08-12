import { storage } from '@/shared/storage';

import { UI_TRANSLATIONS } from './localization.data';
import { EXTRA_UI_TRANSLATIONS } from './translations';
import type { SupportedInterfaceLanguage } from './localization.types';

const STORAGE_KEY = 'EngVox_interface_language';

export const LocalizationService = {
  getLanguage(): SupportedInterfaceLanguage {
    return storage.globalGet<SupportedInterfaceLanguage>(STORAGE_KEY) ?? 'en';
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