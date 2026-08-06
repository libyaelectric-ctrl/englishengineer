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

export const canAccessFeature = (
  _subscription: SubscriptionSnapshot,
  _feature: BillingFeature
): EntitlementResult => ({
  allowed: true,
  reason: 'All features are available to all users.',
  requiredPlan: null,
});

export const canUseAICoach = (
  subscription: SubscriptionSnapshot,
  _dailyUsageCount = 0
): EntitlementResult => {
  if (!isSubscriptionActive(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: 'junior',
    };
  }

  return {
    allowed: true,
    reason: 'Unlimited AI Coach access.',
    requiredPlan: null,
  };
};

export const canCreateMission = (subscription: SubscriptionSnapshot): EntitlementResult => {
  if (!isSubscriptionActive(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: 'junior',
    };
  }
  return {
    allowed: true,
    reason: 'Mission creation is available to all users.',
    requiredPlan: null,
  };
};

export const canViewAdvancedAnalytics = (subscription: SubscriptionSnapshot): EntitlementResult => {
  if (!isSubscriptionActive(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: 'junior',
    };
  }
  return {
    allowed: true,
    reason: 'Advanced analytics available to all users.',
    requiredPlan: null,
  };
};

export const canAccessProjectWorkspace = (
  subscription: SubscriptionSnapshot
): EntitlementResult => {
  if (!isSubscriptionActive(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: 'junior',
    };
  }
  return {
    allowed: true,
    reason: 'Project workspace available to all users.',
    requiredPlan: null,
  };
};

export const canAccessPersistentMemory = (
  subscription: SubscriptionSnapshot
): EntitlementResult => {
  if (!isSubscriptionActive(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: 'junior',
    };
  }
  return {
    allowed: true,
    reason: 'Persistent memory available to all users.',
    requiredPlan: null,
  };
};

export const canAccessCustomScenario = (subscription: SubscriptionSnapshot): EntitlementResult => {
  if (!isSubscriptionActive(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: 'junior',
    };
  }
  return {
    allowed: true,
    reason: 'Custom scenario generation available to all users.',
    requiredPlan: null,
  };
};

export const canAccessLinkedInOptimization = (
  subscription: SubscriptionSnapshot
): EntitlementResult => {
  if (!isSubscriptionActive(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: 'junior',
    };
  }
  return {
    allowed: true,
    reason: 'LinkedIn optimization available to all users.',
    requiredPlan: null,
  };
};

export const canAccessPersistentAIAgent = (
  subscription: SubscriptionSnapshot
): EntitlementResult => {
  if (!isSubscriptionActive(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: 'junior',
    };
  }
  return {
    allowed: true,
    reason: 'AI agent available to all users.',
    requiredPlan: null,
  };
};

export const canAccessRealVoiceSpeaking = (
  subscription: SubscriptionSnapshot
): EntitlementResult => {
  if (!isSubscriptionActive(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription is not active.',
      requiredPlan: 'junior',
    };
  }
  return {
    allowed: true,
    reason: 'Voice speaking available to all users.',
    requiredPlan: null,
  };
};

const PLAN_HIERARCHY: BillingPlanId[] = ['junior', 'senior', 'specialist', 'master', 'team'];

const getPlanLevel = (planId: BillingPlanId): number => PLAN_HIERARCHY.indexOf(planId);

export const isDowngrade = (from: BillingPlanId, to: BillingPlanId): boolean =>
  getPlanLevel(to) < getPlanLevel(from);

export interface DowngradeImpact {
  isDowngrade: boolean;
  lostFeatures: never[];
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
  _currentPlanId: BillingPlanId,
  _targetPlanId: BillingPlanId,
  currentWorkspaceCount = 0
): DowngradeImpact => ({
  isDowngrade: false,
  lostFeatures: [],
  restrictedLimits: [],
  workspaceCount: currentWorkspaceCount,
  requiresDataCleanup: false,
  warningMessage: 'All features remain available.',
});

export const getPlanLimitLabel = (
  subscription: SubscriptionSnapshot,
  limit: 'dailyAICoachRequests' | 'moduleAttemptsPerDay' | 'vocabularyReviewsPerDay'
): string => {
  const value = BILLING_PLANS[subscription.planId].limits[limit];
  return value === 'unlimited' ? 'Unlimited' : String(value);
};
