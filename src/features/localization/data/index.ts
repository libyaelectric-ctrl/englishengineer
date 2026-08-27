import type { SupportedInterfaceLanguage } from '../localization.types';

/**
 * Lazy-loaded language chunks. Each language is a separate module that is
 * only imported when the user selects that language, keeping the initial
 * bundle small. Loaded modules are cached in memory after first load.
 */

// Cache for loaded language data
const cache = new Map<SupportedInterfaceLanguage, Record<string, string>>();

// Dynamic import map — Vite will code-split each into its own chunk
const importMap: Record<SupportedInterfaceLanguage, () => Promise<{ data: Record<string, string> }>> = {
  en: () => import('./en'),
  tr: () => import('./tr'),
  ar: () => import('./ar'),
  de: () => import('./de'),
  es: () => import('./es'),
  pt: () => import('./pt'),
  fr: () => import('./fr'),
  ru: () => import('./ru'),
  zh: () => import('./zh'),
  ja: () => import('./ja'),
  it: () => import('./it'),
  vi: () => import('./vi'),
  pl: () => import('./pl'),
  id: () => import('./id'),
  nl: () => import('./nl'),
};

/**
 * Get UI translations for a specific language. Returns cached data if
 * already loaded, otherwise dynamically imports the language chunk.
 * Falls back to English if the requested language is not available.
 */
export async function getUiTranslations(
  language: SupportedInterfaceLanguage
): Promise<Record<string, string>> {
  if (cache.has(language)) {
    return cache.get(language)!;
  }

  const loader = importMap[language];
  if (!loader) {
    // Fallback to English
    return getUiTranslations('en');
  }

  try {
    const mod = await loader();
    cache.set(language, mod.data);
    return mod.data;
  } catch {
    // If load fails, fallback to English
    if (language !== 'en') {
      return getUiTranslations('en');
    }
    return {};
  }
}

/**
 * Synchronously get translations (only works if already loaded).
 * Used for rendering after initial load.
 */
export function getUiTranslationsSync(
  language: SupportedInterfaceLanguage
): Record<string, string> | undefined {
  return cache.get(language);
}

/**
 * Check if a language chunk is already loaded in memory.
 */
export function isLanguageLoaded(language: SupportedInterfaceLanguage): boolean {
  return cache.has(language);
}

/**
 * Preload a language chunk without waiting for it.
 */
export function preloadLanguage(language: SupportedInterfaceLanguage): void {
  const loader = importMap[language];
  if (loader && !cache.has(language)) {
    loader().then((mod) => cache.set(language, mod.data)).catch(() => {});
  }
}
