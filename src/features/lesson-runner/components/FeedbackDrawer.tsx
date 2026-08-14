import { ArrowRight, CheckCircle2, Lightbulb, XCircle } from 'lucide-react';

import { useLocalizationStore } from '@/features/localization';

export interface FeedbackDrawerProps {
  isCorrect: boolean;
  correctAnswer?: string;
  tip?: string;
  onContinue: () => void;
  continueText?: string;
}

export const FeedbackDrawer = ({
  isCorrect,
  correctAnswer,
  tip,
  onContinue,
  continueText,
}: FeedbackDrawerProps) => {
  const translate = useLocalizationStore((state) => state.translate);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t p-6 shadow-2xl transition-all animate-in slide-in-from-bottom duration-300 ${
        isCorrect
          ? 'border-emerald-500/30 bg-emerald-950/95 text-emerald-100 backdrop-blur-xl'
          : 'border-rose-500/30 bg-rose-950/95 text-rose-100 backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {isCorrect ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-7 w-7" />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <XCircle className="h-7 w-7" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-black tracking-tight">
              {isCorrect ? translate('lesson.correctTitle') : translate('lesson.incorrectTitle')}
            </h3>
            {!isCorrect && correctAnswer && (
              <p className="mt-1 text-sm text-rose-200/90">
                {translate('lesson.correctAnswer')}{' '}
                <span className="font-bold underline decoration-rose-400/50">{correctAnswer}</span>
              </p>
            )}
            {tip && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-300/80">
                <Lightbulb className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
                <span>{tip}</span>
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className={`flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-extrabold tracking-wide transition-all shadow-lg hover:scale-105 active:scale-95 ${
            isCorrect
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-950/50'
              : 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-950/50'
          }`}
        >
          <span>{continueText || translate('lesson.continue')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};