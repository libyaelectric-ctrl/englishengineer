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

const LessonHeader = ({
  selectedModule,
  selectedRule,
  selectedStatus,
}: {
  selectedModule: string;
  selectedRule: Rule;
  selectedStatus: string;
}) => (
  <div className="min-w-0 rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#0047bb]">{selectedModule}</p>
        <h2 className="mt-0.5 break-words text-base font-bold">{selectedRule.ruleTitle || selectedRule.title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-copy">{compact(selectedRule.engineeringUseCase, selectedRule.languageFunction)}</p>
      </div>
      <span className={`shrink-0 whitespace-nowrap rounded-[4px] border font-bold px-3 py-1 text-[10px] uppercase tracking-wider ${selectedStatus === 'Mastered' ? 'border-success/30 bg-success/5 text-success' : selectedStatus === 'Needs Reading/Writing' ? 'border-warning/30 bg-warning/5 text-warning' : selectedStatus === 'Practicing' ? 'border-[#0047bb]/25 bg-[#0047bb]/5 text-[#0047bb]' : 'border-[#d9d9e3] bg-[#f3f3fd] text-muted-copy'}`}>
        {selectedStatus}
      </span>
    </div>
  </div>
);

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
    {([
      ['This Level', rules.length],
      ['Total Map', totalGrammarLessons],
      ['Mastered', masteredCount],
      ['Pool', grammarPoolIds.length],
    ] as const).map(([label, value]) => (
      <div key={label} className="rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-center shadow-sm">
        <p className="text-base font-bold text-foreground">{value}</p>
        <p className="text-[10px] font-bold uppercase text-muted-copy">{label}</p>
      </div>
    ))}
  </div>
);

const MasteryBar = ({
  selectedProgress,
}: {
  selectedProgress: GrammarRuleProgress;
}) => {
  const missing = getMissingGrammarTransferEvidence(selectedProgress);

  return (
    <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-copy">Mastery</p>
        <div className="flex flex-wrap items-center gap-2">
          <MasteryPill label="Practice" value={`${getPracticeCount(selectedProgress)}/3`} complete={getPracticeCount(selectedProgress) >= 3} />
          <MasteryPill label="Reading" value={selectedProgress.skillEvidence.reading ? `${selectedProgress.skillEvidence.reading.score}%` : 'Missing'} complete={Boolean(selectedProgress.skillEvidence.reading)} />
          <MasteryPill label="Writing" value={selectedProgress.skillEvidence.writing ? `${selectedProgress.skillEvidence.writing.score}%` : 'Missing'} complete={Boolean(selectedProgress.skillEvidence.writing)} />
          <MasteryPill label="R/W" value={`${getTransferCount(selectedProgress)}/2`} complete={getTransferCount(selectedProgress) >= 2} />
        </div>
        {missing.length > 0 && (
          <span className="rounded-[4px] border border-warning/30 bg-warning/5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning">
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
  <div className="rounded-[4px] border border-[#0047bb]/25 bg-white p-4 shadow-sm">
    <SectionHeading title="AI Grammar Teacher" subtitle="Practice, translate, and chat with your bilingual engineering English tutor" />
    <div className="mt-3 flex max-h-80 min-h-40 flex-col gap-2.5 overflow-y-auto rounded-[4px] border border-[#d9d9e3] bg-background p-3">
      {messages.map((msg, i) => (
        <div key={i} className={cn('flex flex-col max-w-[85%] rounded-[4px] p-3 text-xs leading-relaxed', msg.role === 'assistant' ? 'bg-[#0047bb]/5 text-foreground border border-[#0047bb]/10 mr-auto' : 'bg-foreground text-background ml-auto')}>
          <p className="font-bold text-[10px] uppercase opacity-60 mb-1">{msg.role === 'assistant' ? 'AI Teacher 🎓' : 'You 💻'}</p>
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
      ))}
      {isTalking && (
        <div className="flex flex-col max-w-[85%] rounded-[4px] p-3 text-xs bg-[#0047bb]/5 text-foreground border border-[#0047bb]/10 mr-auto animate-pulse">
          <p className="font-bold text-[10px] uppercase opacity-60 mb-1">AI Teacher 🎓</p>
          <p>Thinking and explaining...</p>
        </div>
      )}
    </div>
    <div className="mt-3 flex gap-2">
      <label className="flex-1">
        <span className="sr-only">Chat with AI Grammar Teacher</span>
        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} disabled={isTalking} placeholder="Type your reply, translation effort, or question..." className="w-full rounded-[4px] border border-[#d9d9e3] bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-[#0047bb]" />
      </label>
      <Button onClick={handleSend} disabled={!chatInput.trim() || isTalking} aria-label="Send message" className="rounded-[4px]">
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
  <div className="mt-3 space-y-3 rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-3">
    {quizItems.map((item, qi) => (
      <div key={item.question}>
        <p className="text-xs font-bold">{qi + 1}. {item.question}</p>
        <div className="mt-1.5 grid gap-1.5">
          {item.choices.map((choice, ci) => {
            const letter = String.fromCharCode(65 + ci);
            const selected = quizAnswers[qi] === letter;
            const revealed = Object.keys(quizAnswers).length === 3;
            const correct = ci === item.correct;
            return (
              <button key={`${item.question}-${choice}`} type="button" disabled={revealed} onClick={() => setQuizAnswers((prev) => ({ ...prev, [qi]: letter }))} className={`break-words rounded-[4px] border p-2 text-left text-[11px] font-semibold transition-colors cursor-pointer ${revealed ? (correct ? 'border-success bg-success/10 text-success' : selected ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-[#d9d9e3] bg-white opacity-60') : (selected ? 'border-[#0047bb] bg-[#0047bb] text-white' : 'border-[#d9d9e3] bg-white text-foreground hover:border-[#0047bb]/30 hover:bg-[#0047bb]/5')}`}>
                <span className="mr-1.5 font-black">{letter}.</span>{choice}
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

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
      <LessonHeader selectedModule={selectedModule} selectedRule={selectedRule} selectedStatus={selectedStatus} />
      <StatsGrid rules={rules} totalGrammarLessons={totalGrammarLessons} masteredCount={masteredCount} grammarPoolIds={grammarPoolIds} />
      <MasteryBar selectedProgress={selectedProgress} />
      <LessonBlock icon={Target} title="Lesson Objective" body={`Practice how to "${selectedRule.languageFunction.toLowerCase()}" in an engineering context: "${selectedRule.engineeringUseCase}" using the structure "${selectedRule.structure}".`} />

      {linkedVocabulary.length > 0 && (
        <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
          <SectionHeading title="Words You Will Use Today" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {linkedVocabulary.map((item) => (
              <span key={`${item.tag}-${item.term}`} className="rounded-[4px] border border-success/30 bg-success/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">{item.term}</span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
        <SectionHeading title="Teacher Explanation" />
        <p className="mt-2 text-xs leading-relaxed">{compact(selectedRule.explanation, selectedRule.definition)}</p>
        <p className="mt-2 rounded-[4px] border border-[#d9d9e3] bg-background p-3 text-xs leading-relaxed text-muted-copy">Turkish speaker note: {selectedRule.turkishExplanation}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[4px] border border-[#0047bb]/25 bg-[#f3f3fd] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#0047bb]">Structure</p>
          <p className="mt-2 break-words font-mono text-sm font-bold text-[#0047bb]">{selectedRule.structure}</p>
          <p className="mt-2 break-words text-xs text-muted-copy">Target output: {selectedRule.minimumUserOutput}</p>
        </div>
        <div className="rounded-[4px] border border-warning/30 bg-warning/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-warning">Guided Practice</p>
          <p className="mt-2 break-words text-xs font-bold leading-relaxed">{selectedRule.taskPromptTemplate}</p>
        </div>
      </div>

      <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
        <SectionHeading title="Examples" subtitle="Read the pattern before you try to produce it." />
        <div className="mt-2 grid gap-2">
          {selectedRule.examples.map((example, index) => (
            <div key={`${example.english}-${index}`} className="rounded-[4px] border border-[#d9d9e3] bg-background p-3">
              <p className="break-words text-xs font-bold">{example.english}</p>
              <p className="mt-0.5 break-words text-[11px] text-muted-copy">{example.turkish}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[4px] border border-rose-200 bg-rose-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700">Common Turkish Mistake</p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <div>
            <p className="break-words text-xs font-bold text-rose-900">{selectedRule.badExampleEnglish}</p>
            <p className="mt-1 break-words text-xs leading-relaxed text-rose-800">{selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes}</p>
          </div>
          <div className="rounded-[4px] border border-success/30 bg-white p-3 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-success">Better</p>
            <p className="mt-1 break-words text-xs font-bold">{selectedRule.correctedExampleEnglish}</p>
          </div>
        </div>
      </div>

      <ChatPanel messages={messages} chatInput={chatInput} isTalking={isTalking} setChatInput={setChatInput} handleSend={handleSend} />

      <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
        <SectionHeading title="Practice & Evaluation" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button onClick={() => recordUsage(true)} className="rounded-[4px]"><CheckCircle2 className="h-3.5 w-3.5" /> Used Correctly</Button>
          <Button variant="outline" onClick={() => recordUsage(false)} className="rounded-[4px]"><TriangleAlert className="h-3.5 w-3.5" /> Needs Review</Button>
          <Button variant="outline" className="rounded-[4px]" onClick={() => { setQuizOpen((o) => !o); setQuizAnswers(() => ({})); }}><HelpCircle className="h-3.5 w-3.5" /> Mini Quiz</Button>
          <Button variant="outline" onClick={() => setHintOpen((v) => !v)} className="rounded-[4px]"><BookOpen className="h-3.5 w-3.5" /> Hint</Button>
        </div>
        {hintOpen && <p className="mt-3 rounded-[4px] border border-[#d9d9e3] bg-background p-3 text-xs leading-relaxed text-muted-copy">{getGrammarReviewReason(selectedProgress)}</p>}
        {quizOpen && <QuizPanel quizItems={quizItems} quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers} />}
      </div>

      {linkedVocabulary.length > 0 && (
        <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
          <SectionHeading title="Use It in Skills" subtitle="Use this lesson in Reading and Writing to prove mastery." />
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedRule.skillUse.includes('reading') && <Link to="/reading" className="inline-flex min-h-8 items-center gap-1.5 rounded-[4px] border border-[#d9d9e3] bg-background px-3 text-xs font-bold hover:border-[#0047bb]/40 cursor-pointer"><FileText className="h-3 w-3" /> Reading</Link>}
            {selectedRule.skillUse.includes('writing') && <Link to="/writing" className="inline-flex min-h-8 items-center gap-1.5 rounded-[4px] border border-[#d9d9e3] bg-background px-3 text-xs font-bold hover:border-[#0047bb]/40 cursor-pointer"><PenLine className="h-3 w-3" /> Writing</Link>}
          </div>
        </div>
      )}
    </>
  );
};
