import { BILLING_PLANS } from './billing.helpers';
import {
  BillingFeature,
  BillingPlanId,
  EntitlementResult,
  SubscriptionSnapshot,
} from './billing.types';

export const isSubscriptionActive = (subscription: SubscriptionSnapshot): boolean =>
  subscription.planId === 'junior' ||
  subscription.status === 'active' ||
  subscription.status === 'trialing';

const PLAN_HIERARCHY: BillingPlanId[] = ['junior', 'senior', 'specialist', 'master', 'team'];

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
  if (!isSubscriptionActive(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: 'junior',
    };
  }

  const plan = BILLING_PLANS[subscription.planId];
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
