import { useState } from 'react';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import {
  VocabularyBadgeService,
  type VocabularyBadge,
  type VocabularyStats,
} from '@/features/vocabulary';

interface BadgePanelProps {
  stats: VocabularyStats;
}

const CATEGORY_LABELS: Record<string, string> = {
  milestone: 'Milestone',
  streak: 'Streak',
  accuracy: 'Accuracy',
  speed: 'Speed',
  mastery: 'Mastery',
};

export function BadgePanel({ stats }: BadgePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const badges = VocabularyBadgeService.checkAndUnlock(stats);
  const unlocked = badges.filter((b) => b.badge.unlockedAt).length;
  const total = badges.length;

  const grouped = badges.reduce(
    (acc, b) => {
      const cat = b.badge.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(b);
      return acc;
    },
    {} as Record<string, typeof badges>
  );

  return (
    <SectionCard
      title="Vocabulary Badges"
      subtitle={`${unlocked} / ${total} unlocked`}
      icon={Award}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-xs font-bold text-muted-copy cursor-pointer"
      >
        <span>{expanded ? 'Hide badges' : 'Show badges'}</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                {CATEGORY_LABELS[category] ?? category}
              </h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {items.map(({ badge, newlyUnlocked }) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    unlocked={!!badge.unlockedAt || newlyUnlocked}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function BadgeCard({
  badge,
  unlocked,
}: {
  badge: VocabularyBadge;
  unlocked: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-[4px] border p-3 text-center transition-colors ${
        unlocked
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-border-soft bg-surface opacity-60'
      }`}
    >
      <span className="text-2xl">{unlocked ? badge.icon : '🔒'}</span>
      <span className="text-[10px] font-bold text-foreground">
        {badge.name}
      </span>
      <span className="text-[9px] text-muted-copy">{badge.description}</span>
      {unlocked ? (
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
      ) : (
        <Lock className="h-3 w-3 text-muted-copy" />
      )}
    </div>
  );
}
