import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { storage } from '@/shared/storage';

import { OnboardingGate } from './OnboardingGate';

const Onboarding = () => <div>ONBOARDING PAGE</div>;
const Guarded = () => <div>GUARDED CONTENT</div>;

const renderGate = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <OnboardingGate>
              <Guarded />
            </OnboardingGate>
          }
        />
        <Route
          path="/vocabulary"
          element={
            <OnboardingGate>
              <Guarded />
            </OnboardingGate>
          }
        />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/:step" element={<Onboarding />} />
        <Route path="/welcome" element={<Onboarding />} />
      </Routes>
    </MemoryRouter>
  );

describe('OnboardingGate', () => {
  beforeEach(() => {
    storage.clear();
    useAuthStore.setState({
      currentUser: {
        id: 'gate-user',
        displayName: 'Gate User',
        email: 'gate@example.com',
        role: 'engineer',
        engineeringDiscipline: 'software',
        targetLevel: 'B2',
        location: 'Remote',
        avatarInitials: 'GU',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  afterEach(() => {
    storage.clear();
    useAuthStore.setState({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('allows access when onboarding (discipline + language) is complete', async () => {
    const profile = LearningProfileRepository.getProfile('gate-user');
    LearningProfileRepository.saveProfile({
      ...profile,
      userId: 'gate-user',
      onboardingCompleted: true,
      discipline: 'software',
      interfaceLanguage: 'tr',
    });

    renderGate('/dashboard');
    expect(await screen.findByText('GUARDED CONTENT')).toBeInTheDocument();
    expect(screen.queryByText('ONBOARDING PAGE')).not.toBeInTheDocument();
  });

  it('redirects to /onboarding when onboarding is incomplete', async () => {
    renderGate('/dashboard');
    expect(await screen.findByText('ONBOARDING PAGE')).toBeInTheDocument();
    expect(screen.queryByText('GUARDED CONTENT')).not.toBeInTheDocument();
  });

  it('gates every app route, not just the dashboard', async () => {
    renderGate('/vocabulary');
    expect(await screen.findByText('ONBOARDING PAGE')).toBeInTheDocument();
  });

  it('exempts the /onboarding setup path', async () => {
    renderGate('/onboarding');
    expect(await screen.findByText('ONBOARDING PAGE')).toBeInTheDocument();
  });

  it('exempts the /welcome setup path', async () => {
    renderGate('/welcome');
    expect(await screen.findByText('ONBOARDING PAGE')).toBeInTheDocument();
  });
});
