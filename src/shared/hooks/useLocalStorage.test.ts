import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when no stored value', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('returns stored value', () => {
    localStorage.setItem('key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('updates stored value', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    act(() => result.current[1]('new value'));
    expect(result.current[0]).toBe('new value');
    expect(JSON.parse(localStorage.getItem('key')!)).toBe('new value');
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1]((prev) => prev + 10));
    expect(result.current[0]).toBe(11);
  });

  it('persists complex objects', () => {
    const { result } = renderHook(() =>
      useLocalStorage<{ nested: number[] }>('obj', { nested: [] })
    );
    act(() => result.current[1]({ nested: [1, 2, 3] }));
    expect(result.current[0]).toEqual({ nested: [1, 2, 3] });
    expect(JSON.parse(localStorage.getItem('obj')!)).toEqual({
      nested: [1, 2, 3],
    });
  });

  it('removes value when removeValue called', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'value'));
    act(() => result.current[1]('stored'));
    expect(result.current[0]).toBe('stored');
    act(() => result.current[2]());
    expect(result.current[0]).toBe('value');
    expect(localStorage.getItem('key')).toBeNull();
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('key', 'not-valid-json{{{');
    const { result } = renderHook(() => useLocalStorage('key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('uses namespace prefix', () => {
    const { result } = renderHook(() => useLocalStorage('testkey', 'val'));
    act(() => result.current[1]('updated'));
    const keys = Object.keys(localStorage);
    expect(keys.some((k) => k.includes('testkey'))).toBe(true);
  });
});
