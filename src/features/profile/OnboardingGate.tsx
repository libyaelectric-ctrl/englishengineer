import { type ReactNode } from 'react';

import { useLocation } from 'react-router-dom';

import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';

import { useAuthStore } from '@/features/auth';
import { INTERFACE_LANGUAGES } from '@/features/localization';

import { OnboardingPanel } from './OnboardingPanel';
import { LearningProfileRepository } from './profile.repository';

const BYPASS_PATHS = ['/billing', '/profile', '/login', '/signup'];

/**
 * Gates the entire authenticated app: users who have not selected both a
 * profession (discipline) and an interface language are shown a fixed,
 * centered selection panel (login-style card) instead of the app content.
 *
 * The profile is read fresh on every render (no memoization) so that completing
 * onboarding unlocks the app immediately — a stale cached profile would keep
 * showing the panel and lock the user out.
 */
export const OnboardingGate = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const currentUser = useAuthStore((state) => state.currentUser);

  if (BYPASS_PATHS.some((p) => location.pathname.startsWith(p))) {
    return <>{children}</>;
  }

  const profile = LearningProfileRepository.getProfile(currentUser?.id ?? 'local-user');

  const hasDiscipline = ENGINEERING_DISCIPLINES.includes(profile.discipline);
  const hasLanguage = INTERFACE_LANGUAGES.some((lang) => lang.id === profile.interfaceLanguage);

  if (profile.onboardingCompleted && hasDiscipline && hasLanguage) {
    return children;
  }

  return <OnboardingPanel />;
};
