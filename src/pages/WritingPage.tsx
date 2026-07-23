import { Link } from 'react-router-dom';
import { FileText, FileCheck, Layers, Lock } from 'lucide-react';

import { MetricCard } from '@/shared/components/MetricCard';
import { LevelContentFilter, EmptyLevelState } from '@/features/level-system';
import { useWritingPage } from './WritingPage/hooks/useWritingPage';
import { MissionListTab } from './WritingPage/components/MissionListTab';
import { WorkspaceTab } from './WritingPage/components/WorkspaceTab';
import { useVocabularyStore } from '@/features/vocabulary/store/vocabulary.store';
import { useGrammarStore } from '@/features/grammar/store/grammar.store';

const VOCAB_THRESHOLD = 500;
const GRAMMAR_THRESHOLD = 50;

const WritingPage = () => {
  const vocabStats = useVocabularyStore((s) => s.stats);
  const grammarStats = useGrammarStore((s) => s.stats);
  const vocabLearned = vocabStats.learned + vocabStats.mastered;
  const grammarLearned = grammarStats.learned + grammarStats.mastered;
  const canAccess =
    vocabLearned >= VOCAB_THRESHOLD && grammarLearned >= GRAMMAR_THRESHOLD;

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[4px] border-2 border-[#0047bb] bg-surface p-8 text-center space-y-4">
          <Lock className="mx-auto h-10 w-10 text-[#0047bb]" />
          <h2 className="text-lg font-bold text-foreground">Writing Locked</h2>
          <p className="text-xs text-muted-copy leading-relaxed">
            You need to learn 500 vocabulary words and 50 grammar rules before
            accessing Writing.
          </p>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between text-muted-copy">
              <span>Vocabulary</span>
              <span className="font-bold text-foreground">
                {vocabLearned}/500
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
              <div
                className="h-full bg-[#0047bb] transition-all"
                style={{
                  width: `${Math.min((vocabLearned / VOCAB_THRESHOLD) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-muted-copy">
              <span>Grammar</span>
              <span className="font-bold text-foreground">
                {grammarLearned}/50
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
              <div
                className="h-full bg-[#0047bb] transition-all"
                style={{
                  width: `${Math.min((grammarLearned / GRAMMAR_THRESHOLD) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <Link
              to="/vocabulary"
              className="rounded-[4px] border-2 border-[#0047bb] px-4 py-2 text-[10px] font-bold uppercase text-foreground transition hover:bg-surface-hover"
            >
              Go to Vocabulary
            </Link>
            <Link
              to="/grammar"
              className="rounded-[4px] border-2 border-[#0047bb] px-4 py-2 text-[10px] font-bold uppercase text-foreground transition hover:bg-surface-hover"
            >
              Go to Grammar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    missions,
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
    bestScoreAvg,
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

  if (!currentMission) {
    return (
      <div className="min-h-screen bg-background pb-16 text-foreground space-y-4">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Writing
          </h1>
        </div>
        <LevelContentFilter
          value={levelFilter}
          currentLevel={currentLevel}
          onChange={setLevelFilter}
        />
        <EmptyLevelState skill="Writing" />
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
    <div className="mx-auto max-w-5xl space-y-6 min-h-screen bg-background pb-16 text-foreground animate-in fade-in duration-300">
      {/* Writing sticky header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Writing
          </h1>
          <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
            ENG-W{currentLevel.replace(/[^0-9]/g, '') || currentLevel}
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
            label="Drafting Practice"
            value={`${finishedCount}/${missions.length}`}
            icon={FileText}
            trend="Local mission progress"
            trendDirection="up"
            statusColor="primary"
          />
          <MetricCard
            label="Avg Assessment Accuracy"
            value={finishedCount > 0 ? `${bestScoreAvg}%` : '0%'}
            icon={FileCheck}
            trend={bestScoreAvg >= 85 ? 'Meets C1 Level' : 'Developing Level'}
            trendDirection="neutral"
            statusColor="emerald"
          />
          <MetricCard
            label="Writing Mode"
            value="Local"
            icon={Layers}
            trend="No external AI required"
            trendDirection="neutral"
            statusColor="cyan"
          />
        </div>
      )}

      {/* 1. MISSIONS TAB VIEW */}
      {activeTab === 'missions' && (
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

      {/* 2. ACTIVE ASSESSMENT WORKSPACE TAB VIEW */}
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
    </div>
  );
};

export default WritingPage;
