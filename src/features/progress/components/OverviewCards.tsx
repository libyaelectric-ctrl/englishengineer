import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Headphones, Mic, PenLine, BookMarked } from 'lucide-react';

const MODULES = [
  { key: 'vocabulary', label: 'Vocabulary', icon: BookMarked, href: '/vocabulary', color: '#0047bb' },
  { key: 'grammar', label: 'Grammar', icon: GraduationCap, href: '/grammar', color: '#8b5cf6' },
  { key: 'reading', label: 'Reading', icon: BookOpen, href: '/reading', color: '#10b981' },
  { key: 'writing', label: 'Writing', icon: PenLine, href: '/writing', color: '#f59e0b' },
  { key: 'listening', label: 'Listening', icon: Headphones, href: '/listening', color: '#ef4444' },
  { key: 'speaking', label: 'Speaking', icon: Mic, href: '/speaking', color: '#ec4899' },
];

interface OverviewCardsProps {
  overview: Record<string, { total: number; learned?: number; mastered?: number; completed?: number; submitted?: number }>;
}

export const OverviewCards = ({ overview }: OverviewCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {MODULES.map((mod) => {
      const data = overview[mod.key] || { total: 0 };
      const done = data.learned ?? data.mastered ?? data.completed ?? data.submitted ?? 0;
      const pct = data.total > 0 ? Math.round((done / data.total) * 100) : 0;
      return (
        <Link
          key={mod.key}
          to={mod.href}
          className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-4 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-border-soft bg-background">
              <mod.icon className="h-3.5 w-3.5" style={{ color: mod.color }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">{mod.label}</span>
          </div>
          <div className="h-1.5 rounded-full bg-border-soft overflow-hidden mb-2">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: mod.color }} />
          </div>
          <p className="text-[10px] text-muted-copy">{done}/{data.total} ({pct}%)</p>
        </Link>
      );
    })}
  </div>
);
