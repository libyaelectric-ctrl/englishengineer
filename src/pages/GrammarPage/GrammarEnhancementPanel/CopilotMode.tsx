import { Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/shared/components/Button';
import {
  AdaptiveDifficultyEngine,
  type GrammarRule,
  type GrammarRuleProgress,
} from '@/features/grammar';
import { getModuleLabel } from '../GrammarPageHelpers';
import { PanelShell, MiniMetric } from './shared';
import { type ProofIssue } from './types';

const scoreReport = (text: string, issues: ProofIssue[]): number => {
  if (!text.trim()) return 0;
  const positiveSignals = ['shall', 'must', 'if', 'because', 'therefore', 'was', 'were'].filter(
    (token) => text.toLowerCase().includes(token)
  ).length;
  return Math.max(25, Math.min(100, 75 + positiveSignals * 4 - issues.length * 12));
};

export const CopilotMode = ({
  selectedRule,
  selectedProgress,
  proofIssues,
}: {
  selectedRule: GrammarRule;
  selectedProgress: GrammarRuleProgress;
  proofIssues: ProofIssue[];
}) => {
  const adaptive = useMemo(
    () => AdaptiveDifficultyEngine.assessDifficulty(selectedRule.id, selectedProgress),
    [selectedProgress, selectedRule.id]
  );

  const reportScore = useMemo(
    () => scoreReport(selectedRule.correctedExampleEnglish, proofIssues),
    [selectedRule.correctedExampleEnglish, proofIssues]
  );

  return (
    <PanelShell
      title="Adaptive AI Copilot"
      subtitle="Rule explanation, difficulty, report checking, two-step hints, and personal error recovery."
      icon={Sparkles}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MiniMetric label="Report Score" value={`${reportScore}%`} />
        <MiniMetric label="Difficulty" value={adaptive.suggestedDifficulty} />
        <MiniMetric label="Confidence" value={`${Math.round(adaptive.confidence * 100)}%`} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-[4px] border border-border-soft bg-background p-3">
          <p className="text-xs font-black uppercase tracking-wide">Explain this rule</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-copy">
            In {getModuleLabel(selectedRule.grammarCategory)}, use{' '}
            <span className="font-bold text-primary">{selectedRule.structure}</span> when the
            engineering goal is: {selectedRule.engineeringUseCase}
          </p>
          <p className="mt-2 text-xs leading-relaxed">{adaptive.reasoning}</p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" className="rounded-[4px]">
              Hint 1
            </Button>
            <Button variant="outline" className="rounded-[4px]">
              Hint 2
            </Button>
          </div>
        </div>
        <div className="rounded-[4px] border border-border-soft bg-background p-3">
          <p className="text-xs font-black uppercase tracking-wide">Improvement Quiz Seed</p>
          <p className="mt-2 text-xs text-muted-copy">
            Your next recovery quiz should focus on{' '}
            {selectedRule.mistakeType || 'form and word order'}.
          </p>
          <p className="mt-2 rounded-[4px] border border-primary/20 bg-primary/5 p-2 text-xs font-bold">
            {selectedRule.badExampleEnglish}
          </p>
          <p className="mt-2 text-xs text-muted-copy">
            Target correction: {selectedRule.correctedExampleEnglish}
          </p>
        </div>
      </div>
    </PanelShell>
  );
};
