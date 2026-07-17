import { CreditCard } from 'lucide-react';
import {
  BillingStatusPanel,
  type SubscriptionSnapshot,
  type BillingProviderStatus,
} from '@/features/billing';
import { SectionCard } from '@/shared/components/SectionCard';
import { BillingStatusBadge } from './BillingStatusBadge';
import { BillingPlanCards } from './BillingPlanCards';
import { BillingUpgradeCTA } from './BillingUpgradeCTA';

interface BillingSectionProps {
  subscription: SubscriptionSnapshot;
  providerStatus: BillingProviderStatus;
  isBillingLoading: boolean;
  billingError: string | null;
  onUpgrade: () => void;
  onOpenPortal: () => void;
  todaysCoachSessions: number;
  todaysAttempts: number;
  todaysReviews: number;
  uploadedDocsCount: number;
  voiceMinutesUsed: number;
}

export const BillingSection = ({
  subscription,
  providerStatus,
  isBillingLoading,
  billingError,
  onUpgrade,
  onOpenPortal,
  todaysCoachSessions,
  todaysAttempts,
  todaysReviews,
  uploadedDocsCount,
  voiceMinutesUsed,
}: BillingSectionProps) => (
  <section
    id="billing"
    className="animate-in fade-in duration-200 max-h-[calc(100vh-12rem)] overflow-y-auto"
  >
    <SectionCard
      title="Account & Billing"
      subtitle="Your subscription details, Stripe billing records, and cloud entitlements"
      icon={CreditCard}
    >
      <div className="space-y-6">
        <BillingStatusPanel
          subscription={subscription}
          providerStatus={providerStatus}
          isLoading={isBillingLoading}
          error={billingError}
          onUpgrade={onUpgrade}
          onOpenPortal={onOpenPortal}
        />

        <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-5 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#d9d9e3] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                Usage and Quota limits
              </span>
              <h4 className="text-sm font-bold text-foreground mt-0.5">
                Current Plan Entitlements
              </h4>
            </div>
            <BillingStatusBadge planId={subscription.planId} />
          </div>

          <BillingPlanCards
            subscription={subscription}
            todaysCoachSessions={todaysCoachSessions}
            todaysAttempts={todaysAttempts}
            todaysReviews={todaysReviews}
            uploadedDocsCount={uploadedDocsCount}
            voiceMinutesUsed={voiceMinutesUsed}
          />

          <BillingUpgradeCTA planId={subscription.planId} />
        </div>
      </div>
    </SectionCard>
  </section>
);
