import { useState, useEffect } from 'react';
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
  Send,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { AITeacherService, type AITeacherChatMessage } from '@/features/ai';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import {
  ReadingHelpers,
  VocabularyItem,
  type ReadingEvaluationResult,
} from '@/features/reading';
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
  const [messages, setMessages] = useState<AITeacherChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I am your AI Reading Companion for this technical article: **"${currentMission.title}"**.
        
I can explain complex sentences, help you translate paragraphs, or discuss the engineering topics covered in the text.
What questions do you have about this passage?`,
      },
    ]);
    setChatInput('');
  }, [currentMission.id]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isTalking) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const nextHistory = [
      ...messages,
      { role: 'user' as const, content: userMsg },
    ];
    setMessages(nextHistory);
    setIsTalking(true);

    try {
      const response = await AITeacherService.chat(
        'reading',
        `Title: "${currentMission.title}". Passage: "${currentMission.passageText}"`,
        nextHistory,
        userMsg
      );
      setMessages([
        ...nextHistory,
        { role: 'assistant' as const, content: response.message },
      ]);
    } finally {
      setIsTalking(false);
    }
  };

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
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedWord(matchingVocab);
                  addClickedVocab(matchingVocab.term);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedWord(matchingVocab);
                    addClickedVocab(matchingVocab.term);
                  }
                }}
                className={`underline decoration-2 underline-offset-4 cursor-pointer px-1 rounded-[4px] font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#0047bb]/10 text-foreground decoration-[#0047bb]'
                    : hasExplored
                      ? 'decoration-success/60 text-foreground hover:bg-success/5'
                      : 'decoration-[#0047bb]/60 text-foreground hover:bg-[#0047bb]/5 hover:text-foreground'
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
      <div className="flex flex-col gap-4 rounded-[4px] border border-border-soft bg-surface p-4 md:flex-row md:items-center md:justify-between shadow-sm">
        <button
          onClick={handleBackToMissions}
          className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-wider text-muted-copy hover:text-[#0047bb] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Reading list</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-[4px] border ${ReadingHelpers.getCefrBadgeStyles(currentMission.cefrLevel)}`}
          >
            Level: {currentMission.cefrLevel}
          </span>
          <span className="text-xs font-mono text-muted-copy bg-[#f3f3fd] px-3 py-1 rounded-[4px] border border-border-soft flex items-center gap-1.5 font-bold">
            <Clock className="h-3.5 w-3.5 text-[#0047bb]" />
            <span>Elapsed: {ReadingHelpers.formatTime(timeSpentSeconds)}</span>
          </span>
          {timeSpentSeconds > 0 && (
            <span className="text-xs font-mono text-[#0047bb] bg-[#0047bb]/5 px-3 py-1 rounded-[4px] border border-[#0047bb]/25 font-bold">
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
            className="rounded-[4px] cursor-pointer"
            onClick={() => moveMission(-1)}
            disabled={currentMissionIndex <= 0}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="min-w-14 text-center text-xs font-medium text-muted-copy font-bold">
            {currentMissionIndex + 1}/{visibleMissions.length}
          </span>
          <Button
            variant="outline"
            className="rounded-[4px] cursor-pointer"
            onClick={() => moveMission(1)}
            disabled={currentMissionIndex >= visibleMissions.length - 1}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
          <Link
            to="/curriculum"
            className="hidden text-xs font-bold text-[#0047bb] sm:inline-flex"
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
                <span className="rounded-[4px] border border-border-soft bg-[#f3f3fd] px-2.5 py-1 font-mono text-[9px] font-bold text-muted-copy uppercase tracking-wider">
                  {currentMission.discipline}
                </span>
              }
            >
              <div className="rounded-[4px] border border-border-soft bg-surface p-5 text-sm font-normal leading-[1.8] text-foreground md:text-base whitespace-pre-line">
                {renderPassage(
                  currentMission.passageText,
                  currentMission.vocabulary
                )}
              </div>
            </SectionCard>

            <div className="space-y-3 rounded-[4px] border border-border-soft bg-[#f3f3fd] p-5 shadow-sm">
              <h5 className="text-xs font-bold uppercase text-muted-copy tracking-wider flex items-center gap-1.5">
                <Info className="h-4 w-4 text-[#0047bb]" />
                <span>
                  Domain Term Notes ({clickedVocab.length}/
                  {currentMission.vocabulary.length} explored)
                </span>
              </h5>

              {selectedWord ? (
                <div className="p-4 bg-[#0047bb]/5 border border-[#0047bb]/25 rounded-[4px] animate-in slide-in-from-top-2 duration-300 shadow-sm">
                  <h6 className="font-mono text-sm text-[#0047bb] font-bold">
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

            {/* AI Reading Companion */}
            <div className="space-y-3 rounded-[4px] border border-border-soft bg-surface p-5 shadow-sm">
              <h5 className="text-xs font-bold uppercase text-foreground tracking-wider flex items-center gap-1.5">
                <span>AI Reading Companion 🎓</span>
              </h5>
              <div className="flex max-h-60 min-h-24 flex-col gap-2.5 overflow-y-auto rounded-[4px] border border-border-soft bg-background p-2.5">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex flex-col max-w-[85%] rounded-[4px] p-2.5 text-xs leading-relaxed',
                      msg.role === 'assistant'
                        ? 'bg-[#0047bb]/5 text-foreground border border-[#0047bb]/10 mr-auto'
                        : 'bg-foreground text-background ml-auto'
                    )}
                  >
                    <p className="font-bold text-[9px] uppercase opacity-60 mb-0.5">
                      {msg.role === 'assistant' ? 'AI Mentor 🎓' : 'You 💻'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                {isTalking && (
                  <div className="flex flex-col max-w-[85%] rounded-[4px] p-2.5 text-xs bg-[#0047bb]/5 text-foreground border border-[#0047bb]/10 mr-auto animate-pulse">
                    <p className="font-bold text-[9px] uppercase opacity-60 mb-0.5">
                      AI Mentor 🎓
                    </p>
                    <p>Typing response...</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendChat();
                  }}
                  disabled={isTalking}
                  placeholder="Ask a question about the text..."
                  className="flex-1 rounded-[4px] border border-border-soft bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-[#0047bb]"
                />
                <Button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || isTalking}
                  className="rounded-[4px] cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
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
                    className="space-y-3 rounded-[4px] border border-border-soft bg-[#f3f3fd] p-4 shadow-sm"
                  >
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border border-border-soft bg-surface font-mono text-xs font-bold text-muted-copy">
                        {idx + 1}
                      </span>
                      <h5 className="text-sm font-bold leading-tight text-foreground">
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
                              className={`w-full text-left p-3 rounded-[4px] border transition-all text-xs font-bold flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'border-[#0047bb] bg-[#0047bb] text-white'
                                  : 'border-border-soft bg-surface text-muted-copy hover:border-[#0047bb]/30 hover:bg-[#0047bb]/5 hover:text-foreground'
                              }`}
                            >
                              <span>{choice}</span>
                              {isSelected && (
                                <Check className="h-4 w-4 text-white shrink-0 ml-2" />
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
                              className={`flex-1 p-3 rounded-[4px] border text-xs font-bold text-center capitalize transition-all cursor-pointer ${
                                isSelected
                                  ? option === 'true'
                                    ? 'border-success bg-success/10 text-success font-bold'
                                    : 'border-rose-500 bg-rose-500/10 text-rose-700 font-bold'
                                  : 'border-border-soft bg-surface text-muted-copy hover:border-[#0047bb]/20 hover:bg-[#0047bb]/5 hover:text-foreground'
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
                        <label className="block">
                          <span className="sr-only">{q.questionText}</span>
                          <input
                            type="text"
                            value={answers[q.id] || ''}
                            onChange={(e) => setAnswer(q.id, e.target.value)}
                            placeholder={
                              q.type === 'keyword_answer'
                                ? 'Enter precise number or code standard...'
                                : 'Draft technical explanation...'
                            }
                            className="w-full rounded-[4px] border border-border-soft bg-surface p-3 text-xs text-foreground placeholder-muted-copy focus:border-[#0047bb] focus:outline-none focus:ring-2 focus:ring-[#0047bb]/10 font-bold"
                          />
                        </label>
                        {q.type === 'short_answer' && (
                          <p className="text-[10px] text-muted-copy mt-1.5 leading-relaxed font-mono font-bold">
                            Type a comprehensive response using correct
                            engineering terminology.
                          </p>
                        )}
                      </div>
                    )}

                    {userErrors[q.id] && (
                      <p className="text-[10px] text-rose-400 font-bold font-mono flex items-center gap-1 mt-1">
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
                    className="h-10 rounded-[4px] border-border-soft text-xs text-muted-copy hover:text-[#0047bb] hover:bg-[#0047bb]/5 cursor-pointer"
                  >
                    Reset Form
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    className="bg-[#0047bb] hover:bg-[#0047bb]/90 text-white font-bold uppercase tracking-wider text-[10px] px-5 h-10 rounded-[4px] cursor-pointer border border-[#0047bb]"
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
            <p className="text-4xl font-bold text-[#0047bb]">
              {evaluationResult.finalScore}%
            </p>
            <p className="text-sm text-muted-copy font-bold uppercase tracking-wider">
              Comprehension Score
            </p>
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
