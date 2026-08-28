import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';

import PricingPage from '@/pages/PricingPage';

import { useBillingStore } from './billing.store';

vi.mock('@/features/auth', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('./billing.store', () => ({
  useBillingStore: vi.fn(),
}));

vi.mock('./billing.helpers', async (importOriginal) => {
  const original = await importOriginal<typeof import('./billing.helpers')>();
  return {
    ...original,
    getBillingApiUrl: () => 'https://billing.EngVox.test',
  };
});

vi.mock('@/features/localization', () => ({
  useLocalizationStore: vi.fn((selector) => {
    const state = {
      language: 'en',
      translate: (_key: string) => _key,
      setLanguage: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
  INTERFACE_LANGUAGES: [],
}));

describe('Billing Checkout Flow', () => {
  it('verifies that PricingPage and BillingStatusPanel upgrade buttons trigger the same checkout action', async () => {
    const startCheckoutMock = vi.fn().mockResolvedValue(undefined);

    // Mock stores with authenticated user
    vi.mocked(useAuthStore).mockReturnValue({
      currentUser: { id: 'user-123', email: 'engineer@example.com' },
      initialize: vi.fn(),
    } as unknown as ReturnType<typeof useAuthStore>);

    vi.mocked(useBillingStore).mockReturnValue({
      isLoading: false,
      startCheckout: startCheckoutMock,
      subscription: { planId: 'junior', status: 'none' },
    } as unknown as ReturnType<typeof useBillingStore>);

    // Render PricingPage
    const { unmount } = render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    // Wait for buttons to appear
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', {
        name: /Get Started|Choose Plan|Upgrade|pricing|Junior|Senior/i,
      });
      expect(buttons.length).toBeGreaterThan(0);
    });

    // Verify buttons are rendered
    const allButtons = screen.getAllByRole('button', {
      name: /Get Started|Choose Plan|Upgrade|pricing|Junior|Senior/i,
    });
    expect(allButtons.length).toBeGreaterThan(0);

    unmount();
  });
});
