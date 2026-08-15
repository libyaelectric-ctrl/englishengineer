import { beforeEach, describe, expect, it } from 'vitest';

import { LearningProfileRepository } from './learning-profile.repository';

const USER = 'discipline-lock-user';

describe('LearningProfileRepository discipline lock', () => {
  beforeEach(() => {
    LearningProfileRepository.reset(USER);
  });

  it('locks the discipline when onboarding completes', () => {
    const profile = LearningProfileRepository.updatePreferences(USER, {
      discipline: 'civil',
      onboardingCompleted: true,
    });
    expect(profile.discipline).toBe('civil');
    expect(profile.disciplineLockedAt).toBeTruthy();
  });

  it('rejects discipline changes once locked', () => {
    LearningProfileRepository.updatePreferences(USER, {
      discipline: 'civil',
      onboardingCompleted: true,
    });
    const updated = LearningProfileRepository.updatePreferences(USER, {
      discipline: 'software',
    });
    expect(updated.discipline).toBe('civil');
  });

  it('allows discipline changes before onboarding completes', () => {
    LearningProfileRepository.updatePreferences(USER, { discipline: 'civil' });
    const updated = LearningProfileRepository.updatePreferences(USER, {
      discipline: 'mechanical',
    });
    expect(updated.discipline).toBe('mechanical');
    expect(updated.disciplineLockedAt).toBeUndefined();
  });

  it('persists the native language chosen during onboarding', () => {
    const profile = LearningProfileRepository.updatePreferences(USER, {
      nativeLanguage: 'fr',
    });
    expect(profile.nativeLanguage).toBe('fr');

    const reloaded = LearningProfileRepository.getProfile(USER);
    expect(reloaded.nativeLanguage).toBe('fr');
  });

  it('keeps nativeLanguage in sync with interfaceLanguage when not set', () => {
    LearningProfileRepository.updatePreferences(USER, { interfaceLanguage: 'de' });
    const profile = LearningProfileRepository.getProfile(USER);
    expect(profile.interfaceLanguage).toBe('de');
    expect(profile.nativeLanguage).toBe('de');
  });
});
