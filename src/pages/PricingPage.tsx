import { Check, MinusCircle, Sparkles, Building2, Zap } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  COMMERCIAL_PLAN_CATALOG,
  CommercialPlanPreview,
  useBillingStore,
  BillingPlanId,
} from '@/features/billing';
import { getBillingApiUrl } from '@/features/billing/billing.helpers';
import { useAuthStore } from '@/features/auth';
import { PageMetadata } from '@/shared/components/PageMetadata';
import { ProductAnalyticsService } from '@/features/analytics';
import { EnterpriseQuoteModal } from '@/features/billing/EnterpriseQuoteModal';
import { Navbar } from '@/pages/LandingPage/Navbar';

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const isPlanUnavailable = (plan: CommercialPlanPreview) =>
  plan.id === 'exec' || plan.id === 'private';

const ACTIVE_PLANS = COMMERCIAL_PLAN_CATALOG.filter((plan) =>
  ['free', 'pro', 'project', 'exec', 'private'].includes(plan.id)
);

const ACCESS_BADGES: Record<string, string> = {
  free: 'ACCESS-LVL-00',
  pro: 'ACCESS-LVL-01',
  project: 'ACCESS-LVL-02',
  exec: 'ACCESS-LVL-03',
  private: 'SECURE-PRIVATE',
};

const getAccessBadge = (id: string): string =>
  ACCESS_BADGES[id] ?? 'ACCESS-LVL-01';

const ANNUAL_PRICES: Record<string, string> = {
  pro: '$23',
  project: '$47',
  exec: '$79',
  private: '$799',
};

const MONTHLY_PRICES: Record<string, string> = {
  free: '$0',
  pro: '$29',
  project: '$59',
  exec: '$99',
  private: '$999',
};

const getCalculatedPrice = (
  plan: CommercialPlanPreview,
  isAnnual: boolean
): string => {
  if (plan.id === 'free') return '$0';
  const prices = isAnnual ? ANNUAL_PRICES : MONTHLY_PRICES;
  return prices[plan.id] ?? plan.price;
};

const FreePlanButton = ({
  currentUser,
}: {
  currentUser: { id: string } | null;
}) => (
  <Link
    to={currentUser ? '/dashboard' : '/start'}
    className="mt-5 flex h-10 w-full items-center justify-center rounded-xl border border-border-soft bg-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-hover transition-all cursor-pointer shadow-sm text-foreground"
  >
    {currentUser ? 'Go to dashboard' : 'Start free'}
  </Link>
);

const HIGHLIGHTED_PLANS = new Set(['pro', 'project']);

const PLAN_BADGES: Record<
  string,
  { icon: typeof Sparkles; label: string; color: string }
> = {
  pro: { icon: Sparkles, label: 'Recommended', color: 'bg-primary' },
  project: {
    icon: Building2,
    label: 'Engineering Teams',
    color: 'bg-blue-600',
  },
};

const getPlanActionLabel = ({
  planId,
  isCurrent,
  inProgress,
  isUnavailable,
}: {
  planId: string;
  isCurrent: boolean;
  inProgress: boolean;
  isUnavailable: boolean;
}): string => {
  if (isUnavailable) return 'Contact Sales';
  if (isCurrent) return 'Current plan';
  if (inProgress) return 'Loading...';
  const plan = COMMERCIAL_PLAN_CATALOG.find((p) => p.id === planId);
  return `Upgrade to ${plan?.name ?? planId}`;
};

const getPlanActionStyle = ({
  isUnavailable,
  isCurrent,
}: {
  isUnavailable: boolean;
  isCurrent: boolean;
}): string => {
  if (isUnavailable) {
    return 'border border-border-soft bg-surface text-muted-copy cursor-not-allowed opacity-60';
  }
  if (isCurrent) {
    return 'border border-success/30 bg-success/10 text-success cursor-not-allowed';
  }
  return 'bg-primary text-white hover:bg-primary-hover';
};

const PlanAction = ({
  plan,
  isCurrent,
  inProgress,
  disabled,
  onClick,
}: {
  plan: CommercialPlanPreview;
  isCurrent: boolean;
  inProgress: boolean;
  disabled: boolean;
  onClick: () => void;
}) => {
  const unavailable = isPlanUnavailable(plan);
  const label = getPlanActionLabel({
    planId: plan.id,
    isCurrent,
    inProgress,
    isUnavailable: unavailable,
  });
  const style = getPlanActionStyle({ isUnavailable: unavailable, isCurrent });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md ${style}`}
    >
      {label}
    </button>
  );
};

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, initialize: initializeAuth } = useAuthStore();

  const [isAnnual, setIsAnnual] = useState(false);
  const [teamSeats, setTeamSeats] = useState(5);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  useEffect(() => {
    void initializeAuth();
    ProductAnalyticsService.track('screen_viewed', 'pricing');
    ProductAnalyticsService.trackOnce('paywall_viewed', 'pricing');
  }, [initializeAuth]);

  const {
    isLoading: isCheckoutLoading,
    startCheckout,
    subscription,
  } = useBillingStore();

  const [billingReadiness, setBillingReadiness] = useState<
    'loading' | 'ready' | 'unavailable'
  >('loading');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<BillingPlanId | null>(
    null
  );
  const billingApiUrl = getBillingApiUrl();

  useEffect(() => {
    if (!billingApiUrl) {
      setBillingReadiness('unavailable');
      return;
    }
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch(
          new URL('/api/health', billingApiUrl).toString()
        );
        if (!res.ok) throw new Error();
        const h = await res.json();
        if (!mounted) return;
        setBillingReadiness(h?.stripeConfigured ? 'ready' : 'unavailable');
      } catch {
        if (!mounted) return;
        setBillingReadiness('unavailable');
      }
    };
    void check();
    return () => {
      mounted = false;
    };
  }, [billingApiUrl]);

  const billingEnabled = billingReadiness === 'ready';
  const isBillingHealthLoading = billingReadiness === 'loading';

  const handleCheckout = async (planId: BillingPlanId) => {
    setCheckoutError(null);
    if (!currentUser) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (currentUser.id.startsWith('demo_engineer_')) {
      setCheckoutError('Demo profiles cannot make purchases.');
      return;
    }
    try {
      setCheckoutPlanId(planId);
      await startCheckout(currentUser.id, currentUser.email, planId);
    } catch (err: unknown) {
      setCheckoutError(getErrorMessage(err, 'Checkout failed.'));
    } finally {
      setCheckoutPlanId(null);
    }
  };

  const billingCycleLabel = (planId: string) => {
    if (planId === 'free') return '/ permanent';
    return isAnnual ? '/ mo (billed yearly)' : '/ month';
  };

  return (
    <main className="bg-background text-foreground min-h-screen relative z-10 pb-20 selection:bg-primary selection:text-primary-foreground">
      <PageMetadata
        title="Pricing Plans & Access Control"
        description="Choose the EngVox access level calibrated for your engineering role."
      />

      <Navbar />

      <section className="pt-24 pb-12 px-4 sm:px-6">
        {checkoutError && (
          <p
            className="mx-auto mb-4 max-w-xl rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-500 font-bold uppercase tracking-wider text-center"
            role="alert"
          >
            {checkoutError}
          </p>
        )}
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
          {ACTIVE_PLANS.map((plan) => {
            const isHighlighted = HIGHLIGHTED_PLANS.has(plan.id);
            const badge = PLAN_BADGES[plan.id];
            const isCurrent = subscription?.planId === plan.id;
            const isThisLoading =
              isCheckoutLoading && checkoutPlanId === plan.id;
            const unavailable = isPlanUnavailable(plan);

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 bg-surface/90 backdrop-blur-xl transition-all duration-300 hover:border-border-hover shadow-lg ${
                  isHighlighted
                    ? 'border-primary/60 ring-2 ring-primary/20'
                    : 'border-border-soft'
                }`}
              >
                {badge && (
                  <div
                    className={`absolute -top-3 left-4 rounded-full ${badge.color} px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1`}
                  >
                    <badge.icon className="h-3 w-3" /> {badge.label}
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-extrabold text-foreground">
                      {plan.name}
                    </h3>
                    <span className="rounded-lg border border-border-soft bg-background px-2 py-0.5 text-[9px] font-bold tracking-wider text-muted-copy uppercase font-mono">
                      {getAccessBadge(plan.id)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground">
                      {getCalculatedPrice(plan, isAnnual)}
                    </span>
                    <span className="ml-1 text-[11px] font-bold text-muted-copy uppercase tracking-wider">
                      {billingCycleLabel(plan.id)}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs text-muted-copy leading-relaxed font-medium min-h-[2.5rem]">
                    {plan.audience}
                  </p>

                  <div className="mt-3 rounded-xl border border-border-soft bg-background p-2.5 shadow-inner">
                    <p className="text-[9px] font-bold text-primary uppercase tracking-wider">
                      Target Audience:
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-foreground">
                      {plan.bestFor}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-border-soft pt-3">
                    <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider mb-2">
                      Key Included Features:
                    </p>
                    <ul className="space-y-2">
                      {plan.benefits.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 text-xs text-foreground font-medium"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border-soft">
                  <div className="flex items-start gap-2 text-[10px] text-muted-copy font-medium mb-3">
                    <MinusCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-copy" />
                    <span>{plan.notIncluded}</span>
                  </div>

                  {plan.id === 'free' ? (
                    <FreePlanButton currentUser={currentUser} />
                  ) : (
                    <PlanAction
                      plan={plan}
                      isCurrent={isCurrent}
                      inProgress={isThisLoading}
                      disabled={
                        !billingEnabled ||
                        isThisLoading ||
                        isBillingHealthLoading ||
                        unavailable
                      }
                      onClick={() => void handleCheckout(plan.id)}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Interactive Team Seat Calculator
              </h2>
              <p className="text-xs text-muted-copy mt-0.5">
                Bulk licensing for site engineering teams, QA/QC departments,
                and MEP contractors.
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-primary">
                {teamSeats} Engineer Seats
              </span>
              <span className="block text-xs font-bold text-muted-copy">
                (${teamSeats * (isAnnual ? 15 : 19)} / month total)
              </span>
            </div>
          </div>

          <input
            type="range"
            min="2"
            max="50"
            value={teamSeats}
            onChange={(e) => setTeamSeats(Number(e.target.value))}
            className="w-full h-2 rounded-lg accent-primary cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-bold text-muted-copy">
            <span>2 Seats ($30/mo)</span>
            <span>25 Seats ($375/mo)</span>
            <span>50+ Seats (Custom Enterprise)</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-primary/20 flex-wrap gap-2">
            <span className="text-xs text-muted-copy font-medium">
              Need custom SSO, dedicated servers, or 50+ seats?
            </span>
            <button
              type="button"
              onClick={() => setQuoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-hover transition cursor-pointer shadow-sm"
            >
              <span>Request Custom Enterprise Quote</span>
              <Zap className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <EnterpriseQuoteModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
        />
      </section>

      <section className="py-12 bg-surface/80 border-t border-b border-border-soft backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-8 space-y-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">
              Comprehensive Feature Matrix
            </span>
            <h2 className="text-2xl font-extrabold text-foreground">
              Compare All Plan Capabilities
            </h2>
            <p className="text-xs text-muted-copy font-medium max-w-lg mx-auto">
              Detailed breakdown of AI allowances, voice meeting modules, team
              seats, and security standards.
            </p>
          </div>

          {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
          <div
            className="overflow-x-auto rounded-2xl border border-border-soft shadow-xl bg-background"
            tabIndex={0}
            role="region"
            aria-label="Plan comparison table"
          >
            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
              <thead className="bg-surface border-b border-border-soft">
                <tr>
                  <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-foreground">
                    Capabilities & Limits
                  </th>
                  {ACTIVE_PLANS.map((p) => (
                    <th
                      key={p.id}
                      className="p-4 text-xs font-extrabold uppercase tracking-wider text-foreground text-center"
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  ['learning', 'ai', 'analytics', 'team', 'limits'] as const
                ).map((key) => (
                  <tr
                    key={key}
                    className="border-b border-border-soft/60 last:border-0 hover:bg-surface/50 transition-colors"
                  >
                    <td className="p-4 font-bold text-foreground capitalize">
                      {key === 'ai' ? 'AI Voice & Writing Coach' : key}
                    </td>
                    {ACTIVE_PLANS.map((p) => (
                      <td
                        key={p.id}
                        className="p-4 text-center text-muted-copy font-medium"
                      >
                        {p.comparison[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
        </div>
      </section>

      <section className="py-12 text-center bg-background border-t border-border-soft">
        <div className="mx-auto max-w-xl px-4 space-y-4">
          <h3 className="text-base font-extrabold text-foreground">
            Select Your Billing Cycle
          </h3>

          <div className="inline-flex items-center justify-center gap-4 rounded-2xl border border-border-soft bg-surface p-4 shadow-xl">
            <span
              className={`text-xs font-bold transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-copy'}`}
            >
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-primary"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>

            <span
              className={`text-xs font-bold transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-copy'}`}
            >
              Annual Billing{' '}
              <span className="ml-1 rounded-full bg-success/20 px-2.5 py-0.5 text-[10px] font-extrabold text-success border border-success/30">
                SAVE 20%
              </span>
            </span>
          </div>

          <p className="text-[11px] text-muted-copy font-medium">
            Switch anytime between monthly and annual billing. VAT & local taxes
            included where applicable.
          </p>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;
