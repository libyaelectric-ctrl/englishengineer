import { BILLING_PLANS } from './billing.helpers';
import {
  BillingFeature,
  BillingPlanId,
  EntitlementResult,
  SubscriptionSnapshot,
} from './billing.types';

const PREMIUM_FEATURES: Partial<Record<BillingFeature, BillingPlanId>> = {
  advancedAnalytics: 'senior',
  fullGamification: 'junior',
  missionCreation: 'junior',
  futureAI: 'master',
  unlimitedAIFeedback: 'senior',
  cloudSync: 'junior',
  advancedTasks: 'senior',
  projectWorkspace: 'specialist',
  persistentProjectMemory: 'specialist',
  customScenarioGeneration: 'master',
  linkedinOptimization: 'master',
  persistentAIAgent: 'master',
  realVoiceSpeaking: 'specialist',
  pronunciationAnalysis: 'specialist',
  voiceMeetingSimulator: 'specialist',
  voiceMinuteWallet: 'master',
};

export const isSubscriptionActive = (subscription: SubscriptionSnapshot): boolean =>
  subscription.planId === 'junior' ||
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
      requiredPlan: requiredPlan || 'junior',
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
    reason: `${feature} requires ${requiredPlan || 'junior'} access.`,
    requiredPlan: requiredPlan || 'junior',
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

  if (typeof subscription.topupCredits === 'number' && subscription.topupCredits > 0) {
    return {
      allowed: true,
      reason: `Using top-up credits (${subscription.topupCredits} left).`,
      requiredPlan: null,
    };
  }

  return {
    allowed: false,
    reason: `Daily AI Coach limit reached. Upgrade to Senior or purchase top-up credits.`,
    requiredPlan: 'senior',
  };
};

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

const PLAN_HIERARCHY: BillingPlanId[] = ['junior', 'senior', 'specialist', 'master', 'team'];

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

const LIMIT_FIELDS = [
  'dailyAICoachRequests',
  'moduleAttemptsPerDay',
  'vocabularyReviewsPerDay',
  'documentUploadsPerMonth',
] as const;

const getTargetWorkspaceLimit = (targetPlanId: BillingPlanId): number => {
  if (targetPlanId === 'junior') return 1;
  if (targetPlanId === 'senior') return 2;
  if (targetPlanId === 'specialist') return 3;
  if (targetPlanId === 'master') return 5;
  return Infinity;
};

const buildDowngradeWarnings = (
  lostFeatures: BillingFeature[],
  restrictedLimits: DowngradeImpact['restrictedLimits'],
  currentWorkspaceCount: number,
  targetPlanId: BillingPlanId,
  targetWorkspaceLimit: number
): string => {
  const messages: string[] = [];
  if (lostFeatures.length > 0) {
    messages.push(`You will lose access to: ${lostFeatures.join(', ')}.`);
  }
  if (restrictedLimits.length > 0) {
    messages.push(
      `Some limits will be reduced. Your data will be preserved but access may be restricted.`
    );
  }
  if (currentWorkspaceCount > targetWorkspaceLimit) {
    messages.push(
      `You have ${currentWorkspaceCount} workspaces but ${targetPlanId} plan allows ${targetWorkspaceLimit}. Please remove extra workspaces before downgrading.`
    );
  }
  return messages.join(' ');
};

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

  const lostFeatures = currentPlan.features.filter((f) => !targetPlan.features.includes(f));

  const restrictedLimits: DowngradeImpact['restrictedLimits'] = LIMIT_FIELDS.map((field) => ({
    field,
    from: currentPlan.limits[field],
    to: targetPlan.limits[field],
  })).filter((item) => item.from !== item.to);

  const targetWorkspaceLimit = getTargetWorkspaceLimit(targetPlanId);
  const requiresDataCleanup = currentWorkspaceCount > targetWorkspaceLimit;
  const warningMessage = buildDowngradeWarnings(
    lostFeatures,
    restrictedLimits,
    currentWorkspaceCount,
    targetPlanId,
    targetWorkspaceLimit
  );

  return {
    isDowngrade: true,
    lostFeatures,
    restrictedLimits,
    workspaceCount: currentWorkspaceCount,
    requiresDataCleanup,
    warningMessage,
  };
};

export const getPlanLimitLabel = (
  subscription: SubscriptionSnapshot,
  limit: 'dailyAICoachRequests' | 'moduleAttemptsPerDay' | 'vocabularyReviewsPerDay'
): string => {
  const value = BILLING_PLANS[subscription.planId].limits[limit];
  return value === 'unlimited' ? 'Unlimited' : String(value);
};