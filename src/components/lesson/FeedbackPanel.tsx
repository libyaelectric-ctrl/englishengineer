import React from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface FeedbackPanelProps {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
  onNext: () => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  isCorrect,
  correctAnswer,
  explanation,
  onNext,
}) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 p-4 sm:p-6 border-t-2 shadow-2xl transition-all duration-300 animate-slide-up z-50 ${
        isCorrect
          ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100 backdrop-blur-md'
          : 'bg-rose-950/90 border-rose-500 text-rose-100 backdrop-blur-md'
      }`}
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4 w-full sm:w-auto">
          {isCorrect ? (
            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 className="h-8 w-8 animate-bounce" />
            </div>
          ) : (
            <div className="p-2 rounded-full bg-rose-500/20 text-rose-400 shrink-0">
              <XCircle className="h-8 w-8" />
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-wide">
              {isCorrect ? 'Tebrikler! Doğru Cevap 🎉' : 'Doğru Yanıt:'}
            </h3>
            {!isCorrect && (
              <p className="text-lg font-bold text-rose-300 font-mono underline decoration-rose-400 decoration-2">
                {correctAnswer}
              </p>
            )}
            {explanation && (
              <p className="text-sm opacity-90 text-slate-200 mt-1 max-w-xl">{explanation}</p>
            )}
          </div>
        </div>

        <button
          onClick={onNext}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 shrink-0 ${
            isCorrect
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-900/50'
              : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-900/50'
          }`}
        >
          <span>DEVAM ET</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
