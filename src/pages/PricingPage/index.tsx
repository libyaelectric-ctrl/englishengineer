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
  const handleSelectPlan = async (tierId: string) => { setCheckoutError(null); if (tierId === 'free') { navigate('/dashboard'); return; } if (!currentUser) { navigate(AUTH_SIGN_IN_URL, { state: { from: location } }); return; } if (currentUser.id.startsWith('demo_engineer_')) { setCheckoutError('Demo profiles cannot make purchases.'); return; } try { await startCheckout(currentUser.id, currentUser.email, tierId as BillingPlanId, isAnnual ? 'year' : 'month'); } catch (err: unknown) { setCheckoutError(err instanceof Error ? err.message : 'Checkout failed.'); } };

  return (
    <main className="relative h-dvh overflow-hidden bg-[#f7f9fc] pt-14 text-slate-950 dark:bg-[#040611] dark:text-white">
      <PageMetadata title="Pricing Plans — EngVox" description="Choose the plan that fits your engineering communication goals." />
      <Navbar />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_52%,#eef4f8_100%)] dark:bg-[linear-gradient(180deg,#040611_0%,#070b18_54%,#040611_100%)]" /><div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-cyan-200/12 blur-3xl" /><div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-indigo-200/10 blur-3xl" />
      <section className="relative mx-auto flex min-h-[calc(100dvh-7.5rem)] max-w-7xl flex-col px-4 pb-20 pt-3 md:px-6">
        <div className="mb-3 grid shrink-0 items-end gap-3 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-800 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">EngVox Pricing</span>
            <h1 className="mt-2 text-[clamp(1.75rem,3.2vw,3rem)] font-black leading-none tracking-tight text-slate-950 dark:text-white">{pricingCopy.title}</h1>
            <p className="mt-1 max-w-3xl text-sm font-semibold leading-5 text-slate-600 dark:text-slate-300">{pricingCopy.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]">
            <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-black/20"><button type="button" onClick={() => setIsAnnual(false)} aria-pressed={!isAnnual} className={`rounded-xl px-3 py-2 text-xs font-black transition-all ${!isAnnual ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 dark:text-white/65'}`}>{pricingCopy.monthly}</button><button type="button" onClick={() => setIsAnnual(true)} aria-pressed={isAnnual} className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black transition-all ${isAnnual ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 dark:text-white/65'}`}><span>{pricingCopy.annual}</span><span className="rounded bg-emerald-500 px-1 py-0.5 text-[9px] text-white">{pricingCopy.save20}</span></button></div>
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-black/20"><Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-200" /><select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} aria-label="Select currency" className="bg-transparent text-xs font-black text-slate-950 outline-none dark:text-white">{CurrencyConfig.CURRENCIES.map((c) => (<option key={c.code} value={c.code}>{c.flag} {c.code}</option>))}</select></div>
          </div>
        </div>
        {checkoutError && <p className="mb-2 shrink-0 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-center text-xs font-bold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" role="alert">{checkoutError}</p>}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">{PRICING_TIERS.map((tier, idx) => (<motion.div key={tier.id} className="min-h-0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: idx * 0.035 }}><PricingCard tier={tier} isAnnual={isAnnual} currency={selectedCurrency} isCurrentPlan={subscription?.planId === tier.id} isLoading={isCheckoutLoading} variant="pricing" onSelect={handleSelectPlan} /></motion.div>))}</div>
      </section>
      <ExitIntentModal /><Footer className="fixed bottom-0 inset-x-0 z-40" />
    </main>
  );
};
export default PricingPage;
