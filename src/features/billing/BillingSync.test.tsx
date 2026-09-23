import { act, render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import { BillingSync } from './BillingSync';

const mocks = vi.hoisted(() => ({
  user: { currentUser: { id: 'user-1' } },
  native: true,
  billing: {
    isLoading: false,
    initializeBilling: vi.fn(),
    refreshBilling: vi.fn(),
    setSubscription: vi.fn(),
  },
  callback: undefined as undefined | ((value: { isActive: boolean }) => void),
  remove: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/features/auth', () => ({
  useAuthStore: (selector: (state: typeof mocks.user) => unknown) => selector(mocks.user),
}));
vi.mock('@/shared/utils/capacitor', () => ({ isNativePlatform: () => mocks.native }));
vi.mock('./billing.store', () => ({ useBillingStore: { getState: () => mocks.billing } }));
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(async (_event, callback) => {
      mocks.callback = callback;
      return { remove: mocks.remove };
    }),
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.billing.isLoading = false;
  mocks.native = true;
  mocks.user.currentUser.id = 'user-1';
});
it('refreshes after native resume and browser focus, without overlapping requests', async () => {
  const view = render(<BillingSync />);
  await act(async () => {
    await vi.dynamicImportSettled();
  });
  expect(mocks.billing.initializeBilling).toHaveBeenCalledWith('user-1');
  act(() => mocks.callback?.({ isActive: true }));
  expect(mocks.billing.refreshBilling).toHaveBeenCalledTimes(1);
  act(() => window.dispatchEvent(new Event('focus')));
  expect(mocks.billing.refreshBilling).toHaveBeenCalledTimes(2);
  mocks.billing.isLoading = true;
  act(() => window.dispatchEvent(new Event('focus')));
  expect(mocks.billing.refreshBilling).toHaveBeenCalledTimes(2);
  view.unmount();
  expect(mocks.remove).toHaveBeenCalledOnce();
  act(() => window.dispatchEvent(new Event('focus')));
  expect(mocks.billing.refreshBilling).toHaveBeenCalledTimes(2);
});
it('does not fetch subscriptions for demo users', () => {
  mocks.user.currentUser.id = 'demo_engineer_test';
  render(<BillingSync />);
  expect(mocks.billing.initializeBilling).not.toHaveBeenCalled();
});
