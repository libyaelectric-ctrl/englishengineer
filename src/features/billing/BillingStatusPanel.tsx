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
    <div
      className="space-y-4 font-sans text-foreground"
      data-testid="billing-status-panel"
    >
      {error && (
        <div
          className="rounded-[4px] border border-warning/20 bg-warning/5 p-4 text-xs leading-5 text-warning shadow-sm font-bold uppercase tracking-wider"
          role="alert"
        >
          Billing status is temporarily unavailable. Access entitlements are
          based on the last known verified state.
        </div>
      )}
      <div className="flex flex-col gap-3 rounded-[4px] border border-[#d9d9e3] bg-white p-4 sm:flex-row sm:items-start sm:justify-between shadow-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
            Current plan
          </p>
          <p className="mt-1 text-base font-bold text-foreground">
            {presentation.planLabel}
          </p>
        </div>
        <StatusBadge
          label={presentation.statusLabel}
          tone={presentation.statusTone}
          className="rounded-[4px] font-bold text-[10px] uppercase tracking-wider"
        />
      </div>

      <div
        className={`rounded-[4px] border p-4 text-xs leading-5 shadow-sm font-bold ${messageStyles[presentation.statusTone]}`}
        role={presentation.statusTone === 'danger' ? 'alert' : 'status'}
      >
        {presentation.message}
      </div>

      <dl className="space-y-3 text-xs">
        <div className="flex flex-col gap-1 border-b border-[#d9d9e3]/60 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-muted-copy font-bold uppercase tracking-wider text-[10px]">
            Subscription status
          </dt>
          <dd className="font-bold text-foreground">
            {presentation.statusLabel}
          </dd>
        </div>
        <div className="flex flex-col gap-1 border-b border-[#d9d9e3]/60 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-muted-copy font-bold uppercase tracking-wider text-[10px]">
            Entitlement status
          </dt>
          <dd>
            <StatusBadge
              label={presentation.entitlementLabel}
              tone={presentation.entitlementTone}
              className="rounded-[4px] font-bold text-[10px] uppercase tracking-wider"
            />
          </dd>
        </div>
        <div className="flex flex-col gap-1 border-b border-[#d9d9e3]/60 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-muted-copy font-bold uppercase tracking-wider text-[10px]">
            {presentation.periodLabel}
          </dt>
          <dd className="font-bold text-foreground">
            {presentation.periodValue}
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-muted-copy font-bold uppercase tracking-wider text-[10px]">
            Billing verification
          </dt>
          <dd>
            <StatusBadge
              label={
                presentation.isBackendVerified
                  ? 'Backend configured'
                  : 'Local billing mode'
              }
              tone={presentation.isBackendVerified ? 'success' : 'warning'}
              className="rounded-[4px] font-bold text-[10px] uppercase tracking-wider"
            />
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2 sm:flex-row pt-2">
        {!paidAccessIsActive ? (
          <Button
            type="button"
            onClick={() => {
              onUpgrade();
              window.location.href = '/pricing';
            }}
            disabled={isLoading}
            className="text-xs bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-white font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm flex items-center justify-center gap-1.5 min-h-9 px-4"
          >
            <Crown className="h-3.5 w-3.5" />
            Upgrade Plan
          </Button>
        ) : (
          <Button
            type="button"
            disabled
            className="text-xs border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 font-bold uppercase tracking-wider rounded-[4px] cursor-not-allowed flex items-center gap-1.5 min-h-9 px-4"
          >
            <Crown className="h-3.5 w-3.5 text-emerald-600" />
            {presentation.planLabel} Active
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onOpenPortal}
          disabled={isLoading || !canOpenPortal}
          className="text-xs border border-[#d9d9e3] bg-white hover:bg-[#faf8ff] text-[#0047bb] font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm flex items-center justify-center gap-1.5 min-h-9 px-4"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Manage Subscription
        </Button>
      </div>

      <p className="text-[10px] leading-4 text-muted-copy font-medium">
        {providerStatus.detail} Payments and paid entitlements are verified by
        the billing backend, never by this page.
      </p>
    </div>
  );
};
