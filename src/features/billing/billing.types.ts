export type BillingPlanId = 'free' | 'junior' | 'senior' | 'specialist' | 'master';

export type SubscriptionStatus =
  | 'none'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'unpaid'
  | 'enterprise_pending';

export type BillingFeature =
  | 'placementTest'
  | 'grammar'
  | 'translator'
  | 'reading'
  | 'writing'
  | 'listening'
  | 'speaking'
  | 'vocabulary'
  | 'learningHub'
  | 'tool'
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
  | 'aiCreditAddon'
  | 'learningPath';

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
  topupCredits?: number;
  /** Billing provider the snapshot came from ('stripe' | 'dodo'). */
  source?: string;
}

export interface BillingSessionRequest {
  userId: string;
  email: string;
  planId: BillingPlanId;
  successUrl: string;
  cancelUrl: string;
  billingInterval?: 'month' | 'year';
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

export type BillingStatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

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

export interface InvoiceRecord {
  id: string;
  date: string;
  amount: string;
  status: string;
  invoicePdf: string | null;
}

export interface BillingState {
  subscription: SubscriptionSnapshot;
  providerStatus: BillingProviderStatus;
  isLoading: boolean;
  error: string | null;
  invoices: InvoiceRecord[];
  isLoadingInvoices: boolean;
}
