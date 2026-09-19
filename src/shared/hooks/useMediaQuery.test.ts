import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useMediaQuery } from './useMediaQuery';

type Listener = (event: MediaQueryListEvent) => void;

/** Controllable `matchMedia` stub: reports `initial` and lets a test flip it. */
const stubMatchMedia = (initial: boolean) => {
  const state = { matches: initial };
  const listeners = new Set<Listener>();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(
      () =>
        ({
          get matches() {
            return state.matches;
          },
          media: '',
          onchange: null,
          addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
          removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList
    )
  );
  return {
    emit(matches: boolean) {
      state.matches = matches;
      listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent));
    },
    listenerCount: () => listeners.size,
  };
};

describe('useMediaQuery', () => {
  it('reports the current match state', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(true);
  });

  it('reacts to later changes and unsubscribes on unmount', () => {
    const media = stubMatchMedia(false);
    const { result, unmount } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);

    act(() => media.emit(true));
    expect(result.current).toBe(true);

    unmount();
    expect(media.listenerCount()).toBe(0);
  });

  it('falls back to the default when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)', true));
    expect(result.current).toBe(true);
  });
});
