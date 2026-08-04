import { Building, ShieldCheck } from 'lucide-react';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';

const SECTORS: Array<{ nameKey: TranslationKey; detailKey: TranslationKey }> = [
  { nameKey: 'landing.sector1', detailKey: 'landing.sector1Desc' },
  { nameKey: 'landing.sector2', detailKey: 'landing.sector2Desc' },
  { nameKey: 'landing.sector3', detailKey: 'landing.sector3Desc' },
  { nameKey: 'landing.sector4', detailKey: 'landing.sector4Desc' },
  { nameKey: 'landing.sector5', detailKey: 'landing.sector5Desc' },
];

export function SocialProofMarquee() {
  const translate = useLocalizationStore((s) => s.translate);

  return (
    <div className="border-y border-border-soft bg-surface/60 py-3.5 px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-copy shrink-0">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-bold uppercase tracking-wider text-[10px] font-mono">
            {translate('landing.trustedBy')}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-6 text-foreground font-semibold text-[11px]">
          {SECTORS.map((s) => (
            <div
              key={s.nameKey}
              className="flex items-center gap-1.5 rounded bg-background border border-border-soft px-2.5 py-1 shadow-2xl"
            >
              <Building className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{translate(s.nameKey)}</span>
              <span className="text-[9px] text-muted-copy font-normal hidden lg:inline font-mono">
                ({translate(s.detailKey)})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SocialProofMarquee;
