import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  useIntersectionObserver,
  useInView,
} from './useIntersectionObserver';

describe('useIntersectionObserver', () => {
  it('returns a ref and isVisible boolean', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    const [ref, isVisible] = result.current;
    expect(ref).toHaveProperty('current');
    expect(typeof isVisible).toBe('boolean');
  });

  it('defaults isVisible to false', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    const [, isVisible] = result.current;
    expect(isVisible).toBe(false);
  });

  it('accepts custom options', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({
        threshold: 0.5,
        rootMargin: '100px',
        freezeOnceVisible: true,
      })
    );
    const [ref] = result.current;
    expect(ref).toHaveProperty('current');
  });

  it('cleans up observer on unmount', () => {
    const { unmount } = renderHook(() => useIntersectionObserver());
    expect(() => unmount()).not.toThrow();
  });
});

describe('useInView', () => {
  it('returns ref and inView boolean', () => {
    const { result } = renderHook(() => useInView());
    expect(result.current).toHaveProperty('ref');
    expect(result.current).toHaveProperty('inView');
    expect(typeof result.current.inView).toBe('boolean');
  });

  it('defaults inView to false', () => {
    const { result } = renderHook(() => useInView());
    expect(result.current.inView).toBe(false);
  });
});
