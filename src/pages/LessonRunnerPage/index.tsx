import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Trophy, Star, ArrowRight, RefreshCw } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/features/auth';
import {
  generateDuolingoUnits,
  type DuolingoLevel,
} from '@/features/gamification/services/duolingo-curriculum.generator';
import { LessonProgressBar } from '@/components/lesson/LessonProgressBar';
import { HeartsDisplay } from '@/components/lesson/HeartsDisplay';
import { QuestionCard } from '@/components/lesson/QuestionCard';
import { FeedbackPanel } from '@/components/lesson/FeedbackPanel';
import { LessonConfetti } from '@/components/lesson/LessonConfetti';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

export const LessonRunnerPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const { hearts, loseHeart, completeLevel, refillHearts } = useGameStore();

  const discipline = (currentUser?.engineeringDiscipline as EngineeringDiscipline) || 'civil';
  const units = useMemo(() => generateDuolingoUnits(discipline), [discipline]);

  // Find target level
  const level: DuolingoLevel | undefined = useMemo(() => {
    for (const unit of units) {
      const found = unit.levels.find((l) => l.id === levelId);
      if (found) return found;
    }
    return units[0]?.levels[0];
  }, [units, levelId]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <p className="text-xl font-bold text-rose-500">Seviye bulunamadı.</p>
          <button
            onClick={() => navigate('/learning-path')}
            className="px-6 py-2.5 rounded-xl bg-sky-500 text-white font-bold"
          >
            Yol Haritasına Dön
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = level.questions[currentStepIndex];

  const handleCheckAnswer = () => {
    if (!selectedAnswer.trim()) return;

    // Normalizing text comparison for writing & speaking
    const normalizedInput = selectedAnswer.trim().toLowerCase();
    const normalizedCorrect = currentQuestion.correctAnswer.trim().toLowerCase();
    const correct = normalizedInput === normalizedCorrect;

    setIsCorrect(correct);
    setIsChecked(true);

    if (!correct) {
      setWrongAnswersCount((prev) => prev + 1);
      loseHeart();
    }
  };

  const handleNextQuestion = () => {
    setIsChecked(false);
    setSelectedAnswer('');

    if (currentStepIndex + 1 < level.questions.length) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Level Completed!
      const stars = wrongAnswersCount === 0 ? 3 : wrongAnswersCount <= 2 ? 2 : 1;
      completeLevel(level.id, stars, level.xpReward);
      setIsCompleted(true);
    }
  };

  // Completion Screen
  if (isCompleted) {
    const stars = wrongAnswersCount === 0 ? 3 : wrongAnswersCount <= 2 ? 2 : 1;

    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <LessonConfetti />

        <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--color-border-soft)] rounded-3xl p-8 shadow-2xl space-y-6 animate-scale-up relative z-10">
          <div className="inline-flex p-5 rounded-full bg-amber-500/20 text-amber-400 mb-2">
            <Trophy className="h-16 w-16 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[var(--foreground)]">Ders Tamamlandı!</h1>
            <p className="text-sm font-semibold text-[var(--color-muted-copy)]">
              {level.title} seviyesini başarıyla bitirdiniz.
            </p>
          </div>

          {/* Stars Earned */}
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`h-10 w-10 ${
                  starIdx <= stars ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs font-bold text-purple-400 uppercase">Kazanılan XP</p>
              <p className="text-2xl font-black text-purple-500">+{level.xpReward} XP</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs font-bold text-emerald-400 uppercase">Doğruluk</p>
              <p className="text-2xl font-black text-emerald-500">
                %{Math.round(((level.questions.length - wrongAnswersCount) / level.questions.length) * 100)}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/learning-path')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <span>YOL HARİTASINA DÖN</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // No Hearts Screen
  if (hearts <= 0) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[var(--surface)] border border-rose-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-6xl animate-bounce">💔</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-rose-500">Canınız Tükendi!</h2>
            <p className="text-sm text-[var(--color-muted-copy)]">
              Yanlış cevaplar nedeniyle canlarınız bitti. Bekleyebilir veya canlarınızı doldurabilirsiniz.
            </p>
          </div>

          <button
            onClick={() => refillHearts()}
            className="w-full py-3.5 rounded-2xl bg-rose-500 text-white font-black shadow-lg hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span>CANLARI YENİLE</span>
          </button>

          <button
            onClick={() => navigate('/learning-path')}
            className="w-full py-3 text-sm text-[var(--color-muted-copy)] hover:underline font-bold"
          >
            Ana Menüye Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between p-4 sm:p-6 pb-32">
      {/* Top Header Bar */}
      <header className="max-w-3xl mx-auto w-full flex items-center gap-4 py-2">
        <button
          onClick={() => {
            if (window.confirm('Ders yarıda bırakılsın mı? İlerlemeniz kaydedilmeyecektir.')) {
              navigate('/learning-path');
            }
          }}
          className="p-2 rounded-full hover:bg-[var(--color-border-soft)] text-[var(--color-muted-copy)] transition-colors"
          title="Dersten Çık"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex-1">
          <LessonProgressBar currentStep={currentStepIndex + 1} totalSteps={level.questions.length} />
        </div>

        <HeartsDisplay />
      </header>

      {/* Main Question Body */}
      <main className="max-w-3xl mx-auto w-full my-auto py-8">
        <QuestionCard
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={setSelectedAnswer}
          isChecked={isChecked}
        />
      </main>

      {/* Bottom Action Footer Bar */}
      {!isChecked && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-[var(--surface)]/90 backdrop-blur-md border-t border-[var(--color-border-soft)] z-40">
          <div className="max-w-3xl mx-auto flex justify-end">
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer.trim()}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[var(--color-primary)] text-white font-black text-lg tracking-wide shadow-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-primary-hover)] active:scale-95 transition-all"
            >
              KONTROL ET
            </button>
          </div>
        </footer>
      )}

      {/* Feedback Drawer Modal */}
      {isChecked && (
        <FeedbackPanel
          isCorrect={isCorrect}
          correctAnswer={currentQuestion.correctAnswer}
          explanation={currentQuestion.explanation}
          onNext={handleNextQuestion}
        />
      )}
    </div>
  );
};

export default LessonRunnerPage;
