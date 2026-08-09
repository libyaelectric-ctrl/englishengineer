import { BookMarked, BookOpen, Headphones, Mic2, PenTool } from 'lucide-react';

import { Link } from 'react-router-dom';

import { useContentPool } from '@/shared/hooks/useContentPool';

import { useLocalizationStore } from '@/features/localization';

interface ContentPoolWidgetProps {
  discipline: string;
}

const SKILL_LINKS = [
  {
    key: 'vocabulary',
    path: '/vocabulary',
    icon: BookMarked,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    key: 'reading',
    path: '/reading',
    icon: BookOpen,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'writing',
    path: '/writing',
    icon: PenTool,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    key: 'listening',
    path: '/listening',
    icon: Headphones,
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },
  {
    key: 'speaking',
    path: '/speaking',
    icon: Mic2,
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
];

export const ContentPoolWidget = ({ discipline }: ContentPoolWidgetProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  const { data, isLoading, error } = useContentPool({ discipline: discipline as never });

  if (isLoading) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5 shadow-sm animate-pulse">
        <div className="h-5 w-40 bg-surface-hover rounded mb-3" />
        <div className="h-8 w-32 bg-surface-hover rounded mb-4" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-hover rounded-[var(--radius-card)]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[var(--radius-card)] border border-error/20 bg-error/5 p-5 shadow-sm">
        <p className="text-sm text-error font-bold">
          {translate('dashboard.contentError') ?? 'Unable to load content'}
        </p>
      </div>
    );
  }

  const skillCounts = {
    vocabulary: data.vocabulary.length,
    reading: data.readings.length,
    writing: data.writings.length,
    listening: data.listenings.length,
    speaking: data.speakings.length,
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5 shadow-sm space-y-4">
      <div>
        <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
          {translate('dashboard.yourPool') ?? 'Your Content Pool'}
        </p>
        <p className="text-2xl font-extrabold text-foreground mt-1">
          {data.totalCount.toLocaleString()}+ {translate('dashboard.items') ?? 'items'}
        </p>
        <p className="text-xs text-muted-copy mt-1">
          {translate('dashboard.domains') ?? 'Domains:'} {data.domains.join(' + ')}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {SKILL_LINKS.map((skill) => (
          <Link
            key={skill.key}
            to={skill.path}
            className={`flex flex-col items-center gap-1.5 rounded-[var(--radius-card)] border p-3 transition-all hover:shadow-sm hover:scale-[1.02] ${skill.color}`}
          >
            <skill.icon className="h-5 w-5" />
            <span className="text-lg font-extrabold">
              {skillCounts[skill.key as keyof typeof skillCounts]}
            </span>
            <span className="text-[9px] font-semibold capitalize">{skill.key}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ContentPoolWidget;
