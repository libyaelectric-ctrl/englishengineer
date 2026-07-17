import { Bookmark, CheckCircle2, Clock, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { ReadingHelpers } from '@/features/reading';
import {
  getContentAccessLabel,
  LevelAccessBadge,
  type CefrLevel,
} from '@/features/level-system';

interface ReadingMissionCardProps {
  mission: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    cefrLevel: string;
    discipline: string;
    estimatedMinutes: number;
  };
  isCompleted: boolean;
  bestScore: number | undefined;
  currentLevel: string;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onLaunch: (id: string) => void;
}

export function ReadingMissionCard({
  mission: m,
  isCompleted,
  bestScore,
  currentLevel,
  isBookmarked,
  onToggleBookmark,
  onLaunch,
}: ReadingMissionCardProps) {
  const difficultyColor = ReadingHelpers.getDifficultyColor(m.difficulty);

  return (
    <div
      id={`reading-card-${m.id}`}
      className={`group relative rounded-xl border bg-surface p-5 transition-all duration-200 hover:-translate-y-px hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm ${
        isCompleted ? 'border-success/20' : 'border-border-soft'
      }`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{
          background: m.cefrLevel.startsWith('A')
            ? '#3b82f6'
            : m.cefrLevel.startsWith('B')
              ? '#f59e0b'
              : '#10b981',
        }}
      />
      <div className="flex flex-col h-full justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded border ${ReadingHelpers.getCefrBadgeStyles(m.cefrLevel)}`}
            >
              {m.cefrLevel}
            </span>
            <LevelAccessBadge
              label={getContentAccessLabel(
                m.cefrLevel as CefrLevel,
                currentLevel as CefrLevel
              )}
            />
            <span
              className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded uppercase ${
                difficultyColor === 'rose'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : difficultyColor === 'amber'
                    ? 'bg-warning/10 text-warning border-warning/20'
                    : 'bg-success/10 text-success border-success/20'
              }`}
            >
              {m.difficulty}
            </span>
            <span className="text-[10px] font-mono text-muted-copy ml-auto flex items-center gap-1">
              <Clock className="h-3 w-3" /> {m.estimatedMinutes}m
            </span>
            <button
              type="button"
              onClick={() => onToggleBookmark(m.id)}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              className="ml-1 shrink-0 p-1 rounded transition-colors hover:bg-surface-hover"
            >
              <Bookmark
                className={`h-4 w-4 ${isBookmarked ? 'fill-foreground text-foreground' : 'text-muted-copy'}`}
              />
            </button>
          </div>

          <div>
            <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
              {m.title}
            </h4>
            <p className="text-xs text-muted-copy mt-1 line-clamp-2 leading-relaxed">
              {m.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border-soft">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium font-mono bg-surface-hover border border-border-soft text-muted-copy px-2 py-1 rounded">
              {m.discipline}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="flex items-center gap-1.5 text-xs text-success font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>Score: {bestScore}%</span>
              </div>
            ) : (
              <span className="text-[10px] font-medium font-mono text-muted-copy uppercase">
                Available
              </span>
            )}

            <Button
              onClick={() => onLaunch(m.id)}
              className={`h-8 px-3 rounded-lg font-medium text-xs flex items-center gap-1 ${
                isCompleted
                  ? 'border border-border-soft bg-surface text-foreground hover:bg-primary/5'
                  : 'bg-primary hover:bg-primary/90 text-white font-medium'
              }`}
            >
              {isCompleted ? (
                <RefreshCw className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3 fill-white" />
              )}
              <span>{isCompleted ? 'Retry' : 'Begin'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
