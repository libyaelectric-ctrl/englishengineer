import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Trophy, ArrowRight } from 'lucide-react';
import { useVocabularyStore } from '@/features/vocabulary/store/vocabulary.store';
import { repairVocabularyText } from '@/features/vocabulary';

interface QuizWord {
  id: string;
  term: string;
  turkishMeaning: string;
}

interface QuizSectionProps {
  learnedCount: number;
  learnedWords: QuizWord[];
}

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const QuizSection = ({ learnedCount, learnedWords }: QuizSectionProps) => {
  const [quizActive, setQuizActive] = useState(false);
  const [quizWords, setQuizWords] = useState<QuizWord[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    mastered: string[];
    struggling: string[];
    kept: string[];
  } | null>(null);

  const { onQuizCorrect, onQuizIncorrect } = useVocabularyStore();

  const canStartQuiz = learnedCount >= 100;

  const startQuiz = () => {
    const shuffled = shuffleArray(learnedWords).slice(0, 10);
    setQuizWords(shuffled);
    setAnswers({});
    setShowResults(false);
    setResults(null);
    setQuizActive(true);
  };

  const handleAnswerChange = (wordId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [wordId]: value }));
  };

  const submitQuiz = () => {
    const mastered: string[] = [];
    const struggling: string[] = [];
    const kept: string[] = [];

    quizWords.forEach((word) => {
      const userAnswer = answers[word.id]?.trim().toLowerCase() || '';
      const correctAnswer = word.turkishMeaning.trim().toLowerCase();

      if (userAnswer === '') {
        kept.push(word.id);
      } else if (userAnswer === correctAnswer) {
        mastered.push(word.id);
        onQuizCorrect(word.id);
      } else {
        struggling.push(word.id);
        onQuizIncorrect(word.id);
      }
    });

    setResults({ mastered, struggling, kept });
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuizActive(false);
    setQuizWords([]);
    setAnswers({});
    setShowResults(false);
    setResults(null);
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="rounded-[4px] border border-border-soft bg-surface/60 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">
          🏆 Mastered Quiz
        </h3>
        <span className="text-[10px] text-muted-copy">
          {learnedCount}/100 words
        </span>
      </div>

      {!quizActive && !showResults && (
        <div className="text-center">
          <p className="text-xs text-muted-copy mb-3">
            {canStartQuiz
              ? 'Translate 10 English words to Turkish. Correct = Mastered, Wrong = Struggling.'
              : `Need ${100 - learnedCount} more learned words to start quiz.`}
          </p>
          <button
            type="button"
            onClick={startQuiz}
            disabled={!canStartQuiz}
            className={`rounded-[4px] px-4 py-2 text-xs font-bold uppercase transition-all ${
              canStartQuiz
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                : 'bg-surface text-muted-copy cursor-not-allowed'
            }`}
          >
            Start Quiz
          </button>
        </div>
      )}

      {quizActive && !showResults && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] text-muted-copy">
            <span>{answeredCount}/{quizWords.length} answered</span>
            <button
              type="button"
              onClick={submitQuiz}
              className="flex items-center gap-1 rounded-[4px] bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              Tamam <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {quizWords.map((word, index) => (
              <div
                key={word.id}
                className="flex items-center gap-3 rounded-[4px] border border-border-soft bg-background p-2"
              >
                <span className="text-[10px] font-bold text-muted-copy min-w-[20px]">
                  {index + 1}.
                </span>
                <span className="text-sm font-semibold text-foreground flex-1">
                  {repairVocabularyText(word.term)}
                </span>
                <input
                  type="text"
                  value={answers[word.id] || ''}
                  onChange={(e) => handleAnswerChange(word.id, e.target.value)}
                  placeholder="Türkçe çevirisi"
                  className="w-40 rounded-[4px] border border-border-soft bg-surface px-2 py-1 text-xs text-foreground outline-none focus:border-[#0047bb]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {showResults && results && (
        <div className="space-y-3">
          <div className="flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" /> {results.mastered.length} Mastered
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="h-3 w-3" /> {results.struggling.length} Struggling
            </span>
            <span className="flex items-center gap-1 text-muted-copy">
              {results.kept.length} Kept in Learned
            </span>
          </div>

          <div className="space-y-1 max-h-60 overflow-y-auto text-[10px]">
            {results.mastered.map((id) => {
              const word = quizWords.find((w) => w.id === id);
              return (
                <div key={id} className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span className="font-semibold">{word?.term}</span>
                  <span>→ Mastered</span>
                </div>
              );
            })}
            {results.struggling.map((id) => {
              const word = quizWords.find((w) => w.id === id);
              return (
                <div key={id} className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-3 w-3" />
                  <span className="font-semibold">{word?.term}</span>
                  <span>→ Struggling</span>
                </div>
              );
            })}
            {results.kept.map((id) => {
              const word = quizWords.find((w) => w.id === id);
              return (
                <div key={id} className="flex items-center gap-2 text-muted-copy">
                  <span className="font-semibold">{word?.term}</span>
                  <span>→ Kept in Learned</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={startQuiz}
              className="rounded-[4px] border border-border-soft px-3 py-1.5 text-[10px] font-bold text-foreground hover:bg-surface-hover cursor-pointer"
            >
              New Quiz
            </button>
            <button
              type="button"
              onClick={resetQuiz}
              className="rounded-[4px] bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
