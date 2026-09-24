import { Download, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

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
import { useVocabularyStore } from '@/features/vocabulary';

export const BillingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const {
    subscription,
    providerStatus,
    isLoading: isBillingLoading,
    isCheckoutLoading,
    error: billingError,
    errorCode: billingErrorCode,
    refreshBilling,
    openCustomerPortal,
    invoices,
    isLoadingInvoices,
    fetchInvoices,
    syncError,
    invoiceError,
    lastSyncedAt,
  } = useBillingStore();
  const [searchParams] = useSearchParams();
  const paymentReturned =
    searchParams.get('billing') === 'success' || searchParams.get('topup') === 'success';
  const [checkingPayment, setCheckingPayment] = useState(false);
  useEffect(() => {
    if (!paymentReturned || !currentUser?.id) return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const check = async () => {
      setCheckingPayment(true);
      await refreshBilling(currentUser.id);
      attempts += 1;
      if (disposed) return;
      if (attempts < 6) timer = setTimeout(() => void check(), 5000);
      else {
        setCheckingPayment(false);
        void fetchInvoices(currentUser.id);
      }
    };
    void check();
    return () => {
      disposed = true;
      clearTimeout(timer);
    };
  }, [paymentReturned, currentUser?.id, refreshBilling, fetchInvoices]);
  const { learningState } = useLearningCockpit(currentUser?.id);
  const reviewHistory = useVocabularyStore((state) => state.history);
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
  const handleUpgrade = () => navigate('/pricing');
  const handleManageSubscription = () => {
    if (!currentUser?.id) return;
    openCustomerPortal(currentUser.id).catch((err) => logger.e('Portal failed:', err));
  };
  return (
    <PageContainer className="max-w-6xl space-y-6">
      <PageHeader
        title="Billing & Subscriptions"
        description="Subscription status, quota limits, and invoice history."
        actions={
          <button
            onClick={() => currentUser?.id && refreshBilling(currentUser.id)}
            disabled={isBillingLoading}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-button)] border border-border-soft bg-surface px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm transition-all hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isBillingLoading ? 'animate-spin' : ''}`} />
            Sync
          </button>
        }
      />
      {syncError && (
        <p role="alert" className="text-sm text-danger">
          {syncError}
        </p>
      )}
      {paymentReturned && (
        <p role="status" className="text-sm text-muted-copy">
          {checkingPayment
            ? 'Checking payment confirmation...'
            : 'Status refreshed. Payments may take a few minutes to appear. Use Sync to check again.'}
        </p>
      )}
      {lastSyncedAt && (
        <p className="text-xs text-muted-copy">
          Last synced: {new Date(lastSyncedAt).toLocaleTimeString()}
        </p>
      )}
      <div className="grid min-w-0 grid-cols-1 gap-6">
        <div className="min-w-0 space-y-6">
          <SectionCard
            title="Subscription Entitlements"
            subtitle="Current status and quick upgrade controls"
            icon={Wallet}
          >
            <BillingStatusPanel
              subscription={subscription}
              providerStatus={providerStatus}
              isLoading={isCheckoutLoading}
              onUpgrade={handleUpgrade}
              onOpenPortal={handleManageSubscription}
              error={billingError}
              errorCode={billingErrorCode}
            />
          </SectionCard>
          <SectionCard
            title="Plan Quota Limits"
            subtitle="Daily usage compared with the current plan"
            icon={ShieldCheck}
          >
            <div className="space-y-5">
              <BillingPlanCards
                subscription={subscription}
                todaysCoachSessions={todaysCoachSessions}
                todaysAttempts={
                  learningState.studySessions.filter(
                    (s) => new Date(s.timestamp).toDateString() === new Date().toDateString()
                  ).length
                }
                todaysReviews={
                  reviewHistory.filter(
                    (item) => new Date(item.timestamp).toDateString() === new Date().toDateString()
                  ).length
                }
                uploadedDocsCount={null}
                voiceMinutesUsed={null}
              />
              <BillingUpgradeCTA subscription={subscription} />
            </div>
          </SectionCard>
          <SectionCard title="Transaction History" subtitle="Invoices and receipts" icon={Download}>
            {invoiceError && (
              <div role="alert" className="mb-3 text-sm text-danger">
                {invoiceError}
                <button
                  type="button"
                  className="ml-3 min-h-11 underline"
                  onClick={() => currentUser?.id && fetchInvoices(currentUser.id)}
                >
                  Retry
                </button>
              </div>
            )}
            <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border-soft bg-surface shadow-sm">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-soft bg-surface-hover">
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
                <tbody className="divide-y divide-border-soft">
                  {isLoadingInvoices ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-copy">
                        Loading invoices...
                      </td>
                    </tr>
                  ) : (invoices ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-copy">
                        {invoiceError
                          ? 'Invoice history could not be loaded.'
                          : 'No transactions yet.'}
                      </td>
                    </tr>
                  ) : (
                    (invoices ?? []).map((inv: InvoiceRecord) => (
                      <tr key={inv.id} className="transition-colors hover:bg-surface-hover">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">
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
                            className={`inline-flex items-center rounded-[var(--radius-button)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${inv.status === 'paid' ? 'border border-success/30 bg-success/15 text-success' : inv.status === 'open' ? 'border border-warning/30 bg-warning/15 text-warning' : 'border border-border-soft bg-surface-hover text-muted-copy'}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {inv.invoicePdf ? (
                            <a
                              href={inv.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-border-soft bg-surface text-muted-copy shadow-sm transition-all hover:border-primary hover:text-primary"
                              aria-label="Download receipt"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="inline-flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-[var(--radius-button)] border border-border-soft bg-surface text-muted-copy/50"
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
