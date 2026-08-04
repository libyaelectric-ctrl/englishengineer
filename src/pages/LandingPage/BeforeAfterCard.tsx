import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

import { useState } from 'react';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';

const COMPARISONS: Array<{
  category: TranslationKey;
  before: TranslationKey;
  after: TranslationKey;
  risk: TranslationKey;
  ready: TranslationKey;
}> = [
  {
    category: 'landing.comparison1Category',
    before: 'landing.comparison1Before',
    after: 'landing.comparison1After',
    risk: 'landing.comparison1Risk',
    ready: 'landing.comparison1Ready',
  },
  {
    category: 'landing.comparison2Category',
    before: 'landing.comparison2Before',
    after: 'landing.comparison2After',
    risk: 'landing.comparison2Risk',
    ready: 'landing.comparison2Ready',
  },
  {
    category: 'landing.comparison3Category',
    before: 'landing.comparison3Before',
    after: 'landing.comparison3After',
    risk: 'landing.comparison3Risk',
    ready: 'landing.comparison3Ready',
  },
];

export function BeforeAfterCard() {
  const translate = useLocalizationStore((s) => s.translate);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = COMPARISONS[activeIndex];

  return (
    <section className="border-t border-border-soft bg-background px-6 py-8 md:px-12 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
              {translate('landing.beforeAfterBadge')}
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              {translate('landing.beforeAfterTitle')}
            </h2>
          </div>
          <p className="text-xs text-foreground/80 font-medium max-w-xl leading-tight">
            {translate('landing.beforeAfterDesc')}
          </p>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {COMPARISONS.map((item, idx) => (
            <button
              key={item.category}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
                activeIndex === idx
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-surface border-border-soft text-muted-copy hover:text-foreground hover:border-primary/40'
              }`}
            >
              {translate(item.category)}
            </button>
          ))}
        </div>

        {/* Side-by-Side Before & After Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* Before Card */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 font-mono">
                  <XCircle className="h-3.5 w-3.5" /> {translate('landing.beforeWeakLabel')}
                </span>
                <span className="text-[9px] font-bold text-rose-500 uppercase">
                  {translate(active.risk)}
                </span>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed font-mono bg-background/60 p-3 rounded border border-rose-500/20">
                "{translate(active.before)}"
              </p>
            </div>
            <div className="text-[10px] font-semibold text-rose-600/80 italic pt-1">
              ⚠️ {translate('landing.beforeWarning')}
            </div>
          </div>

          {/* After Card (EngVox AI Precision) */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 flex flex-col justify-between space-y-3 shadow-lg relative light-sweep-container overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {translate('landing.afterRefinedLabel')}
                </span>
              </div>
              <p className="text-xs text-foreground font-semibold leading-relaxed bg-background p-3 rounded border border-emerald-500/30 shadow-sm">
                "{translate(active.after)}"
              </p>
            </div>
            <div className="flex items-center justify-between pt-1 text-[10px] text-emerald-600 font-bold">
              <span>{translate(active.ready)}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BeforeAfterCard;
