import { Check, AlertTriangle, Sparkles } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import type { WritingCorrection } from '@/features/writing';

interface CorrectionCheckpointProps {
  activeCorrections: WritingCorrection[];
  onSelectRule: (rule: WritingCorrection) => void;
  onApplyFix: (original: string, fix: string) => void;
  onAutoFixAll: () => void;
  onReset: () => void;
  onSubmit: () => void;
}

export const CorrectionCheckpoint = ({
  activeCorrections, onSelectRule, onApplyFix, onAutoFixAll, onReset, onSubmit,
}: CorrectionCheckpointProps) => (
  <SectionCard
    title="Syntactic Optimization Checkpoint"
    subtitle="Verify linguistic and technical upgrades to earn rewards"
    icon={Sparkles}
    headerActions={
      activeCorrections.length > 0 && (
        <Button onClick={onAutoFixAll} variant="outline" className="text-[10px] h-7 border-primary/40 text-primary hover:bg-primary/5 font-bold font-mono py-0">
          Auto-Fix All
        </Button>
      )
    }
  >
    <div className="space-y-6">
      {activeCorrections.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6 bg-emerald-500/5 rounded-lg border border-emerald-500/20 space-y-4 animate-in zoom-in-95 duration-300">
          <Check className="h-10 w-10 text-emerald-400 bg-emerald-500/10 p-2 rounded-full" />
          <div>
            <p className="text-sm font-bold text-foreground">No Issues Detected</p>
            <p className="text-xs text-muted-copy mt-1.5 leading-relaxed font-medium">
              Linguistic clarity, professional tone, and technical jargon conform completely to standard protocols.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
          {activeCorrections.map((alert) => (
            <div
              key={alert.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectRule(alert)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectRule(alert); }}
              className="group relative cursor-pointer space-y-3 rounded-xl border border-border-soft bg-surface p-4 shadow-sm transition-all hover:-translate-y-px hover:border-border-hover hover:bg-surface-hover/60"
            >
              <div className="flex items-start gap-2.5 text-xs">
                <AlertTriangle className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${alert.type === 'grammar' ? 'text-rose-500' : 'text-amber-500'}`} />
                <p className="text-muted-copy leading-relaxed font-semibold">{alert.text}</p>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border-soft pt-2.5">
                <span className="text-[10px] font-mono text-muted-copy">
                  "{alert.original}" → <span className="text-emerald-400 font-bold">"{alert.fix}"</span>
                </span>
                <Button
                  onClick={(e) => { e.stopPropagation(); onApplyFix(alert.original, alert.fix); }}
                  className="text-[10px] h-6 px-2.5 py-0 bg-primary/20 hover:bg-primary/30 text-primary rounded font-bold"
                >
                  Auto-Fix
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border-soft pt-4">
        <Button variant="outline" onClick={onReset} className="h-10 border-border-soft text-xs text-muted-copy hover:text-foreground">
          Reset Sandbox
        </Button>
        <Button onClick={onSubmit} className="bg-primary hover:bg-primary-hover text-foreground font-black px-5 h-10">
          Submit Draft
        </Button>
      </div>
    </div>
  </SectionCard>
);
