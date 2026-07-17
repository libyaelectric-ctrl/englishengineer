import { BarChart3 } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import type { ScoreResult } from '@/core/learning';

interface ScoreComparisonProps {
  scoreResult: ScoreResult;
}

export const ScoreComparison = ({ scoreResult }: ScoreComparisonProps) => (
  <SectionCard
    title="Your Score vs Average"
    subtitle="How you compare to the average learner"
    icon={BarChart3}
  >
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          <span>Your Score</span>
          <span>{scoreResult.score}%</span>
        </div>
        <ProgressBar value={scoreResult.score} color="primary" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          <span>Average Score</span>
          <span>72%</span>
        </div>
        <ProgressBar value={72} color="cyan" />
      </div>
    </div>
  </SectionCard>
);
