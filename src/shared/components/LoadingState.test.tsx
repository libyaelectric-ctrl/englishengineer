import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingState } from './LoadingState';

describe('LoadingState', () => {
  it('renders with title', () => {
    render(<LoadingState title="Please wait" />);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<LoadingState title="Loading" description="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('renders without title shows skeleton', () => {
    const { container } = render(<LoadingState />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
