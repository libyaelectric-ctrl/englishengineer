import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import OAuthCallbackPage from './OAuthCallbackPage';

const mocks = vi.hoisted(() => ({
  clerkState: { loaded: true },
  handleRedirectCallback: vi.fn(),
  navigateTo: vi.fn(),
}));

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isLoaded: mocks.clerkState.loaded }),
  useClerk: () => ({ handleRedirectCallback: mocks.handleRedirectCallback }),
}));

vi.mock('@/shared/utils/capacitor', () => ({
  navigateTo: mocks.navigateTo,
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/oauth-callback']}>
      <Routes>
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/sign-in" element={<div>Sign-in page</div>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.useFakeTimers();
  mocks.clerkState.loaded = true;
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('OAuthCallbackPage', () => {
  it('shows a spinner while the completion is pending', () => {
    mocks.handleRedirectCallback.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText(/Finishing sign-in/)).toBeInTheDocument();
    expect(mocks.handleRedirectCallback).toHaveBeenCalledTimes(1);
  });

  it('falls back to the error card when handleRedirectCallback stalls past the timeout', () => {
    mocks.handleRedirectCallback.mockReturnValue(new Promise(() => {}));

    renderPage();
    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(screen.getByText(/taking too long/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sign-in incomplete/ })).toBeInTheDocument();

    // The user can still back out to the sign-in screen.
    act(() => {
      screen.getByRole('button', { name: 'Back to sign in' }).click();
    });
    expect(mocks.navigateTo).toHaveBeenCalledWith('/sign-in');
  });

  it('falls back to the error card when Clerk never loads (origin blocked)', () => {
    mocks.clerkState.loaded = false;
    mocks.handleRedirectCallback.mockReturnValue(new Promise(() => {}));

    renderPage();
    expect(screen.getByText(/Finishing sign-in/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(screen.getByText(/taking too long/)).toBeInTheDocument();
    expect(mocks.handleRedirectCallback).not.toHaveBeenCalled();
  });

  it('shows the error card immediately when the completion rejects', async () => {
    mocks.handleRedirectCallback.mockRejectedValue(new Error('origin blocked'));

    renderPage();
    await act(async () => {});

    expect(screen.getByText('origin blocked')).toBeInTheDocument();
  });

  it('navigates to the dashboard on success', async () => {
    mocks.handleRedirectCallback.mockResolvedValue(undefined);

    renderPage();
    await act(async () => {});

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(mocks.handleRedirectCallback).toHaveBeenCalledWith({}, expect.any(Function));
  });
});
