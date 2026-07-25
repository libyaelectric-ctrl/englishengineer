import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useKeyboardNavigation } from './useKeyboardNavigation';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useKeyboardNavigation', () => {
  it('does not throw when called inside MemoryRouter', () => {
    expect(() => {
      renderHook(() => useKeyboardNavigation({ key: 'Enter', onKeyPress: () => {} }), { wrapper });
    }).not.toThrow();
  });

  it('cleans up on unmount without error', () => {
    const { unmount } = renderHook(() => useKeyboardNavigation({ key: 'Enter', onKeyPress: () => {} }), { wrapper });
    expect(() => unmount()).not.toThrow();
  });

  it('can be called multiple times', () => {
    const { result, rerender } = renderHook(() => useKeyboardNavigation({ key: 'Enter', onKeyPress: () => {} }), {
      wrapper,
    });
    expect(result.current).toBeUndefined();
    rerender();
    expect(result.current).toBeUndefined();
  });
});
