import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from './profile.repository';

export const OnboardingGate = ({ children }: { children: ReactNode }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const profile = LearningProfileRepository.getProfile(
    currentUser?.id ?? 'local-user'
  );
  return profile.onboardingCompleted ? (
    children
  ) : (
    <Navigate to="/onboarding" replace />
  );
};
