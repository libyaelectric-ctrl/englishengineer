import { Check, MinusCircle, ShieldAlert } from 'lucide-react';
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

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const isPlanUnavailable = (plan: CommercialPlanPreview) =>
  plan.id === 'exec' || plan.id === 'private';

const ACTIVE_PLANS = COMMERCIAL_PLAN_CATALOG.filter((plan) =>
  ['free', 'pro', 'project', 'exec', 'private'].includes(plan.id)
);

const getAccessBadge = (id: string): string => {
  switch (id) {
    case 'free':
      return 'ACCESS-LVL-00';
    case 'pro':
      return 'ACCESS-LVL-01';
    case 'project':
      return 'ACCESS-LVL-02';
    case 'exec':
      return 'ACCESS-LVL-03';
    case 'private':
      return 'SECURE-PRIVATE';
    default:
      return 'ACCESS-LVL-01';
  }
};

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, initialize: initializeAuth } = useAuthStore();

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
  const [billingBanner, setBillingBanner] = useState(
    'Checking billing status...'
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<BillingPlanId | null>(
    null
  );
  const billingApiUrl = getBillingApiUrl();

  useEffect(() => {
    if (!billingApiUrl) {
      setBillingReadiness('unavailable');
      setBillingBanner('Billing service is not configured.');
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
        if (h?.stripeConfigured) {
          setBillingReadiness('ready');
          setBillingBanner('Secure checkout available.');
        } else {
          setBillingReadiness('unavailable');
          setBillingBanner('Billing service is not verified.');
        }
      } catch {
        if (!mounted) return;
        setBillingReadiness('unavailable');
        setBillingBanner('Billing service is unavailable.');
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

  const FreePlanButton = ({
    currentUser,
  }: {
    currentUser: { id: string } | null;
  }) => (
    <Link
      to={currentUser ? '/dashboard' : '/start'}
      className="mt-6 flex h-10 w-full items-center justify-center rounded-[4px] border border-[#d9d9e3] bg-white text-xs font-bold uppercase tracking-wider hover:bg-[#faf8ff] transition-all cursor-pointer shadow-sm text-foreground"
    >
      {currentUser ? 'Go to dashboard' : 'Start free'}
    </Link>
  );

  const isPlanCardHighlighted = (planId: string) =>
    planId === 'pro' || planId === 'project';

  const PlanCard = ({
    plan,
    subscription,
    billingEnabled,
    isCheckoutLoading,
    checkoutPlanId,
    isBillingHealthLoading,
    currentUser,
    onCheckout,
  }: {
    plan: CommercialPlanPreview;
    subscription: { planId: string } | null;
    billingEnabled: boolean;
    isCheckoutLoading: boolean;
    checkoutPlanId: string | null;
    isBillingHealthLoading: boolean;
    currentUser: { id: string } | null;
    onCheckout: (planId: BillingPlanId) => void;
  }) => (
    <article
      key={plan.id}
      className={`relative flex flex-col rounded-[4px] border p-6 bg-white ${
        isPlanCardHighlighted(plan.id)
          ? 'border-[#0047bb]/50 shadow-md'
          : 'border-[#d9d9e3] shadow-sm'
      }`}
    >
      {plan.id === 'pro' && (
        <div className="absolute -top-3 left-4 rounded-[4px] bg-[#0047bb] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
          Recommended
        </div>
      )}
      <div className="flex items-start justify-between">
        <p className="text-sm font-bold text-foreground">{plan.name}</p>
        <span className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] px-2 py-0.5 text-[9px] font-bold tracking-wider text-muted-copy uppercase font-mono">
          {getAccessBadge(plan.id)}
        </span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
        {plan.price}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
        {plan.cadence}
      </p>
      <p className="mt-3 min-h-[3rem] text-xs text-muted-copy leading-relaxed font-medium">
        {plan.audience}
      </p>
      <div className="mt-3 rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-3 shadow-sm">
        <p className="text-[9px] font-bold text-muted-copy uppercase tracking-wider">
          Best for
        </p>
        <p className="mt-0.5 text-xs font-bold text-foreground">
          {plan.bestFor}
        </p>
      </div>
      <p className="mt-4 text-[9px] font-bold text-muted-copy uppercase tracking-wider">
        Included
      </p>
      <ul className="mt-2 flex-1 space-y-2">
        {plan.benefits.map((b) => (
          <li
            key={b}
            className="flex gap-2 text-xs text-muted-copy font-medium"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0047bb]" />
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2 border-t border-[#d9d9e3] pt-3 text-[10px] text-muted-copy font-medium">
        <MinusCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-copy" />
        {plan.notIncluded}
      </div>
      {plan.id === 'free' ? (
        <FreePlanButton currentUser={currentUser} />
      ) : (
        <PlanAction
          plan={plan}
          isCurrent={subscription?.planId === plan.id}
          inProgress={isCheckoutLoading && checkoutPlanId === plan.id}
          disabled={
            !billingEnabled ||
            (isCheckoutLoading && checkoutPlanId === plan.id) ||
            isBillingHealthLoading ||
            isPlanUnavailable(plan)
          }
          onClick={() => onCheckout(plan.id)}
        />
      )}
    </article>
  );

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
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`mt-6 flex h-10 w-full items-center justify-center rounded-[4px] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
        isPlanUnavailable(plan)
          ? 'border border-[#d9d9e3] bg-white text-muted-copy cursor-not-allowed opacity-50'
          : isCurrent
            ? 'border border-success/20 bg-success/10 text-success cursor-not-allowed'
            : 'bg-[#0047bb] text-white hover:bg-[#0047bb]/95'
      }`}
    >
      {isPlanUnavailable(plan)
        ? 'Coming soon'
        : isCurrent
          ? 'Current plan'
          : inProgress
            ? 'Loading...'
            : `Upgrade to ${plan.name}`}
    </button>
  );

  return (
    <main className="bg-[#faf8ff] text-foreground min-h-screen relative z-10 pb-16">
      <PageMetadata
        title="Pricing"
        description="Choose the EngVox plan that fits your work."
      />

      <section className="py-10 text-center relative overflow-hidden border-b border-[#d9d9e3] bg-white">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#0047bb 1px, transparent 1px), linear-gradient(90deg, #0047bb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="mx-auto max-w-3xl px-4 relative z-10">
          <div className="flex justify-center mb-4">
            <img src="/brand/mascot.jpg" alt="Mascor" className="h-20 w-auto" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#0047bb]">
            Pricing Plans & Access Control
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl tracking-tight text-foreground">
            Choose your access level.
          </h1>
          <p className="mt-3 text-xs text-muted-copy max-w-xl mx-auto font-medium">
            AI-powered communication training for engineers on international
            projects.
          </p>

          {billingReadiness !== 'ready' && subscription?.planId !== 'pro' && (
            <div className="mx-auto mt-6 flex w-fit items-start gap-2 rounded-[4px] border border-warning/20 bg-warning/5 px-4 py-2.5 text-xs text-warning">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[10px]">
                {billingBanner}
              </span>
            </div>
          )}
          {checkoutError && (
            <p
              className="mx-auto mt-3 max-w-xl rounded-[4px] border border-error/20 bg-error/5 px-4 py-2.5 text-xs text-error font-bold uppercase tracking-wider"
              role="alert"
            >
              {checkoutError}
            </p>
          )}
        </div>
      </section>

      {/* Plans grid */}
      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
          {ACTIVE_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              subscription={subscription}
              billingEnabled={billingEnabled}
              isCheckoutLoading={isCheckoutLoading}
              checkoutPlanId={checkoutPlanId}
              isBillingHealthLoading={isBillingHealthLoading}
              currentUser={currentUser}
              onCheckout={(id) => void handleCheckout(id)}
            />
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-12 bg-white border-t border-b border-[#d9d9e3]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-lg font-bold text-foreground">Compare plans</h2>
          <div className="mt-4 overflow-x-auto rounded-[4px] border border-[#d9d9e3] shadow-sm">
            <table className="w-full min-w-[600px] border-collapse bg-white text-left text-xs">
              <thead className="bg-[#f3f3fd]">
                <tr>
                  <th className="border-b border-[#d9d9e3] p-3 text-xs font-bold uppercase tracking-wider text-foreground">
                    Feature
                  </th>
                  {ACTIVE_PLANS.filter((p) =>
                    ['free', 'pro', 'project', 'exec'].includes(p.id)
                  ).map((p) => (
                    <th
                      key={p.id}
                      className="border-b border-[#d9d9e3] p-3 text-xs font-bold uppercase tracking-wider text-foreground text-center"
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
                    className="border-b border-[#d9d9e3]/60 last:border-0 hover:bg-[#faf8ff] transition-colors"
                  >
                    <td className="p-3 font-bold text-foreground capitalize">
                      {key === 'ai' ? 'AI Coach' : key}
                    </td>
                    {ACTIVE_PLANS.filter((p) =>
                      ['free', 'pro', 'project', 'exec'].includes(p.id)
                    ).map((p) => (
                      <td
                        key={p.id}
                        className="p-3 text-center text-muted-copy font-medium"
                      >
                        {p.comparison[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enterprise section */}
          <div
            className="mt-8 rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-6 shadow-sm relative overflow-hidden"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 71, 187, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 71, 187, 0.03) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#0047bb] text-white text-xs font-bold uppercase tracking-wider font-mono shadow-sm">
                EP
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Enterprise & Private
                </h3>
                <p className="text-xs text-muted-copy font-medium">
                  For large teams and government contractors
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 relative z-10">
              <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">Exec</p>
                  <span className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] px-2 py-0.5 text-[9px] font-bold tracking-wider text-muted-copy uppercase font-mono">
                    ACCESS-LVL-04
                  </span>
                </div>
                <p className="mt-2 text-xs font-extrabold tracking-tight text-foreground">
                  $99/mo
                </p>
                <p className="mt-1.5 text-xs text-muted-copy font-medium leading-relaxed">
                  VIP coaching, priority support, offline audio
                </p>
              </div>
              <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">Private</p>
                  <span className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] px-2 py-0.5 text-[9px] font-bold tracking-wider text-muted-copy uppercase font-mono">
                    SECURE-PRIVATE
                  </span>
                </div>
                <p className="mt-2 text-xs font-extrabold tracking-tight text-foreground">
                  $999/mo
                </p>
                <p className="mt-1.5 text-xs text-muted-copy font-medium leading-relaxed">
                  Dedicated server, zero-data retention, custom security
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-copy font-medium relative z-10">
              Contact us for enterprise deployment and custom requirements.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;
