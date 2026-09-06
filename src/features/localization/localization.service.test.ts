import { beforeEach, describe, expect, it } from 'vitest';

import { LocalizationService } from './localization.service';

describe('LocalizationService', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to English and persists Turkish through the storage wrapper', () => {
    expect(LocalizationService.getLanguage()).toBe('en');
    LocalizationService.setLanguage('tr');
    expect(LocalizationService.getLanguage()).toBe('tr');
  });

  it('uses stable translation keys with an English fallback', async () => {
    // UI copy is loaded lazily per-language (see localization/data) instead
    // of being bundled eagerly for all languages, so tests must wait for the
    // chunk before asserting on synchronous `translate`.
    await LocalizationService.waitUntilReady('tr');
    expect(LocalizationService.translate('feedback.submit', 'tr')).toBe('Gönder');
    expect(LocalizationService.translate('nav.home', 'en')).toBe('Home');
  });

  it('falls back to the raw key before the language chunk has loaded', () => {
    // Not awaiting waitUntilReady here on purpose: a never-requested
    // language should never crash, and should degrade gracefully.
    expect(LocalizationService.translate('some.unloaded.key', 'ja')).toBe('some.unloaded.key');
  });
});
