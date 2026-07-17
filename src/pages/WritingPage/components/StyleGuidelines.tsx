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
  <div className="space-y-3 rounded-xl border border-border-soft bg-surface-hover p-5">
    <h5 className="text-xs font-black uppercase text-muted-copy tracking-wider flex items-center gap-1.5">
      <Info className="h-4 w-4 text-engineer-cyan" />
      <span>
        Linguistic Guideline Insights ({corrections.length - activeCorrections.length}/{corrections.length} resolved)
      </span>
    </h5>

    {selectedRule ? (
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-md animate-in slide-in-from-top-2 duration-300">
        <h6 className="font-mono text-sm text-primary font-bold uppercase tracking-wide">
          {selectedRule.type} Correction Guide
        </h6>
        <p className="text-xs text-muted-copy mt-2 leading-relaxed font-medium">
          <strong className="text-foreground">Guideline:</strong> {selectedRule.text}
        </p>
        <p className="text-xs text-muted-copy mt-1.5 leading-relaxed font-mono">
          <span className="text-rose-400 font-bold">"{selectedRule.original}"</span>{' '}
          →{' '}
          <span className="text-emerald-400 font-bold">"{selectedRule.fix}"</span>
        </p>
      </div>
    ) : (
      <div className="space-y-2">
        <p className="text-xs text-muted-copy italic py-1 font-medium">
          Click on any linguistic flag in the right column checkpoint, or review the brief outline of required revisions below:
        </p>
        <div className="flex flex-wrap gap-2">
          {corrections.map((c) => {
            const isFixed = !activeCorrections.some((ac) => ac.id === c.id);
            return (
              <button
                key={c.id}
                onClick={() => onSelectRule(c)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-all cursor-pointer ${
                  isFixed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'border-border-soft bg-surface text-muted-copy hover:border-border-hover hover:bg-surface-hover hover:text-foreground'
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
