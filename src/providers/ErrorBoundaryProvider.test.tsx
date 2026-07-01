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
    render(
      <ErrorBoundaryProvider>
        <BrokenView />
      </ErrorBoundaryProvider>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(
      screen.getByText('Route module failed to render')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return Home/i })).toHaveAttribute(
      'href',
      '/dashboard'
    );
    expect(
      screen.getByRole('button', { name: /Reload Workspace/i })
    ).toBeInTheDocument();
  });
});
