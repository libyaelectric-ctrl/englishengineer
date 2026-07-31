import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with default value', () => {
    const { container } = render(<ProgressBar value={50} />);
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toBeTruthy();
  });

  it('shows percentage when showValue is true', () => {
    render(<ProgressBar value={75} showValue />);
    expect(screen.getByText('75%')).toBeTruthy();
  });

  it('clamps value above max to 100%', () => {
    render(<ProgressBar value={150} max={100} showValue />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('clamps negative value to 0%', () => {
    render(<ProgressBar value={-10} showValue />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('applies color class', () => {
    const { container } = render(<ProgressBar value={50} color="emerald" />);
    expect(container.querySelector('.bg-success')).toBeTruthy();
  });

  it('renders label when showValue is true', () => {
    render(<ProgressBar value={30} showValue />);
    expect(screen.getByText('Progress')).toBeTruthy();
  });
});
