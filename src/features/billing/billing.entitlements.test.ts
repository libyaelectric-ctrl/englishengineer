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

  it('allows all features for all users', () => {
    expect(canAccessFeature(createFreeSubscription(), 'reading').allowed).toBe(true);
    expect(canAccessFeature(createFreeSubscription(), 'writing').allowed).toBe(true);
    expect(canAccessFeature(createFreeSubscription(), 'listening').allowed).toBe(true);
    expect(canAccessFeature(createFreeSubscription(), 'speaking').allowed).toBe(true);
    expect(canAccessFeature(createFreeSubscription(), 'vocabulary').allowed).toBe(true);
  });

  it('allows advanced analytics for all users', () => {
    const result = canViewAdvancedAnalytics(createFreeSubscription());
    expect(result.allowed).toBe(true);
  });

  it('allows unlimited AI Coach for all users', () => {
    expect(canUseAICoach(createFreeSubscription(), 100).allowed).toBe(true);
    expect(canUseAICoach(proSubscription, 1000).allowed).toBe(true);
  });

  it('allows mission creation for all users', () => {
    expect(canCreateMission(createFreeSubscription()).allowed).toBe(true);
  });

  it('formats plan limits as unlimited', () => {
    expect(getPlanLimitLabel(createFreeSubscription(), 'dailyAICoachRequests')).toBe('Unlimited');
    expect(getPlanLimitLabel(proSubscription, 'dailyAICoachRequests')).toBe('Unlimited');
  });

  it('allows project workspace for all users', () => {
    expect(canAccessProjectWorkspace(createFreeSubscription()).allowed).toBe(true);
  });
});