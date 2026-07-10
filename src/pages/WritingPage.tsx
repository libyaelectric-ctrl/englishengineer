import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  PenTool,
  Check,
  AlertTriangle,
  Sparkles,
  FileText,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowLeft,
  Clock,
  Award,
  Coins,
  TrendingUp,
  Info,
  X,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { MetricCard } from '@/shared/components/MetricCard';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { Button } from '@/shared/components/Button';
import {
  useWritingStore,
  WritingHelpers,
  WritingCorrection,
  WritingModelAnswer,
} from '@/features/writing';
import {
  ContentLevelFilter,
  DEFAULT_CONTENT_LEVEL_FILTER,
  EmptyLevelState,
  filterContentByLevel,
  getContentAccessLabel,
  LevelAccessBadge,
  LevelContentFilter,
  useSkillLevel,
} from '@/features/level-system';
import { SkillEntryBrief } from '@/features/learning-orchestrator';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';

const WritingPage = () => {
  // Read state and actions from the writing store
  const {
    missions,
    selectedMissionId,
    draft,
    timeSpentSeconds,
    evaluationResult,
    completedMissions,
    initializeStore,
    selectMission,
    setDraft,
    incrementAutoFixCount,
    incrementTimer,
    submitCurrentMission,
    resetCurrentMission,
    resetAllWritingProgress,
  } = useWritingStore();

  const [activeTab, setActiveTab] = useState<'missions' | 'workspace'>(
    'missions'
  );
  const [selectedRule, setSelectedRule] = useState<WritingCorrection | null>(
    null
  );
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});
  const [levelFilter, setLevelFilter] = useState<ContentLevelFilter>(
    DEFAULT_CONTENT_LEVEL_FILTER
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentLevel = useSkillLevel('writing').currentLevel;
  const visibleMissions = filterContentByLevel(
    missions,
    currentLevel,
    levelFilter
  );

  // Initialize writing store
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Start / stop timer based on active tab and state
  useEffect(() => {
    if (activeTab === 'workspace' && !evaluationResult) {
      timerRef.current = setInterval(() => {
        incrementTimer();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTab, evaluationResult, incrementTimer]);

  useEffect(() => {
    if (visibleMissions.length === 0) {
      setActiveTab('missions');
      return;
    }
    if (
      visibleMissions.length > 0 &&
      !visibleMissions.some((mission) => mission.id === selectedMissionId)
    ) {
      selectMission(visibleMissions[0].id);
    }
  }, [selectMission, selectedMissionId, visibleMissions]);

  const currentMission =
    visibleMissions.find((m) => m.id === selectedMissionId) ||
    visibleMissions[0];

  if (!currentMission) {
    return (
      <div className="space-y-6">
        <div className="sticky top-0 z-20 border-b border-border-soft bg-background py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">Writing</h1>
          </div>
        </div>
        <LevelContentFilter
          value={levelFilter}
          currentLevel={currentLevel}
          onChange={setLevelFilter}
        />
        <EmptyLevelState skill="Writing" />
        <Link
          to="/curriculum"
          className="inline-flex text-sm font-bold text-primary"
        >
          Back to Learning Hub
        </Link>
      </div>
    );
  }

  const currentMissionIndex = visibleMissions.findIndex(
    (mission) => mission.id === currentMission.id
  );
  const moveMission = (offset: number) => {
    const nextMission = visibleMissions[currentMissionIndex + offset];
    if (nextMission) {
      selectMission(nextMission.id);
      setSelectedRule(null);
      setUserErrors({});
      setActiveTab('workspace');
    }
  };

  // Helper to count total finished missions
  const finishedCount = Object.keys(completedMissions).length;
  const bestScoreAvg =
    finishedCount > 0
      ? Math.round(
          Object.values(completedMissions).reduce((a, b) => a + b, 0) /
            finishedCount
        )
      : 0;

  // Active Draft Analysis: count unresolved corrections
  const getActiveCorrections = () => {
    if (!currentMission) return [];
    return currentMission.corrections.filter((item) =>
      draft.includes(item.original)
    );
  };

  const activeCorrections = getActiveCorrections();

  const getReadabilityScore = () => {
    const wordCount = draft.split(/\s+/).filter(Boolean).length;
    if (wordCount === 0) return 0;

    let score = 55;
    if (draft.length > 50) score += 15;
    if (draft.length > 100) score += 15;

    // Penalize if errors still present
    score -= activeCorrections.length * 10;
    return Math.max(Math.min(score, 100), 10);
  };

  const handleApplyFix = (original: string, fix: string) => {
    setDraft(draft.replace(original, fix));
    incrementAutoFixCount();
  };

  const handleAutoFixAll = () => {
    let updatedDraft = draft;
    currentMission.corrections.forEach((item) => {
      if (updatedDraft.includes(item.original)) {
        updatedDraft = updatedDraft.replace(item.original, item.fix);
        incrementAutoFixCount();
      }
    });
    setDraft(updatedDraft);
  };

  const handleLaunchMission = (missionId: string) => {
    ProductAnalyticsService.track('writing_task_started', '/writing', {
      metadata: { skill: 'writing', missionId, source: 'user' },
    });
    ProductAnalyticsService.trackOnce('first_task_started', '/writing', {
      skill: 'writing',
      source: 'user',
    });
    selectMission(missionId);
    setSelectedRule(null);
    setUserErrors({});
    setActiveTab('workspace');
  };

  const handleSubmit = () => {
    // Check if draft is completely empty
    if (!draft.trim()) {
      setUserErrors({ draft: 'Draft cannot be empty' });
      return;
    }

    setUserErrors({});
    submitCurrentMission();
    ProductAnalyticsService.track('writing_task_completed', '/writing', {
      metadata: {
        skill: 'writing',
        missionId: currentMission.id,
        source: 'user',
      },
    });
    ProductAnalyticsService.trackOnce('first_task_completed', '/writing', {
      skill: 'writing',
      source: 'user',
    });
  };

  const handleBackToMissions = () => {
    setActiveTab('missions');
    setSelectedRule(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="sticky top-0 z-20 border-b border-border-soft bg-background py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">Writing</h1>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              A1
            </span>
          </div>
          <div className="hidden text-xs text-muted-copy lg:block">
            {finishedCount}/{missions.length} completed
          </div>
        </div>
      </div>

      <SkillEntryBrief skill="writing" />

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
        <div className="space-y-6">
          <LevelContentFilter
            value={levelFilter}
            currentLevel={currentLevel}
            onChange={setLevelFilter}
          />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">
                Technical Mission Library
              </h3>
              <p className="text-xs text-muted-copy mt-0.5 font-medium">
                Select a professional drafting scenario to begin technical
                revision assessment
              </p>
            </div>
            {finishedCount > 0 && (
              <Button
                variant="outline"
                onClick={resetAllWritingProgress}
                className="text-xs h-9 text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              >
                Reset Progress
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleMissions.map((m) => {
              const bestScore = completedMissions[m.id];
              const isCompleted = bestScore !== undefined;
              const difficultyColor = WritingHelpers.getDifficultyColor(
                m.difficulty
              );

              return (
                <div
                  key={m.id}
                  id={`writing-card-${m.id}`}
                  className={`group relative rounded-xl border bg-surface p-5 transition-all duration-200 hover:-translate-y-px hover:border-border-hover hover:bg-surface-hover/30 hover:shadow-sm ${
                    isCompleted ? 'border-emerald-500/20' : 'border-border-soft'
                  }`}
                >
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Top Badge Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border ${WritingHelpers.getCefrBadgeStyles(m.cefrLevel)}`}
                        >
                          {m.cefrLevel}
                        </span>
                        <LevelAccessBadge
                          label={getContentAccessLabel(
                            m.cefrLevel,
                            currentLevel
                          )}
                        />
                        <span
                          className={`text-[10px] font-black font-mono px-2 py-0.5 rounded uppercase ${
                            difficultyColor === 'rose'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : difficultyColor === 'amber'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {m.difficulty}
                        </span>
                        <span className="text-[10px] font-mono text-muted-copy ml-auto flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {m.estimatedMinutes}m
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <div>
                        <h4 className="text-base font-bold text-foreground group-hover:text-foreground transition-colors">
                          {m.title}
                        </h4>
                        <p className="text-xs text-muted-copy mt-1 line-clamp-2 leading-relaxed">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-border-soft">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold font-mono bg-surface-hover border border-border-soft text-muted-copy px-2 py-1 rounded">
                          {m.discipline}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Score: {bestScore}%</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold font-mono text-muted-copy uppercase">
                            Available
                          </span>
                        )}

                        <Button
                          onClick={() => handleLaunchMission(m.id)}
                          className={`h-8 px-3 rounded-md font-bold text-xs flex items-center gap-1 ${
                            isCompleted
                              ? 'border border-border-soft bg-surface text-foreground hover:bg-surface-hover'
                              : 'bg-primary hover:bg-primary-hover text-white font-black'
                          }`}
                        >
                          {isCompleted ? (
                            <RefreshCw className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3 fill-white" />
                          )}
                          <span>{isCompleted ? 'Retry' : 'Begin'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {visibleMissions.length === 0 && (
              <div className="col-span-full rounded-xl border border-border-soft bg-surface-hover p-6 text-sm text-muted-copy">
                No current-level content yet. No Writing missions are available
                for this filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ACTIVE ASSESSMENT WORKSPACE TAB VIEW */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col gap-4 rounded-xl border border-border-soft bg-surface p-4 md:flex-row md:items-center md:justify-between">
            <button
              onClick={handleBackToMissions}
              className="flex items-center gap-2 text-xs font-bold text-muted-copy hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Writing list</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border ${WritingHelpers.getCefrBadgeStyles(currentMission.cefrLevel)}`}
              >
                Level: {currentMission.cefrLevel}
              </span>
              <span className="text-xs font-mono text-muted-copy bg-surface-hover px-3 py-1 rounded border border-border-soft flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>
                  Elapsed: {WritingHelpers.formatTime(timeSpentSeconds)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => moveMission(-1)}
                disabled={currentMissionIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="min-w-14 text-center text-xs font-black text-muted-copy">
                {currentMissionIndex + 1}/{visibleMissions.length}
              </span>
              <Button
                variant="outline"
                onClick={() => moveMission(1)}
                disabled={currentMissionIndex >= visibleMissions.length - 1}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
              <Link
                to="/curriculum"
                className="hidden text-xs font-bold text-primary sm:inline-flex"
              >
                Hub
              </Link>
            </div>
          </div>

          {!evaluationResult ? (
            /* --- WORKSPACE SUB-VIEW (IN PROGRESS) --- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Draft Editor Sandbox & Guide Rules */}
              <div className="lg:col-span-7 space-y-6">
                <SectionCard
                  title={currentMission.title}
                  subtitle={currentMission.description}
                  icon={PenTool}
                  headerActions={
                    <span className="rounded-lg border border-border-soft bg-surface-hover px-2.5 py-1 font-mono text-[10px] text-muted-copy">
                      {currentMission.discipline}
                    </span>
                  }
                >
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border-soft bg-surface-hover p-4 text-sm text-foreground">
                      <p className="text-xs font-black uppercase text-foreground">
                        Scenario
                      </p>
                      <p className="mt-2 leading-6">
                        {currentMission.scenario ?? currentMission.description}
                      </p>
                      {currentMission.task && (
                        <p className="mt-3 font-semibold text-foreground">
                          Goal: {currentMission.task}
                        </p>
                      )}
                      {currentMission.expectedStructure && (
                        <p className="mt-2 text-xs leading-5 text-muted-copy">
                          Required points:{' '}
                          {currentMission.expectedStructure.join(' · ')}
                        </p>
                      )}
                    </div>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="h-64 w-full resize-none rounded-xl border border-border-soft bg-surface p-5 text-sm font-medium leading-relaxed text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="Start writing or polishing your technical draft..."
                    />

                    <div className="flex items-center justify-between text-xs font-mono text-muted-copy pt-1">
                      <span>CHARACTER COUNT: {draft.length}</span>
                      <span>READABILITY LEVEL: {getReadabilityScore()}%</span>
                    </div>

                    {userErrors.draft && (
                      <p className="text-[10px] text-rose-400 font-bold font-mono flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{userErrors.draft}</span>
                      </p>
                    )}
                  </div>
                </SectionCard>

                {/* Style Guideline Insights */}
                <div className="space-y-3 rounded-xl border border-border-soft bg-surface-hover p-5">
                  <h5 className="text-xs font-black uppercase text-muted-copy tracking-wider flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-engineer-cyan" />
                    <span>
                      Linguistic Guideline Insights (
                      {currentMission.corrections.length -
                        activeCorrections.length}
                      /{currentMission.corrections.length} resolved)
                    </span>
                  </h5>

                  {selectedRule ? (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-md animate-in slide-in-from-top-2 duration-300">
                      <h6 className="font-mono text-sm text-primary font-bold uppercase tracking-wide">
                        {selectedRule.type} Correction Guide
                      </h6>
                      <p className="text-xs text-muted-copy mt-2 leading-relaxed font-medium">
                        <strong className="text-foreground">Guideline:</strong>{' '}
                        {selectedRule.text}
                      </p>
                      <p className="text-xs text-muted-copy mt-1.5 leading-relaxed font-mono">
                        <span className="text-rose-400 font-bold">
                          "{selectedRule.original}"
                        </span>{' '}
                        →{' '}
                        <span className="text-emerald-400 font-bold">
                          "{selectedRule.fix}"
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-copy italic py-1 font-medium">
                        Click on any linguistic flag in the right column
                        checkpoint, or review the brief outline of required
                        revisions below:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentMission.corrections.map((c) => {
                          const isFixed = !activeCorrections.some(
                            (ac) => ac.id === c.id
                          );
                          return (
                            <button
                              key={c.id}
                              onClick={() => setSelectedRule(c)}
                              className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-all cursor-pointer ${
                                isFixed
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'border-border-soft bg-surface text-muted-copy hover:border-border-hover hover:bg-surface-hover hover:text-foreground'
                              }`}
                            >
                              {c.type.toUpperCase()}: {c.original}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Syntactic Optimization Checkpoint */}
              <div className="lg:col-span-5 space-y-6">
                <SectionCard
                  title="Syntactic Optimization Checkpoint"
                  subtitle="Verify linguistic and technical upgrades to earn rewards"
                  icon={Sparkles}
                  headerActions={
                    activeCorrections.length > 0 && (
                      <Button
                        onClick={handleAutoFixAll}
                        variant="outline"
                        className="text-[10px] h-7 border-primary/40 text-primary hover:bg-primary/5 font-bold font-mono py-0"
                      >
                        Auto-Fix All
                      </Button>
                    )
                  }
                >
                  <div className="space-y-6">
                    {activeCorrections.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-6 bg-emerald-500/5 rounded-lg border border-emerald-500/20 space-y-4 animate-in zoom-in-95 duration-300">
                        <Check className="h-10 w-10 text-emerald-400 bg-emerald-500/10 p-2 rounded-full" />
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            No Issues Detected
                          </p>
                          <p className="text-xs text-muted-copy mt-1.5 leading-relaxed font-medium">
                            Linguistic clarity, professional tone, and technical
                            jargon conform completely to standard protocols.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                        {activeCorrections.map((alert) => (
                          <div
                            key={alert.id}
                            onClick={() => setSelectedRule(alert)}
                            className="group relative cursor-pointer space-y-3 rounded-xl border border-border-soft bg-surface p-4 shadow-sm transition-all hover:-translate-y-px hover:border-border-hover hover:bg-surface-hover/60"
                          >
                            <div className="flex items-start gap-2.5 text-xs">
                              <AlertTriangle
                                className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${alert.type === 'grammar' ? 'text-rose-500' : 'text-amber-500'}`}
                              />
                              <p className="text-muted-copy leading-relaxed font-semibold">
                                {alert.text}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-2 border-t border-border-soft pt-2.5">
                              <span className="text-[10px] font-mono text-muted-copy">
                                "{alert.original}" →{' '}
                                <span className="text-emerald-400 font-bold">
                                  "{alert.fix}"
                                </span>
                              </span>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyFix(alert.original, alert.fix);
                                }}
                                className="text-[10px] h-6 px-2.5 py-0 bg-primary/20 hover:bg-primary/30 text-primary rounded font-bold"
                              >
                                Auto-Fix
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Submit Bar */}
                    <div className="flex items-center justify-between border-t border-border-soft pt-4">
                      <Button
                        variant="outline"
                        onClick={resetCurrentMission}
                        className="h-10 border-border-soft text-xs text-muted-copy hover:text-foreground"
                      >
                        Reset Sandbox
                      </Button>

                      <Button
                        onClick={handleSubmit}
                        className="bg-primary hover:bg-primary-hover text-foreground font-black px-5 h-10"
                      >
                        Submit Draft
                      </Button>
                    </div>
                  </div>
                </SectionCard>

                {/* Performance indicator metrics */}
                <SectionCard
                  title="Draft Quality Indicators"
                  subtitle="Active textual metrics"
                  icon={Layers}
                >
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-muted-copy font-bold">
                        <span>CLARITY SCORE</span>
                        <span>{getReadabilityScore()}%</span>
                      </div>
                      <ProgressBar
                        value={getReadabilityScore()}
                        color="primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-muted-copy font-bold">
                        <span>TECHNICAL DENSITY</span>
                        <span>
                          {selectedMissionId === 'writing_cache_draft'
                            ? 68
                            : selectedMissionId === 'writing_rfc_migration'
                              ? 84
                              : 95}
                          %
                        </span>
                      </div>
                      <ProgressBar
                        value={
                          selectedMissionId === 'writing_cache_draft'
                            ? 68
                            : selectedMissionId === 'writing_rfc_migration'
                              ? 84
                              : 95
                        }
                        color="cyan"
                      />
                    </div>
                  </div>
                </SectionCard>
              </div>
            </div>
          ) : (
            /* --- EVALUATION RESULTS VIEW --- */
            <div className="space-y-8 animate-in zoom-in-95 duration-400">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Score Summary Side Panel */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="flex flex-col items-center space-y-6 rounded-xl border border-border-soft bg-surface p-6 text-center shadow-sm">
                    <div>
                      <h4 className="text-sm font-black text-muted-copy uppercase tracking-widest font-mono">
                        Composition Outcome
                      </h4>
                      <p className="text-[10px] text-muted-copy mt-0.5 uppercase">
                        Linguistic Standard Verification
                      </p>
                    </div>

                    {/* Circular Score Badge */}
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-border-soft bg-surface-hover shadow-sm">
                      <div className="absolute inset-2 rounded-full border border-dashed border-border-soft" />
                      <div className="flex flex-col items-center">
                        <span className="text-4xl font-black leading-none text-foreground">
                          {evaluationResult.finalScore}
                        </span>
                        <span className="text-[10px] font-mono text-muted-copy uppercase mt-1">
                          score %
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-copy italic px-2 font-medium leading-relaxed">
                      "{evaluationResult.feedback}"
                    </p>

                    {/* Skill metrics bar */}
                    <div className="w-full space-y-4 border-t border-border-soft pt-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-muted-copy">
                          <span>Linguistic Clarity</span>
                          <span>
                            {evaluationResult.linguisticClarityScore}%
                          </span>
                        </div>
                        <ProgressBar
                          value={evaluationResult.linguisticClarityScore}
                          color="primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-muted-copy">
                          <span>Jargon / Vocabulary</span>
                          <span>{evaluationResult.jargonDensityScore}%</span>
                        </div>
                        <ProgressBar
                          value={evaluationResult.jargonDensityScore}
                          color="cyan"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-muted-copy">
                          <span>Professional Tone</span>
                          <span>{evaluationResult.professionalToneScore}%</span>
                        </div>
                        <ProgressBar
                          value={evaluationResult.professionalToneScore}
                          color="emerald"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rewards summary card */}
                  <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-4">
                    <h5 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                      <Award className="h-4.5 w-4.5" />
                      <span>Scoring Rewards Claimed</span>
                    </h5>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-border-soft bg-surface-hover p-3 text-center">
                        <span className="text-[9px] font-mono text-muted-copy uppercase block">
                          XP gained
                        </span>
                        <span className="mt-0.5 block text-sm font-bold text-foreground">
                          +{evaluationResult.xpEarned}
                        </span>
                      </div>
                      <div className="rounded-xl border border-border-soft bg-surface-hover p-3 text-center">
                        <span className="text-[9px] font-mono text-muted-copy uppercase block flex items-center justify-center gap-0.5">
                          <Coins className="h-2.5 w-2.5 text-amber-500 shrink-0" />{' '}
                          COINS
                        </span>
                        <span className="mt-0.5 block text-sm font-bold text-foreground">
                          +{evaluationResult.coinsEarned}
                        </span>
                      </div>
                      <div className="rounded-xl border border-border-soft bg-surface-hover p-3 text-center">
                        <span className="text-[9px] font-mono text-muted-copy uppercase block flex items-center justify-center gap-0.5">
                          <TrendingUp className="h-2.5 w-2.5 text-cyan-500 shrink-0" />{' '}
                          LEVEL PROGRESS
                        </span>
                        <span
                          className={`text-sm font-bold block mt-0.5 ${
                            evaluationResult.eloChange >= 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {evaluationResult.eloChange >= 0
                            ? `+${evaluationResult.eloChange}`
                            : evaluationResult.eloChange}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Narrative Assessment and Detailed Revision Review */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Strengths & Weaknesses card */}
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-border-soft bg-surface-hover p-5 md:grid-cols-2">
                    <div className="space-y-3">
                      <h5 className="text-xs font-black text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Identified Strengths</span>
                      </h5>
                      <ul className="space-y-1.5">
                        {evaluationResult.strengths.map((s) => (
                          <li
                            key={s}
                            className="text-xs text-muted-copy font-medium flex items-start gap-1.5"
                          >
                            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">
                              •
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3 border-t border-border-soft pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
                      <h5 className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Development Gaps</span>
                      </h5>
                      <ul className="space-y-1.5">
                        {evaluationResult.weaknesses.map((w) => (
                          <li
                            key={w}
                            className="text-xs text-muted-copy font-medium flex items-start gap-1.5"
                          >
                            <span className="text-amber-400 font-bold shrink-0 mt-0.5">
                              •
                            </span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Final Proposal Output Display */}
                  <SectionCard
                    title="Polished Proposal Output"
                    subtitle="Final submitted text after review"
                    icon={FileText}
                  >
                    <div className="whitespace-pre-wrap rounded-xl border border-border-soft bg-surface-hover p-5 text-sm font-medium leading-relaxed text-foreground">
                      {evaluationResult.finalDraft}
                    </div>
                  </SectionCard>

                  {/* Detailed Corrections Audit Card */}
                  <SectionCard
                    title="Detailed Linguistic Audit"
                    subtitle="Review each active syntactic flag and corresponding corrections applied"
                    icon={Sparkles}
                  >
                    <div className="space-y-6">
                      {evaluationResult.detailedCorrections.map((item, idx) => (
                        <div
                          key={item.correctionId}
                          className={`p-4 rounded-md border space-y-3 ${
                            item.isFixed
                              ? 'bg-emerald-500/5 border-emerald-500/20'
                              : 'bg-rose-500/5 border-rose-500/20'
                          }`}
                        >
                          {/* Correction Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex gap-2.5">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border-soft bg-surface font-mono text-xs font-black text-muted-copy">
                                {idx + 1}
                              </span>
                              <h6 className="mt-0.5 text-xs font-bold leading-tight text-foreground md:text-sm">
                                {item.text}
                              </h6>
                            </div>

                            <span
                              className={`text-[10px] font-black font-mono px-2 py-0.5 rounded uppercase flex items-center gap-1 shrink-0 ${
                                item.isFixed
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {item.isFixed ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                              <span>
                                {item.isFixed ? 'Optimized' : 'Unresolved'}
                              </span>
                            </span>
                          </div>

                          {/* Original and Target values */}
                          <div className="grid grid-cols-1 gap-3 rounded-xl border border-border-soft bg-surface p-3 md:grid-cols-2">
                            <div>
                              <span className="text-[9px] font-mono text-muted-copy uppercase block">
                                Casual/Error Term
                              </span>
                              <span className="text-xs font-bold text-rose-400 block mt-0.5">
                                "{item.original}"
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-muted-copy uppercase block">
                                Professional Revision
                              </span>
                              <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                                "{item.fix}"
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <WritingModelAnswer
                    hasSubmitted={Boolean(evaluationResult)}
                    modelAnswer={currentMission.sampleExcellentAnswer}
                    suggestions={evaluationResult.weaknesses}
                  />

                  {/* Continue Session Actions bar */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <Link
                      to="/curriculum"
                      className="inline-flex min-h-10 items-center rounded-xl px-3 text-xs font-bold text-primary hover:bg-surface-hover"
                    >
                      Learning Hub
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetCurrentMission();
                        setSelectedRule(null);
                      }}
                      className="h-10 border-border-soft text-xs text-muted-copy hover:text-foreground"
                    >
                      Retry Sandbox
                    </Button>
                    <Button
                      onClick={handleBackToMissions}
                      className="bg-primary hover:bg-primary-hover text-foreground font-black px-6 h-10"
                    >
                      Back to Writing list
                    </Button>
                    {currentMissionIndex < visibleMissions.length - 1 && (
                      <Button onClick={() => moveMission(1)}>
                        Next lesson <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WritingPage;
