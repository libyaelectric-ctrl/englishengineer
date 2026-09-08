import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorActions, ErrorDetailsBlock, ErrorIcon, RetryButton } from './ErrorFallbackCore';

describe('ErrorFallbackCore', () => {
  it('renders the alert icon as an aria-hidden decorative svg', () => {
    const { container } = render(<ErrorIcon />);
    expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('renders the error message in the dev-only details block', () => {
    render(<ErrorDetailsBlock error={new Error('details message')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('details message');
  });

  it('renders "Unknown error" for empty values in the details block', () => {
    render(<ErrorDetailsBlock error={''} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unknown error');
  });

  it('triggers the retry callback with the default label', () => {
    const onClick = vi.fn();
    render(<RetryButton onClick={onClick} />);
    screen.getByRole('button', { name: /Try Again/i }).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports a custom retry label', () => {
    render(<RetryButton onClick={() => undefined} label="Reload" />);
    expect(screen.getByRole('button', { name: /Reload/i })).toBeInTheDocument();
  });

  it('renders action children in a row', () => {
    render(
      <ErrorActions>
        <span>action</span>
      </ErrorActions>
    );
    expect(screen.getByText('action')).toBeInTheDocument();
  });
});
