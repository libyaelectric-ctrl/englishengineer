import { create } from 'zustand';
import { LocalizationService } from './localization.service';
import type { SupportedInterfaceLanguage } from './localization.types';

interface LocalizationStore {
  language: SupportedInterfaceLanguage;
  setLanguage: (language: SupportedInterfaceLanguage) => void;
  translate: (key: import('./localization.types').TranslationKey) => string;
}

export const useLocalizationStore = create<LocalizationStore>((set) => ({
  language: LocalizationService.getLanguage(),
  setLanguage: (language) => {
    LocalizationService.setLanguage(language);
    set({ language });
  },
  translate: (key) =>
    LocalizationService.translate(key, LocalizationService.getLanguage()),
}));
