import {
  Award,
  BookMarked,
  ChevronRight,
  Languages,
  TriangleAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { GrammarProgressSummary } from '@/features/grammar/grammar.progress';
import type { ProfileBadge, VocabularyMemorySummary } from '@/features/profile';

interface LearningMemorySummaryProps {
  vocabulary: VocabularyMemorySummary;
  grammar: GrammarProgressSummary;
  repeatedMistakes: number;
  badges: ProfileBadge[];
}

export const LearningMemorySummary = ({
  vocabulary,
  grammar,
  repeatedMistakes,
  badges,
}: LearningMemorySummaryProps) => {
  const unlockedBadges = badges.filter((badge) => badge.unlocked).length;
  const items = [
    {
      label: 'Vocabulary memory',
      value: `${vocabulary.mastered} mastered`,
      detail:
        vocabulary.dueToday > 0
          ? `${vocabulary.dueToday} due today`
          : 'Review queue is clear',
      href: '/vocabulary',
      icon: BookMarked,
      tone: 'border-[#0047bb]/25 bg-[#0047bb]/5 text-[#0047bb]',
    },
    {
      label: 'Grammar path',
      value: `${grammar.strong} strong rules`,
      detail:
        grammar.due > 0
          ? `${grammar.due} rules due`
          : `${grammar.learning} learning`,
      href: '/grammar',
      icon: Languages,
      tone: 'border-[#0047bb]/25 bg-[#0047bb]/5 text-[#0047bb]',
    },
    {
      label: 'Mistake memory',
      value: `${repeatedMistakes} repeated patterns`,
      detail:
        repeatedMistakes > 0
          ? 'Included in your review plan'
          : 'No repeated pattern yet',
      href: '/progress/next-steps',
      icon: TriangleAlert,
      tone: 'border-rose-500/25 bg-rose-500/5 text-rose-600',
    },
    {
      label: 'Achievements',
      value: `${unlockedBadges}/${badges.length} unlocked`,
      detail: 'Earned only from recorded practice',
      href: '/progress/next-steps',
      icon: Award,
      tone: 'border-emerald-500/25 bg-emerald-500/5 text-emerald-600',
    },
  ] as const;

  return (
    <div className="space-y-3" data-testid="learning-memory-summary">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            to={item.href}
            className="group flex min-w-0 items-center gap-3 rounded-[4px] border border-border-soft bg-surface p-3.5 transition-colors hover:border-[#0047bb]/40 hover:bg-surface-hover shadow-sm"
          >
            <span className={`shrink-0 rounded-[4px] border p-2 ${item.tone}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                {item.label}
              </span>
              <span className="mt-0.5 block text-sm font-bold text-foreground">
                {item.value}
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-copy font-medium">
                {item.detail}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-copy transition-transform group-hover:translate-x-0.5" />
          </Link>
        );
      })}
    </div>
  );
};
