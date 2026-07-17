import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  PenLine,
  Target,
  TriangleAlert,
  Send,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import {
  getGrammarReviewReason,
  getMissingGrammarTransferEvidence,
  type GrammarRuleProgress,
  GrammarTeacherService,
  type ChatMessage,
} from '@/features/grammar';
import { Button } from '@/shared/components/Button';
import {
  getPracticeCount,
  getTransferCount,
  compact,
} from './GrammarPageHelpers';
import {
  SectionHeading,
  MasteryPill,
  LessonBlock,
} from './GrammarPageComponents';

type Rule = {
  id: string;
  ruleTitle?: string;
  title: string;
  structure: string;
  engineeringUseCase: string;
  languageFunction: string;
  grammarCategory: string;
  explanation: string;
  definition: string;
  turkishExplanation: string;
  minimumUserOutput: string;
  taskPromptTemplate: string;
  examples: { english: string; turkish: string }[];
  badExampleEnglish: string;
  badExampleTurkishExplanation?: string;
  commonMistakes: string;
  correctedExampleEnglish: string;
  skillUse: string[];
  linkedVocabularyTags: string[];
  cefrLevel: string;
};

type QuizItem = {
  question: string;
  choices: string[];
  correct: number;
};

export const GrammarLessonContent = ({
  selectedRule,
  selectedProgress,
  selectedStatus,
  selectedModule,
  rules,
  totalGrammarLessons,
  masteredCount,
  grammarPoolIds,
  linkedVocabulary,
  recordUsage,
  quizOpen,
  setQuizOpen,
  hintOpen,
  setHintOpen,
  quizAnswers,
  setQuizAnswers,
  quizItems,
}: {
  selectedRule: Rule;
  selectedProgress: GrammarRuleProgress;
  selectedStatus: 'New' | 'Practicing' | 'Needs Reading/Writing' | 'Mastered';
  selectedModule: string;
  rules: Rule[];
  totalGrammarLessons: number;
  masteredCount: number;
  grammarPoolIds: string[];
  linkedVocabulary: { tag: string; term: string }[];
  recordUsage: (correct: boolean) => void;
  quizOpen: boolean;
  setQuizOpen: (fn: (o: boolean) => boolean) => void;
  hintOpen: boolean;
  setHintOpen: (fn: (v: boolean) => boolean) => void;
  quizAnswers: Record<number, string>;
  setQuizAnswers: (
    fn: (prev: Record<number, string>) => Record<number, string>
  ) => void;
  quizItems: QuizItem[];
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! Let's study the lesson: **"${selectedRule.title}"** (CEFR: ${selectedRule.cefrLevel}).
        
**Turkish Explanation (Açıklama):**
${selectedRule.turkishExplanation}

**Formula / Structure:**
\`${selectedRule.structure}\`

**Software Engineering Example:**
- *Correct:* "${selectedRule.correctedExampleEnglish}"
- *Common Mistake (Tr):* "${selectedRule.badExampleEnglish}" (${selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes})

Would you like to practice? Try translating this Turkish sentence or write your own example using the formula:
*"${selectedRule.examples[0]?.turkish || 'Write a sentence'}"*`,
      },
    ]);
    setChatInput('');
  }, [selectedRule.id]);

  const handleSend = async () => {
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
      const response = await GrammarTeacherService.chat(
        selectedRule.id,
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

  return (
    <>
      <div className="min-w-0 rounded-lg border border-border-soft bg-surface p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
              {selectedModule}
            </p>
            <h2 className="mt-0.5 break-words text-base font-black">
              {selectedRule.ruleTitle || selectedRule.title}
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-copy">
              {compact(
                selectedRule.engineeringUseCase,
                selectedRule.languageFunction
              )}
            </p>
          </div>
          <span
            className={`shrink-0 whitespace-nowrap rounded-full border font-bold px-3 py-1 text-xs ${
              selectedStatus === 'Mastered'
                ? 'border-success/30 bg-success/5 text-success'
                : selectedStatus === 'Needs Reading/Writing'
                  ? 'border-warning/30 bg-warning/5 text-warning'
                  : selectedStatus === 'Practicing'
                    ? 'border-primary/25 bg-primary/5 text-primary'
                    : 'border-border-soft bg-surface text-muted-copy'
            }`}
          >
            {selectedStatus}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ['This Level', rules.length],
            ['Total Map', totalGrammarLessons],
            ['Mastered', masteredCount],
            ['Pool', grammarPoolIds.length],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-center"
          >
            <p className="text-base font-black">{value}</p>
            <p className="text-[10px] font-bold uppercase text-muted-copy">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border-soft bg-surface p-4">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-copy">
            Mastery
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <MasteryPill
              label="Practice"
              value={`${getPracticeCount(selectedProgress)}/3`}
              complete={getPracticeCount(selectedProgress) >= 3}
            />
            <MasteryPill
              label="Reading"
              value={
                selectedProgress.skillEvidence.reading
                  ? `${selectedProgress.skillEvidence.reading.score}%`
                  : 'Missing'
              }
              complete={Boolean(selectedProgress.skillEvidence.reading)}
            />
            <MasteryPill
              label="Writing"
              value={
                selectedProgress.skillEvidence.writing
                  ? `${selectedProgress.skillEvidence.writing.score}%`
                  : 'Missing'
              }
              complete={Boolean(selectedProgress.skillEvidence.writing)}
            />
            <MasteryPill
              label="R/W"
              value={`${getTransferCount(selectedProgress)}/2`}
              complete={getTransferCount(selectedProgress) >= 2}
            />
          </div>
          {getMissingGrammarTransferEvidence(selectedProgress).length > 0 && (
            <span className="rounded-full border border-warning/30 bg-warning/5 px-2 py-0.5 text-[10px] font-semibold text-warning">
              Missing:{' '}
              {getMissingGrammarTransferEvidence(selectedProgress).join(', ')}
            </span>
          )}
        </div>
      </div>

      <LessonBlock
        icon={Target}
        title="Lesson Objective"
        body={`Practice how to "${selectedRule.languageFunction.toLowerCase()}" in an engineering context: "${selectedRule.engineeringUseCase}" using the structure "${selectedRule.structure}".`}
      />

      {linkedVocabulary.length > 0 && (
        <div className="rounded-lg border border-border-soft bg-surface p-4">
          <SectionHeading title="Words You Will Use Today" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {linkedVocabulary.map((item) => (
              <span
                key={`${item.tag}-${item.term}`}
                className="rounded-full border border-success/30 bg-success/5 px-2.5 py-0.5 text-[11px] font-bold text-success"
              >
                {item.term}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border-soft bg-surface p-4">
        <SectionHeading title="Teacher Explanation" />
        <p className="mt-2 text-xs leading-5">
          {compact(selectedRule.explanation, selectedRule.definition)}
        </p>
        <p className="mt-2 rounded-lg border border-border-soft bg-background p-3 text-xs leading-5 text-muted-copy">
          Turkish speaker note: {selectedRule.turkishExplanation}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
            Structure
          </p>
          <p className="mt-2 break-words font-mono text-sm font-black">
            {selectedRule.structure}
          </p>
          <p className="mt-2 break-words text-xs text-muted-copy">
            Target output: {selectedRule.minimumUserOutput}
          </p>
        </div>
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-warning">
            Guided Practice
          </p>
          <p className="mt-2 break-words text-xs font-bold leading-5">
            {selectedRule.taskPromptTemplate}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border-soft bg-surface p-4">
        <SectionHeading
          title="Examples"
          subtitle="Read the pattern before you try to produce it."
        />
        <div className="mt-2 grid gap-2">
          {selectedRule.examples.map((example, index) => (
            <div
              key={`${example.english}-${index}`}
              className="rounded-lg border border-border-soft bg-background p-3"
            >
              <p className="break-words text-xs font-bold">{example.english}</p>
              <p className="mt-0.5 break-words text-[11px] text-muted-copy">
                {example.turkish}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700">
          Common Turkish Mistake
        </p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <div>
            <p className="break-words text-xs font-bold text-rose-900">
              {selectedRule.badExampleEnglish}
            </p>
            <p className="mt-1 break-words text-xs leading-5 text-rose-800">
              {selectedRule.badExampleTurkishExplanation ||
                selectedRule.commonMistakes}
            </p>
          </div>
          <div className="rounded-lg border border-success/30 bg-white p-3">
            <p className="text-[11px] font-bold uppercase text-success">
              Better
            </p>
            <p className="mt-1 break-words text-xs font-bold">
              {selectedRule.correctedExampleEnglish}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-surface p-4">
        <SectionHeading
          title="AI Grammar Teacher"
          subtitle="Practice, translate, and chat with your bilingual engineering English tutor"
        />
        <div className="mt-3 flex max-h-80 min-h-40 flex-col gap-2.5 overflow-y-auto rounded-lg border border-border-soft bg-background p-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col max-w-[85%] rounded-lg p-3 text-xs leading-5',
                msg.role === 'assistant'
                  ? 'bg-primary/5 text-foreground border border-primary/10 mr-auto'
                  : 'bg-foreground text-background ml-auto'
              )}
            >
              <p className="font-bold text-[10px] uppercase opacity-60 mb-1">
                {msg.role === 'assistant' ? 'AI Teacher 🎓' : 'You 💻'}
              </p>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {isTalking && (
            <div className="flex flex-col max-w-[85%] rounded-lg p-3 text-xs bg-primary/5 text-foreground border border-primary/10 mr-auto animate-pulse">
              <p className="font-bold text-[10px] uppercase opacity-60 mb-1">
                AI Teacher 🎓
              </p>
              <p>Thinking and explaining...</p>
            </div>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <label className="flex-1">
            <span className="sr-only">Chat with AI Grammar Teacher</span>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              disabled={isTalking}
              placeholder="Type your reply, translation effort, or question..."
              className="w-full rounded-lg border border-border-soft bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
          </label>
          <Button
            onClick={handleSend}
            disabled={!chatInput.trim() || isTalking}
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border-soft bg-surface p-4">
        <SectionHeading title="Practice & Evaluation" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button onClick={() => recordUsage(true)}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Used Correctly
          </Button>
          <Button variant="outline" onClick={() => recordUsage(false)}>
            <TriangleAlert className="h-3.5 w-3.5" /> Needs Review
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setQuizOpen((o) => !o);
              setQuizAnswers(() => ({}));
            }}
          >
            <HelpCircle className="h-3.5 w-3.5" /> Mini Quiz
          </Button>
          <Button variant="outline" onClick={() => setHintOpen((v) => !v)}>
            <BookOpen className="h-3.5 w-3.5" /> Hint
          </Button>
        </div>
        {hintOpen && (
          <p className="mt-3 rounded-lg border border-border-soft bg-background p-3 text-xs leading-5 text-muted-copy">
            {getGrammarReviewReason(selectedProgress)}
          </p>
        )}
        {quizOpen && (
          <div className="mt-3 space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            {quizItems.map((item, qi) => (
              <div key={item.question}>
                <p className="text-xs font-bold">
                  {qi + 1}. {item.question}
                </p>
                <div className="mt-1.5 grid gap-1.5">
                  {item.choices.map((choice, ci) => {
                    const letter = String.fromCharCode(65 + ci);
                    const selected = quizAnswers[qi] === letter;
                    const revealed = Object.keys(quizAnswers).length === 3;
                    const correct = ci === item.correct;
                    return (
                      <button
                        key={`${item.question}-${choice}`}
                        type="button"
                        disabled={revealed}
                        onClick={() =>
                          setQuizAnswers((prev) => ({ ...prev, [qi]: letter }))
                        }
                        className={`break-words rounded-lg border p-2 text-left text-[11px] font-semibold transition-colors ${
                          revealed
                            ? correct
                              ? 'border-success bg-success/10'
                              : selected
                                ? 'border-rose-300 bg-rose-50'
                                : 'border-border-soft bg-surface opacity-60'
                            : selected
                              ? 'border-primary bg-primary/10'
                              : 'border-border-soft bg-surface hover:border-primary/30'
                        }`}
                      >
                        <span className="mr-1.5 font-black">{letter}.</span>
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {linkedVocabulary.length > 0 && (
        <div className="rounded-lg border border-border-soft bg-surface p-4">
          <SectionHeading
            title="Use It in Skills"
            subtitle="Use this lesson in Reading and Writing to prove mastery."
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedRule.skillUse.includes('reading') && (
              <Link
                to="/reading"
                className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border-soft bg-background px-3 text-xs font-bold hover:border-primary/40"
              >
                <FileText className="h-3 w-3" /> Reading
              </Link>
            )}
            {selectedRule.skillUse.includes('writing') && (
              <Link
                to="/writing"
                className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border-soft bg-background px-3 text-xs font-bold hover:border-primary/40"
              >
                <PenLine className="h-3 w-3" /> Writing
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};
