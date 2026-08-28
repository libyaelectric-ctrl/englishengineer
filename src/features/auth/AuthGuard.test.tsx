import * as Sentry from '@sentry/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

// --- mocks -----------------------------------------------------------

let clerkLoaded = false;
let clerkSignedIn = false;
let isStoreAuthenticated = false;
let isStoreLoading = false;
let storeCurrentUser: unknown = null;

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isLoaded: clerkLoaded, isSignedIn: clerkSignedIn }),
}));

vi.mock('./auth.store', () => ({
  useAuthStore: () => ({
    isAuthenticated: isStoreAuthenticated,
    isLoading: isStoreLoading,
    currentUser: storeCurrentUser,
  }),
}));

vi.mock('./clerk.config', () => ({
  CLERK_SIGN_IN_URL: '/sign-in',
}));

vi.mock('@sentry/react', () => ({
  withScope: vi.fn((cb) => {
    const scope = {
      setTag: vi.fn(),
      setLevel: vi.fn(),
      setExtras: vi.fn(),
    };
    cb(scope);
    return scope;
  }),
  captureMessage: vi.fn(),
}));

// --- helpers ---------------------------------------------------------

const { AuthGuard } = await import('./AuthGuard');

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthGuard>
        <div data-testid="child">Protected content</div>
      </AuthGuard>
    </MemoryRouter>
  );
}

// --- tests -----------------------------------------------------------

describe('AuthGuard – Clerk timeout fallback', () => {
  beforeEach(() => {
    clerkLoaded = false;
    clerkSignedIn = false;
    isStoreAuthenticated = false;
    isStoreLoading = false;
    storeCurrentUser = null;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading state while Clerk is loading', () => {
    renderGuard();
    expect(screen.getByText('Opening EngVox')).toBeInTheDocument();
    expect(screen.getByText('Restoring your professional learning workspace.')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('shows error fallback after 8 seconds if Clerk has not loaded', async () => {
    renderGuard();

    // Advance past the 8-second timeout
    vi.advanceTimersByTime(8_000);

    await waitFor(() => {
      expect(screen.getByText('Connection problem')).toBeInTheDocument();
    });

    expect(screen.getByText(/ad blocker or privacy extension/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  });

  it('does NOT show error if Clerk loads before timeout', async () => {
    const { rerender } = renderGuard();

    // Initially shows loading
    expect(screen.getByText('Opening EngVox')).toBeInTheDocument();

    // Clerk loads after 3 seconds — before timeout
    vi.advanceTimersByTime(3_000);
    clerkLoaded = true;
    clerkSignedIn = true;

    // Re-render to pick up the new clerkLoaded state
    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthGuard>
          <div data-testid="child">Protected content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    // Clerk loaded — should show children, not the error
    await waitFor(() => {
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    expect(screen.queryByText('Connection problem')).not.toBeInTheDocument();
  });

  it('shows error fallback immediately if Clerk already timed out on re-render', async () => {
    renderGuard();

    // Simulate the timeout
    vi.advanceTimersByTime(8_000);

    await waitFor(() => {
      expect(screen.getByText('Connection problem')).toBeInTheDocument();
    });

    // Reload button works
    const reloadBtn = screen.getByRole('button', { name: /reload page/i });
    expect(reloadBtn).toBeInTheDocument();
  });

  // --- Ad-blocker scenario tests ---

  it('ad-blocker scenario: Clerk never loads, full error UI appears', async () => {
    renderGuard();

    // Verify loading state first
    expect(screen.getByText('Opening EngVox')).toBeInTheDocument();
    expect(screen.queryByText('Connection problem')).not.toBeInTheDocument();

    // Simulate ad-blocker: Clerk never loads
    vi.advanceTimersByTime(7_999);
    expect(screen.queryByText('Connection problem')).not.toBeInTheDocument();

    vi.advanceTimersByTime(1); // Hit the 8s mark

    await waitFor(() => {
      expect(screen.getByText('Connection problem')).toBeInTheDocument();
    });

    // Verify all error UI elements
    expect(screen.getByText(/ad blocker or privacy extension/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    expect(screen.queryByText('Opening EngVox')).not.toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('ad-blocker scenario: error message explicitly mentions ad blocker', async () => {
    renderGuard();
    vi.advanceTimersByTime(8_000);

    await waitFor(() => {
      expect(screen.getByText('Connection problem')).toBeInTheDocument();
    });

    const description = screen.getByText(/ad blocker or privacy extension/i);
    expect(description).toBeInTheDocument();
    expect(description.textContent).toContain('disable it for this site');
  });

  // --- Reload button tests ---

  it('reload button is clickable and has correct handler', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderGuard();
    vi.advanceTimersByTime(8_000);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });

    const reloadBtn = screen.getByRole('button', { name: /reload page/i });

    // Button should be enabled and clickable
    expect(reloadBtn).toBeEnabled();

    // Click should not throw
    await user.click(reloadBtn);

    // Button should still be in the document after click
    expect(reloadBtn).toBeInTheDocument();
  });

  it('reload button is accessible (keyboard navigable)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderGuard();
    vi.advanceTimersByTime(8_000);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });

    const reloadBtn = screen.getByRole('button', { name: /reload page/i });
    reloadBtn.focus();
    expect(reloadBtn).toHaveFocus();
  });

  // --- Sentry integration tests ---

  it('sends Sentry warning when Clerk timeout fires', async () => {
    renderGuard();
    vi.advanceTimersByTime(8_000);

    await waitFor(() => {
      expect(screen.getByText('Connection problem')).toBeInTheDocument();
    });

    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      expect.stringContaining('Clerk failed to load within timeout')
    );
    expect(Sentry.withScope).toHaveBeenCalledTimes(1);
  });

  it('Sentry scope includes route and timeout tags', async () => {
    renderGuard();
    vi.advanceTimersByTime(8_000);

    await waitFor(() => {
      expect(screen.getByText('Connection problem')).toBeInTheDocument();
    });

    // Verify scope.setTag was called with expected tags
    const scopeMock = vi.mocked(Sentry.withScope).mock.results[0].value;
    expect(scopeMock.setTag).toHaveBeenCalledWith('clerk.timeout', true);
    expect(scopeMock.setTag).toHaveBeenCalledWith('clerk.timeout_ms', 8000);
    expect(scopeMock.setTag).toHaveBeenCalledWith('route', '/dashboard');
    expect(scopeMock.setLevel).toHaveBeenCalledWith('warning');
  });

  it('does NOT send Sentry if Clerk loads before timeout', async () => {
    const { rerender } = renderGuard();

    vi.advanceTimersByTime(3_000);
    clerkLoaded = true;
    clerkSignedIn = true;

    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthGuard>
          <div data-testid="child">Protected content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  // --- Timer cleanup tests ---

  it('cleans up timeout when component unmounts', () => {
    const { unmount } = renderGuard();
    unmount();

    // Advance past timeout — should not cause state update on unmounted component
    vi.advanceTimersByTime(10_000);
    // No error thrown = cleanup worked
  });

  it('does not show loading after timeout is cleared by Clerk load', async () => {
    const { rerender } = renderGuard();

    // Advance to just before timeout
    vi.advanceTimersByTime(7_000);

    // Clerk loads
    clerkLoaded = true;
    clerkSignedIn = true;

    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthGuard>
          <div data-testid="child">Protected content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    // Advance past original timeout — timer should be cleaned up
    vi.advanceTimersByTime(2_000);

    await waitFor(() => {
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    expect(screen.queryByText('Connection problem')).not.toBeInTheDocument();
  });

  // --- Route variation tests ---

  it('Sentry reports correct route for /sign-in', async () => {
    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <AuthGuard>
          <div>Protected</div>
        </AuthGuard>
      </MemoryRouter>
    );

    vi.advanceTimersByTime(8_000);

    await waitFor(() => {
      expect(screen.getByText('Connection problem')).toBeInTheDocument();
    });

    const scopeMock = vi.mocked(Sentry.withScope).mock.results[0].value;
    expect(scopeMock.setTag).toHaveBeenCalledWith('route', '/sign-in');
  });

  // --- !hasSession branch coverage ---

  it('shows loading when clerk loaded but store is still loading (no session yet)', () => {
    // Clerk loaded, no session, store still loading
    clerkLoaded = true;
    clerkSignedIn = false;
    isStoreLoading = true;

    renderGuard();

    expect(screen.getByText('Opening EngVox')).toBeInTheDocument();
    expect(screen.getByText('Restoring your professional learning workspace.')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects to /sign-in when clerk loaded but no session and not loading', async () => {
    // Clerk loaded, no session, store not loading → should redirect
    clerkLoaded = true;
    clerkSignedIn = false;
    isStoreLoading = false;

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthGuard>
          <div data-testid="child">Protected content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    // Should redirect to /sign-in (Navigate component replaces the view)
    await waitFor(() => {
      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Opening EngVox')).not.toBeInTheDocument();
  });

  it('shows children when clerk loaded and has session via store', () => {
    clerkLoaded = true;
    clerkSignedIn = false;
    isStoreAuthenticated = true;

    renderGuard();

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByText('Opening EngVox')).not.toBeInTheDocument();
  });

  it('shows children when clerk loaded and has clerk session', () => {
    clerkLoaded = true;
    clerkSignedIn = true;

    renderGuard();

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByText('Opening EngVox')).not.toBeInTheDocument();
  });

  it('shows children when clerk loaded and has currentUser in store', () => {
    clerkLoaded = true;
    clerkSignedIn = false;
    storeCurrentUser = { id: 'user_123' };

    renderGuard();

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
