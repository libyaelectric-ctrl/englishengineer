import { Link } from 'react-router-dom';
import {
  BookOpen,
  HelpCircle,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Info,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import { ReadingHelpers, VocabularyItem, type ReadingEvaluationResult } from '@/features/reading';
import { ReadingTranslation } from '@/features/reading';
import { ReadingEvaluationResults } from './ReadingEvaluationResults';

interface ReadingWorkspaceProps {
  currentMission: {
    id: string;
    title: string;
    passageText: string;
    vocabulary: VocabularyItem[];
    questions: Array<{
      id: string;
      questionText: string;
      type: string;
      choices?: string[];
    }>;
    cefrLevel: string;
    discipline: string;
  };
  currentMissionIndex: number;
  visibleMissions: unknown[];
  answers: Record<string, string>;
  clickedVocab: string[];
  timeSpentSeconds: number;
  evaluationResult: ReadingEvaluationResult | null;
  selectedWord: VocabularyItem | null;
  userErrors: Record<string, string>;
  setSelectedWord: (word: VocabularyItem | null) => void;
  setAnswer: (id: string, value: string) => void;
  addClickedVocab: (term: string) => void;
  handleSubmit: () => void;
  resetCurrentMission: () => void;
  handleBackToMissions: () => void;
  moveMission: (offset: number) => void;
}

export function ReadingWorkspace({
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
}: ReadingWorkspaceProps) {
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

  return (
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
            <span>Elapsed: {ReadingHelpers.formatTime(timeSpentSeconds)}</span>
          </span>
          {timeSpentSeconds > 0 && (
            <span className="text-xs font-mono text-primary bg-primary/5 px-3 py-1 rounded border border-primary/20">
              WPM:{' '}
              {Math.round(
                (currentMission.passageText.split(/\s+/).length /
                  Math.max(timeSpentSeconds, 1)) *
                  60
              )}
            </span>
          )}
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
                  No word currently selected. Click any highlighted underlined
                  word in the passage above to explore its technical note.
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

                    {userErrors[q.id] && (
                      <p className="text-[10px] text-rose-400 font-medium font-mono flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{userErrors[q.id]}</span>
                      </p>
                    )}
                  </div>
                ))}

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
        <>
          <div className="text-center py-4">
            <p className="text-4xl font-black text-primary">
              {evaluationResult.finalScore}%
            </p>
            <p className="text-sm text-muted-copy">Comprehension Score</p>
          </div>
          <ReadingEvaluationResults
            evaluationResult={evaluationResult}
            resetCurrentMission={resetCurrentMission}
            setSelectedWord={setSelectedWord}
            handleBackToMissions={handleBackToMissions}
            currentMissionIndex={currentMissionIndex}
            visibleMissions={visibleMissions}
            moveMission={moveMission}
          />
        </>
      )}
    </div>
  );
}
