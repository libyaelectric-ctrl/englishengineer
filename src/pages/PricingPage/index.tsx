import { PricingCard } from '@/components/ui/PricingCard';
import { Globe } from 'lucide-react';
import { motion } from 'motion/react';

import { useEffect, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ExitIntentModal } from '@/shared/components/ExitIntentModal';
import { GlowingOrb } from '@/shared/components/GlowingOrb';
import { PageMetadata } from '@/shared/components/PageMetadata';
import { getPricingCopy } from '@/shared/data/pricing-copy';
import { PRICING_TIERS } from '@/shared/data/pricing.data';
import { getPublicPageCopy } from '@/shared/data/public-page-copy';

import { ProductAnalyticsService } from '@/features/analytics';
import { useAuthStore } from '@/features/auth';
import { CLERK_SIGN_IN_URL } from '@/features/auth/clerk.config';
import { useBillingStore } from '@/features/billing/billing.store';
import type { BillingPlanId } from '@/features/billing/billing.types';
import { CurrencyConfig } from '@/features/billing/currency.config';
import { useLocalizationStore } from '@/features/localization';

import { Footer } from '@/pages/LandingPage/Footer';
import { Navbar } from '@/pages/LandingPage/Navbar';

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const language = useLocalizationStore((s) => s.language);
  const pricingCopy = getPricingCopy(language);
  const publicCopy = getPublicPageCopy(language);
  const currentUser = useAuthStore((state) => state.currentUser);

  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    ProductAnalyticsService.track('screen_viewed', 'pricing');
    ProductAnalyticsService.trackOnce('paywall_viewed', 'pricing');
  }, []);

  const { isLoading: isCheckoutLoading, startCheckout, subscription } = useBillingStore();

  const handleSelectPlan = async (tierId: string) => {
    setCheckoutError(null);
    if (!currentUser) {
      navigate(CLERK_SIGN_IN_URL, { state: { from: location } });
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
    <main className="bg-background text-foreground min-h-screen relative z-10 pb-16">
      <PageMetadata
        title="Pricing Plans — EngVox"
        description="Choose the plan that fits your engineering communication goals."
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
          <GlowingOrb size="lg" />
        </div>
      </div>

      <Navbar />

      <section className="pt-16 sm:pt-20 pb-8 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {pricingCopy.title}
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            {pricingCopy.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 bg-surface p-1 rounded-[var(--radius-card)] border border-border-soft">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              aria-pressed={!isAnnual}
              aria-label="Select monthly billing"
              className={`px-3 py-1.5 rounded text-sm font-semibold transition-all ${!isAnnual ? 'bg-primary text-white shadow-sm' : 'text-muted-copy'}`}
            >
              {pricingCopy.monthly}
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              aria-pressed={isAnnual}
              aria-label="Select annual billing"
              className={`px-3 py-1.5 rounded text-sm font-semibold transition-all flex items-center gap-1.5 ${isAnnual ? 'bg-primary text-white shadow-sm' : 'text-muted-copy'}`}
            >
              <span>{pricingCopy.annual}</span>
              <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-mono">
                {pricingCopy.save20}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1.5 rounded-[var(--radius-card)] border border-border-soft">
            <Globe className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              aria-label="Select currency"
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
          <p
            className="mx-auto mb-6 max-w-xl rounded-[var(--radius-card)] border border-error/30 bg-error/10 px-4 py-2 text-xs text-error font-bold text-center"
            role="alert"
          >
            {checkoutError}
          </p>
        )}

        <div className="mx-auto mb-8 max-w-sm rounded-[var(--radius-card)] border-2 border-primary/40 bg-surface p-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-foreground">{pricingCopy.freePlan}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">$0</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-copy">
            {publicCopy.freeDescription}
          </p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex w-full items-center justify-center rounded-[var(--radius-card)] bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary/95"
          >
            {pricingCopy.getStarted}
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {PRICING_TIERS.map((tier, idx) => (
            <motion.div
              key={tier.id}
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
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
      <Footer className="fixed bottom-0 inset-x-0 z-50" />
    </main>
  );
};

export default PricingPage;
