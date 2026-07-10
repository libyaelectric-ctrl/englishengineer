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

const ACTIVE_PLANS = COMMERCIAL_PLAN_CATALOG.filter((plan) =>
  ['free', 'pro', 'project', 'max', 'exec', 'private'].includes(plan.id)
);

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

  const renderPlanAction = (plan: CommercialPlanPreview) => {
    if (plan.id === 'free') {
      const href = currentUser ? '/dashboard' : '/start';
      return (
        <Link
          to={href}
          className="mt-6 flex h-10 w-full items-center justify-center rounded-lg border border-border-soft text-sm font-medium hover:bg-surface-hover transition-colors"
        >
          {currentUser ? 'Go to dashboard' : 'Start free'}
        </Link>
      );
    }
    if (plan.id === 'exec' || plan.id === 'private') {
      return (
        <button
          type="button"
          disabled
          className="mt-6 flex h-10 w-full items-center justify-center rounded-lg border border-border-soft bg-surface text-sm font-medium text-muted-copy cursor-not-allowed opacity-50"
        >
          Coming soon
        </button>
      );
    }
    if (subscription?.planId === plan.id) {
      return (
        <button
          type="button"
          disabled
          className="mt-6 flex h-10 w-full items-center justify-center rounded-lg border border-success/20 bg-success/10 text-sm font-medium text-success cursor-not-allowed"
        >
          Current plan
        </button>
      );
    }
    const inProgress = isCheckoutLoading && checkoutPlanId === plan.id;
    return (
      <button
        type="button"
        onClick={() => void handleCheckout(plan.id)}
        disabled={!billingEnabled || inProgress || isBillingHealthLoading}
        className="mt-6 flex h-10 w-full items-center justify-center rounded-lg bg-foreground text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {inProgress ? 'Loading...' : `Upgrade to ${plan.name}`}
      </button>
    );
  };

  return (
    <main className="bg-transparent text-foreground min-h-screen">
      <PageMetadata
        title="Pricing"
        description="Choose the EngVox plan that fits your work."
      />

      <section className="py-10 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex justify-center mb-4">
            <img src="/brand/mascot.png" alt="EngVox" className="h-20 w-auto" />
          </div>
          <p className="text-xs font-medium text-muted-copy">Pricing</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Choose your access level.
          </h1>
          <p className="mt-3 text-sm text-muted-copy max-w-xl mx-auto">
            AI-powered communication training for engineers on international
            projects.
          </p>

          {billingReadiness !== 'ready' && subscription?.planId !== 'pro' && (
            <div className="mx-auto mt-6 flex w-fit items-start gap-2 rounded-lg border border-warning/20 bg-warning/5 px-4 py-2.5 text-xs text-warning">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{billingBanner}</span>
            </div>
          )}
          {checkoutError && (
            <p
              className="mx-auto mt-3 max-w-xl rounded-lg border border-error/20 bg-error/5 px-4 py-2.5 text-xs text-error"
              role="alert"
            >
              {checkoutError}
            </p>
          )}
        </div>
      </section>

      {/* Plans grid */}
      <section className="pb-16">
        <div className="mx-auto grid max-w-5xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
          {ACTIVE_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-xl border p-6 ${
                plan.id === 'pro' || plan.id === 'project'
                  ? 'border-border-hover bg-surface shadow-sm'
                  : 'border-border-soft'
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold">{plan.name}</p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    plan.id === 'free' || billingEnabled
                      ? 'border-success/20 bg-success/10 text-success'
                      : 'border-border-soft bg-surface text-muted-copy'
                  }`}
                >
                  {plan.id === 'free' || billingEnabled ? 'Available' : 'Soon'}
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold">{plan.price}</p>
              <p className="text-xs text-muted-copy">{plan.cadence}</p>
              <p className="mt-3 min-h-[3rem] text-xs text-muted-copy leading-relaxed">
                {plan.audience}
              </p>

              <div className="mt-3 rounded-lg border border-border-soft bg-surface p-3">
                <p className="text-[10px] font-medium text-muted-copy uppercase">
                  Best for
                </p>
                <p className="mt-0.5 text-xs font-medium">{plan.bestFor}</p>
              </div>

              <p className="mt-4 text-[10px] font-medium text-muted-copy uppercase">
                Included
              </p>
              <ul className="mt-2 flex-1 space-y-2">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex gap-2 text-xs text-muted-copy">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2 border-t border-border-soft pt-3 text-[10px] text-muted-copy">
                <MinusCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {plan.notIncluded}
              </div>
              {renderPlanAction(plan)}
            </article>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-border-soft bg-surface py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-lg font-semibold">Compare plans</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border-soft">
            <table className="w-full min-w-[600px] border-collapse bg-surface text-left text-xs">
              <thead className="bg-surface-hover/30">
                <tr>
                  <th className="border-b border-border-soft p-3 font-medium">
                    Feature
                  </th>
                  {ACTIVE_PLANS.filter((p) =>
                    ['free', 'pro', 'project', 'max'].includes(p.id)
                  ).map((p) => (
                    <th
                      key={p.id}
                      className="border-b border-border-soft p-3 font-medium text-center"
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
                    className="border-b border-border-soft/50 last:border-0 hover:bg-surface-hover/20"
                  >
                    <td className="p-3 font-medium capitalize">
                      {key === 'ai' ? 'AI Coach' : key}
                    </td>
                    {ACTIVE_PLANS.filter((p) =>
                      ['free', 'pro', 'project', 'max'].includes(p.id)
                    ).map((p) => (
                      <td
                        key={p.id}
                        className="p-3 text-center text-muted-copy"
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
          <div className="mt-8 rounded-xl border border-border-soft bg-background p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background text-sm font-bold">
                EP
              </div>
              <div>
                <h3 className="text-sm font-semibold">Enterprise & Private</h3>
                <p className="text-xs text-muted-copy">
                  For large teams and government contractors
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border-soft p-4">
                <p className="text-sm font-medium">Exec · $99/mo</p>
                <p className="mt-1 text-xs text-muted-copy">
                  VIP coaching, priority support, offline audio
                </p>
              </div>
              <div className="rounded-lg border border-border-soft p-4">
                <p className="text-sm font-medium">Private · $999/mo</p>
                <p className="mt-1 text-xs text-muted-copy">
                  Dedicated server, zero-data retention, custom security
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-copy">
              Contact us for enterprise deployment and custom requirements.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;
