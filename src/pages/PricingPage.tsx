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

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

// The active purchasable plans
const ACTIVE_PLANS = COMMERCIAL_PLAN_CATALOG;

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuthStore();
  const {
    isLoading: isCheckoutLoading,
    startCheckout,
    subscription,
  } = useBillingStore();
  const [billingReadiness, setBillingReadiness] = useState<
    'loading' | 'ready' | 'unavailable'
  >('loading');
  const [billingBanner, setBillingBanner] = useState(
    'Checking Stripe billing readiness...'
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<BillingPlanId | null>(
    null
  );
  const billingApiUrl = getBillingApiUrl();

  useEffect(() => {
    if (!billingApiUrl) {
      setBillingReadiness('unavailable');
      setBillingBanner(
        (import.meta as any).env?.DEV
          ? 'Stripe billing is running in local developer mode.'
          : 'Billing service is temporarily unavailable.'
      );
      return;
    }

    let mounted = true;

    const checkBillingHealth = async () => {
      try {
        const healthUrl = new URL('/api/health', billingApiUrl).toString();
        const response = await fetch(healthUrl);
        if (!response.ok) {
          throw new Error('Billing health check failed.');
        }
        const health = await response.json();
        if (!mounted) return;

        if (health?.stripeConfigured === true) {
          setBillingReadiness('ready');
          setBillingBanner('Secure Stripe checkout is available.');
        } else {
          setBillingReadiness('unavailable');
          setBillingBanner(
            (import.meta as any).env?.DEV
              ? 'Billing service is running in local developer mode (Stripe backend is not verified).'
              : 'Billing service is temporarily unavailable.'
          );
        }
      } catch {
        if (!mounted) return;
        setBillingReadiness('unavailable');
        setBillingBanner(
          (import.meta as any).env?.DEV
            ? 'Billing service is running in local developer mode (Stripe backend health check failed).'
            : 'Billing service is temporarily unavailable.'
        );
      }
    };

    void checkBillingHealth();
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
      setCheckoutError('Demo profiles do not have billing privileges.');
      return;
    }

    try {
      setCheckoutPlanId(planId);
      await startCheckout(currentUser.id, currentUser.email, planId);
    } catch (error: unknown) {
      setCheckoutError(
        getErrorMessage(error, 'Checkout session could not be created.')
      );
    } finally {
      setCheckoutPlanId(null);
    }
  };

  const renderPlanAction = (plan: CommercialPlanPreview) => {
    // Free plan – direct link
    if (plan.id === 'free') {
      const href = currentUser ? '/dashboard' : '/signup';
      const label = currentUser ? 'Go to dashboard' : 'Start free';

      return (
        <Link
          to={href}
          className="mt-6 public-primary-action w-full text-center"
        >
          {label}
        </Link>
      );
    }

    // Higher tiers not yet available – show disabled Coming Soon button
    if (plan.id === 'exec' || plan.id === 'private') {
      return (
        <button
          type="button"
          disabled
          className="mt-6 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-border-soft bg-surface-hover/20 px-4 py-2 text-sm font-semibold text-muted-copy cursor-not-allowed opacity-60"
          aria-label={`${plan.name} plan coming soon`}
        >
          Plan Coming Soon
        </button>
      );
    }

    // Current active subscription indicator
    if (subscription?.planId === plan.id) {
      return (
        <button
          type="button"
          disabled
          className="mt-6 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 cursor-not-allowed"
        >
          Current Plan
        </button>
      );
    }

    const isCheckoutInProgress =
      isCheckoutLoading && checkoutPlanId === plan.id;

    return (
      <button
        type="button"
        onClick={() => void handleCheckout(plan.id)}
        disabled={
          !billingEnabled || isCheckoutInProgress || isBillingHealthLoading
        }
        className="mt-6 public-primary-action w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCheckoutInProgress
          ? 'Starting checkout...'
          : `Upgrade to ${plan.name}`}
      </button>
    );
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <PageMetadata
        title="Access"
        description="Choose the EngineerOS access level that fits your work."
      />
      <section className="border-b border-border-soft bg-surface py-12 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <p className="public-eyebrow">International engineering learning</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
            Choose the EngineerOS access level that fits your work.
          </h1>
          <p className="mt-3 text-xs leading-5 text-muted-copy max-w-xl mx-auto">
            AI-powered communication training for engineers on international
            projects. Pro features are fully active, while future plans show
            upcoming roadmaps.
          </p>
          <div className="mx-auto mt-6 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
            {[
              ['Start', 'Free to understand the learning flow'],
              ['Grow', 'Pro plan matches professional workspace goals'],
              ['Scale', 'Custom organizational options on request'],
            ].map(([title, copy]) => (
              <div
                key={title}
                className="rounded-card border border-border-soft bg-background p-4"
              >
                <p className="text-xs font-bold text-primary">{title}</p>
                <p className="mt-1 text-[11px] leading-4 text-muted-copy">
                  {copy}
                </p>
              </div>
            ))}
          </div>
          {billingReadiness !== 'ready' && subscription?.planId !== 'pro' && (
            <div className="mx-auto mt-6 flex w-fit max-w-full items-start gap-2 rounded-[8px] border border-warning/20 bg-warning/5 px-4 py-2.5 text-left text-[11px] leading-4 text-warning">
              <ShieldAlert
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              <span>{billingBanner}</span>
            </div>
          )}
          {checkoutError && (
            <p
              className="mx-auto mt-3 max-w-2xl rounded-[8px] border border-error/20 bg-error/5 px-4 py-2.5 text-left text-[11px] leading-4 text-error"
              role="alert"
            >
              {checkoutError}
            </p>
          )}
        </div>
      </section>

      {/* Main active plans grid */}
      <section className="py-12">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
          {ACTIVE_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`public-card relative flex min-w-0 flex-col p-6 rounded-card border ${plan.id === 'pro' || plan.id === 'project' ? 'border-primary/30 bg-primary/5 shadow-md shadow-primary/5' : 'border-border-soft'}`}
            >
              <div className="flex min-h-10 items-start justify-between gap-2">
                <p className="text-sm font-bold text-foreground">{plan.name}</p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${plan.id === 'free' || billingEnabled ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' : 'border-border-soft bg-surface text-muted-copy'}`}
                >
                  {plan.id === 'free' || billingEnabled
                    ? 'Available'
                    : 'Coming Soon'}
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-foreground">
                {plan.price}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-copy">
                {plan.cadence}
              </p>
              <p className="mt-4 min-h-[4rem] text-xs leading-5 text-muted-copy">
                {plan.audience}
              </p>
              <div className="mt-4 rounded-card border border-border-soft bg-surface-hover/20 p-3.5">
                <p className="text-[9px] font-bold text-primary uppercase tracking-wider">
                  BEST FOR
                </p>
                <p className="mt-0.5 text-xs font-bold text-foreground">
                  {plan.bestFor}
                </p>
                <p className="mt-1.5 text-[11px] leading-4 text-muted-copy">
                  {plan.priceReason}
                </p>
              </div>
              <p className="mt-5 text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                INCLUDED
              </p>
              <ul className="mt-3 flex-1 space-y-2.5">
                {plan.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex gap-2 text-xs leading-5 text-foreground"
                  >
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex gap-2 border-t border-border-soft pt-4 text-[10px] leading-4 text-muted-copy">
                <MinusCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{plan.notIncluded}</span>
              </div>
              {renderPlanAction(plan)}
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border-soft bg-surface py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="public-eyebrow">Plan comparison</p>
          <h2 className="mt-2 text-xl font-bold text-foreground">
            See what changes before choosing a plan.
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-copy">
            Free limits reflect the current local policy. Paid allowances remain
            clearly marked as planned until Stripe TEST and entitlement sync are
            verified.
          </p>
          <div className="mt-6 overflow-x-auto rounded-card border border-border-soft">
            <table className="min-w-[700px] w-full border-collapse bg-surface text-left text-xs">
              <thead className="bg-surface-hover/20">
                <tr>
                  <th className="border-b border-border-soft p-3 font-bold text-foreground">
                    Capability
                  </th>
                  {ACTIVE_PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      className="border-b border-border-soft p-3 font-bold text-foreground"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ['Learning access', 'learning'],
                    ['AI support', 'ai'],
                    ['Analytics', 'analytics'],
                    ['Team capability', 'team'],
                    ['Usage limits', 'limits'],
                  ] as const
                ).map(([label, key]) => (
                  <tr
                    key={key}
                    className="border-b border-border-soft/40 last:border-0 hover:bg-surface-hover/10"
                  >
                    <th className="p-3 font-bold text-foreground">{label}</th>
                    {ACTIVE_PLANS.map((plan) => (
                      <td
                        key={plan.id}
                        className="p-3 leading-5 text-muted-copy"
                      >
                        {plan.comparison[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;
