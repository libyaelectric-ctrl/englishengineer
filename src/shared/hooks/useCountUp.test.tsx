import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCountUp } from './useCountUp';

const Probe = ({ value, duration = 100 }: { value: number; duration?: number }) => {
  const display = useCountUp(value, duration);
  return <div data-testid="value">{display}</div>;
};

describe('useCountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the initial value without animating', () => {
    render(<Probe value={42} />);
    expect(screen.getByTestId('value').textContent).toBe('42');
  });

  it('counts up to the new target when the value changes', () => {
    const { rerender } = render(<Probe value={0} />);
    rerender(<Probe value={100} />);
    // Mid-animation the displayed value is strictly between 0 and 100.
    act(() => {
      vi.advanceTimersByTime(50);
    });
    const midway = Number(screen.getByTestId('value').textContent);
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(100);
    // After the full duration the value settles exactly on the target.
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId('value').textContent).toBe('100');
  });

  it('re-animates from the settled value for subsequent changes', () => {
    const { rerender } = render(<Probe value={100} />);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    rerender(<Probe value={250} />);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByTestId('value').textContent).toBe('250');
  });
});
