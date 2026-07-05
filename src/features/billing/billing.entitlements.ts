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
  projectWorkspace: 'project',
  persistentProjectMemory: 'project',
  customScenarioGeneration: 'project',
  linkedinOptimization: 'project',
  persistentAIAgent: 'project',
  realVoiceSpeaking: 'max',
  pronunciationAnalysis: 'max',
  voiceMeetingSimulator: 'max',
  voiceMinuteWallet: 'max',
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

export const canAccessProjectWorkspace = (
  subscription: SubscriptionSnapshot
): EntitlementResult => canAccessFeature(subscription, 'projectWorkspace');

export const canAccessPersistentMemory = (
  subscription: SubscriptionSnapshot
): EntitlementResult =>
  canAccessFeature(subscription, 'persistentProjectMemory');

export const canAccessCustomScenario = (
  subscription: SubscriptionSnapshot
): EntitlementResult =>
  canAccessFeature(subscription, 'customScenarioGeneration');

export const canAccessLinkedInOptimization = (
  subscription: SubscriptionSnapshot
): EntitlementResult => canAccessFeature(subscription, 'linkedinOptimization');

export const canAccessPersistentAIAgent = (
  subscription: SubscriptionSnapshot
): EntitlementResult => canAccessFeature(subscription, 'persistentAIAgent');

export const canAccessRealVoiceSpeaking = (
  subscription: SubscriptionSnapshot
): EntitlementResult => canAccessFeature(subscription, 'realVoiceSpeaking');

const PLAN_HIERARCHY: BillingPlanId[] = ['free', 'pro', 'project', 'max', 'exec', 'private'];

const getPlanLevel = (planId: BillingPlanId): number =>
  PLAN_HIERARCHY.indexOf(planId);

export const isDowngrade = (from: BillingPlanId, to: BillingPlanId): boolean =>
  getPlanLevel(to) < getPlanLevel(from);

export interface DowngradeImpact {
  isDowngrade: boolean;
  lostFeatures: BillingFeature[];
  restrictedLimits: { field: string; from: number | 'unlimited'; to: number | 'unlimited' }[];
  workspaceCount: number;
  requiresDataCleanup: boolean;
  warningMessage: string;
}

export const getDowngradeImpact = (
  currentPlanId: BillingPlanId,
  targetPlanId: BillingPlanId,
  currentWorkspaceCount = 0
): DowngradeImpact => {
  if (!isDowngrade(currentPlanId, targetPlanId)) {
    return {
      isDowngrade: false,
      lostFeatures: [],
      restrictedLimits: [],
      workspaceCount: currentWorkspaceCount,
      requiresDataCleanup: false,
      warningMessage: '',
    };
  }

  const currentPlan = BILLING_PLANS[currentPlanId];
  const targetPlan = BILLING_PLANS[targetPlanId];

  const lostFeatures = currentPlan.features.filter(
    (f) => !targetPlan.features.includes(f)
  );

  const restrictedLimits: DowngradeImpact['restrictedLimits'] = [];
  const limitFields = [
    'dailyAICoachRequests',
    'moduleAttemptsPerDay',
    'vocabularyReviewsPerDay',
    'documentUploadsPerMonth',
  ] as const;

  for (const field of limitFields) {
    const fromVal = currentPlan.limits[field];
    const toVal = targetPlan.limits[field];
    if (fromVal !== toVal) {
      restrictedLimits.push({ field, from: fromVal, to: toVal });
    }
  }

  const targetWorkspaceLimit =
    targetPlanId === 'free' || targetPlanId === 'pro'
      ? 1
      : targetPlanId === 'project'
        ? 3
        : Infinity;
  const requiresDataCleanup = currentWorkspaceCount > targetWorkspaceLimit;

  const messages: string[] = [];
  if (lostFeatures.length > 0) {
    messages.push(
      `You will lose access to: ${lostFeatures.join(', ')}.`
    );
  }
  if (restrictedLimits.length > 0) {
    messages.push(
      `Some limits will be reduced. Your data will be preserved but access may be restricted.`
    );
  }
  if (requiresDataCleanup) {
    messages.push(
      `You have ${currentWorkspaceCount} workspaces but ${targetPlanId} plan allows ${targetWorkspaceLimit}. Please remove extra workspaces before downgrading.`
    );
  }

  return {
    isDowngrade: true,
    lostFeatures,
    restrictedLimits,
    workspaceCount: currentWorkspaceCount,
    requiresDataCleanup,
    warningMessage: messages.join(' '),
  };
};

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
