import {
  BillingPlan,
  BillingPlanId,
  BillingProviderStatus,
  BillingStatusPresentation,
  SubscriptionSnapshot,
} from './billing.types';
import { isConfiguredPublicUrl } from '@/config/environment.config';

interface BillingEnv {
  VITE_BILLING_API_URL?: string;
}

interface ImportMetaWithBillingEnv {
  env?: BillingEnv;
}

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Limited EngVox access for evaluation and learning warm-up.',
    isFutureReady: false,
    features: [
      'reading',
      'writing',
      'listening',
      'speaking',
      'vocabulary',
      'aiCoach',
      'analytics',
      'gamification',
    ],
    limits: {
      dailyAICoachRequests: 1,
      moduleAttemptsPerDay: 1,
      vocabularyReviewsPerDay: 5,
      documentUploadsPerMonth: 0,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description:
      'Unlimited individual learning with AI writing feedback and mistake logs.',
    isFutureReady: false,
    features: [
      'reading',
      'writing',
      'listening',
      'speaking',
      'vocabulary',
      'aiCoach',
      'analytics',
      'advancedAnalytics',
      'gamification',
      'fullGamification',
      'missionCreation',
      'futureAI',
      'unlimitedAIFeedback',
      'cloudSync',
      'advancedTasks',
    ],
    limits: {
      dailyAICoachRequests: 10,
      moduleAttemptsPerDay: 10,
      vocabularyReviewsPerDay: 10,
      documentUploadsPerMonth: 2,
    },
  },
  project: {
    id: 'project',
    name: 'Project',
    description:
      'Collaborative workspaces, persistent memory, and LinkedIn tools.',
    isFutureReady: false,
    features: [
      'reading',
      'writing',
      'listening',
      'speaking',
      'vocabulary',
      'aiCoach',
      'analytics',
      'advancedAnalytics',
      'gamification',
      'fullGamification',
      'missionCreation',
      'futureAI',
      'unlimitedAIFeedback',
      'cloudSync',
      'advancedTasks',
      'projectWorkspace',
      'persistentProjectMemory',
      'customScenarioGeneration',
      'linkedinOptimization',
      'persistentAIAgent',
    ],
    limits: {
      dailyAICoachRequests: 'unlimited',
      moduleAttemptsPerDay: 'unlimited',
      vocabularyReviewsPerDay: 'unlimited',
      documentUploadsPerMonth: 20,
    },
  },

  exec: {
    id: 'exec',
    name: 'Exec',
    description:
      'Dedicated executive coaching, offline audio, and priority slots.',
    isFutureReady: false,
    features: [
      'reading',
      'writing',
      'listening',
      'speaking',
      'vocabulary',
      'aiCoach',
      'analytics',
      'advancedAnalytics',
      'gamification',
      'fullGamification',
      'missionCreation',
      'futureAI',
      'unlimitedAIFeedback',
      'cloudSync',
      'advancedTasks',
      'projectWorkspace',
      'persistentProjectMemory',
      'customScenarioGeneration',
      'linkedinOptimization',
      'persistentAIAgent',
      'realVoiceSpeaking',
      'pronunciationAnalysis',
      'voiceMeetingSimulator',
      'voiceMinuteWallet',
    ],
    limits: {
      dailyAICoachRequests: 'unlimited',
      moduleAttemptsPerDay: 'unlimited',
      vocabularyReviewsPerDay: 'unlimited',
      documentUploadsPerMonth: 'unlimited',
    },
  },
  private: {
    id: 'private',
    name: 'Private',
    description:
      'Ultimate personalized English training and dedicated private proxy.',
    isFutureReady: true,
    features: [
      'reading',
      'writing',
      'listening',
      'speaking',
      'vocabulary',
      'aiCoach',
      'analytics',
      'advancedAnalytics',
      'gamification',
      'fullGamification',
      'missionCreation',
      'futureAI',
      'unlimitedAIFeedback',
      'cloudSync',
      'advancedTasks',
      'projectWorkspace',
      'persistentProjectMemory',
      'customScenarioGeneration',
      'linkedinOptimization',
      'persistentAIAgent',
      'realVoiceSpeaking',
      'pronunciationAnalysis',
      'voiceMeetingSimulator',
      'voiceMinuteWallet',
    ],
    limits: {
      dailyAICoachRequests: 'unlimited',
      moduleAttemptsPerDay: 'unlimited',
      vocabularyReviewsPerDay: 'unlimited',
      documentUploadsPerMonth: 'unlimited',
    },
  },
};

export const createFreeSubscription = (): SubscriptionSnapshot => ({
  planId: 'free',
  status: 'none',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  updatedAt: new Date().toISOString(),
});

export const getBillingApiUrl = (): string | null => {
  const env = (import.meta as unknown as ImportMetaWithBillingEnv).env;
  const value = env?.VITE_BILLING_API_URL?.trim();
  return isConfiguredPublicUrl(value)
    ? value?.replace(/\/$/, '') || null
    : null;
};

export const getBillingProviderStatus = (): BillingProviderStatus => {
  const apiUrl = getBillingApiUrl();
  if (!apiUrl) {
    return {
      mode: 'local-fallback',
      isConfigured: false,
      label: 'Free plan fallback',
      detail:
        'Billing backend is not connected. Stripe actions require VITE_BILLING_API_URL.',
    };
  }

  return {
    mode: 'backend',
    isConfigured: true,
    label: 'Billing backend configured',
    detail:
      'Checkout, customer portal and subscription status are delegated to the backend.',
  };
};

export const formatRenewalDate = (isoDate: string | null): string => {
  if (!isoDate) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(isoDate));
};

const isCancellationPending = (sub: SubscriptionSnapshot) =>
  sub.cancelAtPeriodEnd &&
  (sub.status === 'active' || sub.status === 'trialing');

export const getBillingStatusPresentation = (
  subscription: SubscriptionSnapshot,
  providerStatus: BillingProviderStatus
): BillingStatusPresentation => {
  if (!providerStatus.isConfigured) {
    return {
      planId: 'free',
      planLabel: 'Free',
      statusLabel: 'Local free access',
      statusTone: 'warning',
      message:
        'Billing backend is not connected. This is local Free access, not a verified paid subscription.',
      entitlementLabel: 'Free entitlements only',
      entitlementTone: 'neutral',
      periodLabel: 'Renewal',
      periodValue: 'Not scheduled',
      isBackendVerified: false,
    };
  }

  const plan = BILLING_PLANS[subscription.planId];
  const periodValue = formatRenewalDate(subscription.currentPeriodEnd);

  if (isCancellationPending(subscription)) {
    return {
      planId: subscription.planId,
      planLabel: plan.name,
      statusLabel: 'Cancellation scheduled',
      statusTone: 'warning',
      message:
        'Your subscription remains active until the end of the current billing period.',
      entitlementLabel: `${plan.name} entitlements active until period end`,
      entitlementTone: 'success',
      periodLabel: 'Access until',
      periodValue,
      isBackendVerified: true,
    };
  }

  const base = {
    planId: subscription.planId,
    planLabel: plan.name,
    periodValue,
    isBackendVerified: true,
  } as const;

  switch (subscription.status) {
    case 'active':
      return {
        ...base,
        statusLabel: 'Active',
        statusTone: 'success',
        message: 'Your subscription is active and will renew automatically.',
        entitlementLabel: `${plan.name} entitlements active`,
        entitlementTone: 'success',
        periodLabel: 'Renews on',
      };
    case 'trialing':
      return {
        ...base,
        statusLabel: 'Trialing',
        statusTone: 'info',
        message:
          'Your trial is active. Paid access continues during the trial.',
        entitlementLabel: `${plan.name} trial entitlements active`,
        entitlementTone: 'info',
        periodLabel: 'Trial ends',
      };
    case 'past_due':
      return {
        ...base,
        statusLabel: 'Payment past due',
        statusTone: 'danger',
        message:
          'Your latest payment failed or is overdue. Open the billing portal to update your payment method.',
        entitlementLabel: 'Paid entitlements restricted',
        entitlementTone: 'danger',
        periodLabel: 'Billing period',
      };
    case 'canceled':
      return {
        ...base,
        statusLabel: 'Canceled',
        statusTone: 'neutral',
        message:
          'Your paid subscription is canceled. You can start a new subscription at any time.',
        entitlementLabel: 'Paid entitlements inactive',
        entitlementTone: 'neutral',
        periodLabel: 'Ended on',
      };
    case 'incomplete':
      return {
        ...base,
        statusLabel: 'Payment incomplete',
        statusTone: 'warning',
        message:
          'Subscription setup is incomplete. Complete payment before paid access can be verified.',
        entitlementLabel: 'Paid entitlements pending',
        entitlementTone: 'warning',
        periodLabel: 'Renewal',
      };
    case 'enterprise_pending':
      return {
        ...base,
        statusLabel: 'Enterprise pending',
        statusTone: 'info',
        message: 'Enterprise access is pending commercial confirmation.',
        entitlementLabel: 'Enterprise entitlements pending',
        entitlementTone: 'info',
        periodLabel: 'Activation',
      };
    case 'none':
    default:
      return {
        ...base,
        statusLabel: 'Free',
        statusTone: 'neutral',
        message: 'No paid subscription is active. Free plan limits apply.',
        entitlementLabel: 'Free entitlements active',
        entitlementTone: 'neutral',
        periodLabel: 'Renewal',
      };
  }
};
