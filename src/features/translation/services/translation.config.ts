/**
 * Endpoint inventory for the free translation chain.
 *
 * Verified 2026-09-19 in a real Chromium session. Node-side probes disagree with the
 * browser (datacenter IPs get rate-limited or bot-blocked), so they cannot tell a dead
 * service from a rejected client — every entry below was judged in the browser:
 *  - Google GTX (`translate_a/t`, `translate_a/single`): 200 with a CORS-visible body.
 *  - MyMemory: 200.
 *  - LibreTranslate public instances: `libretranslate.com` now answers "Visit
 *    https://portal.libretranslate.com to get an API key", and the former Argos host no
 *    longer resolves, so the keyless default is `libretranslate.de`.
 *  - `api.allorigins.win/raw` stays as the gateway's CORS-proxy fallback; it cannot be
 *    judged from an opaque test origin, and it is only reached when GTX itself fails.
 *
 * Removed rather than left in the chain: Lingva (lingva.ml 403, lingva.lunar.icu 500) and
 * FtApi (404 "Coming Soon"). An entry that can only fail costs a full timeout before the
 * working provider is tried, which is exactly how a translation looked "stuck".
 */
export const LIBRETRANSLATE_ENDPOINTS = [
  import.meta.env.VITE_LIBRETRANSLATE_URL || 'https://libretranslate.de/translate',
] as const;

export const GOOGLE_GTX_BASE = 'https://translate.googleapis.com/translate_a/t';

export const GOOGLE_GTX_URLS = [
  'https://translate.googleapis.com/translate_a/t',
  'https://translate.googleapis.com/translate_a/single',
  'https://api.allorigins.win/raw',
] as const;

export const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

export const REQUEST_TIMEOUTS = {
  GATEWAY: 3000,
  FALLBACK: 2500,
  ENDPOINT: 2000,
} as const;
