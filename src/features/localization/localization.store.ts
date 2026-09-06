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
    // The new language's copy loads its own chunk in the background (see
    // localization/data). Refresh `translate` once it's ready so subscribed
    // components re-render with the real copy instead of staying on the
    // brief key/English fallback.
    LocalizationService.waitUntilReady(language).then(() => {
      if (useLocalizationStore.getState().language === language) {
        useLocalizationStore.setState({ translate: createTranslate(language) });
      }
    });
  },
  translate: createTranslate(initialLanguage),
}));

// UI copy for the active language (plus the English fallback) is loaded
// lazily instead of bundling all 15 languages eagerly. Kick that load off
// immediately on boot, then refresh `translate` once it lands.
LocalizationService.waitUntilReady(initialLanguage).then(() => {
  if (useLocalizationStore.getState().language === initialLanguage) {
    useLocalizationStore.setState({ translate: createTranslate(initialLanguage) });
  }
});
