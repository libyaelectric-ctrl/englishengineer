import { Crown, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { getBillingStatusPresentation } from './billing.helpers';
import type {
  BillingProviderStatus,
  BillingStatusTone,
  SubscriptionSnapshot,
} from './billing.types';

const messageStyles: Record<BillingStatusTone, string> = {
  neutral: 'border-border-soft bg-surface text-muted-copy',
  info: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  warning: 'border-warning/20 bg-warning/5 text-warning',
  danger: 'border-red-500/20 bg-red-500/10 text-red-400',
};

interface BillingStatusPanelProps {
  subscription: SubscriptionSnapshot;
  providerStatus: BillingProviderStatus;
  isLoading: boolean;
  onUpgrade: () => void;
  onOpenPortal: () => void;
  error?: string | null;
}

export const BillingStatusPanel = ({
  subscription,
  providerStatus,
  isLoading,
  onUpgrade,
  onOpenPortal,
  error,
}: BillingStatusPanelProps) => {
  const presentation = getBillingStatusPresentation(
    subscription,
    providerStatus
  );
  const paidAccessIsActive =
    presentation.planId !== 'free' &&
    (subscription.status === 'active' || subscription.status === 'trialing');
  const canOpenPortal =
    providerStatus.isConfigured && Boolean(subscription.stripeCustomerId);

  return (
    <div className="space-y-4" data-testid="billing-status-panel">
      {error && (
        <div
          className="rounded-card border border-warning/20 bg-warning/5 p-4 text-xs leading-5 text-warning"
          role="alert"
        >
          Billing status is temporarily unavailable. Access entitlements are
          based on the last known verified state.
        </div>
      )}
      <div className="flex flex-col gap-3 rounded-card border border-border-soft bg-surface p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase text-muted-copy">
            Current plan
          </p>
          <p className="mt-1 text-base font-bold text-foreground">
            {presentation.planLabel}
          </p>
        </div>
        <StatusBadge
          label={presentation.statusLabel}
          tone={presentation.statusTone}
        />
      </div>

      <div
        className={`rounded-card border p-4 text-xs leading-5 ${messageStyles[presentation.statusTone]}`}
        role={presentation.statusTone === 'danger' ? 'alert' : 'status'}
      >
        {presentation.message}
      </div>

      <dl className="space-y-3 text-xs">
        <div className="flex flex-col gap-1 border-b border-border-soft/40 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-muted-copy">Subscription status</dt>
          <dd className="font-semibold text-foreground">
            {presentation.statusLabel}
          </dd>
        </div>
        <div className="flex flex-col gap-1 border-b border-border-soft/40 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-muted-copy">Entitlement status</dt>
          <dd>
            <StatusBadge
              label={presentation.entitlementLabel}
              tone={presentation.entitlementTone}
            />
          </dd>
        </div>
        <div className="flex flex-col gap-1 border-b border-border-soft/40 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-muted-copy">{presentation.periodLabel}</dt>
          <dd className="font-semibold text-foreground">
            {presentation.periodValue}
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-muted-copy">Billing verification</dt>
          <dd>
            <StatusBadge
              label={
                presentation.isBackendVerified
                  ? 'Backend configured'
                  : 'Local billing mode'
              }
              tone={presentation.isBackendVerified ? 'success' : 'warning'}
            />
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2 sm:flex-row">
        {!paidAccessIsActive ? (
          <Button
            type="button"
            onClick={() => {
              onUpgrade();
              window.location.href = '/pricing';
            }}
            disabled={isLoading}
            className="text-xs"
          >
            <Crown className="h-3.5 w-3.5" />
            Upgrade Plan
          </Button>
        ) : (
          <Button
            type="button"
            disabled
            className="text-xs border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 cursor-not-allowed flex items-center gap-1.5"
          >
            <Crown className="h-3.5 w-3.5 text-emerald-500" />
            {presentation.planLabel} Active
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onOpenPortal}
          disabled={isLoading || !canOpenPortal}
          className="text-xs"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Manage Subscription
        </Button>
      </div>

      <p className="text-[10px] leading-4 text-muted-copy">
        {providerStatus.detail} Payments and paid entitlements are verified by
        the billing backend, never by this page.
      </p>
    </div>
  );
};
