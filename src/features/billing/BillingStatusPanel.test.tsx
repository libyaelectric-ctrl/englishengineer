import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BrowserRouter } from 'react-router-dom';

import { BillingStatusPanel } from './BillingStatusPanel';
import type {
  BillingProviderStatus,
  SubscriptionSnapshot,
  SubscriptionStatus,
} from './billing.types';

const backendStatus: BillingProviderStatus = {
  mode: 'backend',
  isConfigured: true,
  label: 'Billing backend configured',
  detail: 'Subscription state comes from the billing backend.',
};

const localStatus: BillingProviderStatus = {
  mode: 'local-fallback',
  isConfigured: false,
  label: 'Free plan fallback',
  detail: 'Billing backend is not connected.',
};

const createSubscription = (
  status: SubscriptionStatus,
  overrides: Partial<SubscriptionSnapshot> = {}
): SubscriptionSnapshot => ({
  planId: status === 'none' ? 'junior' : 'senior',
  status,
  currentPeriodEnd: '2026-08-01T00:00:00.000Z',
  cancelAtPeriodEnd: false,
  stripeCustomerId: status === 'none' ? null : 'cus_test',
  stripeSubscriptionId: status === 'none' ? null : 'sub_test',
  updatedAt: '2026-07-01T00:00:00.000Z',
  ...overrides,
});

const renderPanel = (subscription: SubscriptionSnapshot, providerStatus = backendStatus) =>
  render(
    <BrowserRouter>
      <BillingStatusPanel
        subscription={subscription}
        providerStatus={providerStatus}
        isLoading={false}
        onUpgrade={vi.fn()}
        onOpenPortal={vi.fn()}
      />
    </BrowserRouter>
  );

describe('BillingStatusPanel', () => {
  it.each([
    {
      name: 'junior',
      subscription: createSubscription('none'),
      statusLabel: 'Free',
      message: 'No paid subscription is active. Free plan limits apply.',
    },
    {
      name: 'active',
      subscription: createSubscription('active'),
      statusLabel: 'Active',
      message: 'Your subscription is active and will renew automatically.',
    },
    {
      name: 'trialing',
      subscription: createSubscription('trialing'),
      statusLabel: 'Trialing',
      message: 'Your trial is active. Paid access continues during the trial.',
    },
    {
      name: 'past due',
      subscription: createSubscription('past_due'),
      statusLabel: 'Payment past due',
      message:
        'Your latest payment failed or is overdue. Open the billing portal to update your payment method.',
    },
    {
      name: 'canceled',
      subscription: createSubscription('canceled'),
      statusLabel: 'Canceled',
      message: 'Your paid subscription is canceled. You can start a new subscription at any time.',
    },
    {
      name: 'cancel at period end',
      subscription: createSubscription('active', {
        cancelAtPeriodEnd: true,
      }),
      statusLabel: 'Cancellation scheduled',
      message: 'Your subscription remains active until the end of the current billing period.',
    },
  ])('shows the $name subscription state', ({ subscription, statusLabel, message }) => {
    renderPanel(subscription);

    expect(screen.getByText(statusLabel, { selector: 'span' })).toBeVisible();
    expect(screen.getByText(message)).toBeVisible();
    expect(screen.getByText('Backend configured')).toBeVisible();
  });

  const renderError = (error: string, errorCode: string | null) =>
    render(
      <BrowserRouter>
        <BillingStatusPanel
          subscription={createSubscription('none')}
          providerStatus={backendStatus}
          isLoading={false}
          onUpgrade={vi.fn()}
          onOpenPortal={vi.fn()}
          error={error}
          errorCode={errorCode}
        />
      </BrowserRouter>
    );

  it('shows an actionable message for an internal audit-logging failure instead of silence', () => {
    renderError('Required audit logging is unavailable.', 'audit_log_unavailable');

    const alert = screen.getByRole('alert');
    expect(alert).toBeVisible();
    expect(alert).toHaveTextContent(/billing could not be started/i);
    expect(alert).not.toHaveTextContent(/audit logging is unavailable/i);
  });

  it('chooses its copy from the error code, not from the words in the message', () => {
    // The same sentence the backend sends for `audit_log_unavailable`, under a
    // different code: matching the wording here is what this panel used to do.
    renderError('Required audit logging is unavailable.', 'billing_provider_unconfigured');

    const alert = screen.getByRole('alert');
    expect(alert).toBeVisible();
    expect(alert).toHaveTextContent('Required audit logging is unavailable.');
    expect(alert).not.toHaveTextContent(/billing could not be started/i);
  });

  it('falls back to the backend message when no code came with the error', () => {
    renderError('Subscription status is temporarily unavailable.', null);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Subscription status is temporarily unavailable.'
    );
  });

  it('names the in-flight checkout state on the Upgrade button', () => {
    render(
      <BrowserRouter>
        <BillingStatusPanel
          subscription={createSubscription('none')}
          providerStatus={backendStatus}
          isLoading
          onUpgrade={vi.fn()}
          onOpenPortal={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /starting checkout/i })).toBeDisabled();
  });

  it('does not present cached paid data as verified in local billing mode', () => {
    renderPanel(createSubscription('active'), localStatus);

    expect(
      screen.getByText(
        'Billing backend is not connected. This is local Free access, not a verified paid subscription.'
      )
    ).toBeVisible();
    expect(screen.getByText('Free entitlements')).toBeVisible();
    expect(screen.getByText('Local billing mode')).toBeVisible();
    expect(screen.getByRole('button', { name: /manage subscription/i })).toBeDisabled();
  });
});
