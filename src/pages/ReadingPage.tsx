import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Info,
  Check,
  ChevronRight,
  Search,
} from 'lucide-react';

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

  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});
  const [levelFilter, setLevelFilter] = useState<ContentLevelFilter>(
    DEFAULT_CONTENT_LEVEL_FILTER
  );
  const [query, setQuery] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentLevel = useSkillLevel('reading').currentLevel;
  
  const filteredByLevel = filterContentByLevel(
    missions,
    currentLevel,
    levelFilter
  );
  
  const visibleMissions = filteredByLevel.filter(m => 
    m.title.toLowerCase().includes(query.toLowerCase()) || 
    m.discipline.toLowerCase().includes(query.toLowerCase())
  );

  // Initialize reading store
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
    const target = visibleMissions[currentMissionIndex + offset];
    if (target) {
      selectMission(target.id);
      setSelectedWord(null);
      setUserErrors({});
    }
  };

  const finishedCount = Object.keys(completedMissions).length;

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
            const isSelected = selectedWord?.term.toLowerCase() === matchingVocab.term.toLowerCase();
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

  const handleSubmit = () => {
    const unansweredList = currentMission.questions.filter((q) => !answers[q.id]);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader 
        title="Reading"
        badgeText={currentLevel}
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
                      selectMission(m.id);
                      setSelectedWord(null);
                      setUserErrors({});
                    }}
                    className={`shrink-0 snap-start w-[240px] rounded-xl border p-3 text-left transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                        : isCompleted
                        ? 'border-success/30 bg-success/5 hover:border-success/50'
                        : 'border-border-soft bg-surface hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex flex-col h-full justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-[10px] font-bold tracking-wider ${isCompleted ? 'text-success' : 'text-primary'}`}>
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
                        {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
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
        <EmptyLevelState skill="Reading" />
      ) : (
        <div className="space-y-6 pt-2">
          {/* Header Bar */}
          <div className="flex flex-col gap-4 rounded-xl border border-border-soft bg-surface p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded border ${ReadingHelpers.getCefrBadgeStyles(currentMission.cefrLevel)}`}
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
                <span>Elapsed: {ReadingHelpers.formatTime(timeSpentSeconds)}</span>
              </span>
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

          {!evaluationResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Passage & Glossary */}
              <div className="lg:col-span-7 space-y-6">
                <SectionCard
                  title={currentMission.title}
                  subtitle={currentMission.description}
                  icon={BookOpen}
                  headerActions={
                    <span className="rounded-lg border border-border-soft bg-surface-hover px-2.5 py-1 font-mono text-[10px] text-muted-copy">
                      {currentMission.discipline}
                    </span>
                  }
                >
                  <div className="rounded-lg border border-border-soft bg-surface-hover p-5 text-sm font-normal leading-7 text-foreground md:text-base whitespace-pre-line">
                    {renderPassage(currentMission.passageText, currentMission.vocabulary)}
                  </div>
                </SectionCard>

                {/* Glossary card */}
                <div className="space-y-3 rounded-xl border border-border-soft bg-surface-hover p-5">
                  <h5 className="text-xs font-medium uppercase text-muted-copy tracking-wider flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-primary" />
                    <span>Domain Term Notes ({clickedVocab.length}/{currentMission.vocabulary.length} explored)</span>
                  </h5>

                  {selectedWord ? (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg animate-in slide-in-from-top-2 duration-300">
                      <h6 className="font-mono text-sm text-primary font-medium">{selectedWord.term}</h6>
                      <p className="text-xs text-muted-copy mt-2 leading-relaxed font-medium">
                        <strong className="text-foreground">Definition:</strong> {selectedWord.definition}
                      </p>
                      <p className="text-xs text-muted-copy mt-1 italic font-medium">
                        <strong className="text-muted-copy not-italic">Context:</strong> "{selectedWord.context}"
                      </p>
                      <ReadingTranslation
                        translation={selectedWord.turkishTranslation ?? 'Bu terim için Türkçe çeviri henüz eklenmedi.'}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-copy italic py-2 font-medium">
                      No word currently selected. Click any highlighted underlined word in the passage above to explore its technical note.
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
                      <div key={q.id} className="space-y-3 rounded-lg border border-border-soft bg-surface-hover p-4">
                        <div className="flex gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border-soft bg-surface font-mono text-xs font-medium text-muted-copy">{idx + 1}</span>
                          <h5 className="text-sm font-medium leading-tight text-foreground">{q.questionText}</h5>
                        </div>

                        {q.type === 'multiple_choice' && q.choices && (
                          <div className="space-y-2 pt-1">
                            {q.choices.map((choice) => {
                              const choiceLetter = choice.trim().charAt(0).toUpperCase();
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
                                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'true_false' && (
                          <div className="flex gap-3 pt-1">
                            {['true', 'false'].map((option) => {
                              const isSelected = answers[q.id]?.toLowerCase() === option;
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

                        {(q.type === 'short_answer' || q.type === 'keyword_answer') && (
                          <div className="pt-1">
                            <input
                              type="text"
                              value={answers[q.id] || ''}
                              onChange={(e) => setAnswer(q.id, e.target.value)}
                              placeholder={q.type === 'keyword_answer' ? 'Enter precise number or code standard...' : 'Draft technical explanation...'}
                              className="w-full rounded-lg border border-border-soft bg-surface p-3 text-xs text-foreground placeholder-muted-copy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            {q.type === 'short_answer' && (
                              <p className="text-[10px] text-muted-copy mt-1.5 leading-relaxed font-mono">
                                Type a comprehensive response using correct engineering terminology.
                              </p>
                            )}
                          </div>
                        )}

                        {userErrors[q.id] && (
                          <p className="text-[10px] text-rose-400 font-medium font-mono flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>{userErrors[q.id]}</span>
                          </p>
                        )}
                      </div>
                    ))}

                    <div className="flex items-center justify-between border-t border-border-soft pt-4">
                      <Button variant="outline" onClick={resetCurrentMission} className="h-10 border-border-soft text-xs text-muted-copy hover:text-primary">
                        Reset Form
                      </Button>

                      <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-white font-medium px-5 h-10">
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

export default ReadingPage;
