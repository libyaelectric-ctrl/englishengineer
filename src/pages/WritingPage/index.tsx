import { EmptySkillPage } from '@/shared/components/EmptySkillPage';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { PersonalAIPanel } from '@/features/ai/PersonalAIPanel';
import { useAuthStore } from '@/features/auth';
import { type CefrLevel, type ContentLevelFilter } from '@/features/level-system';
import { type WritingCorrection, type WritingEvaluationResult } from '@/features/writing';

import { MissionListTab } from './components/MissionListTab';
import { WorkspaceTab } from './components/WorkspaceTab';
import { useWritingPage } from './hooks/useWritingPage';

const WritingMainContent = ({
  showStatsBar,
  levelFilter,
  currentLevel,
  setLevelFilter,
  finishedCount,
  writingHistory,
  visibleMissions,
  completedMissions,
  resetAllWritingProgress,
  handleLaunchMission,
  activeTab,
  currentMission,
  draft,
  setDraft,
  timeSpentSeconds,
  evaluationResult,
  selectedMissionId,
  selectedRule,
  setSelectedRule,
  userErrors,
  showModelAnswer,
  setShowModelAnswer,
  activeCorrections,
  getReadabilityScore,
  handleApplyFix,
  handleAutoFixAll,
  handleSubmit,
  resetCurrentMission,
  handleBackToMissions,
  moveMission,
  currentMissionIndex,
}: {
  showStatsBar: boolean;
  levelFilter: ContentLevelFilter;
  currentLevel: CefrLevel;
  setLevelFilter: (v: ContentLevelFilter) => void;
  finishedCount: number;
  writingHistory: Array<{ date: string; wordCount: number; score: number }>;
  visibleMissions: Array<{
    id: string;
    title: string;
    description: string;
    cefrLevel: CefrLevel;
    difficulty: string;
    estimatedMinutes: number;
    discipline: string;
  }>;
  completedMissions: Record<string, number>;
  resetAllWritingProgress: () => void;
  handleLaunchMission: (id: string) => void;
  activeTab: string;
  currentMission: {
    id: string;
    title: string;
    description: string;
    cefrLevel: CefrLevel;
    discipline: string;
    corrections: WritingCorrection[];
    scenario?: string;
    task?: string;
    expectedStructure?: string[];
    sampleExcellentAnswer?: string;
  };
  draft: string;
  setDraft: (v: string) => void;
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
  moveMission: (dir: number) => void;
  currentMissionIndex: number;
}) => (
  <>
    {showStatsBar && (
      <MissionListTab
        levelFilter={levelFilter}
        currentLevel={currentLevel}
        setLevelFilter={setLevelFilter}
        finishedCount={finishedCount}
        writingHistory={writingHistory}
        visibleMissions={visibleMissions}
        completedMissions={completedMissions}
        resetAllWritingProgress={resetAllWritingProgress}
        handleLaunchMission={handleLaunchMission}
      />
    )}

    {activeTab === 'workspace' && (
      <WorkspaceTab
        currentMission={currentMission}
        draft={draft}
        setDraft={setDraft}
        timeSpentSeconds={timeSpentSeconds}
        evaluationResult={evaluationResult}
        selectedMissionId={selectedMissionId}
        selectedRule={selectedRule}
        setSelectedRule={setSelectedRule}
        userErrors={userErrors}
        showModelAnswer={showModelAnswer}
        setShowModelAnswer={setShowModelAnswer}
        activeCorrections={activeCorrections}
        getReadabilityScore={getReadabilityScore}
        handleApplyFix={handleApplyFix}
        handleAutoFixAll={handleAutoFixAll}
        handleSubmit={handleSubmit}
        resetCurrentMission={resetCurrentMission}
        handleBackToMissions={handleBackToMissions}
        moveMission={moveMission}
        currentMissionIndex={currentMissionIndex}
        visibleMissionsLength={visibleMissions.length}
      />
    )}
  </>
);

const WritingPage = () => {
  const {
    selectedMissionId,
    draft,
    setDraft,
    timeSpentSeconds,
    evaluationResult,
    completedMissions,
    activeTab,
    selectedRule,
    setSelectedRule,
    userErrors,
    showModelAnswer,
    setShowModelAnswer,
    levelFilter,
    setLevelFilter,
    writingHistory,
    currentLevel,
    visibleMissions,
    currentMission,
    currentMissionIndex,
    finishedCount,
    activeCorrections,
    getReadabilityScore,
    handleApplyFix,
    handleAutoFixAll,
    handleLaunchMission,
    handleSubmit,
    handleBackToMissions,
    moveMission,
    resetCurrentMission,
    resetAllWritingProgress,
  } = useWritingPage();

  const currentUser = useAuthStore((s) => s.currentUser);
  const userDiscipline = (currentUser?.engineeringDiscipline as EngineeringDiscipline) ?? null;

  if (!currentMission) {
    return (
      <EmptySkillPage
        title="Writing"
        skill="Writing"
        levelFilter={levelFilter}
        currentLevel={currentLevel}
        setLevelFilter={setLevelFilter}
      />
    );
  }

  const showStatsBar = activeTab === 'missions';

  return (
    <PageContainer>
      <PageHeader
        title="Writing"
        badgeText={currentLevel}
        description="Technical report drafting, RFI & NCR writing assistant."
      />

      {showStatsBar && <PersonalAIPanel discipline={userDiscipline} cefrLevel={currentLevel} />}

      <WritingMainContent
        showStatsBar={showStatsBar}
        levelFilter={levelFilter}
        currentLevel={currentLevel}
        setLevelFilter={setLevelFilter}
        finishedCount={finishedCount}
        writingHistory={writingHistory}
        visibleMissions={visibleMissions}
        completedMissions={completedMissions}
        resetAllWritingProgress={resetAllWritingProgress}
        handleLaunchMission={handleLaunchMission}
        activeTab={activeTab}
        currentMission={currentMission!}
        draft={draft}
        setDraft={setDraft}
        timeSpentSeconds={timeSpentSeconds}
        evaluationResult={evaluationResult}
        selectedMissionId={selectedMissionId!}
        selectedRule={selectedRule}
        setSelectedRule={setSelectedRule}
        userErrors={userErrors}
        showModelAnswer={showModelAnswer}
        setShowModelAnswer={setShowModelAnswer}
        activeCorrections={activeCorrections}
        getReadabilityScore={getReadabilityScore}
        handleApplyFix={handleApplyFix}
        handleAutoFixAll={handleAutoFixAll}
        handleSubmit={handleSubmit}
        resetCurrentMission={resetCurrentMission}
        handleBackToMissions={handleBackToMissions}
        moveMission={moveMission}
        currentMissionIndex={currentMissionIndex}
      />
    </PageContainer>
  );
};

export default WritingPage;
