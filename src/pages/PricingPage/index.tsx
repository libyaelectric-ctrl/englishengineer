import { Globe } from 'lucide-react';
import { motion } from 'motion/react';

import { useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { ExitIntentModal } from '@/shared/components/ExitIntentModal';
import { PageMetadata } from '@/shared/components/PageMetadata';
import { getPricingCopy } from '@/shared/data/pricing-copy';
import { PRICING_TIERS } from '@/shared/data/pricing.data';

import { ProductAnalyticsService } from '@/features/analytics';
import { useAuthStore } from '@/features/auth';
import { AUTH_SIGN_IN_URL } from '@/features/auth/firebase.config';
import { useBillingStore } from '@/features/billing/billing.store';
import type { BillingPlanId } from '@/features/billing/billing.types';
import { CurrencyConfig } from '@/features/billing/currency.config';
import { useLocalizationStore } from '@/features/localization';

import { Footer } from '@/pages/LandingPage/Footer';
import { Navbar } from '@/pages/LandingPage/Navbar';

import { PricingCard } from '@/components/ui/PricingCard';

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const language = useLocalizationStore((s) => s.language);
  const pricingCopy = getPricingCopy(language);
  const currentUser = useAuthStore((state) => state.currentUser);
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  useEffect(() => {
    ProductAnalyticsService.track('screen_viewed', 'pricing');
    ProductAnalyticsService.trackOnce('paywall_viewed', 'pricing');
  }, []);
  const { isCheckoutLoading, startCheckout, subscription } = useBillingStore();
  const handleSelectPlan = async (tierId: string) => {
    setCheckoutError(null);
    if (tierId === 'free') {
      navigate('/dashboard');
      return;
    }
    if (!currentUser) {
      navigate(AUTH_SIGN_IN_URL, { state: { from: location } });
      return;
    }
    if (currentUser.id.startsWith('demo_engineer_')) {
      setCheckoutError('Demo profiles cannot make purchases.');
      return;
    }
    try {
      await startCheckout(
        currentUser.id,
        currentUser.email,
        tierId as BillingPlanId,
        isAnnual ? 'year' : 'month'
      );
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed.');
    }
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-background pt-14 text-foreground">
      <PageMetadata
        title="Pricing Plans — EngVox"
        description="Choose the plan that fits your engineering communication goals."
      />
      <Navbar />
      <section className="relative mx-auto flex h-[calc(100dvh-7.5rem)] max-w-7xl flex-col px-4 py-3 md:px-6">
        <div className="mb-3 grid shrink-0 items-end gap-3 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              EngVox Pricing
            </span>
            <h1 className="mt-2 text-[clamp(1.75rem,3.2vw,3rem)] font-black leading-none tracking-tight text-foreground">
              {pricingCopy.title}
            </h1>
            <p className="mt-1 max-w-3xl text-sm font-medium leading-5 text-muted-copy">
              {pricingCopy.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border-soft bg-surface p-1.5 shadow-sm">
            <div className="flex items-center gap-1 rounded-xl border border-border-soft bg-surface-hover p-1">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                aria-pressed={!isAnnual}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${!isAnnual ? 'bg-primary text-white shadow-sm' : 'text-muted-copy hover:text-foreground'}`}
              >
                {pricingCopy.monthly}
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                aria-pressed={isAnnual}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${isAnnual ? 'bg-primary text-white shadow-sm' : 'text-muted-copy hover:text-foreground'}`}
              >
                <span>{pricingCopy.annual}</span>
                <span className="rounded bg-emerald-500 px-1 py-0.5 text-[9px] text-white">
                  {pricingCopy.save20}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-border-soft bg-surface px-3 py-1.5">
              <Globe className="h-4 w-4 text-primary" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                aria-label="Select currency"
                className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
              >
                {CurrencyConfig.CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-surface text-foreground">
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {checkoutError && (
          <p
            className="mb-2 shrink-0 rounded-2xl border border-error/25 bg-error/10 px-4 py-2 text-center text-xs font-bold text-error"
            role="alert"
          >
            {checkoutError}
          </p>
        )}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PRICING_TIERS.map((tier, idx) => (
            <motion.div
              key={tier.id}
              className="min-h-0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: idx * 0.035 }}
            >
              <PricingCard
                tier={tier}
                isAnnual={isAnnual}
                currency={selectedCurrency}
                isCurrentPlan={subscription?.planId === tier.id}
                isLoading={isCheckoutLoading}
                variant="pricing"
                onSelect={handleSelectPlan}
              />
            </motion.div>
          ))}
        </div>
      </section>
      <ExitIntentModal />
      <Footer className="fixed bottom-0 inset-x-0 z-40" />
    </main>
  );
};
export default PricingPage;
