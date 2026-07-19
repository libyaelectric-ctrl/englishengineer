import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { Inbox } from 'lucide-react';

describe('EmptyState', () => {
  it('renders with title and icon', () => {
    render(<EmptyState icon={Inbox} title="No data found" description="Nothing here" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<EmptyState icon={Inbox} title="Empty" description="Nothing to show" />);
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });
});
