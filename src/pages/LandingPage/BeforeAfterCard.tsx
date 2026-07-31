import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

import { useState } from 'react';

const COMPARISONS = [
  {
    category: 'FIDIC Claim & Extension of Time (EOT)',
    before:
      'Hi, yesterday heavy rain happened. Workers cannot work on site. Please pay extra money and give more days.',
    after:
      'Pursuant to FIDIC Sub-Clause 8.4 [Extension of Time for Completion], we hereby give formal notice of critical path delay resulting from exceptionally adverse climatic conditions as logged in Site Diary #42.',
    metrics: '+45% Professional Credibility | FIDIC Cl. 8.4 Compliant',
  },
  {
    category: 'RFI & Technical Specification Inquiry',
    before:
      'The drawing for rebar is confusing. Tell us what steel size we use for slab beam B-12.',
    after:
      'RFI #104: Clarification requested regarding structural drawing S-204 detail B-12. Please confirm whether high-yield deformed bars to BS 4449 Grade 500B are specified for top reinforcement.',
    metrics: 'Eliminated RFI Ambiguity | BS 4449 Specification Verified',
  },
  {
    category: 'Site Safety Incident & HSE Report',
    before: 'Worker almost fell down from scaffolding level 3. Fix safety belt now.',
    after:
      'HSE Incident Alert: Near-miss recorded at Scaffold Tower C, Level 3. Immediate stand-down ordered to audit 100% tie-off compliance and double-lanyard harness anchorage points per OSHA 1926.502.',
    metrics: 'Audit-Ready HSE Terminology | OSHA 1926.502 Standard',
  },
];

export function BeforeAfterCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = COMPARISONS[activeIndex];

  return (
    <section className="border-t border-border-soft bg-background px-6 py-8 md:px-12 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
              Before & After
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Transform amateur site notes into audit-ready engineering English.
            </h2>
          </div>
          <p className="text-xs text-foreground/80 font-medium max-w-xl leading-tight">
            See how EngVox AI elevates daily site communications into precise international project
            standards.
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
              {item.category}
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
                  <XCircle className="h-3.5 w-3.5" /> Weak / Informal Site Note
                </span>
                <span className="text-[9px] font-bold text-rose-500 uppercase">
                  Risk: Delay & Dispute
                </span>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed font-mono bg-background/60 p-3 rounded border border-rose-500/20">
                "{active.before}"
              </p>
            </div>
            <div className="text-[10px] font-semibold text-rose-600/80 italic pt-1">
              ⚠️ Lacks contract reference, standard clause numbers & precise technical metrics.
            </div>
          </div>

          {/* After Card (EngVox AI Precision) */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 flex flex-col justify-between space-y-3 shadow-lg relative light-sweep-container overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5" /> EngVox AI Refined Standard
                </span>
                <span className="text-[9px] font-bold text-emerald-600 uppercase font-mono bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                  {active.metrics}
                </span>
              </div>
              <p className="text-xs text-foreground font-semibold leading-relaxed bg-background p-3 rounded border border-emerald-500/30 shadow-sm">
                "{active.after}"
              </p>
            </div>
            <div className="flex items-center justify-between pt-1 text-[10px] text-emerald-600 font-bold">
              <span>Ready to paste directly into Official Site Minutes & RFI logs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BeforeAfterCard;
