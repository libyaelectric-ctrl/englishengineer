import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { useVocabularyStore } from '@/features/vocabulary/store/vocabulary.store';

interface QuizWord {
  id: string;
  term: string;
  turkishMeaning: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: QuizWord[];
  isStrugglingQuiz?: boolean;
}

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const QuizModal = ({
  isOpen,
  onClose,
  words,
  isStrugglingQuiz = false,
}: QuizModalProps) => {
  const [shuffledWords, setShuffledWords] = useState<QuizWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [results, setResults] = useState<
    { wordId: string; correct: boolean }[]
  >([]);
  const [showResult, setShowResult] = useState(false);

  const { onQuizCorrect, onQuizIncorrect, moveToNew, moveToLearned } =
    useVocabularyStore();

  useEffect(() => {
    if (isOpen && words.length > 0) {
      setShuffledWords(shuffleArray(words));
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setResults([]);
      setShowResult(false);
    }
  }, [isOpen, words]);

  const currentWord = shuffledWords[currentIndex];
  const isFinished = currentIndex >= shuffledWords.length;

  const options = useMemo(() => {
    if (!currentWord) return [];
    const allMeanings = shuffledWords
      .filter((w) => w.id !== currentWord.id)
      .map((w) => w.turkishMeaning);
    const shuffled = shuffleArray(allMeanings).slice(0, 3);
    const correct = currentWord.turkishMeaning;
    return shuffleArray([...shuffled, correct]);
  }, [currentWord, shuffledWords]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const correct = answer === currentWord.turkishMeaning;

    if (isStrugglingQuiz) {
      if (correct) {
        moveToLearned(currentWord.id);
      } else {
        moveToNew(currentWord.id);
      }
    } else {
      if (correct) {
        onQuizCorrect(currentWord.id);
      } else {
        onQuizIncorrect(currentWord.id);
      }
    }

    setResults([...results, { wordId: currentWord.id, correct }]);
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      setCurrentIndex(currentIndex + 1);
    }, 1500);
  };

  const restart = () => {
    setShuffledWords(shuffleArray(words));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setResults([]);
    setShowResult(false);
  };

  const correctCount = results.filter((r) => r.correct).length;
  const wrongCount = results.filter((r) => !r.correct).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md rounded-[4px] border border-border-soft bg-surface p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {isFinished ? (
            <div className="text-center space-y-4">
              <Trophy className="mx-auto h-12 w-12 text-yellow-500" />
              <h2 className="text-lg font-bold text-foreground">
                {isStrugglingQuiz
                  ? 'Struggling Quiz Complete!'
                  : 'Quiz Complete!'}
              </h2>
              <div className="flex justify-center gap-6 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" /> {correctCount} Correct
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" /> {wrongCount} Wrong
                </span>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  onClick={restart}
                  className="flex items-center gap-1.5 rounded-[4px] border border-border-soft px-4 py-2 text-xs font-bold uppercase text-foreground hover:bg-surface-hover"
                >
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
                <button
                  onClick={onClose}
                  className="rounded-[4px] bg-primary px-6 py-2 text-xs font-bold uppercase text-primary-foreground"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted-copy">
                  {currentIndex + 1} / {shuffledWords.length}
                </span>
                <button
                  onClick={onClose}
                  className="text-muted-copy hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-base font-bold text-foreground mb-1">
                {currentWord?.term}
              </p>
              <p className="text-xs text-muted-copy mb-4">
                What is the meaning of this word?
              </p>

              <div className="space-y-2">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedAnswer}
                    className={`w-full rounded-[4px] border p-3 text-left text-sm transition-all ${
                      showResult && option === currentWord?.turkishMeaning
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 font-bold'
                        : showResult && option === selectedAnswer
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700'
                          : 'border-border-soft bg-background hover:border-primary'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-4 h-1 rounded-full bg-border-soft overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${((currentIndex + 1) / shuffledWords.length) * 100}%`,
                  }}
                />
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
