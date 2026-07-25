import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns theme, resolvedTheme, setTheme, and toggleTheme', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toHaveProperty('theme');
    expect(result.current).toHaveProperty('resolvedTheme');
    expect(result.current).toHaveProperty('setTheme');
    expect(result.current).toHaveProperty('toggleTheme');
  });

  it('setTheme is a function', () => {
    const { result } = renderHook(() => useTheme());
    expect(typeof result.current.setTheme).toBe('function');
  });

  it('toggleTheme is a function', () => {
    const { result } = renderHook(() => useTheme());
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  it('resolvedTheme is light or dark', () => {
    const { result } = renderHook(() => useTheme());
    expect(['light', 'dark']).toContain(result.current.resolvedTheme);
  });

  it('does not throw when called', () => {
    expect(() => {
      renderHook(() => useTheme());
    }).not.toThrow();
  });
});
