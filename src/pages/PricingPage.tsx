import {
  Building2,
  Check,
  Cpu,
  FileCheck,
  FileText,
  Globe,
  MinusCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

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
import { getBillingApiUrl } from '@/features/billing/billing.helpers';
import { CurrencyConfig } from '@/features/billing/currency.config';

import { Navbar } from '@/pages/LandingPage/Navbar';
import { PricingAddonsCard } from '@/pages/LandingPage/PricingAddonsCard';
import { SalesChatModal } from '@/pages/LandingPage/SalesChatModal';

import { DpaContractGeneratorModal } from './PricingPage/DpaContractGeneratorModal';
import { EnterpriseQuoteCalculatorModal } from './PricingPage/EnterpriseQuoteCalculatorModal';
import { InvoiceTaxManagerModal } from './PricingPage/InvoiceTaxManagerModal';
import { SecurityWhitepaperModal } from './PricingPage/SecurityWhitepaperModal';
import { SlaGuaranteeMatrix } from './PricingPage/SlaGuaranteeMatrix';
import { TrustCenterBadges } from './PricingPage/TrustCenterBadges';

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

const BASE_USD_MAP: Record<string, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  pro: { monthly: 29, annual: 23 },
  project: { monthly: 59, annual: 47 },
  exec: { monthly: 99, annual: 79 },
  private: { monthly: 999, annual: 799 },
};

const getCalculatedPrice = (
  plan: CommercialPlanPreview,
  isAnnual: boolean,
  currencyCode = 'USD'
): string => {
  if (plan.id === 'free') return CurrencyConfig.formatPrice(0, currencyCode);
  const p = BASE_USD_MAP[plan.id] || { monthly: 29, annual: 23 };
  const usd = isAnnual ? p.annual : p.monthly;
  return CurrencyConfig.formatPrice(usd, currencyCode);
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
  const [whitepaperOpen, setWhitepaperOpen] = useState(false);
  const [slaOpen, setSlaOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [dpaOpen, setDpaOpen] = useState(false);

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

  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  return (
    <main className="bg-background text-foreground min-h-screen relative z-10 pb-16 selection:bg-primary selection:text-primary-foreground">
      <PageMetadata
        title="Pricing Plans & Access Control — EngVox"
        description="Choose the EngVox access level calibrated for your engineering role, project team, or executive organization."
      />

      <Navbar />

      {/* Header & Billing Cycle Switcher with Multi-Currency (Item 15) */}
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

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* ITEM 15: Global Currency Switcher */}
            <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-border-soft text-xs font-bold shadow-sm">
              <Globe className="h-4 w-4 text-primary" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              >
                {CurrencyConfig.CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-background text-foreground">
                    {c.flag} {c.code} ({c.symbol}) — {c.region}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface p-2 shadow-sm">
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
                className={`relative flex flex-col justify-between rounded-xl p-4 bg-surface transition-all duration-300 hover:border-primary/40 shadow-sm ${
                  isHighlighted
                    ? 'border-2 border-primary shadow-xl scale-[1.01]'
                    : 'border border-border-soft'
                }`}
              >
                {/* ITEM 16: Border-Beam Halo for Pro Plan */}
                {plan.id === 'pro' && (
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-400 via-primary to-indigo-600 blur-sm opacity-40 animate-ambient-glow pointer-events-none" />
                )}

                {badge && (
                  <div
                    className={`absolute -top-3 left-3 rounded-full ${badge.color} px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1 z-20`}
                  >
                    <badge.icon className="h-3 w-3" /> {badge.label}
                  </div>
                )}

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2 gap-1">
                      <h3 className="text-xs sm:text-sm font-extrabold text-foreground truncate">
                        {plan.name}
                      </h3>
                      <span className="rounded border border-border-soft bg-background px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-muted-copy uppercase font-mono shrink-0">
                        {getAccessBadge(plan.id)}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-2 flex-wrap">
                      <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground font-mono">
                        {getCalculatedPrice(plan, isAnnual, selectedCurrency)}
                      </span>
                      <span className="text-[9px] font-bold text-muted-copy uppercase tracking-wider">
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
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ITEM 19: Interactive Team Seat Calculator with Automatic Tiered Discounts */}
      <section className="py-8 px-6 md:px-12 max-w-7xl mx-auto border-t border-border-soft">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
                Item 19 / Seat Calculator
              </span>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary" /> Enterprise Seat Calculator
              </h2>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-primary font-mono">
                {teamSeats} Engineer Seats
              </span>
              {/* Dynamic Discount Calculation */}
              {(() => {
                const basePerSeatUsd = isAnnual ? 15 : 19;
                let discountPct = 0;
                if (teamSeats >= 10) discountPct = 25;
                else if (teamSeats >= 5) discountPct = 15;

                const discountedPerSeat = Math.round(basePerSeatUsd * (1 - discountPct / 100));
                const totalUsd = teamSeats * discountedPerSeat;
                const formattedTotal = CurrencyConfig.formatPrice(totalUsd, selectedCurrency);

                return (
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs font-bold text-foreground font-mono">
                      {formattedTotal}/month
                    </span>
                    {discountPct > 0 && (
                      <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                        {discountPct}% Tier Discount
                      </span>
                    )}
                  </div>
                );
              })()}
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

          <div className="flex justify-between text-[10px] font-bold text-muted-copy font-mono">
            <span>2 Seats (Standard)</span>
            <span className="text-emerald-600">5-9 Seats (15% Team Discount)</span>
            <span className="text-primary">10+ Seats (25% Bulk Discount)</span>
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

        {/* ITEM 17: Micro-Transaction Add-ons */}
        <PricingAddonsCard />
      </section>

      {/* Comprehensive Feature Comparison Matrix */}
      <section className="py-10 px-6 md:px-12 max-w-7xl mx-auto border-t border-border-soft">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
              Comparison Matrix
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Compare All Plan Capabilities & Security
            </h2>
          </div>
          <p className="text-xs text-muted-copy max-w-xl leading-tight">
            Detailed breakdown of AI allowances, voice meeting modules, team seats, and security
            standards.
          </p>
        </div>

        {/* 360° Rotating Ambient Light Ring Wrapper around Comparison Matrix */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-blue-500 to-indigo-600 blur-xl opacity-45 animate-spin-slow pointer-events-none" />

          <div
            className="relative z-10 overflow-x-auto rounded-xl border border-primary/30 shadow-2xl bg-background/95 backdrop-blur-xl light-sweep-container"
            tabIndex={0}
            role="region"
            aria-label="Plan comparison table"
          >
            <table className="w-full min-w-[750px] border-collapse text-left text-xs">
              <thead className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-indigo-500/10 border-b border-primary/25">
                <tr>
                  <th className="p-4 text-xs font-extrabold uppercase tracking-wider text-foreground">
                    Capabilities & Standards
                  </th>
                  {ACTIVE_PLANS.map((p) => (
                    <th
                      key={p.id}
                      className={`p-4 text-xs font-extrabold tracking-wider text-center ${
                        p.id === 'pro'
                          ? 'bg-primary/15 border-x border-primary/30 text-primary'
                          : 'text-foreground'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold uppercase">{p.name}</span>
                        <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                          {getAccessBadge(p.id)}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    {
                      key: 'learning',
                      label: 'Domain Learning Modules',
                      icon: Sparkles,
                      tooltip:
                        'Access to 10 engineering disciplines, CEFR A1-C2 curriculum, and ASTM/Eurocode vocabulary.',
                    },
                    {
                      key: 'ai',
                      label: 'AI Voice & Writing Coach',
                      icon: Cpu,
                      tooltip:
                        'Real-time oral defense practice, FIDIC contract correction, and technical presentation feedback.',
                    },
                    {
                      key: 'analytics',
                      label: 'Analytics & Skill Metrics',
                      icon: Check,
                      tooltip:
                        'CEFR progression tracking, team performance dashboards, and error diagnostic logs.',
                    },
                    {
                      key: 'team',
                      label: 'Team Management & SSO',
                      icon: Building2,
                      tooltip:
                        'Group seat allocation, SAML/Okta single sign-on, and central billing control.',
                    },
                    {
                      key: 'limits',
                      label: 'Usage Allowance Limits',
                      icon: Zap,
                      tooltip:
                        'Monthly voice practice minutes, document upload counts, and AI token limits.',
                    },
                  ] as const
                ).map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-border-soft/60 last:border-0 hover:bg-primary/5 transition-colors"
                  >
                    <td className="p-3.5 font-bold text-foreground capitalize flex items-center gap-2">
                      <row.icon className="h-4 w-4 text-primary shrink-0" />
                      <span>{row.label}</span>
                    </td>
                    {ACTIVE_PLANS.map((p) => {
                      const value = p.comparison[row.key];
                      const isProCol = p.id === 'pro';
                      const isUnlimited = value.toLowerCase().includes('unlimited');
                      return (
                        <td
                          key={p.id}
                          className={`p-3.5 text-center font-semibold text-xs leading-relaxed transition-colors ${
                            isProCol ? 'bg-primary/5 border-x border-primary/20' : ''
                          }`}
                        >
                          {isUnlimited ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 font-mono">
                              <Check className="h-3 w-3 text-emerald-500" /> {value}
                            </span>
                          ) : (
                            <span className="text-foreground/90">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ITEM 32 & ITEM 40: Trust Center & Dedicated CSM Badges */}
      <TrustCenterBadges
        onOpenSecurityWhitepaper={() => setWhitepaperOpen(true)}
        onOpenSlaMatrix={() => setSlaOpen(true)}
      />

      {/* Section 4 Quick Legal & Tax Toolbar */}
      <section className="py-4 border-t border-border-soft/60 bg-background">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setInvoiceOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-soft border border-border-soft px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/40 transition cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-primary" /> Corporate Invoice & Tax ID
          </button>
          <button
            type="button"
            onClick={() => setDpaOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-soft border border-border-soft px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/40 transition cursor-pointer"
          >
            <FileCheck className="h-3.5 w-3.5 text-emerald-500" /> Instant DPA & MSA Contract
          </button>
          <button
            type="button"
            onClick={() => setQuoteModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" /> Custom Seat Quote Calculator
          </button>
        </div>
      </section>

      {/* Section 4 Modals (Items 31 - 40) */}
      <EnterpriseQuoteCalculatorModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
      />
      <SecurityWhitepaperModal isOpen={whitepaperOpen} onClose={() => setWhitepaperOpen(false)} />
      <SlaGuaranteeMatrix isOpen={slaOpen} onClose={() => setSlaOpen(false)} />
      <InvoiceTaxManagerModal isOpen={invoiceOpen} onClose={() => setInvoiceOpen(false)} />
      <DpaContractGeneratorModal isOpen={dpaOpen} onClose={() => setDpaOpen(false)} />

      {/* ITEM 20: Sales Chat Floating Trigger */}
      <SalesChatModal />

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
