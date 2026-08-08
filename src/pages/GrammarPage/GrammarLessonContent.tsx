import { BookOpen, CheckCircle2, HelpCircle, Target, TriangleAlert } from 'lucide-react';

import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/Button';

import {
  type ChatMessage,
  type GrammarRuleProgress,
  GrammarTeacherService,
  getGrammarReviewReason,
} from '@/features/grammar';
import { useGrammarTranslation } from '@/features/ai/useGrammarTranslation';

import { ExportPanel } from './GrammarLessonContent/ExportPanel';
import { InteractiveDrillPanel } from './GrammarLessonContent/InteractiveDrillPanel';
import { ChatPanel, QuizPanel } from './GrammarLessonContent/LessonActionPanels';
import { LessonHeader } from './GrammarLessonContent/LessonHeader';
import {
  LinkedVocabularySection,
  MasteryBar,
  SkillLinksSection,
  StatsGrid,
  StatusMessage,
} from './GrammarLessonContent/LessonInfoSections';
import type { QuizItem, Rule } from './GrammarLessonContent/types';
import { LessonBlock, SectionHeading } from './GrammarPageComponents';
import { compact } from './GrammarPageHelpers';

export type { Rule, QuizItem };

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

  const ruleForTranslation = selectedRule
    ? {
        id: selectedRule.id,
        title: selectedRule.title,
        explanation: selectedRule.explanation,
        structure: selectedRule.structure,
        engineeringUseCase: selectedRule.engineeringUseCase,
        turkishExplanation: selectedRule.turkishExplanation,
        badExampleTurkishExplanation: selectedRule.badExampleTurkishExplanation,
        examples: selectedRule.examples,
      }
    : null;

  const { translation: grammarTranslation, language: grammarLanguage } =
    useGrammarTranslation(ruleForTranslation, { enableAiFallback: true });

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
        body={`Practice how to "${selectedRule.languageFunction.toLowerCase()}" in an engineering context: "${grammarTranslation?.engineeringUseCase ?? selectedRule.engineeringUseCase}" using the structure "${selectedRule.structure}".`}
      />

      <LinkedVocabularySection linkedVocabulary={linkedVocabulary} />

      <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
        <SectionHeading
          title={grammarTranslation?.title ? `Teacher Explanation — ${grammarTranslation.title}` : 'Teacher Explanation'}
        />
        <p className="mt-2 text-xs leading-relaxed">
          {compact(selectedRule.explanation, selectedRule.definition)}
        </p>
        {grammarTranslation && grammarLanguage !== 'en' && (
          <p className="mt-2 rounded-[4px] border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed text-primary">
            {grammarLanguage === 'tr' ? 'Türkçe açıklama:' : `${grammarLanguage.toUpperCase()} açıklama:`} {grammarTranslation.explanation}
          </p>
        )}
        {grammarLanguage === 'tr' && (
          <p className="mt-2 rounded-[4px] border border-border-soft bg-background p-3 text-xs leading-relaxed text-muted-copy">
            Turkish speaker note: {selectedRule.turkishExplanation}
          </p>
        )}
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
          {(grammarTranslation?.examples ?? selectedRule.examples).map((example, index) => (
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
          Common Mistake
        </p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <div>
            <p className="break-words text-xs font-bold text-rose-900">
              {selectedRule.badExampleEnglish}
            </p>
            <p className="mt-1 break-words text-xs leading-relaxed text-rose-800">
              {grammarLanguage !== 'en' && grammarTranslation?.badExampleTurkishExplanation
                ? grammarTranslation.badExampleTurkishExplanation
                : selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes}
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

      <InteractiveDrillPanel selectedRule={selectedRule} />

      <ExportPanel selectedRule={selectedRule} />

      <SkillLinksSection skillUse={selectedRule.skillUse} />

      <StatusMessage selectedStatus={selectedStatus} />
    </>
  );
};
