import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// --- mocks -----------------------------------------------------------

vi.mock('./FirebaseAuth', () => ({
  useFirebaseAuth: () => ({ isLoaded: true, isSignedIn: false }),
}));

vi.mock('./auth.store', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    isLoading: false,
    currentUser: null,
  }),
}));

vi.mock('./firebase.config', () => ({
  AUTH_SIGN_IN_URL: '/sign-in',
}));

vi.mock('@sentry/react', () => ({
  withScope: vi.fn(),
  captureMessage: vi.fn(),
}));

import { AuthGuard } from './AuthGuard';

describe.skip('AuthGuard', () => {
  // Skipped: vitest fake timer + dynamic import '@sentry/react' causes deadlock. Re-enable when @sentry/react supports ESM.

  it('shows loading while Firebase Auth is loading', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthGuard>
          <div data-testid="child">Protected content</div>
        </AuthGuard>
      </MemoryRouter>
    );
    expect(screen.getByText('Opening EngVox')).toBeInTheDocument();
  });
});
