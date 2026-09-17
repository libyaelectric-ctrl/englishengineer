import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { createFreeSubscription } from '../billing.helpers';
import type { SubscriptionSnapshot } from '../billing.types';
import { BillingUpgradeCTA } from './BillingUpgradeCTA';

const withState = (
  planId: SubscriptionSnapshot['planId'],
  status: SubscriptionSnapshot['status']
): SubscriptionSnapshot => ({ ...createFreeSubscription(), planId, status });

const renderCta = (subscription: SubscriptionSnapshot) => {
  render(
    <MemoryRouter>
      <BillingUpgradeCTA subscription={subscription} />
    </MemoryRouter>
  );
  return screen.getByRole('link');
};

describe('the upgrade CTA takes its wording from the shared rule', () => {
  it('says "Upgrade Plan" to a paid plan that lapsed, exactly as the panel beside it does', () => {
    // Measured before this change: the panel offered this customer "Upgrade Plan" while
    // this control, asking its own question, said "Change / Upgrade Plan" on the same page.
    expect(renderCta(withState('senior', 'canceled')).textContent?.trim()).toBe('Upgrade Plan');
  });

  it('says "Change / Upgrade Plan" only while paid access is in force', () => {
    expect(renderCta(withState('senior', 'active')).textContent?.trim()).toBe(
      'Change / Upgrade Plan'
    );
  });

  it('says "Upgrade Plan" on the free tier', () => {
    expect(renderCta(createFreeSubscription()).textContent?.trim()).toBe('Upgrade Plan');
  });

  it('points at the plan list in every case', () => {
    expect(renderCta(withState('senior', 'past_due'))).toHaveAttribute('href', '/pricing');
  });
});
