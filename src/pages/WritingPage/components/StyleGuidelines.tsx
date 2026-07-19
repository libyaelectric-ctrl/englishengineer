import { Info } from 'lucide-react';
import type { WritingCorrection } from '@/features/writing';

interface StyleGuidelinesProps {
  corrections: WritingCorrection[];
  activeCorrections: WritingCorrection[];
  selectedRule: WritingCorrection | null;
  onSelectRule: (rule: WritingCorrection) => void;
}

export const StyleGuidelines = ({
  corrections,
  activeCorrections,
  selectedRule,
  onSelectRule,
}: StyleGuidelinesProps) => (
  <div className="space-y-3 rounded-[4px] border border-border-soft bg-[#f3f3fd] p-5 shadow-sm">
    <h5 className="text-xs font-bold uppercase text-muted-copy tracking-wider flex items-center gap-1.5">
      <Info className="h-4 w-4 text-[#0047bb]" />
      <span>
        Linguistic Guideline Insights (
        {corrections.length - activeCorrections.length}/{corrections.length}{' '}
        resolved)
      </span>
    </h5>

    {selectedRule ? (
      <div className="p-4 bg-[#0047bb]/5 border border-[#0047bb]/25 rounded-[4px] animate-in slide-in-from-top-2 duration-300 shadow-sm">
        <h6 className="font-mono text-sm text-[#0047bb] font-bold uppercase tracking-wide">
          {selectedRule.type} Correction Guide
        </h6>
        <p className="text-xs text-muted-copy mt-2 leading-relaxed font-medium">
          <strong className="text-foreground">Guideline:</strong>{' '}
          {selectedRule.text}
        </p>
        <p className="text-xs text-muted-copy mt-1.5 leading-relaxed font-mono font-bold">
          <span className="text-rose-400 font-bold">
            "{selectedRule.original}"
          </span>{' '}
          →{' '}
          <span className="text-emerald-400 font-bold">
            "{selectedRule.fix}"
          </span>
        </p>
      </div>
    ) : (
      <div className="space-y-2">
        <p className="text-xs text-muted-copy italic py-1 font-medium">
          Click on any linguistic flag in the right column checkpoint, or review
          the brief outline of required revisions below:
        </p>
        <div className="flex flex-wrap gap-2">
          {corrections.map((c) => {
            const isFixed = !activeCorrections.some((ac) => ac.id === c.id);
            return (
              <button
                key={c.id}
                onClick={() => onSelectRule(c)}
                className={`text-[9px] font-mono px-2.5 py-1 rounded-[4px] border transition-all cursor-pointer uppercase font-bold tracking-wider ${
                  isFixed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'border-border-soft bg-surface text-muted-copy hover:border-[#0047bb]/30 hover:bg-[#0047bb]/5 hover:text-foreground'
                }`}
              >
                {c.type.toUpperCase()}: {c.original}
              </button>
            );
          })}
        </div>
      </div>
    )}
  </div>
);
