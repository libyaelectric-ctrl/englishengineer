import { BookOpen, FileText, GraduationCap } from 'lucide-react';

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/Button';
import { MetricCard } from '@/shared/components/MetricCard';
import { PageContainer } from '@/shared/components/PageContainer';
import { SkillLockedState } from '@/shared/components/SkillLockedState';
import { GRAMMAR_THRESHOLD, VOCAB_THRESHOLD } from '@/shared/constants/progression-thresholds';
import { isProgressionBypassed } from '@/shared/utils/progression-lock.helpers';

import { useGrammarStore } from '@/features/grammar';
import {
  type CefrLevel,
  type ContentLevelFilter,
  EmptyLevelState,
  LevelContentFilter,
} from '@/features/level-system';
import type { VocabularyItem } from '@/features/reading';
import { useVocabularyStore } from '@/features/vocabulary/store/vocabulary.store';

import { ReadingMissionCard } from './ReadingMissionCard';
import { ReadingWorkspace } from './ReadingWorkspace';
import { ReaderView } from './components/ReaderView';
import { useReadingPage } from './hooks/useReadingPage';

const EmptyMissionView = ({
  levelFilter,
  currentLevel,
  setLevelFilter,
}: {
  levelFilter: ContentLevelFilter;
  currentLevel: CefrLevel;
  setLevelFilter: Dispatch<SetStateAction<ContentLevelFilter>>;
}) => (
  <div className="min-h-screen bg-background pb-16 text-foreground space-y-4">
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <h1 className="text-base font-bold tracking-tight text-foreground">Reading</h1>
    </div>
    <LevelContentFilter value={levelFilter} currentLevel={currentLevel} onChange={setLevelFilter} />
    <EmptyLevelState skill="Reading" />
    <Link to="/curriculum" className="inline-flex text-sm font-bold text-primary hover:underline">
      Back to Learning Hub
    </Link>
  </div>
);

const MissionsTabContent = ({
  levelFilter,
  currentLevel,
  setLevelFilter,
  finishedCount,
  bestScoreAvg,
  visibleMissions,
  completedMissions,
  bookmarkedIds,
  toggleBookmark,
  handleLaunchMission,
  resetAllReadingProgress,
}: {
  levelFilter: ContentLevelFilter;
  currentLevel: CefrLevel;
  setLevelFilter: Dispatch<SetStateAction<ContentLevelFilter>>;
  finishedCount: number;
  bestScoreAvg: number;
  visibleMissions: ReturnType<typeof useReadingPage>['visibleMissions'];
  completedMissions: ReturnType<typeof useReadingPage>['completedMissions'];
  bookmarkedIds: Set<string>;
  toggleBookmark: (id: string) => void;
  handleLaunchMission: (missionId: string) => void;
  resetAllReadingProgress: () => void;
}) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        label="Current Level"
        value={currentLevel}
        icon={FileText}
        trend="Independent Reading level"
        trendDirection="neutral"
        statusColor="primary"
      />
      <MetricCard
        label="Avg Assessment Accuracy"
        value={finishedCount > 0 ? `${bestScoreAvg}%` : '0%'}
        icon={GraduationCap}
        trend={bestScoreAvg >= 85 ? 'Meets C1 Level' : 'Developing Level'}
        trendDirection="neutral"
        statusColor="emerald"
      />
      <MetricCard
        label="Completed Missions"
        value={`${finishedCount}/${visibleMissions.length}`}
        icon={BookOpen}
        trend="Current filter progress"
        trendDirection="neutral"
        statusColor="cyan"
      />
    </div>
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
  const vocabStats = useVocabularyStore((s) => s.stats);
  const grammarStats = useGrammarStore((s) => s.stats);
  const vocabLearned = vocabStats.learned + vocabStats.mastered;
  const grammarLearned = grammarStats.learned + grammarStats.mastered;

  const [bypassUnlocked, setBypassUnlocked] = useState(() => isProgressionBypassed());
  const [previewMode, setPreviewMode] = useState(false);

  const canAccess =
    bypassUnlocked ||
    previewMode ||
    (vocabLearned >= VOCAB_THRESHOLD && grammarLearned >= GRAMMAR_THRESHOLD);

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
    finishedCount,
    bestScoreAvg,

    handleLaunchMission,
    handleSubmit,
    handleBackToMissions,
    moveMission,
  } = useReadingPage();

  if (!canAccess) {
    return (
      <SkillLockedState
        skillName="Reading"
        prerequisites={[
          { label: 'Vocabulary', done: vocabLearned, threshold: VOCAB_THRESHOLD },
          { label: 'Grammar', done: grammarLearned, threshold: GRAMMAR_THRESHOLD },
        ]}
        navigationLinks={[
          { label: 'Vocabulary', route: '/vocabulary' },
          { label: 'Grammar', route: '/grammar' },
        ]}
        onPreview={() => setPreviewMode(true)}
        onUnlocked={() => setBypassUnlocked(true)}
      />
    );
  }

  if (!currentMission) {
    return (
      <EmptyMissionView
        levelFilter={levelFilter}
        currentLevel={currentLevel}
        setLevelFilter={setLevelFilter}
      />
    );
  }

  return (
    <PageContainer>
      <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/95 backdrop-blur-xl mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight text-foreground">Reading</h1>
          <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {currentLevel}
          </span>
          <p className="hidden text-[11px] font-medium text-muted-copy leading-tight sm:block">
            Engineering documentation & technical reading comprehension.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy rounded-[4px] border border-border-soft bg-surface px-2.5 py-1">
            {finishedCount}/{missions.length} Completed
          </span>
        </div>
      </div>

      {activeTab === 'missions' && (
        <MissionsTabContent
          levelFilter={levelFilter}
          currentLevel={currentLevel}
          setLevelFilter={setLevelFilter}
          finishedCount={finishedCount}
          bestScoreAvg={bestScoreAvg}
          visibleMissions={visibleMissions}
          completedMissions={completedMissions}
          bookmarkedIds={bookmarkedIds}
          toggleBookmark={toggleBookmark}
          handleLaunchMission={handleLaunchMission}
          resetAllReadingProgress={resetAllReadingProgress}
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
