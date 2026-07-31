import { Building, ShieldCheck } from 'lucide-react';

const SECTORS = [
  { name: 'EPC Mega Projects', detail: 'FIDIC Cl. 8.4 & Cl. 20.1 Claims' },
  { name: 'BIM & Structural Consultancies', detail: 'Eurocode & ACI Specifications' },
  { name: 'Offshore Energy & Petrochemical', detail: 'ASME & API Inspection Reports' },
  { name: 'Cloud & Infrastructure Tech', detail: 'ISO 27001 & Architecture Reviews' },
  { name: 'HSE & High-Risk Site Safety', detail: 'OSHA 1926 & NEBOSH Standards' },
];

export function SocialProofMarquee() {
  return (
    <div className="border-y border-border-soft bg-surface/60 py-3.5 px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-copy shrink-0">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-bold uppercase tracking-wider text-[10px] font-mono">
            Trusted Across Global Engineering Disciplines:
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-6 text-foreground font-semibold text-[11px]">
          {SECTORS.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-1.5 rounded bg-background border border-border-soft px-2.5 py-1 shadow-2xl"
            >
              <Building className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{s.name}</span>
              <span className="text-[9px] text-muted-copy font-normal hidden lg:inline font-mono">
                ({s.detail})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SocialProofMarquee;
