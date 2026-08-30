import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundaryProvider } from './ErrorBoundaryProvider';

const BrokenView = () => {
  throw new Error('Route module failed to render');
};

describe('ErrorBoundaryProvider', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows a friendly fallback, diagnostic and safe Home link', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    // Deliberately NOT wrapped in <BrowserRouter>: in production (see
    // App.tsx/AppProvider.tsx) ErrorBoundaryProvider sits ABOVE RouterProvider,
    // so its fallback renders with no router context available. Wrapping this
    // test in a router previously masked a real production bug where the
    // fallback used react-router's <Link>, which crashes outside router
    // context and turned every caught error into a full white-screen crash.
    render(
      <ErrorBoundaryProvider>
        <BrokenView />
      </ErrorBoundaryProvider>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(screen.getByText('Route module failed to render')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});
