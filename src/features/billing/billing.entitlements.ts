import { BILLING_PLANS } from './billing.helpers';
import {
  BillingFeature,
  BillingPlanId,
  EntitlementResult,
  SubscriptionSnapshot,
} from './billing.types';

export const isSubscriptionActive = (subscription: SubscriptionSnapshot): boolean =>
  subscription.planId === 'free' ||
  subscription.status === 'active' ||
  subscription.status === 'trialing';

const PLAN_HIERARCHY: BillingPlanId[] = [
  'free',
  'junior',
  'senior',
  'specialist',
  'master',
  'team',
];

const findMinimumPlanForFeature = (feature: BillingFeature): BillingPlanId | null => {
  for (const planId of PLAN_HIERARCHY) {
    if (BILLING_PLANS[planId].features.includes(feature)) return planId;
  }
  return null;
};

export const canAccessFeature = (
  subscription: SubscriptionSnapshot,
  feature: BillingFeature
): EntitlementResult => {
  const active = isSubscriptionActive(subscription);
  const plan = BILLING_PLANS[subscription.planId];

  // Inactive/canceled/past-due subscriptions degrade to the free tier: free
  // features must never disappear entirely just because a paid plan lapsed.
  if (!active) {
    if (BILLING_PLANS.free.features.includes(feature)) {
      return {
        allowed: true,
        reason: `Included in the ${BILLING_PLANS.free.name} plan.`,
        requiredPlan: null,
      };
    }
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: findMinimumPlanForFeature(feature),
    };
  }

  // Active subscription (or free tier, which is always active): a free-tier
  // snapshot must never unlock paid features, even when its planId is the
  // legacy 'junior' marker.
  if (isFreeTier(subscription)) {
    if (BILLING_PLANS.free.features.includes(feature)) {
      return {
        allowed: true,
        reason: `Included in the ${BILLING_PLANS.free.name} plan.`,
        requiredPlan: null,
      };
    }
    const requiredPlan = findMinimumPlanForFeature(feature);
    return {
      allowed: false,
      reason: requiredPlan
        ? `This feature requires the ${BILLING_PLANS[requiredPlan].name} plan or higher.`
        : 'This feature is not currently available on any plan.',
      requiredPlan,
    };
  }

  if (plan.features.includes(feature)) {
    return {
      allowed: true,
      reason: `Included in the ${plan.name} plan.`,
      requiredPlan: null,
    };
  }

  const requiredPlan = findMinimumPlanForFeature(feature);
  return {
    allowed: false,
    reason: requiredPlan
      ? `This feature requires the ${BILLING_PLANS[requiredPlan].name} plan or higher.`
      : 'This feature is not currently available on any plan.',
    requiredPlan,
  };
};

/**
 * True when the user is on the free tier (plan 'free', or the legacy
 * 'junior' + status 'none' fallback the app used before 'free' existed).
 */
export const isFreeTier = (subscription: SubscriptionSnapshot): boolean =>
  subscription.planId === 'free' ||
  (subscription.planId === 'junior' && subscription.status === 'none');

export type FreeTierPreviewScope = 'firstGrammarModule' | 'firstVocabularyBatch';

export interface FreeTierPreview {
  limited: boolean;
  scope: FreeTierPreviewScope | null;
}

/**
 * Features where the free tier gets a limited preview instead of full
 * access: Grammar shows only the first module, Vocabulary only the first
 * page. Single source of truth for partial free-tier unlocks — the route
 * guard (URL protection) and the page hooks both read this, so the limit
 * policy lives in exactly one place.
 */
export const FREE_TIER_PREVIEW_LIMITS: Partial<Record<BillingFeature, FreeTierPreviewScope>> = {
  grammar: 'firstGrammarModule',
  vocabulary: 'firstVocabularyBatch',
};

export const getFreeTierPreview = (
  subscription: SubscriptionSnapshot,
  feature: BillingFeature
): FreeTierPreview => {
  if (!isFreeTier(subscription)) return { limited: false, scope: null };
  const scope = FREE_TIER_PREVIEW_LIMITS[feature];
  return scope ? { limited: true, scope } : { limited: false, scope: null };
};

export const canUseAICoach = (
  subscription: SubscriptionSnapshot,
  _dailyUsageCount = 0
): EntitlementResult => canAccessFeature(subscription, 'aiCoach');

export const canCreateMission = (subscription: SubscriptionSnapshot): EntitlementResult =>
  canAccessFeature(subscription, 'missionCreation');

export const canViewAdvancedAnalytics = (subscription: SubscriptionSnapshot): EntitlementResult =>
  canAccessFeature(subscription, 'advancedAnalytics');

export const canAccessProjectWorkspace = (subscription: SubscriptionSnapshot): EntitlementResult =>
  canAccessFeature(subscription, 'projectWorkspace');

export const canAccessPersistentMemory = (subscription: SubscriptionSnapshot): EntitlementResult =>
  canAccessFeature(subscription, 'persistentProjectMemory');

export const canAccessCustomScenario = (subscription: SubscriptionSnapshot): EntitlementResult =>
  canAccessFeature(subscription, 'customScenarioGeneration');

export const canAccessLinkedInOptimization = (
  subscription: SubscriptionSnapshot
): EntitlementResult => canAccessFeature(subscription, 'linkedinOptimization');

export const canAccessPersistentAIAgent = (subscription: SubscriptionSnapshot): EntitlementResult =>
  canAccessFeature(subscription, 'persistentAIAgent');

export const canAccessRealVoiceSpeaking = (subscription: SubscriptionSnapshot): EntitlementResult =>
  canAccessFeature(subscription, 'realVoiceSpeaking');

const getPlanLevel = (planId: BillingPlanId): number => PLAN_HIERARCHY.indexOf(planId);

export const isDowngrade = (from: BillingPlanId, to: BillingPlanId): boolean =>
  getPlanLevel(to) < getPlanLevel(from);

export interface DowngradeImpact {
  isDowngrade: boolean;
  lostFeatures: BillingFeature[];
  restrictedLimits: {
    field: string;
    from: number | 'unlimited';
    to: number | 'unlimited';
  }[];
  workspaceCount: number;
  requiresDataCleanup: boolean;
  warningMessage: string;
}

export const getDowngradeImpact = (
  currentPlanId: BillingPlanId,
  targetPlanId: BillingPlanId,
  currentWorkspaceCount = 0
): DowngradeImpact => {
  const downgrading = isDowngrade(currentPlanId, targetPlanId);
  if (!downgrading) {
    return {
      isDowngrade: false,
      lostFeatures: [],
      restrictedLimits: [],
      workspaceCount: currentWorkspaceCount,
      requiresDataCleanup: false,
      warningMessage: 'All features remain available.',
    };
  }

  const currentFeatures = BILLING_PLANS[currentPlanId].features;
  const targetFeatures = BILLING_PLANS[targetPlanId].features;
  const lostFeatures = currentFeatures.filter((f) => !targetFeatures.includes(f));

  const limitFields: (
    'dailyAICoachRequests' | 'moduleAttemptsPerDay' | 'vocabularyReviewsPerDay'
  )[] = ['dailyAICoachRequests', 'moduleAttemptsPerDay', 'vocabularyReviewsPerDay'];
  const restrictedLimits = limitFields
    .map((field) => ({
      field,
      from: BILLING_PLANS[currentPlanId].limits[field],
      to: BILLING_PLANS[targetPlanId].limits[field],
    }))
    .filter(
      ({ from, to }) =>
        (from === 'unlimited' && to !== 'unlimited') ||
        (typeof from === 'number' && typeof to === 'number' && to < from)
    );

  const requiresDataCleanup =
    lostFeatures.includes('projectWorkspace') && currentWorkspaceCount > 0;

  return {
    isDowngrade: true,
    lostFeatures,
    restrictedLimits,
    workspaceCount: currentWorkspaceCount,
    requiresDataCleanup,
    warningMessage:
      lostFeatures.length > 0
        ? `Downgrading to ${BILLING_PLANS[targetPlanId].name} will remove access to: ${lostFeatures.join(', ')}.`
        : 'No feature access will be lost, but some limits may be reduced.',
  };
};

export const getPlanLimitLabel = (
  subscription: SubscriptionSnapshot,
  limit: 'dailyAICoachRequests' | 'moduleAttemptsPerDay' | 'vocabularyReviewsPerDay'
): string => {
  const value = BILLING_PLANS[subscription.planId].limits[limit];
  return value === 'unlimited' ? 'Unlimited' : String(value);
};
