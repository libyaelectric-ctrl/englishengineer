import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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
      <BrowserRouter>
        <ErrorBoundaryProvider>
          <BrokenView />
        </ErrorBoundaryProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(
      screen.getByText('Route module failed to render')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});
