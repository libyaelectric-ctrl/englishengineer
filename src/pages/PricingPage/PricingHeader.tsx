import { Globe } from 'lucide-react';

import { CurrencyConfig } from '@/features/billing/currency.config';

interface PricingHeaderProps {
  isAnnual: boolean;
  setIsAnnual: (v: boolean) => void;
  selectedCurrency: string;
  setSelectedCurrency: (v: string) => void;
}

export const PricingHeader = ({
  isAnnual,
  setIsAnnual,
  selectedCurrency,
  setSelectedCurrency,
}: PricingHeaderProps) => {
  return (
    <section className="pt-20 sm:pt-24 pb-8 px-6 md:px-12 max-w-7xl mx-auto border-b border-border-soft">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Pricing &amp; Access Control
            </span>
            <span className="text-xs text-muted-copy font-medium">No hidden lock-in</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
            Transparent plans for individual engineers &amp; project teams.
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-border-soft text-xs font-bold shadow-sm">
            <Globe className="h-4 w-4 text-primary" />
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              {CurrencyConfig.CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-background text-foreground">
                  {c.flag} {c.code} ({c.symbol}) — {c.region}
                </option>
              ))}
            </select>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface p-2 shadow-sm">
            <span
              className={`text-xs font-bold transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-copy'}`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-primary"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-copy'}`}
            >
              Annual{' '}
              <span className="ml-1 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[9px] font-bold uppercase border border-primary/20">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
