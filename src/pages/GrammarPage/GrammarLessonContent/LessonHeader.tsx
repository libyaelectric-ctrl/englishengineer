import { Star } from 'lucide-react';

import { useEffect, useState } from 'react';

import { logger } from '@/shared/logger';

import type { Rule } from './types';

export const LessonHeader = ({
  selectedModule,
  selectedRule,
  selectedStatus,
}: {
  selectedModule: string;
  selectedRule: Rule;
  selectedStatus: string;
}) => {
  const STATUS_BADGE_STYLES: Record<string, string> = {
    Mastered: 'border-yellow-400/40 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700',
    Learned: 'border-green-400/40 bg-green-50 dark:bg-green-900/20 text-green-700',
    Learning: 'border-yellow-300/40 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600',
    Struggling: 'border-red-400/40 bg-red-50 dark:bg-red-900/20 text-red-700',
  };
  const DEFAULT_BADGE_STYLE = 'border-border-soft bg-surface-hover text-muted-copy';
  const badgeStyle = STATUS_BADGE_STYLES[selectedStatus] ?? DEFAULT_BADGE_STYLE;

  const STATUS_HINTS: Record<string, { text: string; className?: string }> = {
    Learning: { text: '1 correct → Learned' },
    Learned: { text: '3 correct → Mastered' },
    Struggling: { text: 'Review this rule!', className: 'text-red-500' },
  };
  const hint = STATUS_HINTS[selectedStatus];
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('EngVox_favorite_grammar');
      if (stored) {
        const list: string[] = JSON.parse(stored);
        setIsStarred(list.includes(selectedRule.id));
      }
    } catch (e) {
      logger.w('[LessonHeader] Failed to read favorite grammar from localStorage', e);
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
    } catch (e) {
      logger.w('[LessonHeader] Failed to write favorite grammar to localStorage', e);
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
            {selectedStatus === 'Mastered' && (
              <Star
                className="mr-1 inline h-3 w-3 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
            )}
            {selectedStatus}
          </span>
          {hint && (
            <span className={`text-[10px] ${hint.className ?? 'text-muted-copy'}`}>
              {hint.text}
            </span>
          )}
        </div>
      </div>

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

function compact(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' — ');
}
