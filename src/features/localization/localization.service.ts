import { storage } from '@/shared/storage';
import { UI_TRANSLATIONS } from './localization.data';
import type {
  SupportedInterfaceLanguage,
  TranslationKey,
} from './localization.types';

const STORAGE_KEY = 'engineeros_interface_language';

export const LocalizationService = {
  getLanguage(): SupportedInterfaceLanguage {
    return storage.get<SupportedInterfaceLanguage>(STORAGE_KEY) ?? 'en';
  },

  setLanguage(language: SupportedInterfaceLanguage): void {
    storage.set(STORAGE_KEY, language);
  },

  translate(key: TranslationKey, language: SupportedInterfaceLanguage): string {
    return UI_TRANSLATIONS[language][key] ?? UI_TRANSLATIONS.en[key] ?? key;
  },
};
