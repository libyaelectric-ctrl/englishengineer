import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getOAuthDeepLinkUrl, useNativeOAuthReturn } from './native-oauth';
import { OAUTH_CALLBACK_ROUTE, buildOAuthForwardUrl } from './native-oauth-forward';

const mocks = vi.hoisted(() => ({
  forwardOAuthReturn: vi.fn(),
  addListener: vi.fn(),
  getLaunchUrl: vi.fn(),
  removeListener: vi.fn(),
  isNativePlatform: vi.fn(),
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: mocks.addListener,
    getLaunchUrl: mocks.getLaunchUrl,
  },
}));

vi.mock('@/shared/utils/capacitor', () => ({
  isNativePlatform: mocks.isNativePlatform,
}));

// native-oauth.ts calls forwardOAuthReturn for its navigation side effect,
// which jsdom cannot perform (location.href is not overridable there). Swap in
// a spy while keeping the pure helpers (buildOAuthForwardUrl etc.) real.
vi.mock('./native-oauth-forward', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./native-oauth-forward')>();
  return { ...mod, forwardOAuthReturn: mocks.forwardOAuthReturn };
});

const DEEP_LINK = `${getOAuthDeepLinkUrl()}?__clerk_handshake=1&__clerk_handshake_nonce=e2e-nonce`;

type UrlOpenCallback = (data: { url: string }) => void;

let urlOpenCallback: UrlOpenCallback | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  urlOpenCallback = undefined;
  mocks.isNativePlatform.mockReturnValue(true);
  mocks.addListener.mockImplementation((_eventName: string, callback: UrlOpenCallback) => {
    urlOpenCallback = callback;
    return Promise.resolve({ remove: mocks.removeListener });
  });
  mocks.getLaunchUrl.mockResolvedValue({ url: undefined });
});

const fireAppUrlOpen = (url: string): void => {
  act(() => {
    urlOpenCallback?.({ url });
  });
};

describe('buildOAuthForwardUrl', () => {
  it('replays the deep-link query params onto the app origin', () => {
    const base = 'https://localhost/';
    const forwarded = buildOAuthForwardUrl(DEEP_LINK, base);

    const url = new URL(forwarded);
    expect(url.origin).toBe('https://localhost');
    expect(url.searchParams.get('__clerk_handshake')).toBe('1');
    expect(url.searchParams.get('__clerk_handshake_nonce')).toBe('e2e-nonce');
    expect(url.hash).toBe(`#${OAUTH_CALLBACK_ROUTE}`);
  });

  it('overrides any existing hash route with the callback route', () => {
    const base = 'https://localhost/#/sign-in';
    const forwarded = buildOAuthForwardUrl(DEEP_LINK, base);

    const url = new URL(forwarded);
    expect(url.hash).toBe(`#${OAUTH_CALLBACK_ROUTE}`);
  });

  it('routes to the callback even when the deep link has no params', () => {
    const base = 'https://localhost/#/sign-in';
    const forwarded = buildOAuthForwardUrl(`${getOAuthDeepLinkUrl()}`, base);

    const url = new URL(forwarded);
    expect(url.search).toBe('');
    expect(url.hash).toBe(`#${OAUTH_CALLBACK_ROUTE}`);
  });

  it('throws on an unparseable deep link so the caller can fall back', () => {
    expect(() => buildOAuthForwardUrl('not a url', 'https://localhost/')).toThrow();
  });
});

describe('useNativeOAuthReturn', () => {
  it('registers nothing on web', () => {
    mocks.isNativePlatform.mockReturnValue(false);

    renderHook(() => useNativeOAuthReturn());

    expect(mocks.addListener).not.toHaveBeenCalled();
    expect(mocks.getLaunchUrl).not.toHaveBeenCalled();
  });

  it('registers an appUrlOpen listener and checks the cold-start launch URL on native', () => {
    renderHook(() => useNativeOAuthReturn());

    expect(mocks.addListener).toHaveBeenCalledTimes(1);
    expect(mocks.addListener).toHaveBeenCalledWith('appUrlOpen', expect.any(Function));
    expect(mocks.getLaunchUrl).toHaveBeenCalledTimes(1);
  });

  it('forwards a matching deep link received via appUrlOpen (warm resume)', () => {
    renderHook(() => useNativeOAuthReturn());

    fireAppUrlOpen(DEEP_LINK);

    expect(mocks.forwardOAuthReturn).toHaveBeenCalledTimes(1);
    expect(mocks.forwardOAuthReturn).toHaveBeenCalledWith(DEEP_LINK);
  });

  it('ignores URLs that are not the oauth-callback deep link', () => {
    renderHook(() => useNativeOAuthReturn());

    fireAppUrlOpen('com.engvox.app://some-other-path?x=1');
    // The forwarded https://localhost URL can never match again — no loop.
    fireAppUrlOpen('https://localhost/?__clerk_handshake=1#/oauth-callback');

    expect(mocks.forwardOAuthReturn).not.toHaveBeenCalled();
  });

  it('forwards the deep link delivered by getLaunchUrl (cold start)', async () => {
    mocks.getLaunchUrl.mockResolvedValue({ url: DEEP_LINK });

    renderHook(() => useNativeOAuthReturn());
    // getLaunchUrl resolves on a microtask after the effect registers it.
    await act(async () => {});

    expect(mocks.forwardOAuthReturn).toHaveBeenCalledTimes(1);
    expect(mocks.forwardOAuthReturn).toHaveBeenCalledWith(DEEP_LINK);
  });

  it('does nothing when the launch URL is absent', () => {
    mocks.getLaunchUrl.mockResolvedValue(undefined);

    renderHook(() => useNativeOAuthReturn());

    expect(mocks.forwardOAuthReturn).not.toHaveBeenCalled();
  });

  it('forwards the same deep link only once when both appUrlOpen and the launch URL deliver it', () => {
    mocks.getLaunchUrl.mockResolvedValue({ url: DEEP_LINK });

    renderHook(() => useNativeOAuthReturn());
    fireAppUrlOpen(DEEP_LINK);
    fireAppUrlOpen(DEEP_LINK);

    expect(mocks.forwardOAuthReturn).toHaveBeenCalledTimes(1);
  });

  it('stops listening and removes the listener on unmount', async () => {
    const { unmount } = renderHook(() => useNativeOAuthReturn());

    unmount();
    // The cleanup resolves the addListener promise on a microtask before it
    // calls listener.remove().
    await act(async () => {});

    expect(mocks.removeListener).toHaveBeenCalledTimes(1);
    fireAppUrlOpen(DEEP_LINK);
    expect(mocks.forwardOAuthReturn).not.toHaveBeenCalled();
  });
});
