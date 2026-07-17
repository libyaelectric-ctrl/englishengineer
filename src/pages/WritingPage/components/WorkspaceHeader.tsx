import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { WritingHelpers } from '@/features/writing';

interface WorkspaceHeaderProps {
  cefrLevel: string;
  timeSpentSeconds: number;
  currentMissionIndex: number;
  visibleMissionsLength: number;
  onBack: () => void;
  onMove: (offset: number) => void;
}

export const WorkspaceHeader = ({
  cefrLevel,
  timeSpentSeconds,
  currentMissionIndex,
  visibleMissionsLength,
  onBack,
  onMove,
}: WorkspaceHeaderProps) => (
  <div className="flex flex-col gap-4 rounded-xl border border-border-soft bg-surface p-4 md:flex-row md:items-center md:justify-between">
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-xs font-bold text-muted-copy hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back to Writing list</span>
    </button>

    <div className="flex flex-wrap items-center gap-3">
      <span
        className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border ${WritingHelpers.getCefrBadgeStyles(cefrLevel)}`}
      >
        Level: {cefrLevel}
      </span>
      <span className="text-xs font-mono text-muted-copy bg-surface-hover px-3 py-1 rounded border border-border-soft flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-primary" />
        <span>Elapsed: {WritingHelpers.formatTime(timeSpentSeconds)}</span>
      </span>
    </div>

    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => onMove(-1)}
        disabled={currentMissionIndex <= 0}
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </Button>
      <span className="min-w-14 text-center text-xs font-black text-muted-copy">
        {currentMissionIndex + 1}/{visibleMissionsLength}
      </span>
      <Button
        variant="outline"
        onClick={() => onMove(1)}
        disabled={currentMissionIndex >= visibleMissionsLength - 1}
      >
        Next <ChevronRight className="h-4 w-4" />
      </Button>
      <Link
        to="/curriculum"
        className="hidden text-xs font-bold text-primary sm:inline-flex"
      >
        Hub
      </Link>
    </div>
  </div>
);
