import { useAuthStore } from '@/features/auth';
import { useLocalizationStore } from '@/features/localization';

import { LearningProfileRepository } from './profile.repository';
import type { InterfaceLanguage } from './profile.types';

/**
 * The language used for learning-time answer resolution. Prefers the user's
 * declared native language from the learning profile; falls back to the
 * current interface language so existing users keep their previous behavior.
 */
export const useLearningLanguage = (): InterfaceLanguage => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const uiLanguage = useLocalizationStore((state) => state.language);
  const profile = LearningProfileRepository.getProfile(currentUser?.id || 'local-user');
  return profile.nativeLanguage ?? uiLanguage;
};