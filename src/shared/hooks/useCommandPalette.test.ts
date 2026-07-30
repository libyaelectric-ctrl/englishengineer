import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useCommandPalette } from './useCommandPalette';

describe('useCommandPalette', () => {
  it('returns isOpen false by default', () => {
    const { result } = renderHook(() => useCommandPalette());
    expect(result.current.isOpen).toBe(false);
  });

  it('open sets isOpen to true', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it('close sets isOpen to false', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => result.current.open());
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('toggle flips isOpen', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('provides recordVisit function', () => {
    const { result } = renderHook(() => useCommandPalette());
    expect(typeof result.current.recordVisit).toBe('function');
  });

  it('provides getRecent function returning array', () => {
    const { result } = renderHook(() => useCommandPalette());
    expect(typeof result.current.getRecent).toBe('function');
    expect(Array.isArray(result.current.getRecent())).toBe(true);
  });

  it('provides getFrequency function returning object', () => {
    const { result } = renderHook(() => useCommandPalette());
    expect(typeof result.current.getFrequency).toBe('function');
    expect(typeof result.current.getFrequency()).toBe('object');
  });
});
