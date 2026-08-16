import { FileCheck, FileText, Layers, ShieldCheck } from 'lucide-react';

import { useState } from 'react';

import { Link } from 'react-router-dom';

import { MetricCard } from '@/shared/components/MetricCard';
import { PageContainer } from '@/shared/components/PageContainer';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { PersonalAIPanel } from '@/features/ai/PersonalAIPanel';
import { useAuthStore } from '@/features/auth';
import {
  type CefrLevel,
  type ContentLevelFilter,
  EmptyLevelState,
  LevelContentFilter,
} from '@/features/level-system';
import { type WritingCorrection, type WritingEvaluationResult } from '@/features/writing';
import { FieldDocAssistant } from '@/features/writing/FieldDocAssistant';

import { MissionListTab } from './components/MissionListTab';
import { WorkspaceTab } from './components/WorkspaceTab';
import { useWritingPage } from './hooks/useWritingPage';

const EmptyMissionView = ({
  levelFilter,
  currentLevel,
  setLevelFilter,
}: {
  levelFilter: ContentLevelFilter;
  currentLevel: CefrLevel;
  setLevelFilter: (v: ContentLevelFilter) => void;
}) => (
  <div className="min-h-screen bg-background pb-16 text-foreground space-y-4">
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <h1 className="text-base font-bold tracking-tight text-foreground">Writing</h1>
    </div>
    <LevelContentFilter value={levelFilter} currentLevel={currentLevel} onChange={setLevelFilter} />
    <EmptyLevelState skill="Writing" />
    <Link to="/curriculum" className="inline-flex text-sm font-bold text-primary hover:underline">
      Back to Learning Hub
    </Link>
  </div>
);

const SubTabSwitcher = ({
  subTab,
  setSubTab,
}: {
  subTab: 'missions' | 'field-docs';
  setSubTab: (v: 'missions' | 'field-docs') => void;
}) => {
  const tabs = [
    { key: 'missions' as const, label: 'Practice Missions', icon: null },
    {
      key: 'field-docs' as const,
      label: 'Field Docs (RFI / NCR / EOT)',
      icon: ShieldCheck,
    },
  ];

  return (
    <div
      className="flex items-center gap-1.5 rounded-[var(--radius-card)] border border-border-soft bg-surface/90 p-1 shadow-sm"
      role="tablist"
      aria-label="Writing mode"
    >
      {tabs.map((tab) => {
        const isActive = subTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-card)] text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-copy hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const WritingHeader = ({
  currentLevel,
  activeTab,
  subTab,
  setSubTab,
}: {
  currentLevel: string;
  activeTab: string;
  subTab: 'missions' | 'field-docs';
  setSubTab: (v: 'missions' | 'field-docs') => void;
}) => (
  <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/95 backdrop-blur-xl mb-6">
    <div className="flex items-center gap-3">
      <h1 className="text-base font-bold tracking-tight text-foreground">Writing</h1>
      <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
        {currentLevel}
      </span>
      <p className="hidden text-[11px] font-medium text-muted-copy leading-tight sm:block">
        Technical report drafting, RFI & NCR writing assistant.
      </p>
    </div>

    {activeTab === 'missions' && <SubTabSwitcher subTab={subTab} setSubTab={setSubTab} />}
  </div>
);

const StatsBar = ({
  finishedCount,
  missionsLength,
  bestScoreAvg,
}: {
  finishedCount: number;
  missionsLength: number;
  bestScoreAvg: number;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <MetricCard
      label="Drafting Practice"
      value={`${finishedCount}/${missionsLength}`}
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
);

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
  subTab,
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
  subTab: 'missions' | 'field-docs';
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

    {activeTab === 'missions' && subTab === 'field-docs' && <FieldDocAssistant />}

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
  const [subTab, setSubTab] = useState<'missions' | 'field-docs'>('missions');

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

  const currentUser = useAuthStore((s) => s.currentUser);
  const userDiscipline = (currentUser?.engineeringDiscipline as EngineeringDiscipline) ?? null;

  if (!currentMission) {
    return (
      <EmptyMissionView
        levelFilter={levelFilter}
        currentLevel={currentLevel}
        setLevelFilter={setLevelFilter}
      />
    );
  }

  const showStatsBar = activeTab === 'missions' && subTab === 'missions';

  return (
    <PageContainer>
      <WritingHeader
        currentLevel={currentLevel}
        activeTab={activeTab}
        subTab={subTab}
        setSubTab={setSubTab}
      />

      {showStatsBar && (
        <>
          <PersonalAIPanel discipline={userDiscipline} cefrLevel={currentLevel} />
          <StatsBar
            finishedCount={finishedCount}
            missionsLength={missions.length}
            bestScoreAvg={bestScoreAvg}
          />
        </>
      )}

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
        subTab={subTab}
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


