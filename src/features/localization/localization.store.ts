import { create } from 'zustand';

import { LocalizationService } from './localization.service';
import type { SupportedInterfaceLanguage } from './localization.types';

interface LocalizationStore {
  language: SupportedInterfaceLanguage;
  setLanguage: (language: SupportedInterfaceLanguage) => void;
  translate: (key: string) => string;
}

const RTL_LANGUAGES: SupportedInterfaceLanguage[] = ['ar'];

const createTranslate = (language: SupportedInterfaceLanguage) => {
  return (key: string) => LocalizationService.translate(key, language);
};

const applyDocumentLanguage = (language: SupportedInterfaceLanguage) => {
  document.documentElement.dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

const initialLanguage = LocalizationService.getLanguage();
applyDocumentLanguage(initialLanguage);

export const useLocalizationStore = create<LocalizationStore>((set) => ({
  language: initialLanguage,
  setLanguage: (language) => {
    LocalizationService.setLanguage(language);
    applyDocumentLanguage(language);
    set({ language, translate: createTranslate(language) });
  },
  translate: createTranslate(initialLanguage),
}));