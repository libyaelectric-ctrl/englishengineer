/**
 * A plan id the catalog has an entry for. Only an id in this set can be turned into a
 * `BillingPlan`; anything else has to go through `resolvePlan`, which falls back.
 */
export type BillingPlanId = 'free' | 'junior' | 'senior' | 'specialist' | 'master';

/**
 * A plan id as a boundary hands it over, before the catalog has seen it.
 *
 * Neither place a subscription arrives from validates its plan id: the billing backend's
 * `subscription-status` payload, and the snapshot a previous session wrote to storage. The
 * backend's canonical set includes ids this catalog has no entry for (`team` today), so an
 * incoming id is a plain string here — and `resolvePlan`, in the module that owns the
 * catalog, is what decides which plan it means. Typing it as `BillingPlanId` instead is
 * what forced callers into `as string` / `as BillingPlanId` assertions.
 */
export type IncomingPlanId = string;

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
  planId: IncomingPlanId;
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
  planId: IncomingPlanId;
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
  /** True only while a checkout/portal redirect is being requested. */
  isCheckoutLoading: boolean;
  error: string | null;
  /**
   * The backend's own error code behind `error`, when it sent one.
   *
   * The panel picks its copy from this; matching the message text instead is what
   * made customer-facing wording depend on backend prose.
   */
  errorCode: string | null;
  invoices: InvoiceRecord[];
  isLoadingInvoices: boolean;
}
