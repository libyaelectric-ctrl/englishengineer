import { Link } from 'react-router-dom';
import { BookOpen, FileText, GraduationCap } from 'lucide-react';

import { MetricCard } from '@/shared/components/MetricCard';
import { Button } from '@/shared/components/Button';
import { EmptyLevelState, LevelContentFilter } from '@/features/level-system';
import { useReadingPage } from './ReadingPage/hooks/useReadingPage';
import { ReadingMissionCard } from './ReadingPage/ReadingMissionCard';
import { ReadingWorkspace } from './ReadingPage/ReadingWorkspace';
import { ReaderView } from './ReadingPage/components/ReaderView';

const ReadingPage = () => {
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

  if (!currentMission) {
    return (
      <div className="min-h-screen bg-background pb-16 text-foreground space-y-4">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Reading
          </h1>
        </div>
        <LevelContentFilter
          value={levelFilter}
          currentLevel={currentLevel}
          onChange={setLevelFilter}
        />
        <EmptyLevelState skill="Reading" />
        <Link
          to="/curriculum"
          className="inline-flex text-sm font-bold text-[#0047bb] hover:underline"
        >
          Back to Learning Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground space-y-6 animate-in fade-in duration-300">
      {/* Reading sticky header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Reading
          </h1>
          <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
            ENG-R{currentLevel.replace(/[^0-9]/g, '') || currentLevel}
          </span>
        </div>
        <div className="hidden text-[11px] font-medium text-muted-copy lg:block">
          {finishedCount}/{missions.length} completed
        </div>
      </div>

      {/* Top statistics panel */}
      {activeTab === 'missions' && (
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
      )}

      {/* 1. MISSIONS TAB VIEW */}
      {activeTab === 'missions' && (
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
                Select a professional documentation scenario to begin reading
                comprehension assessment
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
                No current-level content yet. No Reading missions are available
                for this filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ACTIVE ASSESSMENT WORKSPACE TAB VIEW */}
      {activeTab === 'workspace' && currentMission && (
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
      )}
    </div>
  );
};

export default ReadingPage;
