// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  canAccessFeature,
  canAccessProjectWorkspace,
  canCreateMission,
  canUseAICoach,
  canViewAdvancedAnalytics,
  getPlanLimitLabel,
  isSubscriptionActive,
} from './billing.entitlements';
import { createFreeSubscription } from './billing.helpers';
import { SubscriptionSnapshot } from './billing.types';

const proSubscription: SubscriptionSnapshot = {
  planId: 'senior',
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
    expect(isSubscriptionActive({ ...proSubscription, status: 'canceled' })).toBe(false);
  });

  it('allows free users to access basic reading feature', () => {
    expect(canAccessFeature(createFreeSubscription(), 'reading').allowed).toBe(true);
  });

  it('blocks advanced analytics for free users with Pro requirement', () => {
    const result = canViewAdvancedAnalytics(createFreeSubscription());
    expect(result.allowed).toBe(false);
    expect(result.requiredPlan).toBe('senior');
  });

  it('allows advanced analytics for Pro users', () => {
    expect(canViewAdvancedAnalytics(proSubscription).allowed).toBe(true);
  });

  it('enforces junior AI Coach daily limit', () => {
    expect(canUseAICoach(createFreeSubscription(), 3)).toMatchObject({
      allowed: false,
      requiredPlan: 'senior',
    });
  });

  it('enforces senior AI Coach daily limit', () => {
    expect(canUseAICoach(proSubscription, 10).allowed).toBe(true);
    expect(canUseAICoach(proSubscription, 15).allowed).toBe(false);
  });

  it('allows mission creation for junior users', () => {
    expect(canCreateMission(createFreeSubscription()).allowed).toBe(true);
  });

  it('formats plan limits for display', () => {
    expect(getPlanLimitLabel(createFreeSubscription(), 'dailyAICoachRequests')).toBe('3');
    expect(getPlanLimitLabel(proSubscription, 'dailyAICoachRequests')).toBe('15');
  });

  it('keeps project workspace behind the Project entitlement', () => {
    expect(canAccessProjectWorkspace(createFreeSubscription())).toMatchObject({
      allowed: false,
      requiredPlan: 'specialist',
    });
    expect(canAccessProjectWorkspace({ ...proSubscription, planId: 'specialist' }).allowed).toBe(true);
  });
});
