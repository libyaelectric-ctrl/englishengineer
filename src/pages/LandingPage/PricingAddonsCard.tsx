import { BookOpen, FileText, PlusCircle, Sparkles } from 'lucide-react';

import { useState } from 'react';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';

const ADDONS: Array<{
  id: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  priceKey: TranslationKey;
  unitKey: TranslationKey;
  icon: typeof FileText;
}> = [
  {
    id: 'fidic-packs',
    titleKey: 'landing.addon1Title',
    descKey: 'landing.addon1Desc',
    priceKey: 'landing.addon1Price',
    unitKey: 'landing.addon1Unit',
    icon: FileText,
  },
  {
    id: 'astm-banks',
    titleKey: 'landing.addon2Title',
    descKey: 'landing.addon2Desc',
    priceKey: 'landing.addon2Price',
    unitKey: 'landing.addon2Unit',
    icon: BookOpen,
  },
  {
    id: 'site-glossaries',
    titleKey: 'landing.addon3Title',
    descKey: 'landing.addon3Desc',
    priceKey: 'landing.addon3Price',
    unitKey: 'landing.addon3Unit',
    icon: Sparkles,
  },
];

export function PricingAddonsCard() {
  const translate = useLocalizationStore((s) => s.translate);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    setAddedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="mt-8 rounded-xl border border-primary/20 bg-surface/80 p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between border-b border-border-soft pb-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
            {translate('landing.addonsDesc')}
          </span>
          <h3 className="text-sm font-bold text-foreground">{translate('landing.addonsTitle')}</h3>
        </div>
        <span className="text-[10px] text-muted-copy font-medium">
          {translate('landing.addonsSubtitle')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ADDONS.map((addon) => {
          const isAdded = addedIds.includes(addon.id);
          return (
            <div
              key={addon.id}
              className={`rounded-lg border p-3 flex flex-col justify-between space-y-2 transition-all ${
                isAdded
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border-soft bg-background hover:border-primary/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                    <addon.icon className="h-3.5 w-3.5 text-primary" />
                    <span>{translate(addon.titleKey)}</span>
                  </div>
                  <span className="text-xs font-extrabold text-primary font-mono">
                    {translate(addon.priceKey)}
                    <span className="ml-1 font-medium text-muted-copy">
                      {translate(addon.unitKey)}
                    </span>
                  </span>
                </div>
                <p className="text-[11px] text-muted-copy leading-snug">
                  {translate(addon.descKey)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleAddon(addon.id)}
                className={`w-full flex items-center justify-center gap-1.5 rounded py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isAdded
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-surface border border-border-soft text-foreground hover:bg-surface-hover'
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>
                  {isAdded ? translate('landing.addonsAdded') : translate('landing.addonsAdd')}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PricingAddonsCard;
