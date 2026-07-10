import { Link } from 'react-router-dom';
import { CreditCard, Crown } from 'lucide-react';
import { BillingStatusPanel, SubscriptionSnapshot, BillingProviderStatus } from '@/features/billing';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';

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

        {/* Quota and Usage Summary */}
        <div className="rounded-xl border border-border-soft bg-surface p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border-soft pb-3">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-copy">
                Usage and Quota limits
              </span>
              <h4 className="text-sm font-medium text-foreground mt-0.5">
                Current Plan Entitlements
              </h4>
            </div>
            <span className="text-[10px] font-mono font-medium bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase">
              {subscription.planId === 'pro'
                ? 'Pro Plan Access'
                : 'Free Plan Access'}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* AI Coach Sessions */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">
                  Daily AI Coach Requests
                </span>
                <span className="font-medium text-foreground">
                  {subscription.planId === 'pro'
                    ? 'Unlimited'
                    : `${todaysCoachSessions} / 3 daily requests`}
                </span>
              </div>
              <ProgressBar
                value={
                  subscription.planId === 'pro'
                    ? 100
                    : Math.min(100, (todaysCoachSessions / 3) * 100)
                }
                color={
                  subscription.planId === 'pro'
                    ? 'cyan'
                    : todaysCoachSessions >= 3
                      ? 'rose'
                      : 'cyan'
                }
              />
              <p className="text-[10px] text-muted-copy">
                {subscription.planId === 'pro'
                  ? '✓ You have unlimited access to the AI Coach.'
                  : 'Upgrade to Pro to unlock unlimited daily AI coaching feedback.'}
              </p>
            </div>

            {/* Module Attempts */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">
                  Daily Module Attempts
                </span>
                <span className="font-medium text-foreground">
                  {subscription.planId === 'pro'
                    ? 'Unlimited'
                    : `${todaysAttempts} / 5 daily attempts`}
                </span>
              </div>
              <ProgressBar
                value={
                  subscription.planId === 'pro'
                    ? 100
                    : Math.min(100, (todaysAttempts / 5) * 100)
                }
                color={
                  subscription.planId === 'pro'
                    ? 'emerald'
                    : todaysAttempts >= 5
                      ? 'rose'
                      : 'emerald'
                }
              />
              <p className="text-[10px] text-muted-copy">
                {subscription.planId === 'pro'
                  ? '✓ You have unlimited module attempts.'
                  : 'Upgrade to Pro to unlock unlimited daily technical attempts.'}
              </p>
            </div>

            {/* Vocabulary Reviews */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">
                  Daily Vocabulary Reviews
                </span>
                <span className="font-medium text-foreground">
                  {subscription.planId === 'pro'
                    ? 'Unlimited'
                    : `${todaysReviews} / 25 reviews`}
                </span>
              </div>
              <ProgressBar
                value={
                  subscription.planId === 'pro'
                    ? 100
                    : Math.min(100, (todaysReviews / 25) * 100)
                }
                color={
                  subscription.planId === 'pro'
                    ? 'cyan'
                    : todaysReviews >= 25
                      ? 'rose'
                      : 'cyan'
                }
              />
              <p className="text-[10px] text-muted-copy">
                {subscription.planId === 'pro'
                  ? '✓ You have unlimited vocabulary reviews.'
                  : 'Upgrade to Pro to review more than 25 terms per day.'}
              </p>
            </div>

            {/* Document Uploads */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">
                  Monthly Document Uploads
                </span>
                <span className="font-medium text-foreground">
                  {subscription.planId === 'free'
                    ? 'Blocked'
                    : subscription.planId === 'pro'
                      ? `${uploadedDocsCount} / 2 uploads`
                      : `${uploadedDocsCount} / Unlimited`}
                </span>
              </div>
              <ProgressBar
                value={
                  subscription.planId === 'free'
                    ? 0
                    : subscription.planId === 'pro'
                      ? Math.min(100, (uploadedDocsCount / 2) * 100)
                      : 100
                }
                color={
                  subscription.planId === 'free'
                    ? 'rose'
                    : uploadedDocsCount >= 2
                      ? 'amber'
                      : 'primary'
                }
              />
              <p className="text-[10px] text-muted-copy">
                {subscription.planId === 'free'
                  ? 'Upgrade to Pro to upload up to 2 technical documents/month.'
                  : subscription.planId === 'pro'
                    ? '✓ Upload documents inside the AI Copilot tab.'
                    : '✓ Unlimited document uploads enabled.'}
              </p>
            </div>
          </div>

          {/* Voice Minute Wallet (Max+) */}
          {(subscription.planId === 'max' ||
            subscription.planId === 'exec' ||
            subscription.planId === 'private') && (
            <div className="col-span-full space-y-1.5 mt-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  🎙️ Monthly Voice Minutes
                </span>
                <span className="font-medium text-foreground">
                  {subscription.planId === 'max'
                    ? `${voiceMinutesUsed} / 120 min`
                    : 'Unlimited'}
                </span>
              </div>
              <ProgressBar
                value={
                  subscription.planId === 'max'
                    ? Math.min(100, (voiceMinutesUsed / 120) * 100)
                    : 100
                }
                color={
                  subscription.planId !== 'max'
                    ? 'cyan'
                    : voiceMinutesUsed >= 108
                      ? 'rose'
                      : voiceMinutesUsed >= 84
                        ? 'amber'
                        : 'cyan'
                }
              />
              <p className="text-[10px] text-muted-copy">
                {subscription.planId === 'max'
                  ? voiceMinutesUsed >= 120
                    ? '⚠️ Monthly voice minute quota reached. Upgrade to Exec for unlimited minutes.'
                    : `✓ ${120 - voiceMinutesUsed} voice minutes remaining this month. Usage resets on the 1st.`
                  : '✓ Unlimited voice minutes included in your plan.'}
              </p>
            </div>
          )}

          {/* Pro benefits block */}
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <h5 className="text-xs font-medium text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-warning fill-warning/20" />
              Pro subscription benefits
            </h5>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-copy">
              <li className="flex items-center gap-1.5">
                <span className="text-success font-medium">✓</span> Spaced
                repetition full repeats
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-success font-medium">✓</span>{' '}
                Writing tasks + secure AI feedback
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-success font-medium">✓</span>{' '}
                Advanced Mistake Log analytics
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-success font-medium">✓</span> Client
                / consultant roleplay scenarios
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-success font-medium">✓</span>{' '}
                12-month progress history storage
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-success font-medium">✓</span> Direct
                Stripe billing portal access
              </li>
            </ul>
            {subscription.planId !== 'private' && (
              <Link
                to="/pricing"
                className="w-full mt-2 h-9 inline-flex items-center justify-center rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/95 transition-colors text-center"
              >
                {subscription.planId === 'free'
                  ? 'Upgrade Plan'
                  : 'Change / Upgrade Plan'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  </section>
);
