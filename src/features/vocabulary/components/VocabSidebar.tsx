import { useState, useEffect } from 'react';
import { VocabularyMenuService } from '@/features/vocabulary/services/vocabulary.menu';
import { useLearningStore } from '@/core/learning';
import { SkillEntryBrief } from '@/features/learning-orchestrator/SkillEntryBrief';
import { SkillSidebar } from '@/shared/layout/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/shared/layout/sidebar/sidebar.config';

const VOCAB_LEVELS = [
  { id: 'A1', max: 500 },
  { id: 'A2', max: 1200 },
  { id: 'B1', max: 2500 },
  { id: 'B2', max: 4000 },
  { id: 'C1', max: 6000 },
  { id: 'C2', max: 8000 },
];

function getVocabLevel(mastered: number): string {
  for (const lvl of VOCAB_LEVELS) {
    if (mastered <= lvl.max) return lvl.id;
  }
  return 'C2';
}

function VocabLevelGrid({ mastered }: { mastered: number }) {
  const currentLevel = getVocabLevel(mastered);
  return (
    <div className="grid grid-cols-3 gap-2">
      {VOCAB_LEVELS.map((lvl, index) => {
        const isActive = lvl.id === currentLevel;
        const isCompleted = mastered >= lvl.max;
        const prevMax = index === 0 ? 0 : VOCAB_LEVELS[index - 1].max;
        const bracketTotal = lvl.max - prevMax;
        const bracketProgress = Math.max(
          0,
          Math.min(bracketTotal, mastered - prevMax)
        );
        const percent = (bracketProgress / bracketTotal) * 100;
        return (
          <div
            key={lvl.id}
            className={`flex flex-col p-2 rounded-lg border transition-all ${isActive ? 'border-primary bg-primary/5 shadow-sm' : isCompleted ? 'border-success/30 bg-success/5' : 'border-border-soft bg-surface-hover/50'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-foreground'}`}
              >
                {lvl.id}
              </span>
              <span className="text-[10px] text-muted-copy font-medium">
                {lvl.max}
              </span>
            </div>
            <div className="h-1.5 w-full bg-border-soft rounded-full overflow-hidden relative">
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isActive ? 'bg-primary' : isCompleted ? 'bg-success' : 'bg-foreground/30'}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const log = (_page: string, _action: string, _details: string) => {};

export function VocabSidebar() {
  const [v, setV] = useState(() => VocabularyMenuService.getSummary());
  const vocabularyPool = useLearningStore((s) => s.vocabularyPool);

  useEffect(() => {
    const id = setInterval(
      () => setV(VocabularyMenuService.getSummary()),
      5000
    );
    return () => clearInterval(id);
  }, []);

  const config: SidebarConfig = {
    header: <SkillEntryBrief skill="vocabulary" compact={true} />,
    skill: 'vocabulary',
    pathLabel: `Vocabulary · N:${v.newWords} L:${v.learning} M:${v.mastered} W:${v.weak}`,
    pathDescription: 'Learn and review engineering vocabulary.',
    currentLevel: getVocabLevel(v.mastered),
    totalItems: v.total,
    stats: [
      { label: 'New', value: v.newWords, color: 'text-blue-500' },
      { label: 'Learning', value: v.learning, color: 'text-amber-500' },
      { label: 'Mastered', value: v.mastered, color: 'text-green-500' },
      { label: 'Weak', value: v.weak, color: 'text-red-500' },
      { label: 'Forgotten', value: v.forgotten, color: 'text-orange-500' },
      { label: 'Due Today', value: v.dueToday, color: 'text-purple-500' },
      { label: 'In Pool', value: vocabularyPool.length, color: 'text-primary' },
    ],
    progressBars: [
      {
        label: 'Total Mastery',
        value: v.mastered,
        max: v.total,
        color: '#3b82f6',
      },
      { label: 'Learning', value: v.learning, max: v.total, color: '#06b6d4' },
    ],
    actions: [
      {
        icon: '⏰',
        label: `Review ${v.dueToday} due words`,
        onClick: () => {
          log('/vocabulary', 'review', `${v.dueToday} due`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        variant: 'warning',
      },
      {
        icon: '➕',
        label: 'Add custom word',
        onClick: () => {
          document
            .querySelector('input')
            ?.scrollIntoView({ behavior: 'smooth' });
        },
      },
    ],
    custom: <VocabLevelGrid mastered={v.mastered} />,
  };

  return <SkillSidebar config={config} />;
}
