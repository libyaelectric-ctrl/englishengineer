import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('does not throw with empty shortcuts', () => {
    expect(() => {
      renderHook(() => useKeyboardShortcuts({}));
    }).not.toThrow();
  });

  it('does not throw with shortcuts defined', () => {
    expect(() => {
      renderHook(() =>
        useKeyboardShortcuts({
          'ctrl+z': () => {},
          'ctrl+y': () => {},
        })
      );
    }).not.toThrow();
  });

  it('cleans up on unmount without error', () => {
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({})
    );
    expect(() => unmount()).not.toThrow();
  });
});
