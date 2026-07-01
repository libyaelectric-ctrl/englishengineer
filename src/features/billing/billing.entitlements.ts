import { BILLING_PLANS } from './billing.helpers';
import {
  BillingFeature,
  BillingPlanId,
  EntitlementResult,
  SubscriptionSnapshot,
} from './billing.types';

const PREMIUM_FEATURES: Partial<Record<BillingFeature, BillingPlanId>> = {
  advancedAnalytics: 'pro',
  fullGamification: 'pro',
  missionCreation: 'pro',
  futureAI: 'pro',
  unlimitedAIFeedback: 'pro',
  cloudSync: 'pro',
  advancedTasks: 'pro',
  teamDashboard: 'enterprise',
  managerExports: 'enterprise',
  teamInvites: 'enterprise',
};

export const isSubscriptionActive = (
  subscription: SubscriptionSnapshot
): boolean =>
  subscription.planId === 'free' ||
  subscription.status === 'active' ||
  subscription.status === 'trialing';

export const canAccessFeature = (
  subscription: SubscriptionSnapshot,
  feature: BillingFeature
): EntitlementResult => {
  const plan = BILLING_PLANS[subscription.planId];
  const requiredPlan = PREMIUM_FEATURES[feature] || null;

  if (!isSubscriptionActive(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: requiredPlan || 'pro',
    };
  }

  if (plan.features.includes(feature)) {
    return {
      allowed: true,
      reason: `${plan.name} includes ${feature}.`,
      requiredPlan: null,
    };
  }

  return {
    allowed: false,
    reason: `${feature} requires ${requiredPlan || 'pro'} access.`,
    requiredPlan: requiredPlan || 'pro',
  };
};

export const canUseAICoach = (
  subscription: SubscriptionSnapshot,
  dailyUsageCount = 0
): EntitlementResult => {
  const baseAccess = canAccessFeature(subscription, 'aiCoach');
  if (!baseAccess.allowed) {
    return baseAccess;
  }

  const limit = BILLING_PLANS[subscription.planId].limits.dailyAICoachRequests;
  if (limit === 'unlimited' || dailyUsageCount < limit) {
    return baseAccess;
  }

  return {
    allowed: false,
    reason: `Free AI Coach limit reached for today. Upgrade to Pro for unlimited coaching.`,
    requiredPlan: 'pro',
  };
};

export const canCreateMission = (
  subscription: SubscriptionSnapshot
): EntitlementResult => canAccessFeature(subscription, 'missionCreation');

export const canViewAdvancedAnalytics = (
  subscription: SubscriptionSnapshot
): EntitlementResult => canAccessFeature(subscription, 'advancedAnalytics');

export const canAccessTeamWorkspace = (
  subscription: SubscriptionSnapshot
): EntitlementResult => canAccessFeature(subscription, 'teamDashboard');

export const getPlanLimitLabel = (
  subscription: SubscriptionSnapshot,
  limit:
    | 'dailyAICoachRequests'
    | 'moduleAttemptsPerDay'
    | 'vocabularyReviewsPerDay'
): string => {
  const value = BILLING_PLANS[subscription.planId].limits[limit];
  return value === 'unlimited' ? 'Unlimited' : String(value);
};
