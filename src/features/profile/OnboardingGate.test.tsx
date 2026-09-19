import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { storage } from '@/shared/storage';

import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import { OnboardingGate } from './OnboardingGate';

const Guarded = () => <div data-testid="guarded-content">GUARDED CONTENT</div>;

/**
 * jsdom's matchMedia stub matches nothing, so the wizard's narrow (staged) layout
 * is what these tests render by default: one list per step, `onboarding.continue`
 * on step 1 and `onboarding.finish` on step 2. `stubWideViewport` switches the
 * component to the two-pane layout the desktop app uses.
 */
const stubWideViewport = () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('1024px'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }))
  );
};

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
    storage.deactivateSession();
    // A real session is always active by the time this gate renders — via
    // Firebase sign-in (FirebaseBridge), the demo shortcut, or local login —
    // so LearningProfileRepository's scoped storage.get/set (which are
    // no-ops without an active session) need one here too, or every
    // save/read in these tests silently does nothing.
    storage.activateSession({ userId: 'gate-user', kind: 'demo' });
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
    storage.deactivateSession();
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
    await waitFor(() => {
      expect(screen.getByTestId('guarded-content')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /onboarding\.continue/ })).not.toBeInTheDocument();
  });

  it('shows the selection wizard when onboarding is incomplete', async () => {
    renderGate('/dashboard');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /onboarding\.continue/ })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /architecture/i })).toBeInTheDocument();
    expect(screen.queryByTestId('guarded-content')).not.toBeInTheDocument();
  });

  it('gates every app route, not just the dashboard', async () => {
    renderGate('/vocabulary');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /onboarding\.continue/ })).toBeInTheDocument();
    });
    expect(screen.queryByTestId('guarded-content')).not.toBeInTheDocument();
  });

  it('stages the two lists below the wide breakpoint, then unlocks on the same mounted gate', async () => {
    const user = userEvent.setup();
    renderGate('/dashboard');

    // Step 1 — discipline only; the language list must not be rendered yet, or the
    // narrow layout is back to the single long page TD-026 removed.
    const disciplineBtn = await screen.findByRole('button', { name: /architecture/i });
    expect(screen.queryByRole('button', { name: /türkçe/i })).not.toBeInTheDocument();
    await user.click(disciplineBtn);

    const continueBtn = await screen.findByRole('button', { name: /onboarding\.continue/ });
    expect(continueBtn).not.toBeDisabled();
    await user.click(continueBtn);

    // Step 2 — language, then finish.
    const languageBtn = await screen.findByRole('button', { name: /türkçe/i });
    expect(screen.queryByRole('button', { name: /architecture/i })).not.toBeInTheDocument();
    await user.click(languageBtn);

    const finishBtn = await screen.findByRole('button', { name: /onboarding\.finish/ });
    expect(finishBtn).not.toBeDisabled();
    await user.click(finishBtn);

    await waitFor(() => {
      expect(screen.getByTestId('guarded-content')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /onboarding\.finish/ })).not.toBeInTheDocument();
  });

  it('lets the completed step chip walk back to the discipline list', async () => {
    const user = userEvent.setup();
    renderGate('/dashboard');

    await user.click(await screen.findByRole('button', { name: /architecture/i }));
    await user.click(await screen.findByRole('button', { name: /onboarding\.continue/ }));
    expect(await screen.findByRole('button', { name: /türkçe/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /onboarding\.yourDiscipline/ }));
    expect(await screen.findByRole('button', { name: /architecture/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /türkçe/i })).not.toBeInTheDocument();
  });

  it('keeps the two-pane layout (both lists, one CTA) on wide viewports', async () => {
    stubWideViewport();
    const user = userEvent.setup();
    renderGate('/dashboard');

    await user.click(await screen.findByRole('button', { name: /architecture/i }));
    await user.click(await screen.findByRole('button', { name: /türkçe/i }));

    const nextBtn = await screen.findByRole('button', { name: /common\.next/ });
    expect(nextBtn).not.toBeDisabled();
    await user.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByTestId('guarded-content')).toBeInTheDocument();
    });
  });
});
