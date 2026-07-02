import { Check, LockKeyhole, MinusCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { COMMERCIAL_PLAN_CATALOG } from '@/features/billing';
import { getBillingApiUrl } from '@/features/billing/billing.helpers';
import { PageMetadata } from '@/shared/components/PageMetadata';

const PricingPage = () => {
  const [billingReadiness, setBillingReadiness] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [billingBanner, setBillingBanner] = useState(
    'Checking Stripe billing readiness...'
  );
  const billingApiUrl = getBillingApiUrl();

  useEffect(() => {
    if (!billingApiUrl) {
      setBillingReadiness('unavailable');
      setBillingBanner(
        'Billing is unavailable. Configure VITE_BILLING_API_URL to enable Stripe billing.'
      );
      return;
    }

    let mounted = true;

    const checkBillingHealth = async () => {
      try {
        const healthUrl = new URL('/api/health', billingApiUrl).toString();
        const response = await fetch(healthUrl, { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Billing health check failed.');
        }
        const health = await response.json();
        if (!mounted) return;

        if (health?.stripeConfigured === true) {
          setBillingReadiness('ready');
          setBillingBanner('Secure Stripe test checkout is available.');
        } else {
          setBillingReadiness('unavailable');
          setBillingBanner(
            'Billing is unavailable. Stripe backend is not verified.'
          );
        }
      } catch {
        if (!mounted) return;
        setBillingReadiness('unavailable');
        setBillingBanner(
          'Billing is unavailable. Stripe backend health check failed.'
        );
      }
    };

    void checkBillingHealth();
    return () => {
      mounted = false;
    };
  }, [billingApiUrl]);

  const billingEnabled = billingReadiness === 'ready';
  const isBillingLoading = billingReadiness === 'loading';

  return (
    <main className="bg-slate-50">
    <PageMetadata
      title="Pricing"
      description="Preview EngineerOS plans for individual engineers and engineering teams."
    />
    <section className="border-b border-slate-200 bg-white py-16 text-center">
      <div className="mx-auto max-w-3xl px-4">
        <p className="public-eyebrow">International engineering learning</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">
          Clear plans for independent engineers and teams.
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          AI-powered communication training for engineers on international
          projects. Prices are a commercial preview, not evidence of active
          billing.
        </p>
        <div className="mx-auto mt-7 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
          {[
            ['Start', 'Free to understand the learning flow'],
            ['Grow', 'Individual plans match study intensity'],
            ['Scale', 'Team is priced for manager visibility'],
          ].map(([title, copy]) => (
            <div
              key={title}
              className="rounded-[14px] border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-black text-blue-700">{title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-6 flex w-fit max-w-full items-start gap-2 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs leading-5 text-amber-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{billingBanner}</span>
        </div>
      </div>
    </section>

    <section className="py-14">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-2 xl:grid-cols-3 lg:px-8">
        {COMMERCIAL_PLAN_CATALOG.map((plan) => (
          <article
            key={plan.id}
            className={`public-card relative flex min-w-0 flex-col p-5 ${plan.id === 'pro' ? 'border-sky-300 ring-2 ring-sky-100' : ''}`}
          >
            <div className="flex min-h-12 items-start justify-between gap-2">
              <p className="text-sm font-black text-sky-800">{plan.name}</p>
              <span
                className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase ${plan.status === 'available-local' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
              >
                {plan.status === 'available-local' ? 'Available' : 'Preview'}
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-slate-950">
              {plan.price}
            </p>
            <p className="mt-1 text-xs text-slate-500">{plan.cadence}</p>
            <p className="mt-5 min-h-20 text-sm leading-6 text-slate-600">
              {plan.audience}
            </p>
            <div className="mt-4 rounded-[12px] border border-blue-100 bg-blue-50/70 p-3">
              <p className="text-[10px] font-black text-blue-700">BEST FOR</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {plan.bestFor}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                {plan.priceReason}
              </p>
            </div>
            <p className="mt-5 text-xs font-black text-slate-500">INCLUDED</p>
            <ul className="mt-5 flex-1 space-y-3">
              {plan.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex gap-2 text-sm leading-5 text-slate-700"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
              <MinusCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{plan.notIncluded}</span>
            </div>
            {plan.actionLabel === 'Billing unavailable' ? (
              plan.id === 'pro' && billingEnabled ? (
                <Link
                  to="/profile"
                  className="mt-6 public-secondary-action"
                >
                  Upgrade to Pro
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Paid checkout becomes available after the verified Stripe release gate."
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500"
                >
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  {isBillingLoading ? 'Checking billing...' : plan.actionLabel}
                </button>
              )
            ) : (
              <Link
                to={plan.actionHref}
                className={`mt-6 ${plan.status === 'available-local' ? 'public-primary-action' : 'public-secondary-action'}`}
              >
                {plan.actionLabel}
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>

    <section className="border-t border-slate-200 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="public-eyebrow">Plan comparison</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          See what changes before choosing a plan.
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Free limits reflect the current local policy. Paid allowances remain
          clearly marked as planned until Stripe TEST and entitlement sync are
          verified.
        </p>
        <div className="mt-6 overflow-x-auto rounded-[16px] border border-slate-200">
          <table className="min-w-[900px] w-full border-collapse bg-white text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 p-4 font-black text-slate-700">
                  Capability
                </th>
                {COMMERCIAL_PLAN_CATALOG.map((plan) => (
                  <th
                    key={plan.id}
                    className="border-b border-slate-200 p-4 font-black text-slate-950"
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
                  className="border-b border-slate-100 last:border-0"
                >
                  <th className="p-4 font-bold text-slate-700">{label}</th>
                  {COMMERCIAL_PLAN_CATALOG.map((plan) => (
                    <td key={plan.id} className="p-4 leading-6 text-slate-600">
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

    <section className="border-y border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-black text-slate-950">
          Honest commercial readiness
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [
              'Free',
              'Local-first access is available without payment. Controlled sponsor readiness is disabled by default.',
            ],
            [
              'Paid plans',
              'All paid plans are ad-free. Checkout remains unavailable until the backend and webhook are verified.',
            ],
            [
              'Team',
              'Manager summaries and roles are code-ready; live organization billing is not claimed.',
            ],
          ].map(([title, copy]) => (
            <div
              key={title}
              className="rounded-[16px] border border-slate-200 bg-slate-50 p-5"
            >
              <h3 className="font-black text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
  );
};

export default PricingPage;
