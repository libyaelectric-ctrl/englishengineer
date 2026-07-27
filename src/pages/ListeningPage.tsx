import {
  EmptyLevelState,
  LevelContentFilter,
} from '@/features/level-system';
import { SkillLockedState } from '@/shared/components/SkillLockedState';
import { MissionListTab } from './ListeningPage/components/MissionListTab';
import { WorkspaceView } from './ListeningPage/components/WorkspaceView';
import {
  READING_THRESHOLD,
  WRITING_THRESHOLD,
  useListeningPage,
} from './ListeningPage/hooks/useListeningPage';

const ListeningPage = () => {
  const {
    readingDone,
    writingDone,
    canAccess,
    answers,
    summary,
    userKeywords,
    evaluationResult,
    selectMission,
    setAnswer,
    setSummary,
    setUserKeywords,
    submitCurrentMission,
    resetCurrentMission,
    currentLevel,
    levelFilter,
    setLevelFilter,
    visibleMissions,
    workspaceOpen,
    setWorkspaceOpen,
    categoryFilter,
    setCategoryFilter,
    filteredMissions,
    currentMission,
  } = useListeningPage();

  if (!canAccess) {
    return (
      <SkillLockedState
        skillName="Listening"
        readingDone={readingDone}
        writingDone={writingDone}
        readingThreshold={READING_THRESHOLD}
        writingThreshold={WRITING_THRESHOLD}
      />
    );
  }

  if (!currentMission) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 min-h-screen bg-background pb-16 text-foreground animate-in fade-in duration-300">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Listening
          </h1>
        </div>
        <div className="space-y-6 pt-4">
          <LevelContentFilter
            value={levelFilter}
            currentLevel={currentLevel}
            onChange={setLevelFilter}
          />
          <EmptyLevelState skill="listening" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground space-y-6 animate-in fade-in duration-300">
      {/* Sticky header — clean, rigid */}
      <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/95 backdrop-blur-xl mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Listening
          </h1>
          <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {currentLevel}
          </span>
          <p className="hidden text-[11px] font-medium text-muted-copy leading-tight sm:block">
            Engineering site audio, technical meeting transcripts & listening
            comprehension.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy rounded-[4px] border border-border-soft bg-surface px-2.5 py-1">
            Mission{' '}
            {visibleMissions.findIndex((m) => m.id === currentMission.id) + 1}/
            {visibleMissions.length}
          </span>
        </div>
      </div>
      <div className="space-y-6 pt-4">
        <LevelContentFilter
          value={levelFilter}
          currentLevel={currentLevel}
          onChange={setLevelFilter}
        />

        {!workspaceOpen ? (
          <MissionListTab
            currentLevel={currentLevel}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            filteredMissions={filteredMissions}
            selectMission={selectMission}
            setWorkspaceOpen={setWorkspaceOpen}
          />
        ) : (
          <WorkspaceView
            currentMission={currentMission}
            onBack={() => setWorkspaceOpen(false)}
            answers={answers}
            setAnswer={setAnswer}
            summary={summary}
            setSummary={setSummary}
            userKeywords={userKeywords}
            setUserKeywords={setUserKeywords}
            submitCurrentMission={submitCurrentMission}
            resetCurrentMission={resetCurrentMission}
            evaluationResult={evaluationResult}
          />
        )}
      </div>
    </div>
  );
};

export default ListeningPage;
