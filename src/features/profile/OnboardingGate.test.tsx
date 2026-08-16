import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MemoryRouter, Outlet, Route, Routes, useNavigate } from 'react-router-dom';

import { storage } from '@/shared/storage';

import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

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
        <Route path="/welcome" element={<Onboarding />} />
      </Routes>
    </MemoryRouter>
  );

const FlowOnboarding = () => {
  const navigate = useNavigate();
  const handleComplete = () => {
    const profile = LearningProfileRepository.getProfile('gate-user');
    LearningProfileRepository.saveProfile({
      ...profile,
      userId: 'gate-user',
      onboardingCompleted: true,
      discipline: 'software',
      interfaceLanguage: 'tr',
    });
    navigate('/curriculum');
  };
  return (
    <button type="button" onClick={handleComplete}>
      COMPLETE ONBOARDING
    </button>
  );
};

const renderFlow = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          element={
            <OnboardingGate>
              <Outlet />
            </OnboardingGate>
          }
        >
          <Route path="/welcome" element={<FlowOnboarding />} />
          <Route path="/curriculum" element={<Guarded />} />
        </Route>
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

  it('redirects to /welcome when onboarding is incomplete', async () => {
    renderGate('/dashboard');
    expect(await screen.findByText('ONBOARDING PAGE')).toBeInTheDocument();
    expect(screen.queryByText('GUARDED CONTENT')).not.toBeInTheDocument();
  });

  it('gates every app route, not just the dashboard', async () => {
    renderGate('/vocabulary');
    expect(await screen.findByText('ONBOARDING PAGE')).toBeInTheDocument();
  });

  it('exempts the /welcome setup path', async () => {
    renderGate('/welcome');
    expect(await screen.findByText('ONBOARDING PAGE')).toBeInTheDocument();
  });

  it('reflects onboarding completion on the same mounted gate (no stale cache)', async () => {
    const user = userEvent.setup();
    renderFlow('/welcome');
    await user.click(screen.getByRole('button', { name: 'COMPLETE ONBOARDING' }));

    expect(await screen.findByText('GUARDED CONTENT')).toBeInTheDocument();
    expect(screen.queryByText('COMPLETE ONBOARDING')).not.toBeInTheDocument();
  });
});
