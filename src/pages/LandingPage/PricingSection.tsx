import { PricingCard } from '@/components/ui/PricingCard';
import { Check, Globe, X } from 'lucide-react';
import { motion } from 'motion/react';

import { useState } from 'react';

import { PRICING_FEATURE_ORDER, PRICING_TIERS } from '@/shared/data/pricing.data';

import { CurrencyConfig } from '@/features/billing';
import { useLocalizationStore } from '@/features/localization';

import { getLandingTranslations } from './landing-i18n';

export function PricingSection() {
  const language = useLocalizationStore((s) => s.language);
  const t = getLandingTranslations(language);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isAnnual, setIsAnnual] = useState(false);

  const moduleLabels: Record<string, string> = {
    'Placement Test': t.placementTest ?? 'Placement Test',
    'Learning Hub': t.learningHub ?? 'Learning Hub',
    Progress: t.progress ?? 'Progress',
    Vocabulary: t.vocabularyPricing ?? 'Vocabulary',
    Grammar: t.grammarPricing ?? 'Grammar',
    Translator: t.translator ?? 'Translator',
    Reading: t.readingPricing ?? 'Reading',
    Writing: t.writingPricing ?? 'Writing',
    Speaking: t.speakingPricing ?? 'Speaking',
    Listening: t.listening ?? 'Listening',
    Tool: t.tool ?? 'Tool',
    'AI Copilot': t.aiCopilot ?? 'AI Copilot',
  };

  const getFeatureValue = (tierId: string, featureName: string): boolean | string => {
    const tier = PRICING_TIERS.find((t) => t.id === tierId);
    if (!tier) return false;
    if (tier.comingSoon) return 'Coming Soon';
    const feature = tier.features.find((f) => f.name === featureName);
    return feature?.included ?? false;
  };

  return (
    <section
      id="pricing"
      className="py-24 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {t.pricingTitle ?? 'Simple, Transparent Pricing'}
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            {t.pricingSubtitle ??
              'Choose your plan. Every plan includes your discipline-specific vocabulary pool.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-[var(--radius-card)]">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-3 py-1.5 rounded text-sm font-semibold transition-all ${!isAnnual ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              {t.pricingMonthly ?? 'Monthly'}
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-3 py-1.5 rounded text-sm font-semibold transition-all flex items-center gap-1.5 ${isAnnual ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              <span>{t.pricingAnnual ?? 'Annual'}</span>
              <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-mono">
                -{t.pricingSave20 ?? '20%'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-[var(--radius-card)]">
            <Globe className="h-3.5 w-3.5 text-blue-500" />
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {PRICING_TIERS.map((tier, idx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <PricingCard
                tier={tier}
                isAnnual={isAnnual}
                currency={selectedCurrency}
                variant="landing"
                onSelect={(tierId) => {
                  const tier = PRICING_TIERS.find((t) => t.id === tierId);
                  if (tier && !tier.comingSoon) {
                    window.location.href = `/onboarding?plan=${tierId}`;
                  }
                }}
              />
            </motion.div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 pr-4 font-semibold text-slate-600 dark:text-slate-400 w-1/3">
                  {t.pricingFeature ?? 'Feature'}
                </th>
                {PRICING_TIERS.map((tier) => (
                  <th
                    key={tier.id}
                    className="py-3 px-2 text-center font-bold text-slate-900 dark:text-white text-xs"
                  >
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRICING_FEATURE_ORDER.map((featureName) => (
                <tr key={featureName} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                    {moduleLabels[featureName] ?? featureName}
                  </td>
                  {PRICING_TIERS.map((tier) => {
                    const value = getFeatureValue(tier.id, featureName);
                    return (
                      <td key={tier.id} className="py-3 px-2 text-center">
                        {value === true ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : value === false ? (
                          <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                        ) : (
                          <span className="text-[10px] text-slate-400">{value}</span>
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
  );
}

export default PricingSection;
