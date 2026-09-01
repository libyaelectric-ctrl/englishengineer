import { Download, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';

import { useCallback, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { logger } from '@/shared/logger';

import { useAIStore } from '@/features/ai';
import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';
import type { InvoiceRecord } from '@/features/billing';
import { BillingStatusPanel } from '@/features/billing/BillingStatusPanel';
import { BillingPlanCards } from '@/features/billing/components/BillingPlanCards';
import { BillingUpgradeCTA } from '@/features/billing/components/BillingUpgradeCTA';
import { useLearningCockpit } from '@/features/profile';

export const BillingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const {
    subscription,
    providerStatus,
    isLoading: isBillingLoading,
    error: billingError,
    refreshBilling,
    openCustomerPortal,
    invoices,
    isLoadingInvoices,
    fetchInvoices,
  } = useBillingStore();

  const { memory, learningState } = useLearningCockpit(currentUser?.id);
  const { sessions } = useAIStore();

  const todaysCoachSessions = sessions.filter(
    (s) => new Date(s.timestamp).toDateString() === new Date().toDateString()
  ).length;

  useEffect(() => {
    if (currentUser?.id) {
      refreshBilling?.(currentUser.id)?.catch((err) => logger.e('Billing refresh failed:', err));
      fetchInvoices?.(currentUser.id)?.catch((err) => logger.e('Invoices fetch failed:', err));
    }
  }, [currentUser?.id, refreshBilling, fetchInvoices]);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const [syncSlow, setSyncSlow] = useState(false);

  const handleSync = useCallback(() => {
    if (!currentUser?.id) return;
    setSyncSlow(false);
    const timer = setTimeout(() => setSyncSlow(true), 5000);
    refreshBilling(currentUser.id)
      .catch((err) => logger.e('Billing refresh failed:', err))
      .finally(() => clearTimeout(timer));
  }, [currentUser?.id, refreshBilling]);

  const handleManageSubscription = () => {
    if (!currentUser?.id) return;
    openCustomerPortal(currentUser.id).catch((err) => logger.e('Portal failed:', err));
  };

  return (
    <PageContainer className="px-4 sm:px-6 lg:px-8 space-y-10 pt-12 sm:pt-0 relative z-10 font-sans">
      <PageHeader
        title="Billing & Subscriptions"
        description="Verify and adjust your subscription status, manage primary payment card details, and download past invoices."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isBillingLoading}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-background transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isBillingLoading ? 'animate-spin' : ''}`} />
              {isBillingLoading ? (syncSlow ? 'Waking up backend…' : 'Syncing…') : 'Sync Status'}
            </button>
            {syncSlow && isBillingLoading && (
              <span className="text-[10px] text-muted-copy italic">
                Backend may be cold-starting (10-15s)
              </span>
            )}
          </div>
        }
      />

      {/* Main Grid layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Subscription overview */}
        <div className="lg:col-span-2 space-y-8">
          <SectionCard
            title="Subscription Entitlements"
            subtitle="Current status, verification details, and quick upgrade control actions"
            icon={Wallet}
          >
            <BillingStatusPanel
              subscription={subscription}
              providerStatus={providerStatus}
              isLoading={isBillingLoading}
              onUpgrade={handleUpgrade}
              onOpenPortal={handleManageSubscription}
              error={billingError}
            />
          </SectionCard>

          {/* Usage Quotas */}
          <SectionCard
            title="Plan Quota Limits"
            subtitle="Real-time daily usage logs compared against current subscription thresholds"
            icon={ShieldCheck}
          >
            <div className="space-y-6">
              <BillingPlanCards
                subscription={subscription}
                todaysCoachSessions={todaysCoachSessions}
                todaysAttempts={
                  learningState.studySessions.filter(
                    (s) => new Date(s.timestamp).toDateString() === new Date().toDateString()
                  ).length
                }
                todaysReviews={memory.dueToday}
                uploadedDocsCount={0}
                voiceMinutesUsed={0}
              />
              <BillingUpgradeCTA planId={subscription.planId} />
            </div>
          </SectionCard>

          {/* Transaction history log */}
          <SectionCard
            title="Transaction History"
            subtitle="Historical transaction ledger and secure receipt download operations"
            icon={Download}
          >
            <div className="rounded-[4px] border border-border-soft bg-surface overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-soft bg-background">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                      Invoice ID
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                      Billing Date
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                      Amount Paid
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d9d9e3]">
                  {isLoadingInvoices ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-copy">
                        Loading invoices...
                      </td>
                    </tr>
                  ) : (invoices ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-copy">
                        No transactions yet.
                      </td>
                    </tr>
                  ) : (
                    (invoices ?? []).map((inv: InvoiceRecord) => (
                      <tr key={inv.id} className="hover:bg-background transition-colors">
                        <td className="px-4 py-3 text-xs font-mono font-bold text-foreground">
                          {inv.id}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-muted-copy">
                          {inv.date
                            ? new Intl.DateTimeFormat(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }).format(new Date(inv.date))
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-foreground">
                          {inv.amount}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span
                            className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              inv.status === 'paid'
                                ? 'bg-success/15 border border-success/30 text-success'
                                : inv.status === 'open'
                                  ? 'bg-warning/15 border border-warning/30 text-warning'
                                  : 'bg-surface-hover border border-border-soft text-muted-copy'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {inv.invoicePdf ? (
                            <button
                              type="button"
                              onClick={async () => {
                                const { openExternalUrl } =
                                  await import('@/shared/utils/capacitor');
                                await openExternalUrl(inv.invoicePdf!);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-border-soft bg-surface text-muted-copy hover:border-primary hover:text-primary transition-all cursor-pointer shadow-sm"
                              aria-label="Download receipt"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-border-soft bg-surface text-muted-copy/50 cursor-not-allowed"
                              aria-label="No receipt available"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
};

export default BillingPage;
