import { useState } from 'react';
import { Check, X, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CurrencyConfig } from '@/features/billing';
import { getLandingTranslations } from './landing-i18n';
import { useLocalizationStore } from '@/features/localization';

type PackageId = 'junior' | 'senior' | 'specialist' | 'master' | 'team';

interface PackageInfo {
  id: PackageId;
  name: string;
  price: number;
  description: string;
  highlighted: boolean;
  comingSoon: boolean;
}

const PACKAGES: PackageInfo[] = [
  { id: 'junior', name: 'Junior', price: 29, description: 'Essential learning core for daily practice.', highlighted: false, comingSoon: false },
  { id: 'senior', name: 'Senior', price: 59, description: 'Expand to reading, writing, and translation.', highlighted: true, comingSoon: false },
  { id: 'specialist', name: 'Specialist', price: 79, description: 'Add speaking and listening practice.', highlighted: false, comingSoon: false },
  { id: 'master', name: 'Master', price: 99, description: 'Full access including tools and AI copilot.', highlighted: false, comingSoon: false },
  { id: 'team', name: 'Team', price: 999, description: 'Enterprise solution for engineering teams.', highlighted: false, comingSoon: true },
];

const MODULES: Array<{ key: string; label: string; tiers: Record<PackageId, boolean | string> }> = [
  { key: 'placement', label: 'Placement Test', tiers: { junior: true, senior: true, specialist: true, master: true, team: 'Coming Soon' } },
  { key: 'learningHub', label: 'Learning Hub', tiers: { junior: true, senior: true, specialist: true, master: true, team: 'Coming Soon' } },
  { key: 'progress', label: 'Progress Tracking', tiers: { junior: true, senior: true, specialist: true, master: true, team: 'Coming Soon' } },
  { key: 'vocabulary', label: 'Vocabulary', tiers: { junior: true, senior: true, specialist: true, master: true, team: 'Coming Soon' } },
  { key: 'grammar', label: 'Grammar', tiers: { junior: true, senior: true, specialist: true, master: true, team: 'Coming Soon' } },
  { key: 'translator', label: 'Translator', tiers: { junior: false, senior: true, specialist: true, master: true, team: 'Coming Soon' } },
  { key: 'reading', label: 'Reading', tiers: { junior: false, senior: true, specialist: true, master: true, team: 'Coming Soon' } },
  { key: 'writing', label: 'Writing', tiers: { junior: false, senior: true, specialist: true, master: true, team: 'Coming Soon' } },
  { key: 'speaking', label: 'Speaking', tiers: { junior: false, senior: false, specialist: true, master: true, team: 'Coming Soon' } },
  { key: 'listening', label: 'Listening', tiers: { junior: false, senior: false, specialist: true, master: true, team: 'Coming Soon' } },
  { key: 'tools', label: 'Tool', tiers: { junior: false, senior: false, specialist: false, master: true, team: 'Coming Soon' } },
  { key: 'aiCopilot', label: 'AI Copilot', tiers: { junior: false, senior: false, specialist: false, master: true, team: 'Coming Soon' } },
];

export function PricingSection() {
  const language = useLocalizationStore((s) => s.language);
  const t = getLandingTranslations(language);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isAnnual, setIsAnnual] = useState(false);

  const tp = (key: keyof typeof t, fallback: string) => t[key] ?? fallback;

  const formatPrice = (usd: number) => {
    if (usd === 0) return tp('pricingFree' as keyof typeof t, 'junior');
    const annual = isAnnual ? Math.round(usd * 0.8) : usd;
    return CurrencyConfig.formatPrice(annual, selectedCurrency);
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
            {t.pricingSubtitle ?? 'Choose your plan. Every plan includes your discipline-specific vocabulary pool.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
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
              <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-mono">-{t.pricingSave20 ?? '20%'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
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
          {PACKAGES.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`relative rounded-2xl p-5 border flex flex-col ${pkg.highlighted ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-2 ring-blue-500/20 scale-[1.03]' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'} ${pkg.comingSoon ? 'opacity-70' : ''}`}
            >
              {pkg.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {t.pricingMostPopular ?? 'Most Popular'}
                </span>
              )}
              {pkg.comingSoon && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] bg-slate-500 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {t.pricingComingSoon ?? 'Coming Soon'}
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
              <div className="mt-2 mb-3">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {formatPrice(pkg.price)}
                </span>
                {pkg.price > 0 && (
                  <span className="text-xs text-slate-500">/{isAnnual ? (t.pricingYear ?? 'yr') : (t.pricingMonth ?? 'mo')}</span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex-1">{pkg.description}</p>
              <Link
                to={pkg.comingSoon ? '#' : `/onboarding?plan=${pkg.id}`}
                onClick={(e) => pkg.comingSoon && e.preventDefault()}
                className={`block w-full rounded-lg px-3 py-2 text-center text-xs font-bold transition-all ${pkg.comingSoon ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed' : pkg.highlighted ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800'}`}
              >
                {pkg.comingSoon ? (t.pricingNotifyMe ?? 'Notify Me') : (t.pricingGetStarted ?? 'Get Started')}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 pr-4 font-semibold text-slate-600 dark:text-slate-400 w-1/3">{t.pricingFeature ?? 'Feature'}</th>
                {PACKAGES.map((pkg) => (
                  <th key={pkg.id} className="py-3 px-2 text-center font-bold text-slate-900 dark:text-white text-xs">{pkg.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod) => (
                <tr key={mod.key} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{mod.label}</td>
                  {PACKAGES.map((pkg) => {
                    const value = mod.tiers[pkg.id];
                    return (
                      <td key={pkg.id} className="py-3 px-2 text-center">
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