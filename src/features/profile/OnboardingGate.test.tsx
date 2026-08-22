import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { storage } from '@/shared/storage';

import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import { OnboardingGate } from './OnboardingGate';

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
    await act(async () => {
      expect(await screen.findByText('GUARDED CONTENT')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Start/ })).not.toBeInTheDocument();
  });

  it('shows the centered selection panel when onboarding is incomplete', async () => {
    renderGate('/dashboard');
    await act(async () => {
      // The "Start" button uses translation key "onboarding.start" and is disabled until discipline selected
      expect(await screen.findByRole('button', { name: 'onboarding.start' })).toBeInTheDocument();
    });
    // Discipline button has name "discipline.architecture discipline.architecture.desc"
    expect(screen.getByRole('button', { name: /discipline\.architecture/ })).toBeInTheDocument();
    expect(screen.queryByText('GUARDED CONTENT')).not.toBeInTheDocument();
  });

  it('gates every app route, not just the dashboard', async () => {
    renderGate('/vocabulary');
    await act(async () => {
      expect(await screen.findByRole('button', { name: 'onboarding.start' })).toBeInTheDocument();
    });
    expect(screen.queryByText('GUARDED CONTENT')).not.toBeInTheDocument();
  });

  it('unlocks the app on the same mounted gate once the panel is completed (no stale cache)', async () => {
    const user = userEvent.setup();
    renderGate('/dashboard');
    // Click Architecture discipline button (uses translation key)
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /discipline\.architecture/ }));
    });
    // Click the Start button (translation key "onboarding.start") - it should be enabled now
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'onboarding.start' }));
    });
    await act(async () => {
      expect(await screen.findByText('GUARDED CONTENT')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'onboarding.start' })).not.toBeInTheDocument();
  });
});
