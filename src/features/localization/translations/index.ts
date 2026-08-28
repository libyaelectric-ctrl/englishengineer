import { NAVIGATION_TRANSLATIONS } from '../localization.data';
import type { SupportedInterfaceLanguage } from '../localization.types';
import { EXTRA_NAV_TRANSLATIONS } from './navigation.translations';

export { EXTRA_NAV_TRANSLATIONS } from './navigation.translations';
export { EXTRA_UI_TRANSLATIONS } from './ui.translations';
export { SIDEBAR_EXTRA_COPY } from './sidebar.translations';

for (const lang of Object.keys(EXTRA_NAV_TRANSLATIONS) as SupportedInterfaceLanguage[]) {
  Object.assign(NAVIGATION_TRANSLATIONS[lang], EXTRA_NAV_TRANSLATIONS[lang]);
}
