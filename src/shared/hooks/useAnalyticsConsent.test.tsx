import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CookieConsentBanner from '../components/CookieConsentBanner';
import { useAnalyticsConsent } from './useAnalyticsConsent';

const init = vi.hoisted(() => vi.fn());
vi.mock('@/core/observability/observability.service', () => ({ ObservabilityService: { init } }));

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.stubGlobal('requestIdleCallback', undefined);
  init.mockClear();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('analytics consent', () => {
  it('reacts to local consent and another tab, and unregisters listeners', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { result, unmount } = renderHook(useAnalyticsConsent);
    expect(result.current).toBe(false);
    act(() => {
      localStorage.setItem('engvox_cookie_consent', 'accepted');
      window.dispatchEvent(new Event('engvox:cookie-consent'));
    });
    expect(result.current).toBe(true);
    act(() => {
      localStorage.setItem('engvox_cookie_consent', 'rejected');
      window.dispatchEvent(new Event('storage'));
    });
    expect(result.current).toBe(false);
    unmount();
    expect(remove).toHaveBeenCalledWith('engvox:cookie-consent', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('storage', expect.any(Function));
    remove.mockRestore();
  });
  it('accepts in place without discarding the current draft', async () => {
    render(
      <>
        <input aria-label="draft" defaultValue="unfinished lesson" />
        <CookieConsentBanner />
      </>
    );
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole('button', { name: 'Kabul Et' }));
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(localStorage.getItem('engvox_cookie_consent')).toBe('accepted');
    expect(screen.getByLabelText('draft')).toHaveValue('unfinished lesson');
    expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument();
    expect(init).toHaveBeenCalledOnce();
  });
  it('rejects without starting analytics', () => {
    render(<CookieConsentBanner />);
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole('button', { name: 'Reddet' }));
    expect(localStorage.getItem('engvox_cookie_consent')).toBe('rejected');
    expect(init).not.toHaveBeenCalled();
  });
});
