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
  Award,
  AlertTriangle,
  Coins,
  TrendingUp,
  Info,
  Check,
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
        <div className="sticky top-0 z-20 border-b border-border-soft bg-background py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">Reading</h1>
          </div>
        </div>
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
      <div className="sticky top-0 z-20 border-b border-border-soft bg-background py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">Reading</h1>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              A1
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
            /* --- EVALUATION RESULTS VIEW --- */
            <div className="space-y-8 animate-in zoom-in-95 duration-400">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Score Summary Side Panel */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="flex flex-col items-center space-y-6 rounded-xl border border-border-soft bg-surface p-6 text-center">
                    <div>
                      <h4 className="text-sm font-medium text-muted-copy uppercase tracking-widest font-mono">
                        Verification Outcome
                      </h4>
                      <p className="text-[10px] text-muted-copy mt-0.5 uppercase">
                        Substation Signal Standard Match
                      </p>
                    </div>

                    {/* Circular Score Badge */}
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary/20 bg-primary/5">
                      <div className="absolute inset-2 rounded-full border border-dashed border-primary/30" />
                      <div className="flex flex-col items-center">
                        <span className="text-4xl font-medium leading-none text-foreground">
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
                        <div className="flex justify-between items-center text-[10px] font-mono font-medium text-muted-copy">
                          <span>Comprehension Rate</span>
                          <span>{evaluationResult.comprehensionScore}%</span>
                        </div>
                        <ProgressBar
                          value={evaluationResult.comprehensionScore}
                          color="primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono font-medium text-muted-copy">
                          <span>Jargon / Vocabulary</span>
                          <span>{evaluationResult.vocabularyScore}%</span>
                        </div>
                        <ProgressBar
                          value={evaluationResult.vocabularyScore}
                          color="primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono font-medium text-muted-copy">
                          <span>Technical Precision</span>
                          <span>
                            {evaluationResult.technicalAccuracyScore}%
                          </span>
                        </div>
                        <ProgressBar
                          value={evaluationResult.technicalAccuracyScore}
                          color="success"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rewards summary card */}
                  <div className="p-5 bg-success/5 border border-success/20 rounded-lg space-y-4">
                    <h5 className="text-xs font-medium uppercase text-success tracking-wider flex items-center gap-1.5">
                      <Award className="h-4.5 w-4.5" />
                      <span>Scoring Rewards Claimed</span>
                    </h5>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-border-soft bg-surface-hover p-3 text-center">
                        <span className="text-[9px] font-mono text-muted-copy uppercase block">
                          XP gained
                        </span>
                        <span className="mt-0.5 block text-sm font-medium text-foreground">
                          +{evaluationResult.xpEarned}
                        </span>
                      </div>
                      <div className="rounded-lg border border-border-soft bg-surface-hover p-3 text-center">
                        <span className="text-[9px] font-mono text-muted-copy uppercase block flex items-center justify-center gap-0.5">
                          <Coins className="h-2.5 w-2.5 text-warning shrink-0" />{' '}
                          COINS
                        </span>
                        <span className="mt-0.5 block text-sm font-medium text-foreground">
                          +{evaluationResult.coinsEarned}
                        </span>
                      </div>
                      <div className="rounded-lg border border-border-soft bg-surface-hover p-3 text-center">
                        <span className="text-[9px] font-mono text-muted-copy uppercase block flex items-center justify-center gap-0.5">
                          <TrendingUp className="h-2.5 w-2.5 text-primary shrink-0" />{' '}
                          LEVEL PROGRESS
                        </span>
                        <span
                          className={`text-sm font-medium block mt-0.5 ${
                            evaluationResult.eloChange >= 0
                              ? 'text-success'
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

                {/* Narrative Assessment and Detailed QA Review */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Strengths & Weaknesses card */}
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-border-soft bg-surface-hover p-5 md:grid-cols-2">
                    <div className="space-y-3">
                      <h5 className="text-xs font-medium text-success uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Identified Strengths</span>
                      </h5>
                      <ul className="space-y-1.5">
                        {evaluationResult.strengths.map((s) => (
                          <li
                            key={s}
                            className="text-xs text-muted-copy font-medium flex items-start gap-1.5"
                          >
                            <span className="text-success font-medium shrink-0 mt-0.5">
                              •
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3 border-t border-border-soft pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
                      <h5 className="text-xs font-medium text-warning uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Development Gaps</span>
                      </h5>
                      <ul className="space-y-1.5">
                        {evaluationResult.weaknesses.map((w) => (
                          <li
                            key={w}
                            className="text-xs text-muted-copy font-medium flex items-start gap-1.5"
                          >
                            <span className="text-warning font-medium shrink-0 mt-0.5">
                              •
                            </span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Question Detailed QA Review Card */}
                  <SectionCard
                    title="Detailed Technical Evaluation"
                    subtitle="Review each answered question and corresponding engineering justifications"
                    icon={HelpCircle}
                  >
                    <div className="space-y-6">
                      {evaluationResult.detailedAnswers.map((item, idx) => (
                        <div
                          key={item.questionId}
                          className={`p-4 rounded-lg border space-y-3 ${
                            item.isCorrect
                              ? 'bg-success/5 border-success/20'
                              : 'bg-rose-500/5 border-rose-500/20'
                          }`}
                        >
                          {/* Q Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex gap-2.5">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border-soft bg-surface font-mono text-xs font-medium text-muted-copy">
                                {idx + 1}
                              </span>
                              <h6 className="mt-0.5 text-xs font-medium leading-tight text-foreground md:text-sm">
                                {item.questionText}
                              </h6>
                            </div>

                            <span
                              className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded uppercase flex items-center gap-1 shrink-0 ${
                                item.isCorrect
                                  ? 'bg-success/10 text-success border border-success/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {item.isCorrect ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                              <span>
                                {item.isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </span>
                          </div>

                          {/* Response Row */}
                          <div className="grid grid-cols-1 gap-3 rounded-lg border border-border-soft bg-surface p-3 md:grid-cols-2">
                            <div>
                              <span className="text-[9px] font-mono text-muted-copy uppercase block">
                                Your Answer
                              </span>
                              <span className="mt-0.5 block text-xs font-medium text-foreground">
                                {item.userAnswer}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-muted-copy uppercase block">
                                Expected Key / Option
                              </span>
                              <span className="text-xs font-medium text-success block mt-0.5">
                                {item.correctAnswer}
                              </span>
                            </div>
                          </div>

                          {/* Explanation Card */}
                          <div className="space-y-1 rounded-lg border border-border-soft bg-surface-hover p-3">
                            <span className="text-[9px] font-medium uppercase text-muted-copy tracking-wider font-mono">
                              Technical Justification
                            </span>
                            <p className="text-xs text-muted-copy leading-relaxed font-medium">
                              {item.explanation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  {/* Continue Session Actions bar */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <Link
                      to="/writing"
                      className="inline-flex min-h-10 items-center rounded-lg px-3 text-xs font-medium text-primary hover:bg-primary/5"
                    >
                      Follow up in Writing
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetCurrentMission();
                        setSelectedWord(null);
                      }}
                      className="h-10 border-border-soft text-xs text-muted-copy hover:text-primary"
                    >
                      Retry Assessment
                    </Button>
                    <Button
                      onClick={handleBackToMissions}
                      className="bg-primary hover:bg-primary/90 text-white font-medium px-6 h-10"
                    >
                      Back to Reading list
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

export default ReadingPage;
