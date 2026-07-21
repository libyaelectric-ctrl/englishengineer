import { Zap, Lock } from 'lucide-react';
import { useVocabularyStore } from '@/features/vocabulary/store/vocabulary.store';
import { VocabularyProgressService, QUIZ_THRESHOLD } from '@/features/vocabulary/services/vocabulary.progress';

interface QuizButtonProps {
  onOpenQuiz: () => void;
  onOpenStrugglingQuiz: () => void;
}

export const QuizButton = ({ onOpenQuiz, onOpenStrugglingQuiz }: QuizButtonProps) => {
  const { wordProgress, stats } = useVocabularyStore();
  const learnedCount = stats.learned;
  const strugglingCount = stats.struggling;
  const canStartQuiz = VocabularyProgressService.isQuizReady(learnedCount);
  const learnedWords = Object.values(wordProgress).filter((w) => w.status === 'learned');

  return (
    <div className="flex items-center gap-2">
      {canStartQuiz ? (
        <button
          onClick={onOpenQuiz}
          className="flex items-center gap-1.5 rounded-[4px] bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover"
        >
          <Zap className="h-3 w-3" />
          Quiz ({learnedWords.length})
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-[4px] border border-border-soft bg-surface px-3 py-1.5">
          <Lock className="h-3 w-3 text-muted-copy" />
          <span className="text-[10px] font-bold text-muted-copy">
            Quiz {learnedCount}/{QUIZ_THRESHOLD}
          </span>
          <div className="h-1 w-16 rounded-full bg-border-soft overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min((learnedCount / QUIZ_THRESHOLD) * 100, 100)}%` }}
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
    </div>
  );
};
