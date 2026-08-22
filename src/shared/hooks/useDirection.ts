/**
 * RTL Direction Hook
 *
 * Applies dir="rtl" attribute for Arabic, Hebrew, and other RTL languages.
 * Integrates with the localization store.
 */
import { useEffect } from 'react';

import { useLocalizationStore } from '@/features/localization';

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const useDirection = () => {
  const language = useLocalizationStore((s) => s.language);

  useEffect(() => {
    const isRTL = RTL_LANGUAGES.includes(language);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);

    // Add RTL class for Tailwind RTL utilities
    if (isRTL) {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }

    return () => {
      document.documentElement.removeAttribute('dir');
      document.documentElement.classList.remove('rtl', 'ltr');
    };
  }, [language]);

  return RTL_LANGUAGES.includes(language);
};
