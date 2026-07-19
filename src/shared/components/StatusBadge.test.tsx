import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders with label', () => {
    render(<StatusBadge label="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with default neutral tone', () => {
    const { container } = render(<StatusBadge label="Test" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('border-border-soft');
  });

  it('renders with success tone', () => {
    const { container } = render(<StatusBadge label="Success" tone="success" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('text-success');
  });

  it('renders with danger tone', () => {
    const { container } = render(<StatusBadge label="Error" tone="danger" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('text-error');
  });

  it('applies custom className', () => {
    const { container } = render(<StatusBadge label="Test" className="custom-class" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('custom-class');
  });
});
