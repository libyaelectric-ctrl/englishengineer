import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import BillingPage from './index';

vi.mock('@/features/auth', async (importOriginal) => ({
  ...(await importOriginal()),
  useAuthStore: vi.fn(() => ({
    currentUser: { id: 'user-1', email: 'test@example.com', displayName: 'Test User' },
  })),
}));

vi.mock('@/features/billing', async (importOriginal) => ({
  ...(await importOriginal()),
  useBillingStore: vi.fn(() => ({
    subscription: { planId: 'starter', status: 'active' },
    providerStatus: null,
    isLoading: false,
    error: null,
    refreshBilling: vi.fn().mockResolvedValue(undefined),
    startCheckout: vi.fn().mockResolvedValue(undefined),
    openCustomerPortal: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('@/features/billing/BillingStatusPanel', () => ({
  BillingStatusPanel: () => null,
}));

vi.mock('@/features/ai', async (importOriginal) => ({
  ...(await importOriginal()),
  useAIStore: vi.fn(() => ({
    sessions: [],
  })),
}));

vi.mock('@/features/profile', async (importOriginal) => ({
  ...(await importOriginal()),
  useLearningCockpit: vi.fn(() => ({
    memory: { dueToday: 0 },
    learningState: { studySessions: [] },
  })),
}));

vi.mock('@/features/billing/components/BillingPlanCards', () => ({
  BillingPlanCards: () => null,
}));

vi.mock('@/features/billing/components/BillingUpgradeCTA', () => ({
  BillingUpgradeCTA: () => null,
}));

vi.mock('@/shared/components/Button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/shared/components/SectionCard', () => ({
  SectionCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('BillingPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/billing']}>
        <BillingPage />
      </MemoryRouter>
    );
  });
});
