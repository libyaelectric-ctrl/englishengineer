import { FileText } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import { WritingEvaluationResults } from '../WritingEvaluationResults';
import type {
  WritingCorrection,
  WritingEvaluationResult,
} from '@/features/writing';

interface EvaluationViewProps {
  evaluationResult: WritingEvaluationResult;
  currentMission: {
    id: string;
    title: string;
    description: string;
    cefrLevel: string;
    discipline: string;
    corrections: WritingCorrection[];
    scenario?: string;
    task?: string;
    expectedStructure?: string[];
    sampleExcellentAnswer?: string;
  };
  showModelAnswer: boolean;
  setShowModelAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  resetCurrentMission: () => void;
  setSelectedRule: (rule: WritingCorrection | null) => void;
  handleBackToMissions: () => void;
  currentMissionIndex: number;
  moveMission: (offset: number) => void;
}

export const EvaluationView = ({
  evaluationResult,
  currentMission,
  showModelAnswer,
  setShowModelAnswer,
  resetCurrentMission,
  setSelectedRule,
  handleBackToMissions,
  currentMissionIndex,
  moveMission,
}: EvaluationViewProps) => (
  <>
    <WritingEvaluationResults
      evaluationResult={evaluationResult}
      currentMission={currentMission}
      resetCurrentMission={resetCurrentMission}
      setSelectedRule={setSelectedRule}
      handleBackToMissions={handleBackToMissions}
      currentMissionIndex={currentMissionIndex}
      visibleMissions={[]}
      moveMission={moveMission}
    />
    <SectionCard
      title="Model Answer"
      subtitle="Reference structure for this mission"
      icon={FileText}
      headerActions={
        <Button
          variant="outline"
          onClick={() => setShowModelAnswer((s) => !s)}
          className="text-xs h-8 rounded-[4px] cursor-pointer"
        >
          {showModelAnswer ? 'Hide Model Answer' : 'Show Model Answer'}
        </Button>
      }
    >
      {showModelAnswer && currentMission.expectedStructure ? (
        <div className="space-y-2">
          {currentMission.expectedStructure.map((point, i) => (
            <div
              key={i}
              className="rounded-[4px] border border-border-soft bg-[#f3f3fd] p-3 text-sm text-foreground shadow-sm font-normal"
            >
              {point}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-copy font-medium italic">
          Toggle above to reveal the model answer.
        </p>
      )}
    </SectionCard>
  </>
);
