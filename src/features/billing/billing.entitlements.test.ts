// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  canAccessFeature,
  canAccessProjectWorkspace,
  canCreateMission,
  canUseAICoach,
  canViewAdvancedAnalytics,
  getDowngradeImpact,
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

const withPlan = (planId: SubscriptionSnapshot['planId']): SubscriptionSnapshot => ({
  ...proSubscription,
  planId,
});

describe('billing entitlements', () => {
  it('treats free subscription as active fallback', () => {
    expect(isSubscriptionActive(createFreeSubscription())).toBe(true);
  });

  it('distinguishes the free tier from a paid Junior plan', () => {
    const free = createFreeSubscription();
    const paidJunior = { ...withPlan('junior'), status: 'active' as const };

    // Free tier: core vocabulary/grammar + analytics, but no placement test
    // and nothing paid.
    expect(canAccessFeature(free, 'vocabulary').allowed).toBe(true);
    expect(canAccessFeature(free, 'grammar').allowed).toBe(true);
    expect(canAccessFeature(free, 'placementTest').allowed).toBe(false);
    expect(canAccessFeature(free, 'learningHub').allowed).toBe(false);
    expect(canAccessFeature(free, 'reading').allowed).toBe(false);

    // Paid Junior unlocks the placement test.
    expect(canAccessFeature(paidJunior, 'placementTest').allowed).toBe(true);
    expect(canAccessFeature(paidJunior, 'learningHub').allowed).toBe(true);
    expect(canAccessFeature(paidJunior, 'reading').allowed).toBe(false);
  });

  it('blocks inactive paid subscription', () => {
    expect(isSubscriptionActive({ ...proSubscription, status: 'canceled' })).toBe(false);
  });

  describe('plan-based feature gating (cumulative tiers)', () => {
    it('gives Junior only the base modules', () => {
      const junior = { ...createFreeSubscription(), planId: 'junior' as const };
      expect(canAccessFeature(junior, 'vocabulary').allowed).toBe(true);
      expect(canAccessFeature(junior, 'grammar').allowed).toBe(true);
      expect(canAccessFeature(junior, 'placementTest').allowed).toBe(true);
      expect(canAccessFeature(junior, 'reading').allowed).toBe(false);
      expect(canAccessFeature(junior, 'writing').allowed).toBe(false);
      expect(canAccessFeature(junior, 'speaking').allowed).toBe(false);
      expect(canAccessFeature(junior, 'aiCoach').allowed).toBe(false);
    });

    it('adds Translator, Reading and Writing at Senior', () => {
      const senior = withPlan('senior');
      expect(canAccessFeature(senior, 'vocabulary').allowed).toBe(true);
      expect(canAccessFeature(senior, 'translator').allowed).toBe(true);
      expect(canAccessFeature(senior, 'reading').allowed).toBe(true);
      expect(canAccessFeature(senior, 'writing').allowed).toBe(true);
      expect(canAccessFeature(senior, 'speaking').allowed).toBe(false);
      expect(canAccessFeature(senior, 'aiCoach').allowed).toBe(false);
    });

    it('adds Speaking and Listening at Specialist', () => {
      const specialist = withPlan('specialist');
      expect(canAccessFeature(specialist, 'speaking').allowed).toBe(true);
      expect(canAccessFeature(specialist, 'listening').allowed).toBe(true);
      expect(canAccessFeature(specialist, 'realVoiceSpeaking').allowed).toBe(true);
      expect(canAccessFeature(specialist, 'aiCoach').allowed).toBe(false);
      expect(canAccessFeature(specialist, 'projectWorkspace').allowed).toBe(false);
    });

    it('unlocks Tool and AI Copilot only at Master', () => {
      const master = withPlan('master');
      expect(canAccessFeature(master, 'aiCoach').allowed).toBe(true);
      expect(canAccessFeature(master, 'advancedTasks').allowed).toBe(true);
      expect(canAccessFeature(master, 'projectWorkspace').allowed).toBe(true);
      expect(canAccessFeature(master, 'linkedinOptimization').allowed).toBe(true);
    });

    it('reports the minimum required plan when blocked', () => {
      const junior = { ...createFreeSubscription(), planId: 'junior' as const };
      const result = canAccessFeature(junior, 'aiCoach');
      expect(result.allowed).toBe(false);
      expect(result.requiredPlan).toBe('master');
    });

    it('blocks every feature for an inactive subscription', () => {
      const canceled = { ...withPlan('master'), status: 'canceled' as const };
      expect(canAccessFeature(canceled, 'vocabulary').allowed).toBe(false);
      expect(canAccessFeature(canceled, 'vocabulary').requiredPlan).toBe('free');
    });
  });

  it('delegates canViewAdvancedAnalytics to the Master tier', () => {
    expect(canViewAdvancedAnalytics(createFreeSubscription()).allowed).toBe(false);
    expect(canViewAdvancedAnalytics(withPlan('master')).allowed).toBe(true);
  });

  it('delegates canUseAICoach to the Master tier', () => {
    expect(canUseAICoach(createFreeSubscription(), 100).allowed).toBe(false);
    expect(canUseAICoach(withPlan('master'), 1000).allowed).toBe(true);
  });

  it('delegates canCreateMission to the Master tier', () => {
    expect(canCreateMission(createFreeSubscription()).allowed).toBe(false);
    expect(canCreateMission(withPlan('master')).allowed).toBe(true);
  });

  it('delegates canAccessProjectWorkspace to the Master tier', () => {
    expect(canAccessProjectWorkspace(createFreeSubscription()).allowed).toBe(false);
    expect(canAccessProjectWorkspace(withPlan('master')).allowed).toBe(true);
  });

  it('formats plan limits per tier instead of always unlimited', () => {
    expect(getPlanLimitLabel(createFreeSubscription(), 'dailyAICoachRequests')).toBe('0');
    expect(getPlanLimitLabel(withPlan('master'), 'dailyAICoachRequests')).toBe('Unlimited');
  });

  describe('downgrade impact', () => {
    it('reports no impact when not downgrading', () => {
      const impact = getDowngradeImpact('junior', 'master');
      expect(impact.isDowngrade).toBe(false);
      expect(impact.lostFeatures).toEqual([]);
    });

    it('lists lost features when downgrading from Master to Junior', () => {
      const impact = getDowngradeImpact('master', 'junior');
      expect(impact.isDowngrade).toBe(true);
      expect(impact.lostFeatures).toContain('aiCoach');
      expect(impact.lostFeatures).toContain('speaking');
      expect(impact.warningMessage).toMatch(/Junior/);
    });

    it('flags data cleanup when losing project workspace with active workspaces', () => {
      const impact = getDowngradeImpact('master', 'junior', 3);
      expect(impact.requiresDataCleanup).toBe(true);
      expect(impact.workspaceCount).toBe(3);
    });
  });
});
