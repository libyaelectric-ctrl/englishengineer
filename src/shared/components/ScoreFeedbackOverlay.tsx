import { Award, Zap, Coins, TrendingUp } from 'lucide-react';
import { Button } from './Button';
import { ScoreResult } from '@/core/learning';

interface ScoreFeedbackOverlayProps {
  result: ScoreResult | null;
  onClose: () => void;
  onAction?: () => void;
  actionText?: string;
}

export const ScoreFeedbackOverlay = ({
  result,
  onClose,
  onAction,
  actionText = 'Return to Command Center',
}: ScoreFeedbackOverlayProps) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700/25 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        data-testid="speaking-result-panel"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg space-y-5 overflow-y-auto rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_30px_90px_rgba(15,23,42,0.18)] animate-in zoom-in-95 duration-300 sm:space-y-6 sm:p-8"
      >
        {/* Title / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex rounded-[16px] border border-blue-200 bg-blue-50 p-4 text-blue-700">
            <Award className="h-10 w-10" />
          </div>
          <h3 className="text-3xl font-black text-slate-950">
            Evaluation Complete
          </h3>
          <p className="text-xs font-mono text-slate-500 tracking-[0.2em] uppercase">
            SYSTEM ASSESSMENT RESULTS
          </p>
        </div>

        {/* Big Score Meter */}
        <div className="flex flex-col gap-4 rounded-[16px] border border-blue-100 bg-blue-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-mono text-slate-500">
              TOTAL EVALUATION SCORE
            </p>
            <h4 className="mt-1 text-5xl font-black text-slate-950">
              {result.score}
              <span className="text-xl font-medium text-slate-600">/100</span>
            </h4>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-blue-100 border-t-blue-600 font-mono text-sm font-bold text-blue-700">
            {result.score}%
          </div>
        </div>

        {/* Rewards Payout Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="min-w-0 rounded-[12px] border border-slate-200 bg-slate-50 p-3 text-center sm:p-4">
            <Zap className="h-5 w-5 text-amber-500 mx-auto" />
            <p className="mt-2 break-words text-[10px] font-mono leading-4 text-slate-500">
              XP GAINED
            </p>
            <p className="mt-0.5 text-base font-bold text-slate-950">
              +{result.xp}
            </p>
          </div>
          <div className="min-w-0 rounded-[12px] border border-slate-200 bg-slate-50 p-3 text-center sm:p-4">
            <Coins className="h-5 w-5 text-yellow-500 mx-auto" />
            <p className="mt-2 break-words text-[10px] font-mono leading-4 text-slate-500">
              COINS AWARDED
            </p>
            <p className="mt-0.5 text-base font-bold text-slate-950">
              +{result.coins}
            </p>
          </div>
          <div className="min-w-0 rounded-[12px] border border-slate-200 bg-slate-50 p-3 text-center sm:p-4">
            <TrendingUp className="h-5 w-5 text-engineer-cyan mx-auto" />
            <p className="mt-2 break-words text-[10px] font-mono leading-4 text-slate-500">
              LEVEL PROGRESS
            </p>
            <p
              className={`text-base font-bold mt-0.5 ${result.eloChange >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}
            >
              {result.eloChange >= 0
                ? `+${result.eloChange}`
                : result.eloChange}
            </p>
          </div>
        </div>

        {/* Dynamic Diagnostics */}
        <div className="space-y-4 border-t border-slate-200 pt-4 text-sm">
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              SYSTEM FEEDBACK
            </span>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-700">
              {result.feedback}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-700">
                STRENGTHS
              </span>
              <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-slate-600">
                {result.strengths.map((str, idx) => (
                  <li key={idx} className="truncate">
                    {str}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-rose-700">
                WEAKNESSES
              </span>
              <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-slate-600">
                {result.weaknesses.map((wk, idx) => (
                  <li key={idx} className="truncate">
                    {wk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Dismiss Diagnostics
          </Button>
          {onAction && (
            <Button onClick={onAction} className="flex-1">
              {actionText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
