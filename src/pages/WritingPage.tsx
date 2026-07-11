import { useState, useEffect, useRef } from 'react';
import {
  PenTool,
  Check,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Clock,
  Info,
  Search,
  ChevronRight,
} from 'lucide-react';

import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { Button } from '@/shared/components/Button';
import { PageHeader } from '@/shared/components/PageHeader';
import {
  useWritingStore,
  WritingHelpers,
  WritingCorrection,
} from '@/features/writing';
import {
  ContentLevelFilter,
  DEFAULT_CONTENT_LEVEL_FILTER,
  EmptyLevelState,
  filterContentByLevel,
  LevelContentFilter,
  useSkillLevel,
} from '@/features/level-system';

import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { WritingEvaluationResults } from './WritingPage/WritingEvaluationResults';

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

  const [selectedRule, setSelectedRule] = useState<WritingCorrection | null>(null);
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});
  const [levelFilter, setLevelFilter] = useState<ContentLevelFilter>(
    DEFAULT_CONTENT_LEVEL_FILTER
  );
  const [query, setQuery] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentLevel = useSkillLevel('writing').currentLevel;
  
  const filteredByLevel = filterContentByLevel(
    missions,
    currentLevel,
    levelFilter
  );
  
  const visibleMissions = filteredByLevel.filter(m => 
    m.title.toLowerCase().includes(query.toLowerCase()) || 
    m.discipline.toLowerCase().includes(query.toLowerCase())
  );

  // Initialize writing store
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Start / stop timer
  useEffect(() => {
    if (!evaluationResult) {
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [evaluationResult, incrementTimer, selectedMissionId]);

  useEffect(() => {
    if (visibleMissions.length > 0 && (!selectedMissionId || !visibleMissions.some(m => m.id === selectedMissionId))) {
      selectMission(visibleMissions[0].id);
    }
  }, [selectMission, selectedMissionId, visibleMissions]);

  const currentMission = visibleMissions.find((m) => m.id === selectedMissionId) || visibleMissions[0];

  const currentMissionIndex = currentMission ? visibleMissions.findIndex((m) => m.id === currentMission.id) : -1;
  const previousMission = currentMissionIndex > 0 ? visibleMissions[currentMissionIndex - 1] : null;
  const nextMission = currentMissionIndex < visibleMissions.length - 1 ? visibleMissions[currentMissionIndex + 1] : null;

  const moveMission = (offset: number) => {
    const nextMission = visibleMissions[currentMissionIndex + offset];
    if (nextMission) {
      selectMission(nextMission.id);
      setSelectedRule(null);
      setUserErrors({});
    }
  };

  const finishedCount = Object.keys(completedMissions).length;

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader 
        title="Writing"
        badgeText="A1"
        badgeColor="border-primary/20 bg-primary/10 text-primary"
      >
        <LevelContentFilter
          value={levelFilter}
          currentLevel={currentLevel}
          onChange={setLevelFilter}
        />
        <div className="relative mt-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-copy" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block min-h-11 w-full rounded-xl border border-border-soft bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="Search scenarios or disciplines"
          />
        </div>
      </PageHeader>

      {/* Horizontal Topic Bar */}
      <div className="sticky top-[72px] z-10 -mx-4 px-4 py-3 bg-surface/95 backdrop-blur-sm border-b border-border-soft lg:-mx-8 lg:px-8 shadow-sm transition-all">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-full w-10 h-10 p-0"
            disabled={!previousMission}
            onClick={() => previousMission && selectMission(previousMission.id)}
            aria-label="Previous scenario"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 overflow-x-auto custom-scrollbar snap-x flex gap-3 pb-1 pt-1">
            {visibleMissions.length === 0 ? (
              <div className="w-full text-center text-sm font-medium text-muted-copy py-3">
                No scenarios found for the current filter.
              </div>
            ) : (
              visibleMissions.map((m) => {
                const lessonNumber = filteredByLevel.findIndex((item) => item.id === m.id) + 1;
                const isSelected = currentMission?.id === m.id;
                const isCompleted = completedMissions[m.id] !== undefined;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      ProductAnalyticsService.track('writing_task_started', '/writing', {
                        metadata: { skill: 'writing', missionId: m.id, source: 'user' },
                      });
                      selectMission(m.id);
                      setSelectedRule(null);
                      setUserErrors({});
                    }}
                    className={`shrink-0 snap-start w-[240px] rounded-xl border p-3 text-left transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                        : isCompleted
                        ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                        : 'border-border-soft bg-surface hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex flex-col h-full justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-[10px] font-bold tracking-wider ${isCompleted ? 'text-emerald-500' : 'text-primary'}`}>
                          SCENARIO {lessonNumber}
                        </p>
                        <p className="mt-1 text-sm font-bold text-foreground truncate">
                          {m.title}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] font-medium text-muted-copy truncate">
                          {m.discipline}
                        </p>
                        {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-full w-10 h-10 p-0"
            disabled={!nextMission}
            onClick={() => nextMission && selectMission(nextMission.id)}
            aria-label="Next scenario"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!currentMission ? (
        <EmptyLevelState skill="Writing" />
      ) : (
        <div className="space-y-6 pt-2">
          {/* Header Bar */}
          <div className="flex flex-col gap-4 rounded-xl border border-border-soft bg-surface p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded border ${WritingHelpers.getCefrBadgeStyles(currentMission.cefrLevel)}`}
              >
                Level: {currentMission.cefrLevel}
              </span>
              <span className="text-[10px] font-medium font-mono px-2 py-0.5 rounded uppercase border border-border-soft bg-surface-hover text-muted-copy">
                {currentMission.difficulty}
              </span>
              <span className="text-[10px] font-mono text-muted-copy flex items-center gap-1">
                <Clock className="h-3 w-3" /> {currentMission.estimatedMinutes}m
              </span>
              <span className="text-xs font-mono text-muted-copy bg-surface-hover px-3 py-1 rounded border border-border-soft flex items-center gap-1.5 ml-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Elapsed: {WritingHelpers.formatTime(timeSpentSeconds)}</span>
              </span>
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

          {!evaluationResult ? (
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
                      <p className="text-xs font-bold uppercase text-foreground">
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
                  <h5 className="text-xs font-bold uppercase text-muted-copy tracking-wider flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-primary" />
                    <span>
                      Linguistic Guideline Insights ({currentMission.corrections.length - activeCorrections.length}/{currentMission.corrections.length} resolved)
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
                        Click on any linguistic flag in the right column checkpoint, or review the brief outline of required revisions below:
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
                        className="bg-primary hover:bg-primary/90 text-white font-medium px-5 h-10"
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
            <WritingEvaluationResults
              evaluationResult={evaluationResult}
              currentMission={currentMission}
              resetCurrentMission={resetCurrentMission}
              setSelectedRule={setSelectedRule}
              handleBackToMissions={() => {}} 
              currentMissionIndex={currentMissionIndex}
              visibleMissions={visibleMissions}
              moveMission={moveMission}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default WritingPage;
