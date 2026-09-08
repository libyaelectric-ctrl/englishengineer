import { PricingCard } from '@/components/ui/PricingCard';
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

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const language = useLocalizationStore((s) => s.language);
  const pricingCopy = getPricingCopy(language);
  const currentUser = useAuthStore((state) => state.currentUser);
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => { ProductAnalyticsService.track('screen_viewed', 'pricing'); ProductAnalyticsService.trackOnce('paywall_viewed', 'pricing'); }, []);
  const { isLoading: isCheckoutLoading, startCheckout, subscription } = useBillingStore();

  const handleSelectPlan = async (tierId: string) => {
    setCheckoutError(null);
    if (tierId === 'free') { navigate('/dashboard'); return; }
    if (!currentUser) { navigate(AUTH_SIGN_IN_URL, { state: { from: location } }); return; }
    if (currentUser.id.startsWith('demo_engineer_')) { setCheckoutError('Demo profiles cannot make purchases.'); return; }
    try { await startCheckout(currentUser.id, currentUser.email, tierId as BillingPlanId, isAnnual ? 'year' : 'month'); }
    catch (err: unknown) { setCheckoutError(err instanceof Error ? err.message : 'Checkout failed.'); }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-50 pb-20 pt-20 text-slate-950 dark:bg-[#040611] dark:text-white">
      <PageMetadata title="Pricing Plans — EngVox" description="Choose the plan that fits your engineering communication goals." />
      <Navbar />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_5%,rgba(6,182,212,0.14),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(168,85,247,0.12),transparent_26%)] dark:bg-[radial-gradient(circle_at_20%_5%,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(168,85,247,0.18),transparent_26%)]" />
      <section className="relative mx-auto max-w-7xl px-6 pb-10 md:px-12">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-100">Fiyatlandırma</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{pricingCopy.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-200 sm:text-lg">{pricingCopy.subtitle}</p>
        </div>
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-900/10 bg-white/72 p-1 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]">
            <button type="button" onClick={() => setIsAnnual(false)} aria-pressed={!isAnnual} className={`rounded-xl px-3 py-2 text-sm font-black transition-all ${!isAnnual ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 dark:text-white/65'}`}>{pricingCopy.monthly}</button>
            <button type="button" onClick={() => setIsAnnual(true)} aria-pressed={isAnnual} className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-black transition-all ${isAnnual ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 dark:text-white/65'}`}><span>{pricingCopy.annual}</span><span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] text-white">{pricingCopy.save20}</span></button>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-900/10 bg-white/72 px-3 py-2 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]"><Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-200" /><select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} aria-label="Select currency" className="bg-transparent text-xs font-black text-slate-950 outline-none dark:text-white">{CurrencyConfig.CURRENCIES.map((c) => (<option key={c.code} value={c.code}>{c.flag} {c.code}</option>))}</select></div>
        </div>
        {checkoutError && <p className="mx-auto mb-6 max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs font-bold text-red-600 dark:text-red-300" role="alert">{checkoutError}</p>}
        <div className="mx-auto grid max-w-sm grid-cols-1 gap-4 sm:max-w-none sm:grid-cols-2 lg:grid-cols-5">{PRICING_TIERS.map((tier, idx) => (<motion.div key={tier.id} className="h-full" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: idx * 0.05 }}><PricingCard tier={tier} isAnnual={isAnnual} currency={selectedCurrency} isCurrentPlan={subscription?.planId === tier.id} isLoading={isCheckoutLoading} variant="pricing" onSelect={handleSelectPlan} /></motion.div>))}</div>
        <p className="mx-auto mt-6 max-w-lg text-center text-xs text-slate-600 dark:text-white/55">Prices shown may vary slightly at checkout due to billing provider rounding.</p>
      </section>
      <ExitIntentModal />
      <Footer className="fixed bottom-0 inset-x-0 z-40" />
    </main>
  );
};
export default PricingPage;
