import { Zap, Lock, Info } from 'lucide-react';
import { useVocabularyStore } from '@/features/vocabulary/store/vocabulary.store';
import {
  VocabularyProgressService,
  QUIZ_THRESHOLD,
} from '@/features/vocabulary/services/vocabulary.progress';

interface QuizButtonProps {
  onOpenQuiz: () => void;
  onOpenStrugglingQuiz: () => void;
}

export const QuizButton = ({
  onOpenQuiz,
  onOpenStrugglingQuiz,
}: QuizButtonProps) => {
  const { wordProgress, stats } = useVocabularyStore();
  const learnedCount = stats.learned;
  const strugglingCount = stats.struggling;
  const canStartQuiz = VocabularyProgressService.isQuizReady(learnedCount);
  const learnedWords = Object.values(wordProgress).filter(
    (w) => w.status === 'learned'
  );

  return (
    <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-sm border-b border-border-soft -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-2">
      <div className="flex items-center gap-3">
        {canStartQuiz ? (
          <button
            onClick={onOpenQuiz}
            className="flex items-center gap-1.5 rounded-[4px] bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover"
          >
            <Zap className="h-3 w-3" />
            Quiz ({learnedWords.length} words)
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-[4px] border border-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5">
            <Lock className="h-3 w-3 text-amber-600" />
            <span className="text-[10px] font-bold text-amber-700">
              Locked — Learn {QUIZ_THRESHOLD - learnedCount} more words
            </span>
            <div className="h-1 w-16 rounded-full bg-amber-200 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{
                  width: `${Math.min((learnedCount / QUIZ_THRESHOLD) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {strugglingCount > 0 && (
          <button
            onClick={onOpenStrugglingQuiz}
            className="flex items-center gap-1 rounded-[4px] border border-red-300 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 transition hover:bg-red-100"
          >
            Struggling ({strugglingCount})
          </button>
        )}

        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-copy">
          <Info className="h-3 w-3" />
          {learnedCount}/{QUIZ_THRESHOLD} learned
        </div>
      </div>
    </div>
  );
};
