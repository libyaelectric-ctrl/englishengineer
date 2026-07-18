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

const cefrBarColor = (level: string) =>
  level.startsWith('A') ? '#3b82f6' : level.startsWith('B') ? '#f59e0b' : '#10b981';

const difficultyBadgeClass = (color: string) =>
  color === 'rose'
    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    : color === 'amber'
      ? 'bg-warning/10 text-warning border-warning/20'
      : 'bg-success/10 text-success border-success/20';

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
      className={`group relative rounded-[4px] border bg-white p-5 transition-all duration-200 hover:border-[#0047bb]/30 hover:shadow-md ${
        isCompleted ? 'border-success/20' : 'border-[#d9d9e3]'
      }`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[4px]"
        style={{ background: cefrBarColor(m.cefrLevel) }}
      />
      <div className="flex flex-col h-full justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-[4px] border uppercase tracking-wider ${ReadingHelpers.getCefrBadgeStyles(m.cefrLevel)}`}
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
              className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-[4px] uppercase tracking-wider ${difficultyBadgeClass(difficultyColor)}`}
            >
              {m.difficulty}
            </span>
            <span className="text-[10px] font-mono text-muted-copy ml-auto flex items-center gap-1 font-bold">
              <Clock className="h-3 w-3 text-muted-copy" /> {m.estimatedMinutes}
              M
            </span>
            <button
              type="button"
              onClick={() => onToggleBookmark(m.id)}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              className="ml-1 shrink-0 p-1 rounded-[4px] transition-colors hover:bg-surface-hover cursor-pointer"
            >
              <Bookmark
                className={`h-4 w-4 ${isBookmarked ? 'fill-[#0047bb] text-[#0047bb]' : 'text-muted-copy'}`}
              />
            </button>
          </div>

          <div>
            <h4 className="text-base font-bold text-foreground group-hover:text-[#0047bb] transition-colors tracking-tight">
              {m.title}
            </h4>
            <p className="text-xs text-muted-copy mt-1 line-clamp-2 leading-relaxed font-normal">
              {m.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#d9d9e3]">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold font-mono bg-[#f3f3fd] border border-[#d9d9e3] text-muted-copy px-2 py-1 rounded-[4px] uppercase tracking-wider">
              {m.discipline}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="flex items-center gap-1.5 text-xs text-success font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Score: {bestScore}%</span>
              </div>
            ) : (
              <span className="text-[9px] font-bold font-mono text-muted-copy uppercase tracking-wider">
                Available
              </span>
            )}

            <Button
              onClick={() => onLaunch(m.id)}
              className={`h-8 px-3.5 rounded-[4px] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
                isCompleted
                  ? 'border border-[#d9d9e3] bg-white text-foreground hover:bg-[#0047bb]/5'
                  : 'bg-[#0047bb] hover:bg-[#0047bb]/90 text-white border border-[#0047bb]'
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
