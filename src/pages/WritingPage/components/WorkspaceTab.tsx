import {
  type WritingCorrection,
  type WritingEvaluationResult,
} from '@/features/writing';
import { WorkspaceHeader } from './WorkspaceHeader';
import { DraftEditor } from './DraftEditor';
import { StyleGuidelines } from './StyleGuidelines';
import { CorrectionCheckpoint } from './CorrectionCheckpoint';
import { DraftQualityIndicators } from './DraftQualityIndicators';
import { EvaluationView } from './EvaluationView';

interface Mission {
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
}

interface WorkspaceTabProps {
  currentMission: Mission;
  draft: string;
  setDraft: (draft: string) => void;
  timeSpentSeconds: number;
  evaluationResult: WritingEvaluationResult | null;
  selectedMissionId: string;
  selectedRule: WritingCorrection | null;
  setSelectedRule: (rule: WritingCorrection | null) => void;
  userErrors: Record<string, string>;
  showModelAnswer: boolean;
  setShowModelAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  activeCorrections: WritingCorrection[];
  getReadabilityScore: () => number;
  handleApplyFix: (original: string, fix: string) => void;
  handleAutoFixAll: () => void;
  handleSubmit: () => void;
  resetCurrentMission: () => void;
  handleBackToMissions: () => void;
  moveMission: (offset: number) => void;
  currentMissionIndex: number;
  visibleMissionsLength: number;
}

const getTechnicalDensity = (id: string) =>
  id === 'writing_cache_draft' ? 68 : id === 'writing_rfc_migration' ? 84 : 95;

export const WorkspaceTab = ({
  currentMission, draft, setDraft, timeSpentSeconds, evaluationResult,
  selectedMissionId, selectedRule, setSelectedRule, userErrors,
  showModelAnswer, setShowModelAnswer, activeCorrections,
  getReadabilityScore, handleApplyFix, handleAutoFixAll,
  handleSubmit, resetCurrentMission, handleBackToMissions, moveMission,
  currentMissionIndex, visibleMissionsLength,
}: WorkspaceTabProps) => (
  <div className="space-y-6">
    <WorkspaceHeader
      cefrLevel={currentMission.cefrLevel}
      timeSpentSeconds={timeSpentSeconds}
      currentMissionIndex={currentMissionIndex}
      visibleMissionsLength={visibleMissionsLength}
      onBack={handleBackToMissions}
      onMove={moveMission}
    />

    {!evaluationResult ? (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <DraftEditor
            title={currentMission.title}
            description={currentMission.description}
            discipline={currentMission.discipline}
            scenario={currentMission.scenario}
            task={currentMission.task}
            expectedStructure={currentMission.expectedStructure}
            draft={draft}
            onDraftChange={setDraft}
            getReadabilityScore={getReadabilityScore}
            userErrors={userErrors}
          />
          <StyleGuidelines
            corrections={currentMission.corrections}
            activeCorrections={activeCorrections}
            selectedRule={selectedRule}
            onSelectRule={setSelectedRule}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <CorrectionCheckpoint
            activeCorrections={activeCorrections}
            onSelectRule={setSelectedRule}
            onApplyFix={handleApplyFix}
            onAutoFixAll={handleAutoFixAll}
            onReset={resetCurrentMission}
            onSubmit={handleSubmit}
          />
          <DraftQualityIndicators
            getReadabilityScore={getReadabilityScore}
            technicalDensity={getTechnicalDensity(selectedMissionId)}
          />
        </div>
      </div>
    ) : (
      <EvaluationView
        evaluationResult={evaluationResult}
        currentMission={currentMission}
        showModelAnswer={showModelAnswer}
        setShowModelAnswer={setShowModelAnswer}
        resetCurrentMission={resetCurrentMission}
        setSelectedRule={setSelectedRule}
        handleBackToMissions={handleBackToMissions}
        currentMissionIndex={currentMissionIndex}
        moveMission={moveMission}
      />
    )}
  </div>
);
