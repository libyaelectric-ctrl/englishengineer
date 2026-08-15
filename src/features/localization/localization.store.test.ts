import { beforeEach, describe, expect, it } from 'vitest';

import { useLocalizationStore } from './localization.store';

describe('localization.store RTL support', () => {
  beforeEach(() => {
    useLocalizationStore.getState().setLanguage('en');
  });

  it('sets dir=rtl and lang=ar when Arabic is selected', () => {
    useLocalizationStore.getState().setLanguage('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });

  it('sets dir=ltr for left-to-right languages', () => {
    useLocalizationStore.getState().setLanguage('tr');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('tr');
  });

  it('toggles back to ltr when switching from Arabic to another language', () => {
    useLocalizationStore.getState().setLanguage('ar');
    expect(document.documentElement.dir).toBe('rtl');

    useLocalizationStore.getState().setLanguage('fr');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('fr');
  });
});