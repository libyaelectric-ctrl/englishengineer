import { Link } from 'react-router-dom';
import {
  FileText,
  FileCheck,
  Layers,
} from 'lucide-react';

import { MetricCard } from '@/shared/components/MetricCard';
import { LevelContentFilter, EmptyLevelState } from '@/features/level-system';
import { useWritingPage } from './WritingPage/hooks/useWritingPage';
import { MissionListTab } from './WritingPage/components/MissionListTab';
import { WorkspaceTab } from './WritingPage/components/WorkspaceTab';

const WritingPage = () => {
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
      <div className="space-y-4">
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Writing</h1>
      </div>
        <LevelContentFilter
          value={levelFilter}
          currentLevel={currentLevel}
          onChange={setLevelFilter}
        />
        <EmptyLevelState skill="Writing" />
        <Link
          to="/curriculum"
          className="inline-flex text-sm font-bold text-primary hover:underline"
        >
          Back to Learning Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Writing sticky header */}
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-foreground">Writing</h1>
            <span className="rounded-full border border-border-soft bg-background px-2 py-0.5 text-[10px] font-bold text-foreground">
              {currentLevel}
            </span>
          </div>
          <div className="hidden text-xs text-muted-copy lg:block">
            {finishedCount}/{missions.length} completed
          </div>
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