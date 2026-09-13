import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AuthGuard } from './AuthGuard';

// --- mocks -----------------------------------------------------------

// Mutable state so each test can shape the session it exercises. `vi.hoisted`
// keeps the objects alive before the (hoisted) `vi.mock` factories run.
const mockState = vi.hoisted(() => ({
  firebase: { isLoaded: true, isSignedIn: false, user: undefined as { uid: string } | undefined },
  auth: {
    isAuthenticated: false,
    isLoading: false,
    currentUser: null as { id?: string } | null,
    sessionKind: null as string | null,
  },
}));

vi.mock('./FirebaseAuth', () => ({
  useFirebaseAuth: () => mockState.firebase,
}));

vi.mock('./auth.store', () => ({
  useAuthStore: () => mockState.auth,
}));

vi.mock('./firebase.config', () => ({
  AUTH_SIGN_IN_URL: '/sign-in',
}));

vi.mock('@sentry/react', () => ({
  withScope: vi.fn(),
  captureMessage: vi.fn(),
}));

// AuthGuard is mounted inside a real route tree. If it were rendered alone,
// its `<Navigate to="/sign-in">` would never unmount and the redirect would
// loop forever — that missing `/sign-in` route is what used to hang this file.
const renderAt = (path = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <div data-testid="child">Protected content</div>
            </AuthGuard>
          }
        />
        <Route path="/sign-in" element={<div data-testid="sign-in">Sign in</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('AuthGuard', () => {
  it('shows the loading state while Firebase Auth is still loading', () => {
    mockState.firebase.isLoaded = false;
    mockState.auth.isAuthenticated = false;
    mockState.auth.currentUser = null;

    renderAt();

    expect(screen.getByText('Opening EngVox')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();

    mockState.firebase.isLoaded = true;
  });

  it('redirects to sign-in when there is no session', () => {
    mockState.firebase.isLoaded = true;
    mockState.firebase.isSignedIn = false;
    mockState.auth.isAuthenticated = false;
    mockState.auth.currentUser = null;

    renderAt();

    expect(screen.getByTestId('sign-in')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders the protected children for a local session', () => {
    mockState.firebase.isLoaded = true;
    mockState.auth.sessionKind = 'local';
    mockState.auth.isAuthenticated = true;
    mockState.auth.currentUser = { id: 'local-user' };

    renderAt();

    expect(screen.getByTestId('child')).toBeInTheDocument();

    mockState.auth.sessionKind = null;
    mockState.auth.isAuthenticated = false;
    mockState.auth.currentUser = null;
  });
});
