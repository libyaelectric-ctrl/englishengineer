import { type ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';

import { useAuthStore } from '@/features/auth';
import { INTERFACE_LANGUAGES } from '@/features/localization';

import { LearningProfileRepository } from './profile.repository';

/**
 * Gates the entire authenticated app: users who have not selected both a
 * profession (discipline) and an interface language during onboarding are
 * redirected to `/welcome`. Setup pages themselves are exempt so the flow
 * can be completed.
 *
 * The profile is read fresh on every render (no memoization) so that completing
 * onboarding updates the gate immediately — a stale cached profile would keep
 * redirecting back to `/welcome` and lock the user out of the app.
 */
export const OnboardingGate = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const currentUser = useAuthStore((state) => state.currentUser);
  const profile = LearningProfileRepository.getProfile(currentUser?.id ?? 'local-user');

  const isSetupPath = location.pathname === '/welcome';

  if (isSetupPath) {
    return children;
  }

  const hasDiscipline = ENGINEERING_DISCIPLINES.includes(profile.discipline);
  const hasLanguage = INTERFACE_LANGUAGES.some((lang) => lang.id === profile.interfaceLanguage);

  if (profile.onboardingCompleted && hasDiscipline && hasLanguage) {
    return children;
  }

  return <Navigate to="/welcome" replace />;
};
