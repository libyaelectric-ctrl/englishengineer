export const LIBRETRANSLATE_ENDPOINTS = [
  import.meta.env.VITE_LIBRETRANSLATE_URL || 'https://translate.argosopentech.com/translate',
  'https://libretranslate.com/translate',
  'https://libretranslate.de/translate',
] as const;

export const GOOGLE_GTX_BASE = 'https://translate.googleapis.com/translate_a/t';

export const GOOGLE_GTX_URLS = [
  'https://translate.googleapis.com/translate_a/t',
  'https://translate.googleapis.com/translate_a/single',
  'https://api.allorigins.win/raw',
] as const;

export const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

export const LINGVA_ENDPOINTS = [
  'https://lingva.ml/api/v1',
  'https://lingva.lunar.icu/api/v1',
] as const;

export const FTAPI_URL = 'https://ftapi.pythonanywhere.com/translate';

export const REQUEST_TIMEOUTS = {
  GATEWAY: 3000,
  FALLBACK: 2500,
  ENDPOINT: 2000,
} as const;
