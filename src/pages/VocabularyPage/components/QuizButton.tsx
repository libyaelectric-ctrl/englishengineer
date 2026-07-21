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
    <div className="space-y-3">
      {canStartQuiz ? (
        <button
          onClick={onOpenQuiz}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover"
        >
          <Zap className="h-4 w-4" />
          Start Quiz ({learnedWords.length} words)
        </button>
      ) : (
        <div className="rounded-[4px] border border-border-soft bg-surface p-4 text-center">
          <Lock className="mx-auto mb-2 h-5 w-5 text-muted-copy" />
          <p className="text-xs font-bold text-foreground">Quiz Locked</p>
          <p className="mt-1 text-[10px] text-muted-copy">
            {learnedCount}/{QUIZ_THRESHOLD} kelime öğrenildi
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-border-soft overflow-hidden">
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
          className="flex w-full items-center justify-center gap-2 rounded-[4px] border border-red-300 bg-red-50 px-4 py-2 text-xs font-bold uppercase text-red-700 transition hover:bg-red-100"
        >
          Struggling Quiz ({strugglingCount})
        </button>
      )}
    </div>
  );
};
