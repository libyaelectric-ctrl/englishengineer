import { useEffect, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { PageMetadata } from '@/shared/components/PageMetadata';

import { ProductAnalyticsService } from '@/features/analytics';
import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing/billing.store';
import type { BillingPlanId } from '@/features/billing/billing.types';
import { CurrencyConfig } from '@/features/billing/currency.config';
import { useLocalizationStore } from '@/features/localization';
import { PricingCard } from '@/components/ui/PricingCard';
import { PRICING_TIERS } from '@/shared/data/pricing.data';

import { Navbar } from '@/pages/LandingPage/Navbar';

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const translate = useLocalizationStore((s) => s.translate);
  const currentUser = useAuthStore((state) => state.currentUser);
  const { initialize: initializeAuth } = useAuthStore();

  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    void initializeAuth();
    ProductAnalyticsService.track('screen_viewed', 'pricing');
    ProductAnalyticsService.trackOnce('paywall_viewed', 'pricing');
  }, [initializeAuth]);

  const { isLoading: isCheckoutLoading, startCheckout, subscription } = useBillingStore();

  const handleSelectPlan = async (tierId: string) => {
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
      await startCheckout(currentUser.id, currentUser.email, tierId as BillingPlanId);
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed.');
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen relative z-10 pb-16">
      <PageMetadata
        title="Pricing Plans — EngVox"
        description="Choose the plan that fits your engineering communication goals."
      />

      <Navbar />

      <section className="pt-20 sm:pt-24 pb-8 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {translate('pricing.title') ?? 'Simple, Transparent Pricing'}
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            {translate('pricing.subtitle') ?? 'Choose your plan. Every plan includes your discipline-specific vocabulary pool.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border-soft">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-3 py-1.5 rounded text-sm font-semibold transition-all ${!isAnnual ? 'bg-primary text-white shadow-sm' : 'text-muted-copy'}`}
            >
              {translate('pricing.monthly') ?? 'Monthly'}
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-3 py-1.5 rounded text-sm font-semibold transition-all flex items-center gap-1.5 ${isAnnual ? 'bg-primary text-white shadow-sm' : 'text-muted-copy'}`}
            >
              <span>{translate('pricing.annual') ?? 'Annual'}</span>
              <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-mono">
                -{translate('pricing.save20') ?? '20%'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-lg border border-border-soft">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              {CurrencyConfig.CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {checkoutError && (
          <p className="mx-auto mb-6 max-w-xl rounded-xl border border-error/30 bg-error/10 px-4 py-2 text-xs text-error font-bold text-center" role="alert">
            {checkoutError}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
          {PRICING_TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              isAnnual={isAnnual}
              currency={selectedCurrency}
              isCurrentPlan={subscription?.planId === tier.id}
              isLoading={isCheckoutLoading}
              variant="pricing"
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 pt-8 pb-4 max-w-7xl mx-auto border-t border-border-soft">
        <div className="flex items-center justify-between text-xs text-muted-copy">
          <span>EngVox © 2026</span>
          <Link to="/" className="font-bold text-primary hover:underline">
            {translate('pricing.backHome') ?? 'Back to Home'}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;