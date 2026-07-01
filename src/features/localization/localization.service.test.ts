import { beforeEach, describe, expect, it } from 'vitest';
import { LocalizationService } from './localization.service';

describe('LocalizationService', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to English and persists Turkish through the storage wrapper', () => {
    expect(LocalizationService.getLanguage()).toBe('en');
    LocalizationService.setLanguage('tr');
    expect(LocalizationService.getLanguage()).toBe('tr');
  });

  it('uses stable translation keys with an English fallback', () => {
    expect(LocalizationService.translate('feedback.submit', 'tr')).toBe(
      'Gönder'
    );
    expect(LocalizationService.translate('nav.home', 'en')).toBe('Home');
  });
});
