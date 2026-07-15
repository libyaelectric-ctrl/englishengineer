import { Brain } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';

interface EvaluationScoresProps {
  evaluationResult: {
    fluencyScore: number;
    clarityScore: number;
    grammarScore: number;
    technicalVocabularyScore: number;
    confidenceScore: number;
  };
}

export const EvaluationScores = ({
  evaluationResult,
}: EvaluationScoresProps) => (
  <SectionCard
    title="Latest Speaking Score"
    subtitle="Deterministic local text evaluation"
    icon={Brain}
  >
    <div className="space-y-4">
      {[
        ['Fluency', evaluationResult.fluencyScore],
        ['Clarity', evaluationResult.clarityScore],
        ['Grammar', evaluationResult.grammarScore],
        ['Technical vocabulary', evaluationResult.technicalVocabularyScore],
        ['Confidence', evaluationResult.confidenceScore],
      ].map(([label, value]) => (
        <div key={String(label)}>
          <div className="mb-1 flex justify-between text-xs font-medium text-muted-copy">
            <span>{label}</span>
            <span>{value}%</span>
          </div>
          <ProgressBar value={Number(value)} color="primary" />
        </div>
      ))}
    </div>
  </SectionCard>
);
