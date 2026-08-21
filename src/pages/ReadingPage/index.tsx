import type { Dispatch, SetStateAction } from 'react';

import { Button } from '@/shared/components/Button';
import { EmptySkillPage } from '@/shared/components/EmptySkillPage';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { PersonalAIPanel } from '@/features/ai/PersonalAIPanel';
import { useAuthStore } from '@/features/auth';
import {
  type CefrLevel,
  type ContentLevelFilter,
  LevelContentFilter,
} from '@/features/level-system';
import type { VocabularyItem } from '@/features/reading';

import { ReadingMissionCard } from './ReadingMissionCard';
import { ReadingWorkspace } from './ReadingWorkspace';
import { ReaderView } from './components/ReaderView';
import { useReadingPage } from './hooks/useReadingPage';

const MissionsTabContent = ({
  levelFilter,
  currentLevel,
  setLevelFilter,
  finishedCount,
  visibleMissions,
  completedMissions,
  bookmarkedIds,
  toggleBookmark,
  handleLaunchMission,
  resetAllReadingProgress,
  discipline,
}: {
  levelFilter: ContentLevelFilter;
  currentLevel: CefrLevel;
  setLevelFilter: Dispatch<SetStateAction<ContentLevelFilter>>;
  finishedCount: number;
  visibleMissions: ReturnType<typeof useReadingPage>['visibleMissions'];
  completedMissions: ReturnType<typeof useReadingPage>['completedMissions'];
  bookmarkedIds: Set<string>;
  toggleBookmark: (id: string) => void;
  handleLaunchMission: (missionId: string) => void;
  resetAllReadingProgress: () => void;
  discipline: EngineeringDiscipline | null;
}) => (
  <>
    <PersonalAIPanel discipline={discipline} cefrLevel={currentLevel} userName={undefined} />
    <div className="space-y-6">
      <LevelContentFilter
        value={levelFilter}
        currentLevel={currentLevel}
        onChange={setLevelFilter}
      />
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground tracking-tight">
            Technical Mission Library
          </h3>
          <p className="text-xs text-muted-copy mt-0.5">
            Select a professional documentation scenario to begin reading comprehension assessment
          </p>
        </div>
        {finishedCount > 0 && (
          <Button
            variant="outline"
            onClick={resetAllReadingProgress}
            className="text-xs h-9 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 rounded-[4px] cursor-pointer"
          >
            Reset Progress
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleMissions.map((m) => (
          <ReadingMissionCard
            key={m.id}
            mission={m}
            isCompleted={completedMissions[m.id] !== undefined}
            bestScore={completedMissions[m.id]}
            currentLevel={currentLevel}
            isBookmarked={bookmarkedIds.has(m.id)}
            onToggleBookmark={toggleBookmark}
            onLaunch={handleLaunchMission}
          />
        ))}
        {visibleMissions.length === 0 && (
          <div className="col-span-full rounded-[4px] border border-border-soft bg-surface/60 p-6 text-sm text-muted-copy">
            No current-level content yet. No Reading missions are available for this filter.
          </div>
        )}
      </div>
    </div>
  </>
);

const WorkspaceTabContent = ({
  currentMission,
  currentMissionIndex,
  visibleMissions,
  answers,
  clickedVocab,
  timeSpentSeconds,
  evaluationResult,
  selectedWord,
  userErrors,
  setSelectedWord,
  setAnswer,
  addClickedVocab,
  handleSubmit,
  resetCurrentMission,
  handleBackToMissions,
  moveMission,
}: {
  currentMission: ReturnType<typeof useReadingPage>['currentMission'];
  currentMissionIndex: number;
  visibleMissions: ReturnType<typeof useReadingPage>['visibleMissions'];
  answers: ReturnType<typeof useReadingPage>['answers'];
  clickedVocab: ReturnType<typeof useReadingPage>['clickedVocab'];
  timeSpentSeconds: number;
  evaluationResult: ReturnType<typeof useReadingPage>['evaluationResult'];
  selectedWord: VocabularyItem | null;
  userErrors: ReturnType<typeof useReadingPage>['userErrors'];
  setSelectedWord: Dispatch<SetStateAction<VocabularyItem | null>>;
  setAnswer: ReturnType<typeof useReadingPage>['setAnswer'];
  addClickedVocab: (w: string) => void;
  handleSubmit: () => void;
  resetCurrentMission: () => void;
  handleBackToMissions: () => void;
  moveMission: (dir: number) => void;
}) => {
  if (!currentMission) return null;
  return (
    <>
      <ReaderView
        title={currentMission.title}
        content={currentMission.passageText}
        onWordClick={(word) => addClickedVocab(word)}
      />
      <ReadingWorkspace
        currentMission={currentMission}
        currentMissionIndex={currentMissionIndex}
        visibleMissions={visibleMissions}
        answers={answers}
        clickedVocab={clickedVocab}
        timeSpentSeconds={timeSpentSeconds}
        evaluationResult={evaluationResult}
        selectedWord={selectedWord}
        userErrors={userErrors}
        setSelectedWord={setSelectedWord}
        setAnswer={setAnswer}
        addClickedVocab={addClickedVocab}
        handleSubmit={handleSubmit}
        resetCurrentMission={resetCurrentMission}
        handleBackToMissions={handleBackToMissions}
        moveMission={moveMission}
      />
    </>
  );
};

const ReadingPage = () => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const userDiscipline = (currentUser?.engineeringDiscipline as EngineeringDiscipline) ?? null;

  const {
    missions,
    answers,
    clickedVocab,
    timeSpentSeconds,
    evaluationResult,
    completedMissions,
    setAnswer,
    addClickedVocab,
    resetCurrentMission,
    resetAllReadingProgress,

    activeTab,
    selectedWord,
    setSelectedWord,
    userErrors,
    levelFilter,
    setLevelFilter,
    bookmarkedIds,
    toggleBookmark,

    currentLevel,
    visibleMissions,
    currentMission,
    currentMissionIndex,
    aiMissionLoading,
    finishedCount,

    handleLaunchMission,
    handleSubmit,
    handleBackToMissions,
    moveMission,
  } = useReadingPage();

  if (!currentMission) {
    return (
      <EmptySkillPage
        title="Reading"
        description="Engineering documentation & technical reading comprehension."
        skill="Reading"
        levelFilter={levelFilter}
        currentLevel={currentLevel}
        setLevelFilter={setLevelFilter}
      />
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Reading"
        description="Engineering documentation & technical reading comprehension."
        badgeText={currentLevel}
        actions={
          <>
            {aiMissionLoading && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                AI lesson loading...
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy rounded-[4px] border border-border-soft bg-surface px-2.5 py-1">
              {finishedCount}/{missions.length} Completed
            </span>
          </>
        }
      />

      {activeTab === 'missions' && (
        <MissionsTabContent
          levelFilter={levelFilter}
          currentLevel={currentLevel}
          setLevelFilter={setLevelFilter}
          finishedCount={finishedCount}
          visibleMissions={visibleMissions}
          completedMissions={completedMissions}
          bookmarkedIds={bookmarkedIds}
          toggleBookmark={toggleBookmark}
          handleLaunchMission={handleLaunchMission}
          resetAllReadingProgress={resetAllReadingProgress}
          discipline={userDiscipline}
        />
      )}

      {activeTab === 'workspace' && (
        <WorkspaceTabContent
          currentMission={currentMission}
          currentMissionIndex={currentMissionIndex}
          visibleMissions={visibleMissions}
          answers={answers}
          clickedVocab={clickedVocab}
          timeSpentSeconds={timeSpentSeconds}
          evaluationResult={evaluationResult}
          selectedWord={selectedWord}
          userErrors={userErrors}
          setSelectedWord={setSelectedWord}
          setAnswer={setAnswer}
          addClickedVocab={addClickedVocab}
          handleSubmit={handleSubmit}
          resetCurrentMission={resetCurrentMission}
          handleBackToMissions={handleBackToMissions}
          moveMission={moveMission}
        />
      )}
    </PageContainer>
  );
};

export default ReadingPage;
