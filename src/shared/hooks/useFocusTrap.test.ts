import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

describe('useFocusTrap', () => {
  it('returns a ref object', () => {
    const { result } = renderHook(() => useFocusTrap(false));
    expect(result.current).toHaveProperty('current');
  });

  it('does not throw when isActive is false', () => {
    expect(() => {
      renderHook(() => useFocusTrap(false));
    }).not.toThrow();
  });

  it('does not throw when isActive is true', () => {
    expect(() => {
      renderHook(() => useFocusTrap(true));
    }).not.toThrow();
  });

  it('returns same ref across re-renders', () => {
    const { result, rerender } = renderHook(() => useFocusTrap(false));
    const firstRef = result.current;
    rerender();
    expect(result.current).toBe(firstRef);
  });
});
