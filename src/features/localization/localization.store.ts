import { create } from 'zustand';

import { LocalizationService } from './localization.service';
import type { SupportedInterfaceLanguage } from './localization.types';

interface LocalizationStore {
  language: SupportedInterfaceLanguage;
  setLanguage: (language: SupportedInterfaceLanguage) => void;
  translate: (key: string) => string;
}

const createTranslate = (language: SupportedInterfaceLanguage) => {
  return (key: string) => LocalizationService.translate(key, language);
};

export const useLocalizationStore = create<LocalizationStore>((set) => ({
  language: LocalizationService.getLanguage(),
  setLanguage: (language) => {
    LocalizationService.setLanguage(language);
    set({ language, translate: createTranslate(language) });
  },
  translate: createTranslate(LocalizationService.getLanguage()),
}));