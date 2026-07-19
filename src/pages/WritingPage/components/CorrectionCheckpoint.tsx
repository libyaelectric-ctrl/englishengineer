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
  activeCorrections,
  onSelectRule,
  onApplyFix,
  onAutoFixAll,
  onReset,
  onSubmit,
}: CorrectionCheckpointProps) => (
  <SectionCard
    title="Syntactic Optimization Checkpoint"
    subtitle="Verify linguistic and technical upgrades to earn rewards"
    icon={Sparkles}
    headerActions={
      activeCorrections.length > 0 && (
        <Button
          onClick={onAutoFixAll}
          variant="outline"
          className="text-[10px] h-7 border-[#0047bb]/40 text-[#0047bb] hover:bg-[#0047bb]/5 font-bold font-mono py-0 rounded-[4px] cursor-pointer shadow-sm"
        >
          Auto-Fix All
        </Button>
      )
    }
  >
    <div className="space-y-6">
      {activeCorrections.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6 bg-emerald-500/5 rounded-[4px] border border-emerald-500/20 space-y-4 animate-in zoom-in-95 duration-300 shadow-sm">
          <Check className="h-10 w-10 text-emerald-400 bg-emerald-500/10 p-2 rounded-full" />
          <div>
            <p className="text-sm font-bold text-foreground">
              No Issues Detected
            </p>
            <p className="text-xs text-muted-copy mt-1.5 leading-relaxed font-medium">
              Linguistic clarity, professional tone, and technical jargon
              conform completely to standard protocols.
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectRule(alert);
              }}
              className="group relative cursor-pointer space-y-3 rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm transition-all hover:border-[#0047bb]/30 hover:bg-[#0047bb]/5"
            >
              <div className="flex items-start gap-2.5 text-xs">
                <AlertTriangle
                  className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${alert.type === 'grammar' ? 'text-rose-500' : 'text-amber-500'}`}
                />
                <p className="text-muted-copy leading-relaxed font-bold">
                  {alert.text}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border-soft pt-2.5">
                <span className="text-[10px] font-mono text-muted-copy font-bold">
                  "{alert.original}" →{' '}
                  <span className="text-emerald-400 font-bold font-mono">
                    "{alert.fix}"
                  </span>
                </span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyFix(alert.original, alert.fix);
                  }}
                  className="text-[10px] h-6 px-2.5 py-0 bg-[#0047bb]/10 hover:bg-[#0047bb]/20 text-[#0047bb] rounded-[4px] font-bold cursor-pointer border border-[#0047bb]/25 transition-colors shadow-sm animate-in fade-in"
                >
                  Auto-Fix
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border-soft pt-4">
        <Button
          variant="outline"
          onClick={onReset}
          className="h-10 rounded-[4px] border-border-soft text-xs text-muted-copy hover:text-[#0047bb] hover:bg-[#0047bb]/5 cursor-pointer shadow-sm"
        >
          Reset Sandbox
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-[#0047bb] hover:bg-[#0047bb]/90 text-white font-bold uppercase tracking-wider text-[10px] px-5 h-10 rounded-[4px] cursor-pointer border border-[#0047bb] shadow-sm"
        >
          Submit Draft
        </Button>
      </div>
    </div>
  </SectionCard>
);
