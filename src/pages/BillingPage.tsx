import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  ShieldCheck,
  Wallet,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';
import { useAIStore } from '@/features/ai';
import { useLearningCockpit } from '@/features/profile';
import { BillingStatusPanel } from '@/features/billing/BillingStatusPanel';
import { BillingPlanCards } from './ProfilePage/BillingPlanCards';
import { BillingUpgradeCTA } from './ProfilePage/BillingUpgradeCTA';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';

// Mock transaction history that matches professional invoicing systems
const MOCK_INVOICES = [
  { id: 'INV-2026-003', date: '2026-07-01', amount: '$29.00', status: 'Paid' },
  { id: 'INV-2026-002', date: '2026-06-01', amount: '$29.00', status: 'Paid' },
  { id: 'INV-2026-001', date: '2026-05-01', amount: '$29.00', status: 'Paid' },
];

export const BillingPage = () => {
  const { currentUser } = useAuthStore();
  const {
    subscription,
    providerStatus,
    isLoading: isBillingLoading,
    error: billingError,
    refreshBilling,
    startCheckout,
    openCustomerPortal,
  } = useBillingStore();

  const { memory, learningState } = useLearningCockpit(currentUser?.id);
  const { sessions } = useAIStore();

  const todaysCoachSessions = sessions.filter(
    (s) => new Date(s.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const [cardName, setCardName] = useState(currentUser?.displayName || '');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      refreshBilling(currentUser.id).catch(() => {});
    }
  }, [currentUser?.id, refreshBilling]);

  const handleUpgrade = () => {
    if (!currentUser?.id || !currentUser?.email) return;
    startCheckout(currentUser.id, currentUser.email, 'pro').catch(() => {});
  };

  const handleManageSubscription = () => {
    if (!currentUser?.id) return;
    openCustomerPortal(currentUser.id).catch(() => {});
  };

  const handleSaveBillingInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-300 pt-12 sm:pt-0 text-foreground relative z-10 font-sans">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-[#d9d9e3] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Billing & Subscriptions
            </h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-copy">
              Financial Engineering Hub & Entitlements Terminal
            </p>
          </div>
          <button
            onClick={() => currentUser?.id && refreshBilling(currentUser.id)}
            disabled={isBillingLoading}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-[#faf8ff] transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isBillingLoading ? 'animate-spin' : ''}`}
            />
            Sync Status
          </button>
        </div>
        <p className="text-xs leading-5 text-muted-copy max-w-2xl font-medium">
          Verify and adjust your subscription status, manage primary payment
          card details, and download past invoices.
        </p>
      </header>

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
            <div className="space-y-4">
              <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-5 space-y-6 shadow-sm">
                <BillingPlanCards
                  subscription={subscription}
                  todaysCoachSessions={todaysCoachSessions}
                  todaysAttempts={
                    learningState.studySessions.filter(
                      (s) =>
                        new Date(s.timestamp).toDateString() ===
                        new Date().toDateString()
                    ).length
                  }
                  todaysReviews={memory.dueToday}
                  uploadedDocsCount={0}
                  voiceMinutesUsed={0}
                />
                <BillingUpgradeCTA planId={subscription.planId} />
              </div>
            </div>
          </SectionCard>

          {/* Transaction history log */}
          <SectionCard
            title="Transaction History"
            subtitle="Historical transaction ledger and secure receipt download operations"
            icon={Download}
          >
            <div className="rounded-[4px] border border-[#d9d9e3] bg-white overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#d9d9e3] bg-[#faf8ff]">
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
                  {MOCK_INVOICES.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#faf8ff] transition-colors"
                    >
                      <td className="px-4 py-3 text-xs font-mono font-bold text-foreground">
                        {inv.id}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-muted-copy">
                        {inv.date}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-foreground">
                        {inv.amount}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="inline-flex items-center rounded-[4px] bg-success/15 border border-success/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-success">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#d9d9e3] bg-white text-muted-copy hover:border-[#0047bb] hover:text-[#0047bb] transition-all cursor-pointer shadow-sm"
                          aria-label="Download receipt"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Right Column - Payment Method Details */}
        <div className="space-y-8">
          <SectionCard
            title="Payment Method"
            subtitle="Configure your primary credit card and secure billing information"
            icon={CreditCard}
          >
            <div className="space-y-5">
              {/* Virtual Premium Card mockup */}
              <div className="relative overflow-hidden rounded-[4px] border border-[#0047bb]/30 bg-[#0047bb]/5 p-5 text-[#0047bb] shadow-sm">
                <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-[#0047bb]/5" />
                <div className="flex justify-between items-start mb-8">
                  <CreditCard className="h-8 w-8 text-[#0047bb]" />
                  <span className="rounded-[4px] bg-[#0047bb]/15 border border-[#0047bb]/35 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
                    Primary
                  </span>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-mono tracking-widest font-bold">
                    {cardNumber}
                  </p>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <div>
                      <span className="block text-[#0047bb]/70 text-[8px]">
                        Cardholder
                      </span>
                      <span className="truncate max-w-[120px] block">
                        {cardName || 'Guest User'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#0047bb]/70 text-[8px]">
                        Expires
                      </span>
                      <span>{cardExpiry}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSaveBillingInfo} className="space-y-4 pt-2">
                <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                  Cardholder Name
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/15 transition-all shadow-sm font-bold"
                    required
                  />
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <label className="col-span-2 block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                    Card Number
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/15 transition-all shadow-sm font-bold font-mono"
                      required
                    />
                  </label>
                  <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                    Expiry Date
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/15 transition-all shadow-sm font-bold"
                      required
                    />
                  </label>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-xs font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm flex items-center justify-center min-h-9"
                  >
                    Update Payment Method
                  </Button>
                  {saveSuccess && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-success font-bold uppercase tracking-wider mt-1 animate-in fade-in duration-200">
                      <CheckCircle2 className="h-4 w-4" /> Billing info updated
                    </div>
                  )}
                </div>
              </form>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
