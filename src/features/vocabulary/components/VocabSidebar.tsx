import { SkillSidebar } from '@/layouts/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/layouts/sidebar/sidebar.config';
import { Plus, RefreshCw } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useLocalizationStore } from '@/features/localization';
import { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';
import { interpolate } from '@/features/localization/interpolate';
import { STORAGE_CHANGE_EVENT } from '@/shared/storage';

import { SkillEntryBrief } from '@/features/learning-orchestrator';
import {
  VocabularyMenuService,
  type VocabularyMenuState,
} from '@/features/vocabulary/services/core/vocabulary.menu';

const VOCAB_LEVELS = [
  { id: 'A1', max: 500 },
  { id: 'A2', max: 1200 },
  { id: 'B1', max: 2500 },
  { id: 'B2', max: 4000 },
  { id: 'C1', max: 6000 },
  { id: 'C2', max: 8000 },
];

function getVocabLevel(mastered: number): string {
  for (const level of VOCAB_LEVELS) {
    if (mastered <= level.max) return level.id;
  }
  return 'C2';
}

function VocabLevelGrid({ mastered }: { mastered: number }) {
  const currentLevel = getVocabLevel(mastered);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {VOCAB_LEVELS.map((level, index) => {
        const isActive = level.id === currentLevel;
        const isCompleted = mastered >= level.max;
        const previousMax = index === 0 ? 0 : VOCAB_LEVELS[index - 1].max;
        const bracketTotal = level.max - previousMax;
        const bracketProgress = Math.max(0, Math.min(bracketTotal, mastered - previousMax));
        const percent = (bracketProgress / bracketTotal) * 100;
        return (
          <div
            key={level.id}
            className={`flex flex-col rounded-[var(--radius-card)] border p-2 transition-all ${isActive ? 'border-primary bg-primary/5 shadow-sm' : isCompleted ? 'border-success/30 bg-success/5' : 'border-border-soft bg-surface-hover/50'}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className={`text-xs font-bold ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-foreground'}`}
              >
                {level.id}
              </span>
              <span className="text-[10px] font-medium text-muted-copy">{level.max}</span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border-soft">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${isActive ? 'bg-primary' : isCompleted ? 'bg-success' : 'bg-foreground/30'}`}
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

const getStatusCount = (
  state: VocabularyMenuState,
  status: 'Learning' | 'Learned' | 'Mastered' | 'Struggling'
): number => Object.values(state.progress).filter((word) => word.status === status).length;

export function VocabSidebar() {
  const [menuState, setMenuState] = useState(() => VocabularyMenuService.getState());
  const language = useLocalizationStore((s) => s.language);
  const copy = SIDEBAR_SKILL_COPY[language] ?? SIDEBAR_SKILL_COPY.en;
  const summary = VocabularyMenuService.getSummary(menuState);
  const learned = getStatusCount(menuState, 'Learned');
  const struggling = getStatusCount(menuState, 'Struggling');

  useEffect(() => {
    const syncVocabularySummary = (event: Event) => {
      const { detail } = event as CustomEvent<{ key: string }>;
      if (detail.key === 'EngVox_vocabulary_menu') {
        setMenuState(VocabularyMenuService.getState());
      }
    };
    window.addEventListener(STORAGE_CHANGE_EVENT, syncVocabularySummary);
    return () => window.removeEventListener(STORAGE_CHANGE_EVENT, syncVocabularySummary);
  }, []);

  const config: SidebarConfig = {
    header: <SkillEntryBrief skill="vocabulary" compact={true} />,
    skill: 'vocabulary',
    pathLabel: interpolate(copy.vocabPath, {
      learned,
      mastered: summary.mastered,
      struggling,
    }),
    pathDescription: copy.vocabDesc,
    currentLevel: getVocabLevel(summary.mastered),
    totalItems: summary.total,
    stats: [
      { label: copy.vocabNew, value: summary.newWords, color: 'text-blue-500' },
      { label: copy.vocabLearned, value: learned, color: 'text-cyan-500' },
      { label: copy.vocabMastered, value: summary.mastered, color: 'text-green-500' },
      { label: copy.vocabStruggling, value: struggling, color: 'text-red-500' },
      { label: copy.dueToday, value: summary.dueToday, color: 'text-purple-500' },
    ],
    progressBars: [
      {
        label: copy.totalMastery,
        value: summary.mastered,
        max: summary.total,
        color: '#3b82f6',
      },
      {
        label: copy.vocabLearned,
        value: learned,
        max: summary.total,
        color: '#06b6d4',
      },
    ],
    actions: [
      {
        icon: RefreshCw,
        label: interpolate(copy.reviewDue, { count: summary.dueToday }),
        onClick: () => {
          log('/vocabulary', 'review', `${summary.dueToday} due`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        variant: 'warning',
      },
      {
        icon: Plus,
        label: copy.addCustomWord,
        onClick: () => {
          document.querySelector('input')?.scrollIntoView({ behavior: 'smooth' });
        },
      },
    ],
    custom: <VocabLevelGrid mastered={summary.mastered} />,
  };

  return <SkillSidebar config={config} />;
}
