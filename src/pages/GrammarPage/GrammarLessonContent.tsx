import {
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  PenLine,
  Send,
  Star,
  Target,
  TriangleAlert,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';

import {
  type ChatMessage,
  type GrammarRuleProgress,
  GrammarTeacherService,
  getGrammarReviewReason,
  getMissingGrammarTransferEvidence,
} from '@/features/grammar';

import { LessonBlock, MasteryPill, SectionHeading } from './GrammarPageComponents';
import { compact, getPracticeCount, getTransferCount } from './GrammarPageHelpers';

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

const STATUS_BADGE_STYLES: Record<string, string> = {
  Mastered: 'border-yellow-400/40 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700',
  Learned: 'border-green-400/40 bg-green-50 dark:bg-green-900/20 text-green-700',
  Learning: 'border-yellow-300/40 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600',
  Struggling: 'border-red-400/40 bg-red-50 dark:bg-red-900/20 text-red-700',
};
const DEFAULT_BADGE_STYLE = 'border-border-soft bg-surface-hover text-muted-copy';

const STATUS_HINTS: Record<string, { text: string; className?: string }> = {
  Learning: { text: '1 correct → Learned' },
  Learned: { text: '3 correct → Mastered' },
  Struggling: { text: 'Review this rule!', className: 'text-red-500' },
};

const STATUS_MESSAGES: Record<string, string> = {
  New: 'This rule is new. Start practicing to move to Practicing.',
  Practicing: 'Used correctly 1+ times. Keep going to Master.',
  Mastered: 'Congrats! You have mastered this rule.',
  'Needs Reading/Writing': 'Apply this rule in Reading and Writing exercises.',
};

const LessonHeader = ({
  selectedModule,
  selectedRule,
  selectedStatus,
}: {
  selectedModule: string;
  selectedRule: Rule;
  selectedStatus: string;
}) => {
  const badgeStyle = STATUS_BADGE_STYLES[selectedStatus] ?? DEFAULT_BADGE_STYLE;
  const hint = STATUS_HINTS[selectedStatus];
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('EngVox_favorite_grammar');
      if (stored) {
        const list: string[] = JSON.parse(stored);
        setIsStarred(list.includes(selectedRule.id));
      }
    } catch {
      // ignore
    }
  }, [selectedRule.id]);

  const toggleStar = () => {
    try {
      const stored = localStorage.getItem('EngVox_favorite_grammar');
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (list.includes(selectedRule.id)) {
        list = list.filter((id) => id !== selectedRule.id);
        setIsStarred(false);
      } else {
        list.push(selectedRule.id);
        setIsStarred(true);
      }
      localStorage.setItem('EngVox_favorite_grammar', JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-w-0 rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
              {selectedModule}
            </p>
            <button
              type="button"
              onClick={toggleStar}
              className="text-muted-copy hover:text-amber-400 transition-colors cursor-pointer"
              title={isStarred ? 'Remove from favorite rules' : 'Bookmark rule to favorites'}
            >
              <Star className={`h-4 w-4 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
          <h2 className="mt-0.5 break-words text-base font-bold">
            {selectedRule.ruleTitle || selectedRule.title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-copy">
            {compact(selectedRule.engineeringUseCase, selectedRule.languageFunction)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`shrink-0 whitespace-nowrap rounded-[4px] border font-bold px-3 py-1 text-[10px] uppercase tracking-wider ${badgeStyle}`}
          >
            {selectedStatus === 'Mastered' && '⭐ '}
            {selectedStatus}
          </span>
          {hint && (
            <span className={`text-[10px] ${hint.className ?? 'text-muted-copy'}`}>
              {hint.text}
            </span>
          )}
        </div>
      </div>

      {/* Visual Grammar Formula Badge */}
      {selectedRule.structure && (
        <div className="flex items-center gap-2 rounded border border-primary/20 bg-primary/5 p-2 text-xs font-mono">
          <span className="font-bold text-primary text-[10px] uppercase tracking-wider">
            Formula:
          </span>
          <span className="font-bold text-foreground">{selectedRule.structure}</span>
        </div>
      )}
    </div>
  );
};

const StatsGrid = ({
  rules,
  totalGrammarLessons,
  masteredCount,
  grammarPoolIds,
}: {
  rules: Rule[];
  totalGrammarLessons: number;
  masteredCount: number;
  grammarPoolIds: string[];
}) => (
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
        className="rounded-[4px] border border-border-soft bg-surface px-3 py-2 text-center shadow-sm"
      >
        <p className="text-base font-bold text-foreground">{value}</p>
        <p className="text-[10px] font-bold uppercase text-muted-copy">{label}</p>
      </div>
    ))}
  </div>
);

const MasteryBar = ({ selectedProgress }: { selectedProgress: GrammarRuleProgress }) => {
  const missing = getMissingGrammarTransferEvidence(selectedProgress);

  return (
    <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-copy">Mastery</p>
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
        {missing.length > 0 && (
          <span className="rounded-[4px] border border-warning/30 bg-warning/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
            Missing: {missing.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
};

const ChatPanel = ({
  messages,
  chatInput,
  isTalking,
  setChatInput,
  handleSend,
}: {
  messages: ChatMessage[];
  chatInput: string;
  isTalking: boolean;
  setChatInput: (v: string) => void;
  handleSend: () => void;
}) => (
  <div className="rounded-[4px] border border-primary/25 bg-surface p-4 shadow-sm">
    <SectionHeading
      title="AI Grammar Teacher"
      subtitle="Practice, translate, and chat with your bilingual engineering English tutor"
    />
    <div className="mt-3 flex max-h-80 min-h-40 flex-col gap-2.5 overflow-y-auto rounded-[4px] border border-border-soft bg-background p-3">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            'flex flex-col max-w-[85%] rounded-[4px] p-3 text-xs leading-relaxed',
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
        <div className="flex flex-col max-w-[85%] rounded-[4px] p-3 text-xs bg-primary/5 text-foreground border border-primary/10 mr-auto animate-pulse">
          <p className="font-bold text-[10px] uppercase opacity-60 mb-1">AI Teacher 🎓</p>
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
          className="w-full rounded-[4px] border border-border-soft bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
        />
      </label>
      <Button
        onClick={handleSend}
        disabled={!chatInput.trim() || isTalking}
        aria-label="Send message"
        className="rounded-[4px]"
      >
        <Send className="h-3.5 w-3.5" />
      </Button>
    </div>
  </div>
);

const QuizPanel = ({
  quizItems,
  quizAnswers,
  setQuizAnswers,
}: {
  quizItems: QuizItem[];
  quizAnswers: Record<number, string>;
  setQuizAnswers: (fn: (prev: Record<number, string>) => Record<number, string>) => void;
}) => (
  <div className="mt-3 space-y-3 rounded-[4px] border border-primary/25 bg-primary/5 p-3">
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
                onClick={() => setQuizAnswers((prev) => ({ ...prev, [qi]: letter }))}
                className={`break-words rounded-[4px] border p-2 text-left text-[11px] font-semibold transition-colors cursor-pointer ${revealed ? (correct ? 'border-success bg-success/10 text-success' : selected ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-border-soft bg-surface opacity-60') : selected ? 'border-primary bg-primary text-white' : 'border-border-soft bg-surface text-foreground hover:border-primary/30 hover:bg-primary/5'}`}
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
);

const LinkedVocabularySection = ({
  linkedVocabulary,
}: {
  linkedVocabulary: { tag: string; term: string }[];
}) => {
  if (linkedVocabulary.length === 0) return null;
  return (
    <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
      <SectionHeading title="Words You Will Use Today" />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {linkedVocabulary.map((item) => (
          <span
            key={`${item.tag}-${item.term}`}
            className="rounded-[4px] border border-success/30 bg-success/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success"
          >
            {item.term}
          </span>
        ))}
      </div>
    </div>
  );
};

const SkillLinksSection = ({ skillUse }: { skillUse: string[] }) => {
  if (skillUse.length === 0) return null;
  const SKILL_LINKS: Record<string, { to: string; icon: typeof FileText; label: string }> = {
    reading: { to: '/reading', icon: FileText, label: 'Reading' },
    writing: { to: '/writing', icon: PenLine, label: 'Writing' },
  };
  return (
    <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
      <SectionHeading
        title="Use It in Skills"
        subtitle="Use this lesson in Reading and Writing to prove mastery."
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {skillUse.map((skill) => {
          const link = SKILL_LINKS[skill];
          if (!link) return null;
          const Icon = link.icon;
          return (
            <Link
              key={skill}
              to={link.to}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-[4px] border border-border-soft bg-background px-3 text-xs font-bold hover:border-primary/40 cursor-pointer"
            >
              <Icon className="h-3 w-3" /> {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const StatusMessage = ({ selectedStatus }: { selectedStatus: string }) => {
  const message = STATUS_MESSAGES[selectedStatus];
  if (!message) return null;
  return (
    <div className="rounded-[4px] border border-border-soft bg-surface p-3 text-[10px] text-muted-copy">
      {message}
    </div>
  );
};

// ─── Interactive Drill Panel ─────────────────────────────────────────────────

type DrillMode = 'fill_blank' | 'correction' | 'reordering';

const DRILL_LABELS: Record<DrillMode, string> = {
  fill_blank: '✏️ Fill in the Blank',
  correction: '🔍 Error Correction',
  reordering: '🔀 Word Reordering',
};

const InteractiveDrillPanel = ({ selectedRule }: { selectedRule: Rule }) => {
  const [activeDrill, setActiveDrill] = useState<DrillMode | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [wordTokens, setWordTokens] = useState<string[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const firstExample = selectedRule.examples[0];

  // Compute drill question depending on active mode
  const fillSentence = (() => {
    if (!firstExample) return { blanked: '', correct: '' };
    const words = firstExample.english.split(' ');
    const idx = Math.min(Math.floor(words.length / 2), words.length - 1);
    const correct = words[idx].replace(/[.,!?;:]/g, '');
    const blanked = words.map((w, i) => (i === idx ? '______' : w)).join(' ');
    return { blanked, correct };
  })();

  const openDrill = (mode: DrillMode) => {
    setActiveDrill((prev) => (prev === mode ? null : mode));
    setUserAnswer('');
    setResult(null);
    setHintsUsed(0);
    if (mode === 'reordering' && firstExample) {
      const words = firstExample.english.split(' ').filter(Boolean);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setWordTokens(shuffled);
      setSelectedTokens([]);
    }
  };

  const normalise = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .replace(/\s+/g, ' ');

  const checkFillOrCorrection = () => {
    const expected =
      activeDrill === 'fill_blank' ? fillSentence.correct : selectedRule.correctedExampleEnglish;
    setResult(normalise(userAnswer) === normalise(expected) ? 'correct' : 'wrong');
  };

  const checkReordering = () => {
    const joined = selectedTokens.join(' ');
    setResult(normalise(joined) === normalise(firstExample?.english ?? '') ? 'correct' : 'wrong');
  };

  const toggleToken = (token: string, fromSelected: boolean) => {
    if (fromSelected) {
      setSelectedTokens((prev) => {
        const idx = prev.lastIndexOf(token);
        return idx !== -1 ? [...prev.slice(0, idx), ...prev.slice(idx + 1)] : prev;
      });
      setWordTokens((prev) => [...prev, token]);
    } else {
      setWordTokens((prev) => {
        const idx = prev.indexOf(token);
        return idx !== -1 ? [...prev.slice(0, idx), ...prev.slice(idx + 1)] : prev;
      });
      setSelectedTokens((prev) => [...prev, token]);
    }
    setResult(null);
  };

  if (!firstExample) return null;

  return (
    <div className="rounded-[4px] border border-primary/20 bg-surface p-4 shadow-sm space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
        🎯 Interactive Drills
      </p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(DRILL_LABELS) as DrillMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => openDrill(mode)}
            className={cn(
              'rounded-[4px] border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer',
              activeDrill === mode
                ? 'border-primary bg-primary text-white'
                : 'border-border-soft bg-background text-muted-copy hover:border-primary/40 hover:text-primary'
            )}
          >
            {DRILL_LABELS[mode]}
          </button>
        ))}
      </div>

      {activeDrill === 'fill_blank' && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-copy">
            Fill in the missing word in the sentence:
          </p>
          <p className="rounded border border-border-soft bg-background px-3 py-2 text-sm font-mono font-bold text-foreground">
            {fillSentence.blanked}
          </p>
          <p className="text-[10px] text-muted-copy italic">Turkish: {firstExample.turkish}</p>
          {hintsUsed > 0 && (
            <p className="text-[10px] text-amber-600 font-bold">
              💡 Hint: Starts with &ldquo;{fillSentence.correct[0]}&rdquo; (
              {fillSentence.correct.length} letters)
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setResult(null);
              }}
              placeholder="Type your answer..."
              className="flex-1 rounded border border-border-soft bg-background px-3 py-1.5 text-xs outline-none focus:border-primary text-foreground"
            />
            <button
              type="button"
              onClick={checkFillOrCorrection}
              className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Check
            </button>
            <button
              type="button"
              onClick={() => setHintsUsed((h) => h + 1)}
              className="rounded border border-border-soft px-3 py-1.5 text-xs font-bold text-muted-copy hover:text-primary transition-colors cursor-pointer"
            >
              Hint
            </button>
          </div>
          {result === 'correct' && (
            <p className="text-xs font-bold text-success">✅ Correct! Great job.</p>
          )}
          {result === 'wrong' && (
            <p className="text-xs font-bold text-rose-600">
              ❌ Not quite. Expected: <span className="font-mono">{fillSentence.correct}</span>
            </p>
          )}
        </div>
      )}

      {activeDrill === 'correction' && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-copy">
            Find and correct the grammar mistake:
          </p>
          <p className="rounded border border-rose-300 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-sm font-bold text-rose-800 dark:text-rose-300">
            {selectedRule.badExampleEnglish}
          </p>
          <p className="text-[10px] text-muted-copy italic">
            {selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes}
          </p>
          <div className="flex items-center gap-2">
            <input
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setResult(null);
              }}
              placeholder="Write the corrected sentence..."
              className="flex-1 rounded border border-border-soft bg-background px-3 py-1.5 text-xs outline-none focus:border-primary text-foreground"
            />
            <button
              type="button"
              onClick={checkFillOrCorrection}
              className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Check
            </button>
          </div>
          {result === 'correct' && (
            <p className="text-xs font-bold text-success">✅ Correct! You spotted the mistake.</p>
          )}
          {result === 'wrong' && (
            <p className="text-xs font-bold text-rose-600">
              ❌ Not quite. Correct answer:{' '}
              <span className="font-mono">{selectedRule.correctedExampleEnglish}</span>
            </p>
          )}
        </div>
      )}

      {activeDrill === 'reordering' && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-copy">
            Tap words to build the sentence in the correct order:
          </p>
          {/* Answer area */}
          <div className="min-h-9 flex flex-wrap gap-1.5 rounded border-2 border-dashed border-primary/30 bg-primary/5 p-2">
            {selectedTokens.length === 0 && (
              <span className="text-[10px] text-muted-copy italic">
                Tap words below to place them here…
              </span>
            )}
            {selectedTokens.map((token, i) => (
              <button
                key={`sel-${i}-${token}`}
                type="button"
                onClick={() => toggleToken(token, true)}
                className="rounded border border-primary bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors"
              >
                {token}
              </button>
            ))}
          </div>
          {/* Word pool */}
          <div className="flex flex-wrap gap-1.5">
            {wordTokens.map((token, i) => (
              <button
                key={`pool-${i}-${token}`}
                type="button"
                onClick={() => toggleToken(token, false)}
                className="rounded border border-border-soft bg-background px-2 py-0.5 text-xs font-semibold text-foreground cursor-pointer hover:border-primary/40 hover:text-primary transition-colors"
              >
                {token}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={checkReordering}
              className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Check Order
            </button>
            <button
              type="button"
              onClick={() => openDrill('reordering')}
              className="rounded border border-border-soft px-3 py-1.5 text-xs font-bold text-muted-copy hover:text-primary transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
          {result === 'correct' && (
            <p className="text-xs font-bold text-success">✅ Perfect order!</p>
          )}
          {result === 'wrong' && (
            <p className="text-xs font-bold text-rose-600">
              ❌ Not quite right. Expected:{' '}
              <span className="font-mono">{firstExample.english}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Export Panel ─────────────────────────────────────────────────────────────

const ExportPanel = ({ selectedRule }: { selectedRule: Rule }) => {
  const exportAnki = () => {
    const header = 'Front,Back,Tags\n';
    const lines = selectedRule.examples.map((ex) => {
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      return `${escape(ex.english)},${escape(ex.turkish)},grammar ${selectedRule.cefrLevel} ${selectedRule.grammarCategory.replace(/\s+/g, '_')}`;
    });
    if (selectedRule.badExampleEnglish) {
      lines.push(
        `"${selectedRule.badExampleEnglish.replace(/"/g, '""')}","${(selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes).replace(/"/g, '""')}",grammar ${selectedRule.cefrLevel} mistakes`
      );
    }
    const blob = new Blob([header + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grammar-${selectedRule.id}-anki.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const html = `
      <!DOCTYPE html><html lang="en"><head>
      <meta charset="UTF-8"/><title>${selectedRule.title} – Grammar Cheat Sheet</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 32px; max-width: 720px; margin: auto; color: #111; }
        h1 { font-size: 22px; border-bottom: 3px solid #6366f1; padding-bottom: 8px; color: #4f46e5; }
        .badge { display: inline-block; background: #e0e7ff; color: #4338ca; font-weight: 700; font-size: 11px; border-radius: 4px; padding: 2px 8px; margin-left: 8px; }
        .formula { background: #f1f5f9; border: 1px solid #6366f1; border-radius: 6px; padding: 10px 14px; font-family: monospace; font-weight: 700; font-size: 14px; color: #4f46e5; margin: 12px 0; }
        h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-top: 20px; }
        .ex { border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px 12px; margin: 6px 0; }
        .en { font-weight: 700; font-size: 13px; }
        .tr { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .mistake { border-color: #fca5a5; background: #fff1f2; }
        .correct { border-color: #86efac; background: #f0fdf4; }
        @media print { body { padding: 16px; } }
      </style>
      </head><body>
      <h1>${selectedRule.ruleTitle || selectedRule.title} <span class="badge">${selectedRule.cefrLevel}</span></h1>
      <div class="formula">${selectedRule.structure}</div>
      <p style="font-size:13px">${selectedRule.turkishExplanation}</p>
      <h3>Examples</h3>
      ${selectedRule.examples.map((ex) => `<div class="ex"><div class="en">${ex.english}</div><div class="tr">${ex.turkish}</div></div>`).join('')}
      ${
        selectedRule.badExampleEnglish
          ? `
      <h3>Common Mistake</h3>
      <div class="ex mistake"><div class="en">✗ ${selectedRule.badExampleEnglish}</div><div class="tr">${selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes}</div></div>
      <div class="ex correct"><div class="en">✓ ${selectedRule.correctedExampleEnglish}</div></div>`
          : ''
      }
      </body></html>`;
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[4px] border border-border-soft bg-surface p-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
        Export:
      </span>
      <button
        type="button"
        onClick={exportAnki}
        className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-background px-3 py-1.5 text-[10px] font-bold text-muted-copy hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
      >
        📥 Anki CSV
      </button>
      <button
        type="button"
        onClick={exportPDF}
        className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-background px-3 py-1.5 text-[10px] font-bold text-muted-copy hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
      >
        📄 PDF Sheet
      </button>
    </div>
  );
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
  setQuizAnswers: (fn: (prev: Record<number, string>) => Record<number, string>) => void;
  quizItems: QuizItem[];
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! Let's study the lesson: **"${selectedRule.title}"** (CEFR: ${selectedRule.cefrLevel}).\n\n**Turkish Explanation (Açıklama):**\n${selectedRule.turkishExplanation}\n\n**Formula / Structure:**\n\`${selectedRule.structure}\`\n\n**Software Engineering Example:**\n- *Correct:* "${selectedRule.correctedExampleEnglish}"\n- *Common Mistake (Tr):* "${selectedRule.badExampleEnglish}" (${selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes})\n\nWould you like to practice? Try translating this Turkish sentence or write your own example using the formula:\n*"${selectedRule.examples[0]?.turkish || 'Write a sentence'}"*`,
      },
    ]);
    setChatInput('');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setMessages/setChatInput are stable setters
  }, [selectedRule.id]);

  const handleSend = async () => {
    if (!chatInput.trim() || isTalking) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const nextHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(nextHistory);
    setIsTalking(true);
    try {
      const response = await GrammarTeacherService.chat(selectedRule.id, nextHistory, userMsg);
      setMessages([...nextHistory, { role: 'assistant' as const, content: response.message }]);
    } finally {
      setIsTalking(false);
    }
  };

  return (
    <>
      <LessonHeader
        selectedModule={selectedModule}
        selectedRule={selectedRule}
        selectedStatus={selectedStatus}
      />
      <StatsGrid
        rules={rules}
        totalGrammarLessons={totalGrammarLessons}
        masteredCount={masteredCount}
        grammarPoolIds={grammarPoolIds}
      />
      <MasteryBar selectedProgress={selectedProgress} />
      <LessonBlock
        icon={Target}
        title="Lesson Objective"
        body={`Practice how to "${selectedRule.languageFunction.toLowerCase()}" in an engineering context: "${selectedRule.engineeringUseCase}" using the structure "${selectedRule.structure}".`}
      />

      <LinkedVocabularySection linkedVocabulary={linkedVocabulary} />

      <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
        <SectionHeading title="Teacher Explanation" />
        <p className="mt-2 text-xs leading-relaxed">
          {compact(selectedRule.explanation, selectedRule.definition)}
        </p>
        <p className="mt-2 rounded-[4px] border border-border-soft bg-background p-3 text-xs leading-relaxed text-muted-copy">
          Turkish speaker note: {selectedRule.turkishExplanation}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[4px] border border-primary/25 bg-surface-hover p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Structure</p>
          <p className="mt-2 break-words font-mono text-sm font-bold text-primary">
            {selectedRule.structure}
          </p>
          <p className="mt-2 break-words text-xs text-muted-copy">
            Target output: {selectedRule.minimumUserOutput}
          </p>
        </div>
        <div className="rounded-[4px] border border-warning/30 bg-warning/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-warning">
            Guided Practice
          </p>
          <p className="mt-2 break-words text-xs font-bold leading-relaxed">
            {selectedRule.taskPromptTemplate}
          </p>
        </div>
      </div>

      <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
        <SectionHeading
          title="Examples"
          subtitle="Read the pattern before you try to produce it."
        />
        <div className="mt-2 grid gap-2">
          {selectedRule.examples.map((example, index) => (
            <div
              key={`${example.english}-${index}`}
              className="rounded-[4px] border border-border-soft bg-background p-3"
            >
              <p className="break-words text-xs font-bold">{example.english}</p>
              <p className="mt-0.5 break-words text-[11px] text-muted-copy">{example.turkish}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[4px] border border-rose-200 bg-rose-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700">
          Common Turkish Mistake
        </p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <div>
            <p className="break-words text-xs font-bold text-rose-900">
              {selectedRule.badExampleEnglish}
            </p>
            <p className="mt-1 break-words text-xs leading-relaxed text-rose-800">
              {selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes}
            </p>
          </div>
          <div className="rounded-[4px] border border-success/30 bg-surface p-3 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-success">Better</p>
            <p className="mt-1 break-words text-xs font-bold">
              {selectedRule.correctedExampleEnglish}
            </p>
          </div>
        </div>
      </div>

      <ChatPanel
        messages={messages}
        chatInput={chatInput}
        isTalking={isTalking}
        setChatInput={setChatInput}
        handleSend={handleSend}
      />

      <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
        <SectionHeading title="Practice & Evaluation" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button onClick={() => recordUsage(true)} className="rounded-[4px]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Used Correctly
          </Button>
          <Button variant="outline" onClick={() => recordUsage(false)} className="rounded-[4px]">
            <TriangleAlert className="h-3.5 w-3.5" /> Needs Review
          </Button>
          <Button
            variant="outline"
            className="rounded-[4px]"
            onClick={() => {
              setQuizOpen((o) => !o);
              setQuizAnswers(() => ({}));
            }}
          >
            <HelpCircle className="h-3.5 w-3.5" /> Mini Quiz
          </Button>
          <Button
            variant="outline"
            onClick={() => setHintOpen((v) => !v)}
            className="rounded-[4px]"
          >
            <BookOpen className="h-3.5 w-3.5" /> Hint
          </Button>
        </div>
        {hintOpen && (
          <p className="mt-3 rounded-[4px] border border-border-soft bg-background p-3 text-xs leading-relaxed text-muted-copy">
            {getGrammarReviewReason(selectedProgress)}
          </p>
        )}
        {quizOpen && (
          <QuizPanel
            quizItems={quizItems}
            quizAnswers={quizAnswers}
            setQuizAnswers={setQuizAnswers}
          />
        )}
      </div>

      {/* Interactive Drill Modes */}
      <InteractiveDrillPanel selectedRule={selectedRule} />

      {/* Export Actions */}
      <ExportPanel selectedRule={selectedRule} />

      <SkillLinksSection skillUse={selectedRule.skillUse} />

      <StatusMessage selectedStatus={selectedStatus} />
    </>
  );
};
