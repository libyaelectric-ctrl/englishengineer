import { CheckCircle2, Zap } from 'lucide-react';

export interface LessonCompleteScreenProps {
  earnedCp: number;
  correctCount: number;
  totalCount: number;
  onContinue: () => void;
  onBackToRoadmap: () => void;
  translate: (key: string) => string;
}

export const LessonCompleteScreen = ({
  earnedCp,
  correctCount,
  totalCount,
  onContinue,
  onBackToRoadmap,
  translate,
}: LessonCompleteScreenProps) => {
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="mx-auto mt-12 flex w-full max-w-lg flex-col items-center gap-8 rounded-3xl border border-emerald-500/30 bg-emerald-950/30 p-8 text-center font-sans shadow-2xl backdrop-blur animate-in zoom-in-95 fade-in duration-300">
      <div className="flex h-24 w-24 animate-bounce items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-950/50">
        <CheckCircle2 className="h-12 w-12" />
      </div>

      <div className="space-y-2">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
          {translate('lesson.completedBadge')}
        </span>
        <h1 className="text-3xl font-black tracking-tight text-emerald-100">
          {translate('lesson.completedTitle')}
        </h1>
        <p className="text-sm text-emerald-200/80">
          {translate('lesson.completedDesc').replace('{count}', String(totalCount))}
        </p>
      </div>

      <div className="grid w-full max-w-sm grid-cols-2 gap-4">
        <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-yellow-300">
            <Zap className="h-5 w-5 text-yellow-300" />
            <span>+{earnedCp}</span>
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            {translate('lesson.careerPoints')}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-black/40 p-4 text-center">
          <div className="text-2xl font-black text-emerald-400">{accuracy}%</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            {translate('lesson.accuracy')}
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-xl bg-emerald-500 py-3.5 font-extrabold text-slate-950 shadow-lg shadow-emerald-950/50 transition-all hover:bg-emerald-400 active:scale-95"
        >
          {translate('lesson.nextTask')}
        </button>
        <button
          type="button"
          onClick={onBackToRoadmap}
          className="w-full rounded-xl border border-[var(--color-border-soft)] bg-foreground/5 py-3.5 font-bold text-emerald-100 transition-all hover:bg-foreground/10 active:scale-95"
        >
          {translate('lesson.backToRoadmap')}
        </button>
      </div>
    </div>
  );
};