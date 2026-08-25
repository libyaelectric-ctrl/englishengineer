import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// --- mocks -----------------------------------------------------------

let clerkLoaded = false;
let clerkSignedIn = false;

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isLoaded: clerkLoaded, isSignedIn: clerkSignedIn }),
}));

vi.mock('./auth.store', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    isLoading: false,
    currentUser: null,
  }),
}));

vi.mock('./clerk.config', () => ({
  CLERK_SIGN_IN_URL: '/sign-in',
}));

// --- helpers ---------------------------------------------------------

const { AuthGuard } = await import('./AuthGuard');

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthGuard>
        <div data-testid="child">Protected content</div>
      </AuthGuard>
    </MemoryRouter>,
  );
}

// --- tests -----------------------------------------------------------

describe('AuthGuard – Clerk timeout fallback', () => {
  beforeEach(() => {
    clerkLoaded = false;
    clerkSignedIn = false;
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

    expect(
      screen.getByText(/ad blocker or privacy extension/i),
    ).toBeInTheDocument();
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
      </MemoryRouter>,
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
});
