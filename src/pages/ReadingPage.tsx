import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  HelpCircle,
  GraduationCap,
  CheckCircle2,
  FileText,
  RefreshCw,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Info,
  Check,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { MetricCard } from '@/shared/components/MetricCard';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import { PageHeader } from '@/shared/components/PageHeader';
import {
  useReadingStore,
  ReadingHelpers,
  VocabularyItem,
  ReadingTranslation,
} from '@/features/reading';
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
import { ReadingEvaluationResults } from './ReadingPage/ReadingEvaluationResults';

const ReadingPage = () => {
  // Read state and actions from the reading store
  const {
    missions,
    selectedMissionId,
    answers,
    clickedVocab,
    timeSpentSeconds,
    evaluationResult,
    completedMissions,
    initializeStore,
    selectMission,
    setAnswer,
    addClickedVocab,
    incrementTimer,
    submitCurrentMission,
    resetCurrentMission,
    resetAllReadingProgress,
  } = useReadingStore();

  const [activeTab, setActiveTab] = useState<'missions' | 'workspace'>(
    'missions'
  );
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});
  const [levelFilter, setLevelFilter] = useState<ContentLevelFilter>(
    DEFAULT_CONTENT_LEVEL_FILTER
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentLevel = useSkillLevel('reading').currentLevel;
  const visibleMissions = filterContentByLevel(
    missions,
    currentLevel,
    levelFilter
  );

  // Initialize reading store
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
        <PageHeader title="Reading" />
        <LevelContentFilter
          value={levelFilter}
          currentLevel={currentLevel}
          onChange={setLevelFilter}
        />
        <EmptyLevelState skill="Reading" />
        <Link
          to="/curriculum"
          className="inline-flex text-sm font-medium text-primary"
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
      setSelectedWord(null);
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

  // Active Passage Highlight Rendering
  const renderPassage = (text: string, vocabList: VocabularyItem[]) => {
    if (!vocabList || vocabList.length === 0)
      return <span className="whitespace-pre-wrap">{text}</span>;

    const escapeRegExp = (str: string) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const terms = vocabList.map((v) => escapeRegExp(v.term));
    const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');

    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) => {
          const matchingVocab = vocabList.find(
            (v) => v.term.toLowerCase() === part.toLowerCase()
          );

          if (matchingVocab) {
            const isSelected =
              selectedWord?.term.toLowerCase() ===
              matchingVocab.term.toLowerCase();
            const hasExplored = clickedVocab.includes(matchingVocab.term);

            return (
              <span
                key={index}
                onClick={() => {
                  setSelectedWord(matchingVocab);
                  addClickedVocab(matchingVocab.term);
                }}
                className={`underline decoration-2 underline-offset-4 cursor-pointer px-1 rounded font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary/10 text-foreground decoration-primary'
                    : hasExplored
                      ? 'decoration-success/60 text-foreground hover:bg-success/5'
                      : 'decoration-primary/60 text-foreground hover:bg-primary/5 hover:text-foreground'
                }`}
              >
                {part}
              </span>
            );
          }

          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  const handleLaunchMission = (missionId: string) => {
    selectMission(missionId);
    setSelectedWord(null);
    setUserErrors({});
    setActiveTab('workspace');
  };

  const handleSubmit = () => {
    // Validate that at least some answers are entered to prevent accidental submission
    const unansweredList = currentMission.questions.filter(
      (q) => !answers[q.id]
    );
    if (unansweredList.length > 0) {
      const errors: Record<string, string> = {};
      unansweredList.forEach((q) => {
        errors[q.id] = 'Verification answer required';
      });
      setUserErrors(errors);
      return;
    }

    setUserErrors({});
    submitCurrentMission();
  };

  const handleBackToMissions = () => {
    setActiveTab('missions');
    setSelectedWord(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Reading"
        badgeText="A1"
        badgeColor="border-primary/20 bg-primary/10 text-primary"
        actions={
          <div className="hidden text-xs text-muted-copy lg:block">
            {finishedCount}/{missions.length} completed
          </div>
        }
      />

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
              <h3 className="text-xl font-medium text-foreground tracking-tight">
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
              const difficultyColor = ReadingHelpers.getDifficultyColor(
                m.difficulty
              );

              return (
                <div
                  key={m.id}
                  id={`reading-card-${m.id}`}
                  className={`group relative rounded-xl border bg-surface p-5 transition-all duration-200 hover:-translate-y-px hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm ${
                    isCompleted ? 'border-success/20' : 'border-border-soft'
                  }`}
                >
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Top Badge Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded border ${ReadingHelpers.getCefrBadgeStyles(m.cefrLevel)}`}
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
                          className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded uppercase ${
                            difficultyColor === 'rose'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : difficultyColor === 'amber'
                                ? 'bg-warning/10 text-warning border-warning/20'
                                : 'bg-success/10 text-success border-success/20'
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
                        <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
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
                        <span className="text-[10px] font-medium font-mono bg-surface-hover border border-border-soft text-muted-copy px-2 py-1 rounded">
                          {m.discipline}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <div className="flex items-center gap-1.5 text-xs text-success font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Score: {bestScore}%</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium font-mono text-muted-copy uppercase">
                            Available
                          </span>
                        )}

                        <Button
                          onClick={() => handleLaunchMission(m.id)}
                          className={`h-8 px-3 rounded-lg font-medium text-xs flex items-center gap-1 ${
                            isCompleted
                              ? 'border border-border-soft bg-surface text-foreground hover:bg-primary/5'
                              : 'bg-primary hover:bg-primary/90 text-white font-medium'
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
                No current-level content yet. No Reading missions are available
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
              className="flex items-center gap-2 text-xs font-medium text-muted-copy hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Reading list</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded border ${ReadingHelpers.getCefrBadgeStyles(currentMission.cefrLevel)}`}
              >
                Level: {currentMission.cefrLevel}
              </span>
              <span className="text-xs font-mono text-muted-copy bg-surface-hover px-3 py-1 rounded border border-border-soft flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>
                  Elapsed: {ReadingHelpers.formatTime(timeSpentSeconds)}
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
              <span className="min-w-14 text-center text-xs font-medium text-muted-copy">
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
                className="hidden text-xs font-medium text-primary sm:inline-flex"
              >
                Hub
              </Link>
            </div>
          </div>

          {!evaluationResult ? (
            /* --- WORKSPACE SUB-VIEW (IN PROGRESS) --- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Passage & Glossary */}
              <div className="lg:col-span-7 space-y-6">
                <SectionCard
                  title={currentMission.title}
                  subtitle="Active Document Reading - Click underlined technical terms to expand system glossary"
                  icon={BookOpen}
                  headerActions={
                    <span className="rounded-lg border border-border-soft bg-surface-hover px-2.5 py-1 font-mono text-[10px] text-muted-copy">
                      {currentMission.discipline}
                    </span>
                  }
                >
                  <div className="rounded-lg border border-border-soft bg-surface-hover p-5 text-sm font-normal leading-7 text-foreground md:text-base whitespace-pre-line">
                    {renderPassage(
                      currentMission.passageText,
                      currentMission.vocabulary
                    )}
                  </div>
                </SectionCard>

                {/* Glossary card */}
                <div className="space-y-3 rounded-xl border border-border-soft bg-surface-hover p-5">
                  <h5 className="text-xs font-medium uppercase text-muted-copy tracking-wider flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-primary" />
                    <span>
                      Domain Term Notes ({clickedVocab.length}/
                      {currentMission.vocabulary.length} explored)
                    </span>
                  </h5>

                  {selectedWord ? (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg animate-in slide-in-from-top-2 duration-300">
                      <h6 className="font-mono text-sm text-primary font-medium">
                        {selectedWord.term}
                      </h6>
                      <p className="text-xs text-muted-copy mt-2 leading-relaxed font-medium">
                        <strong className="text-foreground">Definition:</strong>{' '}
                        {selectedWord.definition}
                      </p>
                      <p className="text-xs text-muted-copy mt-1 italic font-medium">
                        <strong className="text-muted-copy not-italic">
                          Context:
                        </strong>{' '}
                        "{selectedWord.context}"
                      </p>
                      <ReadingTranslation
                        translation={
                          selectedWord.turkishTranslation ??
                          'Bu terim için Türkçe çeviri henüz eklenmedi.'
                        }
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-copy italic py-2 font-medium">
                      No word currently selected. Click any highlighted
                      underlined word in the passage above to explore its
                      technical note.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Comprehension Checkpoint Form */}
              <div className="lg:col-span-5 space-y-6">
                <SectionCard
                  title="Comprehension Checkpoint"
                  subtitle="Verify structural and semantic intake to earn rewards"
                  icon={HelpCircle}
                >
                  <div className="space-y-6">
                    {currentMission.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="space-y-3 rounded-lg border border-border-soft bg-surface-hover p-4"
                      >
                        <div className="flex gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border-soft bg-surface font-mono text-xs font-medium text-muted-copy">
                            {idx + 1}
                          </span>
                          <h5 className="text-sm font-medium leading-tight text-foreground">
                            {q.questionText}
                          </h5>
                        </div>

                        {/* RENDER QUESTION SPECIFIC INPUTS */}
                        {q.type === 'multiple_choice' && q.choices && (
                          <div className="space-y-2 pt-1">
                            {q.choices.map((choice) => {
                              const choiceLetter = choice
                                .trim()
                                .charAt(0)
                                .toUpperCase();
                              const isSelected = answers[q.id] === choiceLetter;

                              return (
                                <button
                                  key={choice}
                                  onClick={() => setAnswer(q.id, choiceLetter)}
                                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs font-medium flex items-center justify-between cursor-pointer ${
                                    isSelected
                                      ? 'border-primary bg-primary/10 text-foreground'
                                      : 'border-border-soft bg-surface text-muted-copy hover:border-primary/20 hover:bg-primary/5 hover:text-foreground'
                                  }`}
                                >
                                  <span>{choice}</span>
                                  {isSelected && (
                                    <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'true_false' && (
                          <div className="flex gap-3 pt-1">
                            {['true', 'false'].map((option) => {
                              const isSelected =
                                answers[q.id]?.toLowerCase() === option;
                              return (
                                <button
                                  key={option}
                                  onClick={() => setAnswer(q.id, option)}
                                  className={`flex-1 p-3 rounded-lg border text-xs font-medium text-center capitalize transition-all cursor-pointer ${
                                    isSelected
                                      ? option === 'true'
                                        ? 'border-success bg-success/5 text-success'
                                        : 'border-rose-500 bg-rose-500/5 text-rose-400'
                                      : 'border-border-soft bg-surface text-muted-copy hover:border-primary/20 hover:bg-primary/5 hover:text-foreground'
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {(q.type === 'short_answer' ||
                          q.type === 'keyword_answer') && (
                          <div className="pt-1">
                            <input
                              type="text"
                              value={answers[q.id] || ''}
                              onChange={(e) => setAnswer(q.id, e.target.value)}
                              placeholder={
                                q.type === 'keyword_answer'
                                  ? 'Enter precise number or code standard...'
                                  : 'Draft technical explanation...'
                              }
                              className="w-full rounded-lg border border-border-soft bg-surface p-3 text-xs text-foreground placeholder-muted-copy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            {q.type === 'short_answer' && (
                              <p className="text-[10px] text-muted-copy mt-1.5 leading-relaxed font-mono">
                                Type a comprehensive response using correct
                                engineering terminology.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Error Handling */}
                        {userErrors[q.id] && (
                          <p className="text-[10px] text-rose-400 font-medium font-mono flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>{userErrors[q.id]}</span>
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Submit Bar */}
                    <div className="flex items-center justify-between border-t border-border-soft pt-4">
                      <Button
                        variant="outline"
                        onClick={resetCurrentMission}
                        className="h-10 border-border-soft text-xs text-muted-copy hover:text-primary"
                      >
                        Reset Form
                      </Button>

                      <Button
                        onClick={handleSubmit}
                        className="bg-primary hover:bg-primary/90 text-white font-medium px-5 h-10"
                      >
                        Submit Answers
                      </Button>
                    </div>
                  </div>
                </SectionCard>
              </div>
            </div>
          ) : (
            <ReadingEvaluationResults
              evaluationResult={evaluationResult}
              resetCurrentMission={resetCurrentMission}
              setSelectedWord={setSelectedWord}
              handleBackToMissions={handleBackToMissions}
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

export default ReadingPage;
