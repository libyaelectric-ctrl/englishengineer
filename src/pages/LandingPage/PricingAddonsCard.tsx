import { FileText, Mic, PlusCircle, Sparkles } from 'lucide-react';

import { useState } from 'react';

const ADDONS = [
  {
    id: 'docs-50',
    title: '+50 Document Analyses',
    desc: 'Extra FIDIC contracts, RFI logs & ASTM specifications processing limit.',
    price: '$9',
    unit: 'one-time',
    icon: FileText,
  },
  {
    id: 'voice-120',
    title: '+120 Voice Practice Mins',
    desc: 'Extra AI oral defense coaching & technical interview simulation time.',
    price: '$12',
    unit: 'one-time',
    icon: Mic,
  },
  {
    id: 'terms-custom',
    title: 'Custom Technical Dictionary',
    desc: 'Upload 500+ private company terms for specialized team training.',
    price: '$19',
    unit: 'one-time',
    icon: Sparkles,
  },
];

export function PricingAddonsCard() {
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    setAddedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="mt-8 rounded-xl border border-primary/20 bg-surface/80 p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between border-b border-border-soft pb-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
            Item 17 / Add-On Micro-Transactions
          </span>
          <h3 className="text-sm font-bold text-foreground">
            Optional Micro-Addons (No Subscription Needed)
          </h3>
        </div>
        <span className="text-[10px] text-muted-copy font-medium">
          Add extra credits to any active plan
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
                    <span>{addon.title}</span>
                  </div>
                  <span className="text-xs font-extrabold text-primary font-mono">
                    {addon.price}
                  </span>
                </div>
                <p className="text-[11px] text-muted-copy leading-snug">{addon.desc}</p>
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
                <span>{isAdded ? 'Added to Cart ✓' : 'Add to Plan'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PricingAddonsCard;
