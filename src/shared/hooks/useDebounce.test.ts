import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'hello' } }
    );

    rerender({ value: 'world' });
    expect(result.current).toBe('hello');

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('world');
  });

  it('resets timer on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('a');

    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('c');
  });

  it('cleans up timer on unmount', () => {
    const { unmount, result } = renderHook(() => useDebounce('test', 500));
    unmount();
    expect(result.current).toBe('test');
  });

  it('works with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 100 } }
    );

    rerender({ value: 'b', delay: 100 });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('b');

    rerender({ value: 'c', delay: 200 });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('c');
  });
});
