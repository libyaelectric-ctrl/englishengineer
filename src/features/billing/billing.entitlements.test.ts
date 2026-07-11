// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createFreeSubscription } from './billing.helpers';
import {
  canAccessFeature,
  canCreateMission,
  canUseAICoach,
  canAccessProjectWorkspace,
  canViewAdvancedAnalytics,
  getPlanLimitLabel,
  isSubscriptionActive,
} from './billing.entitlements';
import { SubscriptionSnapshot } from './billing.types';

const proSubscription: SubscriptionSnapshot = {
  planId: 'pro',
  status: 'active',
  currentPeriodEnd: '2026-07-26T00:00:00.000Z',
  cancelAtPeriodEnd: false,
  stripeCustomerId: 'cus_1',
  stripeSubscriptionId: 'sub_1',
  updatedAt: '2026-06-26T00:00:00.000Z',
};

describe('billing entitlements', () => {
  it('treats free subscription as active fallback', () => {
    expect(isSubscriptionActive(createFreeSubscription())).toBe(true);
  });

  it('blocks inactive paid subscription', () => {
    expect(
      isSubscriptionActive({ ...proSubscription, status: 'canceled' })
    ).toBe(false);
  });

  it('allows free users to access basic reading feature', () => {
    expect(canAccessFeature(createFreeSubscription(), 'reading').allowed).toBe(
      true
    );
  });

  it('blocks advanced analytics for free users with Pro requirement', () => {
    const result = canViewAdvancedAnalytics(createFreeSubscription());
    expect(result.allowed).toBe(false);
    expect(result.requiredPlan).toBe('pro');
  });

  it('allows advanced analytics for Pro users', () => {
    expect(canViewAdvancedAnalytics(proSubscription).allowed).toBe(true);
  });

  it('enforces free AI Coach daily limit', () => {
    expect(canUseAICoach(createFreeSubscription(), 3)).toMatchObject({
      allowed: false,
      requiredPlan: 'pro',
    });
  });

  it('allows Pro unlimited AI Coach usage', () => {
    expect(canUseAICoach(proSubscription, 50).allowed).toBe(true);
  });

  it('blocks mission creation for free users', () => {
    expect(canCreateMission(createFreeSubscription()).allowed).toBe(false);
  });

  it('formats plan limits for display', () => {
    expect(
      getPlanLimitLabel(createFreeSubscription(), 'dailyAICoachRequests')
    ).toBe('3');
    expect(getPlanLimitLabel(proSubscription, 'dailyAICoachRequests')).toBe(
      'Unlimited'
    );
  });

  it('keeps project workspace behind the Project entitlement', () => {
    expect(canAccessProjectWorkspace(createFreeSubscription())).toMatchObject({
      allowed: false,
      requiredPlan: 'project',
    });
    expect(
      canAccessProjectWorkspace({ ...proSubscription, planId: 'project' })
        .allowed
    ).toBe(true);
  });
});
