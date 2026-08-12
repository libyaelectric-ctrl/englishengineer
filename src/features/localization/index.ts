import './translations';

export {
  type SupportedInterfaceLanguage,
  type InterfaceLanguageId,
  type InterfaceLanguageOption,
  type TranslationKey,
} from './localization.types';

export {
  INTERFACE_LANGUAGES,
  AVAILABLE_INTERFACE_LANGUAGES,
  UI_TRANSLATIONS,
  NAVIGATION_TRANSLATIONS,
} from './localization.data';

export { LocalizationService } from './localization.service';

export { useLocalizationStore } from './localization.store';

export { SIDEBAR_EXTRA_COPY } from './translations';