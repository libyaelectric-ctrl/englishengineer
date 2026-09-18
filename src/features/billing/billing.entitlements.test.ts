// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  canAccessFeature,
  canAccessProjectWorkspace,
  canCreateMission,
  canOpenCustomerPortal,
  canUseAICoach,
  canViewAdvancedAnalytics,
  getDowngradeImpact,
  getFreeTierPreview,
  getPlanLimitLabel,
  hasActivePaidAccess,
  isSubscriptionActive,
} from './billing.entitlements';
import { BILLING_PLANS, createFreeSubscription, resolvePlan } from './billing.helpers';
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

  describe('hasActivePaidAccess', () => {
    const withStatus = (status: SubscriptionSnapshot['status']): SubscriptionSnapshot => ({
      ...proSubscription,
      status,
    });

    it('is true while a paid plan is active or trialing', () => {
      for (const status of ['active', 'trialing'] as const) {
        expect(hasActivePaidAccess(withStatus(status))).toBe(true);
      }
    });

    it('is false for a paid plan that lapsed, so the customer keeps a route back', () => {
      // The states a churned customer sits in. Answering this question differently on the
      // billing page and the profile page is what hid the upgrade control from exactly
      // these customers on one of the two surfaces.
      for (const status of ['canceled', 'past_due', 'unpaid', 'incomplete'] as const) {
        expect(hasActivePaidAccess(withStatus(status))).toBe(false);
      }
    });

    it('is false for both free-tier shapes', () => {
      expect(hasActivePaidAccess(createFreeSubscription())).toBe(false);
      expect(hasActivePaidAccess({ ...proSubscription, planId: 'junior', status: 'none' })).toBe(
        false
      );
    });
  });

  describe('resolvePlan', () => {
    it('answers with the catalogue entry for every id the catalogue knows', () => {
      for (const planId of ['free', 'junior', 'senior', 'specialist', 'master'] as const) {
        expect(resolvePlan(planId)).toBe(BILLING_PLANS[planId]);
      }
    });

    it('resolves an id outside the catalogue instead of handing back undefined', () => {
      // `team` is a canonical plan id on the backend, which has no entry here, and nothing
      // validates the plan id on its way in — so every lookup has to resolve to a plan.
      for (const unknownId of ['team', 'orbit', '']) {
        expect(resolvePlan(unknownId)).toBe(BILLING_PLANS.free);
      }
    });

    it('answers inherited object keys with the fallback, not with Object.prototype', () => {
      // The catalogue is an object literal, so a raw lookup answers `__proto__`, `toString`
      // and friends from the prototype chain; those came back as if they were plans.
      for (const inherited of ['__proto__', 'toString', 'constructor', 'hasOwnProperty']) {
        expect(resolvePlan(inherited)).toBe(BILLING_PLANS.free);
      }
    });
  });

  describe('canOpenCustomerPortal', () => {
    const configured = { isConfigured: true };
    const unconfigured = { isConfigured: false };

    it('is true only when the provider is configured and a customer is linked', () => {
      expect(canOpenCustomerPortal(proSubscription, configured)).toBe(true);
    });

    it('is false without a linked customer, configured or not', () => {
      const noCustomer = { ...proSubscription, stripeCustomerId: null };
      expect(canOpenCustomerPortal(noCustomer, configured)).toBe(false);
      expect(canOpenCustomerPortal(noCustomer, unconfigured)).toBe(false);
    });

    it('is false when the provider is not configured, however the account looks', () => {
      expect(canOpenCustomerPortal(proSubscription, unconfigured)).toBe(false);
      expect(canOpenCustomerPortal(createFreeSubscription(), unconfigured)).toBe(false);
    });
  });

  describe('free-tier preview limits (Grammar first module, Vocabulary first page)', () => {
    it('gives the free tier a limited Grammar preview', () => {
      const free = createFreeSubscription();
      expect(getFreeTierPreview(free, 'grammar')).toEqual({
        limited: true,
        scope: 'firstGrammarModule',
      });
      expect(getFreeTierPreview(free, 'vocabulary')).toEqual({
        limited: true,
        scope: 'firstVocabularyBatch',
      });
      // Features without a preview stay fully locked on the free tier.
      expect(getFreeTierPreview(free, 'reading').limited).toBe(false);
      expect(getFreeTierPreview(free, 'reading').scope).toBe(null);
    });

    it('gives the legacy junior+none tier the same previews', () => {
      const junior = { ...createFreeSubscription(), planId: 'junior' as const };
      expect(getFreeTierPreview(junior, 'grammar').limited).toBe(true);
      expect(getFreeTierPreview(junior, 'vocabulary').limited).toBe(true);
    });

    it('does not limit paid subscribers', () => {
      expect(getFreeTierPreview(withPlan('master'), 'grammar').limited).toBe(false);
      expect(getFreeTierPreview(withPlan('master'), 'vocabulary').limited).toBe(false);
      expect(getFreeTierPreview(withPlan('master'), 'grammar').scope).toBe(null);
    });
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
    it('gives the legacy junior+none (free tier) only the base modules', () => {
      const junior = { ...createFreeSubscription(), planId: 'junior' as const };
      expect(canAccessFeature(junior, 'vocabulary').allowed).toBe(true);
      expect(canAccessFeature(junior, 'grammar').allowed).toBe(true);
      expect(canAccessFeature(junior, 'placementTest').allowed).toBe(false);
      expect(canAccessFeature(junior, 'learningHub').allowed).toBe(false);
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

    it('degrades an inactive subscription to the free tier instead of locking everything', () => {
      const canceled = { ...withPlan('master'), status: 'canceled' as const };
      expect(canAccessFeature(canceled, 'vocabulary').allowed).toBe(true);
      expect(canAccessFeature(canceled, 'vocabulary').requiredPlan).toBe(null);
      expect(canAccessFeature(canceled, 'placementTest').allowed).toBe(false);
    });
  });

  it('delegates canViewAdvancedAnalytics to the Master tier', () => {
    expect(canViewAdvancedAnalytics(createFreeSubscription()).allowed).toBe(false);
    expect(canViewAdvancedAnalytics(withPlan('master')).allowed).toBe(true);
  });

  it('delegates canUseAICoach to the Master tier', () => {
    expect(canUseAICoach(createFreeSubscription()).allowed).toBe(false);
    expect(canUseAICoach(withPlan('master')).allowed).toBe(true);
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
