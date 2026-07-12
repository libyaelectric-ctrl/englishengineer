import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import {
  WritingRealtimeAnalyzer,
  type RealtimeSuggestion,
} from './writing-realtime-analyzer';

interface WritingRealtimeFeedbackProps {
  draft: string;
}

const severityConfig: Record<
  RealtimeSuggestion['severity'],
  { icon: typeof CheckCircle2; color: string; bg: string }
> = {
  error: {
    icon: AlertTriangle,
    color: 'text-rose-500',
    bg: 'bg-rose-500/5 border-rose-500/20',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/5 border-amber-500/20',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/5 border-blue-500/20',
  },
};

const typeLabels: Record<RealtimeSuggestion['type'], string> = {
  grammar: 'Grammar',
  style: 'Style',
  vocabulary: 'Vocabulary',
  structure: 'Structure',
};

export const WritingRealtimeFeedback = ({
  draft,
}: WritingRealtimeFeedbackProps) => {
  const analysis = useMemo(
    () => WritingRealtimeAnalyzer.analyze(draft),
    [draft]
  );

  if (!draft.trim()) {
    return (
      <div className="rounded-xl border border-border-soft bg-surface-hover p-5 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-muted-copy mb-2" />
        <p className="text-xs text-muted-copy">
          Start writing to see real-time feedback
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border-soft bg-surface p-3 text-center">
          <p className="text-[10px] font-mono text-muted-copy uppercase">
            Words
          </p>
          <p className="text-lg font-bold text-foreground">
            {analysis.wordCount}
          </p>
        </div>
        <div className="rounded-lg border border-border-soft bg-surface p-3 text-center">
          <p className="text-[10px] font-mono text-muted-copy uppercase">
            Sentences
          </p>
          <p className="text-lg font-bold text-foreground">
            {analysis.sentenceCount}
          </p>
        </div>
        <div className="rounded-lg border border-border-soft bg-surface p-3 text-center">
          <p className="text-[10px] font-mono text-muted-copy uppercase">
            Readability
          </p>
          <p
            className={cn(
              'text-lg font-bold',
              analysis.readabilityScore >= 80
                ? 'text-emerald-500'
                : analysis.readabilityScore >= 60
                  ? 'text-amber-500'
                  : 'text-rose-500'
            )}
          >
            {analysis.readabilityScore}%
          </p>
        </div>
      </div>

      {/* Score Bars */}
      <div className="space-y-2">
        <ScoreBar label="Grammar" score={analysis.grammarScore} />
        <ScoreBar label="Style" score={analysis.styleScore} />
        <ScoreBar
          label="Passive Voice"
          score={Math.max(0, 100 - analysis.passiveVoiceCount * 10)}
        />
      </div>

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-muted-copy tracking-wider">
            {analysis.suggestions.length} Suggestion
            {analysis.suggestions.length !== 1 ? 's' : ''}
          </p>
          {analysis.suggestions.slice(0, 8).map((suggestion) => {
            const config = severityConfig[suggestion.severity];
            const Icon = config.icon;
            return (
              <div
                key={suggestion.id}
                className={cn('rounded-lg border p-3 text-xs', config.bg)}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', config.color)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('font-bold', config.color)}>
                        {typeLabels[suggestion.type]}
                      </span>
                      {suggestion.line && (
                        <span className="text-[10px] text-muted-copy">
                          Line {suggestion.line}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-foreground">
                      {suggestion.message}
                    </p>
                    {suggestion.fix && (
                      <p className="mt-1 text-[10px] text-emerald-500 font-mono">
                        Suggested: &quot;{suggestion.fix}&quot;
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {analysis.suggestions.length > 8 && (
            <p className="text-[10px] text-muted-copy">
              +{analysis.suggestions.length - 8} more suggestions
            </p>
          )}
        </div>
      )}

      {analysis.suggestions.length === 0 && draft.trim().length > 20 && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
          <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500 mb-1" />
          <p className="text-xs text-emerald-500 font-medium">
            No issues detected — great writing!
          </p>
        </div>
      )}
    </div>
  );
};

const ScoreBar = ({ label, score }: { label: string; score: number }) => (
  <div className="flex items-center gap-3">
    <span className="w-20 text-[10px] font-mono text-muted-copy uppercase">
      {label}
    </span>
    <div className="flex-1 h-1.5 rounded-full bg-surface-hover overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300',
          score >= 80
            ? 'bg-emerald-500'
            : score >= 60
              ? 'bg-amber-500'
              : 'bg-rose-500'
        )}
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="w-8 text-[10px] font-mono text-muted-copy text-right">
      {score}
    </span>
  </div>
);
