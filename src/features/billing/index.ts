export {
  type BillingPlanId,
  type SubscriptionStatus,
  type BillingFeature,
  type BillingLimits,
  type BillingPlan,
  type SubscriptionSnapshot,
  type BillingSessionRequest,
  type BillingPortalRequest,
  type BillingRedirectResponse,
  type BillingProviderStatus,
  type BillingStatusTone,
  type BillingStatusPresentation,
  type EntitlementResult,
  type BillingState,
} from './billing.types';

export {
  type CommercialPlanId,
  type CommercialPlanPreview,
  COMMERCIAL_PLAN_CATALOG,
  SPONSOR_PLACEMENT_POLICY,
} from './billing.catalog';

export {
  BILLING_PLANS,
  FREE_FEATURES,
  createFreeSubscription,
  getBillingApiUrl,
  getBillingProviderStatus,
  formatRenewalDate,
  getBillingStatusPresentation,
} from './billing.helpers';

export {
  isSubscriptionActive,
  isFreeTier,
  canAccessFeature,
  canUseAICoach,
  canCreateMission,
  canViewAdvancedAnalytics,
  canAccessProjectWorkspace,
  canAccessPersistentMemory,
  canAccessCustomScenario,
  canAccessLinkedInOptimization,
  canAccessPersistentAIAgent,
  canAccessRealVoiceSpeaking,
  isDowngrade,
  type DowngradeImpact,
  getDowngradeImpact,
  getPlanLimitLabel,
  FREE_TIER_PREVIEW_LIMITS,
  getFreeTierPreview,
  type FreeTierPreviewScope,
  type FreeTierPreview,
} from './billing.entitlements';

export { EntitlementGate } from './EntitlementGate';

export { LockedFeatureModal, type LockedFeatureModalItem } from './LockedFeatureModal';

export { SubscriptionRouteGuard } from './SubscriptionRouteGuard';

export { CurriculumSectionGuard } from './CurriculumSectionGuard';

export { BillingService } from './billing.service';

export { useBillingStore } from './billing.store';

export { StripeBillingProvider } from './stripe.provider';

export { BillingStatusPanel } from './BillingStatusPanel';

export { type WorkspaceDocument, type Workspace, useWorkspaceStore } from './workspace.store';

export { WorkspaceSelector } from './WorkspaceSelector';

export { CurrencyConfig, type CurrencyOption } from './currency.config';
