import { Building2, Check, MinusCircle, Sparkles, Zap } from 'lucide-react';

import { useEffect, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { PageMetadata } from '@/shared/components/PageMetadata';
import { logger } from '@/shared/logger';

import { ProductAnalyticsService } from '@/features/analytics';
import { useAuthStore } from '@/features/auth';
import {
  BillingPlanId,
  COMMERCIAL_PLAN_CATALOG,
  CommercialPlanPreview,
  useBillingStore,
} from '@/features/billing';
import { EnterpriseQuoteModal } from '@/features/billing/EnterpriseQuoteModal';
import { getBillingApiUrl } from '@/features/billing/billing.helpers';

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

const getAccessBadge = (id: string): string => ACCESS_BADGES[id] ?? 'ACCESS-LVL-01';

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

const getCalculatedPrice = (plan: CommercialPlanPreview, isAnnual: boolean): string => {
  if (plan.id === 'free') return '$0';
  const prices = isAnnual ? ANNUAL_PRICES : MONTHLY_PRICES;
  return prices[plan.id] ?? plan.price;
};

const FreePlanButton = ({ currentUser }: { currentUser: { id: string } | null }) => (
  <Link
    to={currentUser ? '/dashboard' : '/start'}
    className="mt-4 flex h-9 w-full items-center justify-center rounded-lg border border-border-soft bg-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-hover transition-all cursor-pointer shadow-sm text-foreground"
  >
    {currentUser ? 'Go to dashboard' : 'Start free'}
  </Link>
);

const HIGHLIGHTED_PLANS = new Set(['pro', 'project']);

const PLAN_BADGES: Record<string, { icon: typeof Sparkles; label: string; color: string }> = {
  pro: { icon: Sparkles, label: 'Popular', color: 'bg-primary' },
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
  return 'bg-primary text-white hover:bg-primary/95';
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
      className={`flex h-9 w-full items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${style}`}
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

  const { isLoading: isCheckoutLoading, startCheckout, subscription } = useBillingStore();

  const [billingReadiness, setBillingReadiness] = useState<'loading' | 'ready' | 'unavailable'>(
    'loading'
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<BillingPlanId | null>(null);
  const billingApiUrl = getBillingApiUrl();

  useEffect(() => {
    if (!billingApiUrl) {
      setBillingReadiness('unavailable');
      return;
    }
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch(new URL('/api/health', billingApiUrl).toString());
        if (!res.ok) throw new Error();
        const h = await res.json();
        if (!mounted) return;
        setBillingReadiness(h?.stripeConfigured ? 'ready' : 'unavailable');
      } catch (e) {
        logger.w('[PRICING] Health check failed', e);
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
    <main className="bg-background text-foreground min-h-screen relative z-10 pb-16 selection:bg-primary selection:text-primary-foreground">
      <PageMetadata
        title="Pricing Plans & Access Control — EngVox"
        description="Choose the EngVox access level calibrated for your engineering role, project team, or executive organization."
      />

      <Navbar />

      {/* Header & Billing Cycle Switcher */}
      <section className="pt-20 sm:pt-24 pb-8 px-6 md:px-12 max-w-7xl mx-auto border-b border-border-soft">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Pricing & Access Control
              </span>
              <span className="text-xs text-muted-copy font-medium">No hidden lock-in</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Transparent plans for individual engineers & project teams.
            </h1>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface p-2 shadow-sm shrink-0">
            <span
              className={`text-xs font-bold transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-copy'}`}
            >
              Monthly
            </span>

            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-primary"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            <span
              className={`text-xs font-bold transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-copy'}`}
            >
              Annual{' '}
              <span className="ml-1 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[9px] font-bold uppercase border border-primary/20">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* 5-Plan Tier Cards */}
      <section className="py-8 px-6 md:px-12 max-w-[1400px] mx-auto">
        {checkoutError && (
          <p
            className="mx-auto mb-4 max-w-xl rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-500 font-bold uppercase tracking-wider text-center"
            role="alert"
          >
            {checkoutError}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-stretch">
          {ACTIVE_PLANS.map((plan) => {
            const isHighlighted = HIGHLIGHTED_PLANS.has(plan.id);
            const badge = PLAN_BADGES[plan.id];
            const isCurrent = subscription?.planId === plan.id;
            const isThisLoading = isCheckoutLoading && checkoutPlanId === plan.id;
            const unavailable = isPlanUnavailable(plan);

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-xl border p-4 bg-surface transition-all duration-300 hover:border-primary/40 shadow-sm ${
                  isHighlighted
                    ? 'border-2 border-primary shadow-md bg-surface relative scale-[1.01]'
                    : 'border border-border-soft'
                }`}
              >
                {badge && (
                  <div
                    className={`absolute -top-2.5 left-3 rounded-full ${badge.color} px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1`}
                  >
                    <badge.icon className="h-3 w-3" /> {badge.label}
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                    <span className="rounded border border-border-soft bg-background px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-muted-copy uppercase font-mono">
                      {getAccessBadge(plan.id)}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {getCalculatedPrice(plan, isAnnual)}
                    </span>
                    <span className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                      {billingCycleLabel(plan.id)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-copy leading-relaxed font-medium min-h-[32px]">
                    {plan.audience}
                  </p>

                  <div className="mt-2.5 rounded-lg border border-border-soft bg-background p-2">
                    <p className="text-[9px] font-bold text-primary uppercase tracking-wider">
                      Target Audience:
                    </p>
                    <p className="text-xs font-bold text-foreground truncate">{plan.bestFor}</p>
                  </div>

                  <div className="mt-3 border-t border-border-soft/60 pt-2.5">
                    <p className="text-[9px] font-bold text-muted-copy uppercase tracking-wider mb-2">
                      Key Included Features:
                    </p>
                    <ul className="space-y-2">
                      {plan.benefits.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 text-xs text-foreground font-medium"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="leading-tight">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-border-soft">
                  <div className="flex items-start gap-1.5 text-[10px] text-muted-copy font-medium mb-2.5">
                    <MinusCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-copy/60" />
                    <span className="leading-tight">{plan.notIncluded}</span>
                  </div>

                  {plan.id === 'free' ? (
                    <FreePlanButton currentUser={currentUser} />
                  ) : (
                    <PlanAction
                      plan={plan}
                      isCurrent={isCurrent}
                      inProgress={isThisLoading}
                      disabled={
                        !billingEnabled || isThisLoading || isBillingHealthLoading || unavailable
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

      {/* Interactive Team Seat Calculator */}
      <section className="py-8 px-6 md:px-12 max-w-7xl mx-auto border-t border-border-soft">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Calculator
              </span>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary" /> Enterprise Seat Calculator
              </h2>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-primary">
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

          <div className="flex items-center justify-between pt-2 border-t border-primary/15 flex-wrap gap-2">
            <span className="text-xs text-muted-copy font-medium">
              Need custom SSO, dedicated private proxy servers, or 50+ seats?
            </span>
            <button
              type="button"
              onClick={() => setQuoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition cursor-pointer shadow-sm"
            >
              <span>Request Custom Enterprise Quote</span>
              <Zap className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <EnterpriseQuoteModal isOpen={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} />
      </section>

      {/* Comprehensive Feature Comparison Matrix */}
      <section className="py-10 px-6 md:px-12 max-w-7xl mx-auto border-t border-border-soft">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Comparison Matrix
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Compare All Plan Capabilities
            </h2>
          </div>
          <p className="text-xs text-muted-copy max-w-xl leading-tight">
            Detailed breakdown of AI allowances, voice meeting modules, team seats, and security
            standards.
          </p>
        </div>

        <div
          className="overflow-x-auto rounded-xl border border-border-soft shadow-md bg-background"
          tabIndex={0}
          role="region"
          aria-label="Plan comparison table"
        >
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead className="bg-surface border-b border-border-soft">
              <tr>
                <th className="p-3.5 text-xs font-extrabold uppercase tracking-wider text-foreground">
                  Capabilities & Limits
                </th>
                {ACTIVE_PLANS.map((p) => (
                  <th
                    key={p.id}
                    className="p-3.5 text-xs font-extrabold uppercase tracking-wider text-foreground text-center"
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['learning', 'ai', 'analytics', 'team', 'limits'] as const).map((key) => (
                <tr
                  key={key}
                  className="border-b border-border-soft/60 last:border-0 hover:bg-surface/50 transition-colors"
                >
                  <td className="p-3.5 font-bold text-foreground capitalize">
                    {key === 'ai' ? 'AI Voice & Writing Coach' : key}
                  </td>
                  {ACTIVE_PLANS.map((p) => (
                    <td key={p.id} className="p-3.5 text-center text-muted-copy font-medium">
                      {p.comparison[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer Link Back to Home */}
      <section className="px-6 md:px-12 pt-8 pb-4 max-w-7xl mx-auto border-t border-border-soft">
        <div className="flex items-center justify-between text-xs text-muted-copy">
          <span>EngVox Engineering Operating System © 2026</span>
          <Link to="/" className="font-bold text-primary hover:underline flex items-center gap-1">
            <span>Back to Home</span>
            <Zap className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;
