export {
  type BillingPlanId,
  type BillingFeature,
  type SubscriptionSnapshot,
  type InvoiceRecord,
} from './billing.types';

export { BILLING_PLANS } from './billing.helpers';

export {
  canAccessFeature,
  canUseAICoach,
  canViewAdvancedAnalytics,
  getFreeTierPreview,
} from './billing.entitlements';

export { EntitlementGate } from './EntitlementGate';

export { LockedFeatureModal, type LockedFeatureModalItem } from './LockedFeatureModal';

export { SubscriptionRouteGuard } from './SubscriptionRouteGuard';

export { CurriculumSectionGuard } from './CurriculumSectionGuard';

export { BillingService } from './billing.service';

export { useBillingStore } from './billing.store';
