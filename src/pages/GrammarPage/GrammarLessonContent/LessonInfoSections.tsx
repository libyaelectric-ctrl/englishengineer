import { FileText, PenLine } from 'lucide-react';

import { Link } from 'react-router-dom';

import type { GrammarRuleProgress } from '@/features/grammar';
import { getMissingGrammarTransferEvidence } from '@/features/grammar';

import { MasteryPill, SectionHeading } from '../GrammarPageComponents';
import { getPracticeCount, getTransferCount } from '../GrammarPageHelpers';

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

export const StatsGrid = ({
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

export const MasteryBar = ({ selectedProgress }: { selectedProgress: GrammarRuleProgress }) => {
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

export const LinkedVocabularySection = ({
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

export const SkillLinksSection = ({ skillUse }: { skillUse: string[] }) => {
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

const STATUS_MESSAGES: Record<string, string> = {
  New: 'This rule is new. Start practicing to move to Practicing.',
  Practicing: 'Used correctly 1+ times. Keep going to Master.',
  Mastered: 'Congrats! You have mastered this rule.',
  'Needs Reading/Writing': 'Apply this rule in Reading and Writing exercises.',
};

export const StatusMessage = ({ selectedStatus }: { selectedStatus: string }) => {
  const message = STATUS_MESSAGES[selectedStatus];
  if (!message) return null;
  return (
    <div className="rounded-[4px] border border-border-soft bg-surface p-3 text-[10px] text-muted-copy">
      {message}
    </div>
  );
};
