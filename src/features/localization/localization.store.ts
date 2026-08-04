import { create } from 'zustand';

import { LocalizationService } from './localization.service';
import type { SupportedInterfaceLanguage, TranslationKey } from './localization.types';

interface LocalizationStore {
  language: SupportedInterfaceLanguage;
  setLanguage: (language: SupportedInterfaceLanguage) => void;
  translate: (key: TranslationKey) => string;
}

const createTranslate = (language: SupportedInterfaceLanguage) => {
  return (key: TranslationKey) => LocalizationService.translate(key, language);
};

export const useLocalizationStore = create<LocalizationStore>((set) => ({
  language: LocalizationService.getLanguage(),
  setLanguage: (language) => {
    LocalizationService.setLanguage(language);
    // Re-create translate so selectors of s.translate re-render on language change.
    set({ language, translate: createTranslate(language) });
  },
  translate: createTranslate(LocalizationService.getLanguage()),
}));
