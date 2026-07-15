import {
  Award,
  BookMarked,
  ChevronRight,
  Languages,
  TriangleAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { GrammarProgressSummary } from '@/features/grammar';
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
      tone: 'border-primary/20 bg-primary/5 text-primary',
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
      tone: 'border-indigo-200 bg-indigo-50 text-indigo-700',
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
      tone: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    {
      label: 'Achievements',
      value: `${unlockedBadges}/${badges.length} unlocked`,
      detail: 'Earned only from recorded practice',
      href: '/progress/next-steps',
      icon: Award,
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
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
            className="group flex min-w-0 items-center gap-3 rounded-[14px] border border-border-soft bg-surface p-3.5 transition-colors hover:border-blue-200 hover:bg-blue-50/50"
          >
            <span className={`shrink-0 rounded-[11px] border p-2 ${item.tone}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-muted-copy">
                {item.label}
              </span>
              <span className="mt-0.5 block text-sm font-black text-foreground">
                {item.value}
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-copy">
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
