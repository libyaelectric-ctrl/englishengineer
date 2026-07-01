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
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
};

interface BillingStatusPanelProps {
  subscription: SubscriptionSnapshot;
  providerStatus: BillingProviderStatus;
  isLoading: boolean;
  onUpgrade: () => void;
  onOpenPortal: () => void;
}

export const BillingStatusPanel = ({
  subscription,
  providerStatus,
  isLoading,
  onUpgrade,
  onOpenPortal,
}: BillingStatusPanelProps) => {
  const presentation = getBillingStatusPresentation(
    subscription,
    providerStatus
  );
  const paidAccessIsActive =
    presentation.planId === 'pro' &&
    (subscription.status === 'active' || subscription.status === 'trialing');
  const canOpenPortal =
    providerStatus.isConfigured && Boolean(subscription.stripeCustomerId);

  return (
    <div className="space-y-4" data-testid="billing-status-panel">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            Current plan
          </p>
          <p className="mt-1 text-lg font-black text-slate-900">
            {presentation.planLabel}
          </p>
        </div>
        <StatusBadge
          label={presentation.statusLabel}
          tone={presentation.statusTone}
        />
      </div>

      <div
        className={`rounded-xl border p-4 text-sm leading-6 ${messageStyles[presentation.statusTone]}`}
        role={presentation.statusTone === 'danger' ? 'alert' : 'status'}
      >
        {presentation.message}
      </div>

      <dl className="space-y-3 text-sm">
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-slate-500">Subscription status</dt>
          <dd className="font-semibold text-slate-800">
            {presentation.statusLabel}
          </dd>
        </div>
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-slate-500">Entitlement status</dt>
          <dd>
            <StatusBadge
              label={presentation.entitlementLabel}
              tone={presentation.entitlementTone}
            />
          </dd>
        </div>
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-slate-500">{presentation.periodLabel}</dt>
          <dd className="font-semibold text-slate-800">
            {presentation.periodValue}
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-slate-500">Billing verification</dt>
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
        <Button
          type="button"
          onClick={onUpgrade}
          disabled={
            isLoading || !providerStatus.isConfigured || paidAccessIsActive
          }
        >
          <Crown className="h-4 w-4" />
          {paidAccessIsActive ? 'Pro Active' : 'Upgrade to Pro'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onOpenPortal}
          disabled={isLoading || !canOpenPortal}
        >
          <ExternalLink className="h-4 w-4" /> Manage Subscription
        </Button>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        {providerStatus.detail} Payments and paid entitlements are verified by
        the billing backend, never by this page.
      </p>
    </div>
  );
};
