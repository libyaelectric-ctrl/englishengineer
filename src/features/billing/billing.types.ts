export type BillingPlanId =
  | 'free'
  | 'pro'
  | 'project'
  | 'expert'
  | 'max'
  | 'exec'
  | 'private';

export type SubscriptionStatus =
  | 'none'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'enterprise_pending';

export type BillingFeature =
  | 'reading'
  | 'writing'
  | 'listening'
  | 'speaking'
  | 'vocabulary'
  | 'aiCoach'
  | 'analytics'
  | 'advancedAnalytics'
  | 'gamification'
  | 'fullGamification'
  | 'missionCreation'
  | 'futureAI'
  | 'unlimitedAIFeedback'
  | 'cloudSync'
  | 'advancedTasks'
  | 'projectWorkspace'
  | 'persistentProjectMemory'
  | 'customScenarioGeneration'
  | 'linkedinOptimization'
  | 'persistentAIAgent'
  | 'realVoiceSpeaking'
  | 'pronunciationAnalysis'
  | 'voiceMeetingSimulator'
  | 'voiceMinuteWallet'
  | 'aiCreditAddon';

export interface BillingLimits {
  dailyAICoachRequests: number | 'unlimited';
  moduleAttemptsPerDay: number | 'unlimited';
  vocabularyReviewsPerDay: number | 'unlimited';
  documentUploadsPerMonth: number | 'unlimited';
}

export interface BillingPlan {
  id: BillingPlanId;
  name: string;
  description: string;
  isFutureReady: boolean;
  features: BillingFeature[];
  limits: BillingLimits;
}

export interface SubscriptionSnapshot {
  planId: BillingPlanId;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  updatedAt: string;
}

export interface BillingSessionRequest {
  userId: string;
  email: string;
  planId: BillingPlanId;
  successUrl: string;
  cancelUrl: string;
}

export interface BillingPortalRequest {
  userId: string;
  returnUrl: string;
}

export interface BillingRedirectResponse {
  url: string;
}

export interface BillingProviderStatus {
  mode: 'local-fallback' | 'backend';
  isConfigured: boolean;
  label: string;
  detail: string;
}

export type BillingStatusTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export interface BillingStatusPresentation {
  planId: BillingPlanId;
  planLabel: string;
  statusLabel: string;
  statusTone: BillingStatusTone;
  message: string;
  entitlementLabel: string;
  entitlementTone: BillingStatusTone;
  periodLabel: string;
  periodValue: string;
  isBackendVerified: boolean;
}

export interface EntitlementResult {
  allowed: boolean;
  reason: string;
  requiredPlan: BillingPlanId | null;
}

export interface BillingState {
  subscription: SubscriptionSnapshot;
  providerStatus: BillingProviderStatus;
  isLoading: boolean;
  error: string | null;
}
