import React from 'react';
import { Award, Zap, Coins, TrendingUp } from 'lucide-react';
import { Button } from './Button';
import { ScoreResult } from '@/core/learning';

interface ScoreFeedbackOverlayProps {
  result: ScoreResult | null;
  onClose: () => void;
  onAction?: () => void;
  actionText?: string;
}

export const ScoreFeedbackOverlay = React.memo(({
  result,
  onClose,
  onAction,
  actionText = 'Return to Dashboard',
}: ScoreFeedbackOverlayProps) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Evaluation results"
        data-testid="speaking-result-panel"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg space-y-5 overflow-y-auto rounded-2xl border border-border-soft bg-surface p-6 shadow-xl"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover">
            <Award className="h-7 w-7 text-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Evaluation Complete
          </h3>
        </div>

        {/* Score */}
        <div className="flex items-center justify-between rounded-xl border border-border-soft bg-surface p-5">
          <div>
            <p className="text-xs text-muted-copy">Total Score</p>
            <h4 className="mt-1 text-4xl font-bold text-foreground">
              {result.score}
              <span className="text-lg text-muted-copy">/100</span>
            </h4>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border-soft text-lg font-bold text-foreground">
            {result.score}%
          </div>
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border-soft bg-surface p-3 text-center">
            <Zap className="h-4 w-4 text-warning mx-auto" />
            <p className="mt-1 text-[10px] text-muted-copy">XP</p>
            <p className="text-sm font-bold text-foreground">+{result.xp}</p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-3 text-center">
            <Coins className="h-4 w-4 text-warning mx-auto" />
            <p className="mt-1 text-[10px] text-muted-copy">Coins</p>
            <p className="text-sm font-bold text-foreground">+{result.coins}</p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-3 text-center">
            <TrendingUp className="h-4 w-4 text-foreground mx-auto" />
            <p className="mt-1 text-[10px] text-muted-copy">ELO</p>
            <p
              className={`text-sm font-bold ${result.eloChange >= 0 ? 'text-success' : 'text-error'}`}
            >
              {result.eloChange >= 0
                ? `+${result.eloChange}`
                : result.eloChange}
            </p>
          </div>
        </div>

        {/* Feedback */}
        <div className="space-y-4 border-t border-border-soft pt-4">
          <div>
            <p className="text-xs font-medium text-muted-copy">Feedback</p>
            <p className="mt-1 text-sm text-foreground leading-relaxed">
              {result.feedback}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-success">Strengths</p>
              <ul className="mt-1 space-y-1 text-xs text-muted-copy">
                {result.strengths.map((str, idx) => (
                  <li key={idx} className="truncate">
                    {str}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-error">Weaknesses</p>
              <ul className="mt-1 space-y-1 text-xs text-muted-copy">
                {result.weaknesses.map((wk, idx) => (
                  <li key={idx} className="truncate">
                    {wk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Dismiss
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
});
ScoreFeedbackOverlay.displayName = 'ScoreFeedbackOverlay';
