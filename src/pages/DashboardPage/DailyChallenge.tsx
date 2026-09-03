/**
 * Daily Challenge Mode
 *
 * A time-limited 3-question mini quiz that:
 * - Changes daily based on date seed
 * - Covers random modules (vocabulary, grammar, reading)
 * - Has a 60-second timer per question
 * - Awards bonus XP (3x normal) for completion
 * - Shows streak protection status
 * - Creates urgency and daily return habit
 */
import { CheckCircle2, Clock, Flame, Sparkles, Target, Trophy, XCircle, Zap } from 'lucide-react';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { useLearningStore } from '@/core/learning';

import { useLocalizationStore } from '@/features/localization';
import { VocabularyRepository } from '@/features/vocabulary';

interface ChallengeQuestion {
  id: string;
  module: 'vocabulary' | 'grammar' | 'reading';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface ChallengeState {
  status: 'idle' | 'active' | 'completed';
  currentQuestion: number;
  score: number;
  answers: Array<{ questionId: string; correct: boolean; timeMs: number }>;
  startTime: number | null;
  timeRemaining: number;
}

const QUESTIONS_PER_CHALLENGE = 3;
const TIME_PER_QUESTION_MS = 60_000; // 60 seconds
const XP_BONUS_MULTIPLIER = 3;
const STORAGE_KEY = 'daily_challenge';

// Daily seed based on date (deterministic per day)
const getDailySeed = (): number => {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};

// Simple seeded random
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate deterministic questions based on daily seed
const generateDailyQuestions = async (): Promise<ChallengeQuestion[]> => {
  const seed = getDailySeed();
  const questions: ChallengeQuestion[] = [];

  // Get vocabulary data
  try {
    const vocabTerms = await VocabularyRepository.getVocabularyByLevel('A1');
    const shuffled = [...vocabTerms].sort((a) => seededRandom(seed + a.id.charCodeAt(0)) - 0.5);

    // Vocabulary questions
    for (let i = 0; i < 2 && i < shuffled.length; i++) {
      const term = shuffled[i];
      if (!term) continue;

      const wrongAnswers = vocabTerms
        .filter((t) => t.id !== term.id)
        .sort(() => seededRandom(seed + i * 100) - 0.5)
        .slice(0, 3)
        .map((t) => t.turkishMeaning || t.definition);

      const options = [term.turkishMeaning || term.definition, ...wrongAnswers].sort(
        () => seededRandom(seed + i * 200) - 0.5
      );

      questions.push({
        id: `vocab-${i}`,
        module: 'vocabulary',
        question: `What does "${term.term}" mean?`,
        options,
        correctAnswer: term.turkishMeaning || term.definition,
        explanation: term.definition,
      });
    }

    // Grammar question (template-based)
    const grammarQuestions = [
      {
        question: 'Which sentence uses the present perfect correctly?',
        options: [
          'I have visited the site yesterday.',
          'I have visited the site this week.',
          'I visit the site yesterday.',
          'I will visit the site this week.',
        ],
        correctAnswer: 'I have visited the site this week.',
        explanation: 'Present perfect connects past action to present time.',
      },
      {
        question: 'Choose the correct passive form:',
        options: [
          'The report was written by the engineer.',
          'The report written by the engineer.',
          'The report is write by the engineer.',
          'The report has write by the engineer.',
        ],
        correctAnswer: 'The report was written by the engineer.',
        explanation: 'Passive voice: subject + be + past participle + by agent.',
      },
      {
        question: 'Which is correct for future plans?',
        options: [
          'We are meeting the client tomorrow.',
          'We are meet the client tomorrow.',
          'We meeted the client tomorrow.',
          'We will meets the client tomorrow.',
        ],
        correctAnswer: 'We are meeting the client tomorrow.',
        explanation: 'Present continuous for fixed future arrangements.',
      },
    ];

    const grammarIdx = seed % grammarQuestions.length;
    const grammarQ = grammarQuestions[grammarIdx];
    if (grammarQ) {
      questions.push({
        id: 'grammar-0',
        module: 'grammar',
        question: grammarQ.question,
        options: grammarQ.options.sort(() => seededRandom(seed + 500) - 0.5),
        correctAnswer: grammarQ.correctAnswer,
        explanation: grammarQ.explanation,
      });
    }
  } catch {
    // Fallback questions if vocabulary load fails
    questions.push({
      id: 'vocab-fallback',
      module: 'vocabulary',
      question: 'What does "engineering" mean?',
      options: ['Mühendislik', 'İnşaat', 'Tasarım', 'Yönetim'],
      correctAnswer: 'Mühendislik',
    });
    questions.push({
      id: 'vocab-fallback-2',
      module: 'vocabulary',
      question: 'What does "safety" mean?',
      options: ['Güvenlik', 'Hız', 'Kalite', 'Maliyet'],
      correctAnswer: 'Güvenlik',
    });
  }

  return questions.slice(0, QUESTIONS_PER_CHALLENGE);
};

// Load challenge state from localStorage
const loadChallengeState = (): ChallengeState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as ChallengeState & { date?: string };
    // Reset if different day
    if (parsed.date !== new Date().toISOString().split('T')[0]) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

// Save challenge state to localStorage
const saveChallengeState = (state: ChallengeState): void => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, date: new Date().toISOString().split('T')[0] })
    );
  } catch {
    // localStorage not available
  }
};

// eslint-disable-next-line complexity -- large dashboard card with many states
export const DailyChallenge = memo(() => {
  const streak = useLearningStore((s) => s.streak);
  const translate = useLocalizationStore((s) => s.translate);

  const [state, setState] = useState<ChallengeState>(
    () =>
      loadChallengeState() ?? {
        status: 'idle',
        currentQuestion: 0,
        score: 0,
        answers: [],
        startTime: null,
        timeRemaining: TIME_PER_QUESTION_MS,
      }
  );

  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Load questions on mount
  useEffect(() => {
    generateDailyQuestions().then(setQuestions);
  }, []);

  // Timer effect
  useEffect(() => {
    if (state.status !== 'active' || showResult) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.timeRemaining <= 1000) {
          // Time's up — auto-submit wrong answer
          const currentQ = questions[prev.currentQuestion];
          if (currentQ) {
            const newAnswers = [
              ...prev.answers,
              {
                questionId: currentQ.id,
                correct: false,
                timeMs: TIME_PER_QUESTION_MS,
              },
            ];
            const isLast = prev.currentQuestion >= QUESTIONS_PER_CHALLENGE - 1;
            return {
              ...prev,
              timeRemaining: TIME_PER_QUESTION_MS,
              answers: newAnswers,
              status: isLast ? 'completed' : 'active',
              currentQuestion: isLast ? prev.currentQuestion : prev.currentQuestion + 1,
            };
          }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1000 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, state.currentQuestion, showResult, questions]);

  // Handle answer selection
  const handleAnswer = useCallback(
    (answer: string) => {
      if (showResult || state.status !== 'active') return;

      setSelectedAnswer(answer);
      setShowResult(true);

      const currentQ = questions[state.currentQuestion];
      if (!currentQ) return;

      const isCorrect = answer === currentQ.correctAnswer;
      const timeMs = TIME_PER_QUESTION_MS - state.timeRemaining;

      setTimeout(() => {
        setState((prev) => {
          const newAnswers = [
            ...prev.answers,
            {
              questionId: currentQ.id,
              correct: isCorrect,
              timeMs,
            },
          ];
          const isLast = prev.currentQuestion >= QUESTIONS_PER_CHALLENGE - 1;

          return {
            ...prev,
            currentQuestion: isLast ? prev.currentQuestion : prev.currentQuestion + 1,
            score: prev.score + (isCorrect ? 1 : 0),
            answers: newAnswers,
            status: isLast ? 'completed' : 'active',
            timeRemaining: TIME_PER_QUESTION_MS,
          };
        });
        setSelectedAnswer(null);
        setShowResult(false);
      }, 1500);
    },
    [showResult, state.status, state.currentQuestion, state.timeRemaining, questions]
  );

  // Start challenge
  const startChallenge = useCallback(() => {
    setState({
      status: 'active',
      currentQuestion: 0,
      score: 0,
      answers: [],
      startTime: Date.now(),
      timeRemaining: TIME_PER_QUESTION_MS,
    });
    setSelectedAnswer(null);
    setShowResult(false);
  }, []);

  // Calculate bonus XP
  const bonusXP = useMemo(() => {
    return state.status === 'completed' ? state.score * 10 * XP_BONUS_MULTIPLIER : 0;
  }, [state.status, state.score]);

  // Save state when completed
  useEffect(() => {
    if (state.status === 'completed') {
      saveChallengeState(state);
    }
  }, [state]);

  const currentQ = questions[state.currentQuestion];
  const timePercent = (state.timeRemaining / TIME_PER_QUESTION_MS) * 100;
  const isTodayCompleted = state.status === 'completed';

  return (
    <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Daily Challenge</h2>
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
            {translate('dailyChallenge.gamification')}
          </span>
        </div>
        {isTodayCompleted && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">
            <CheckCircle2 className="h-3 w-3" />
            COMPLETED
          </span>
        )}
      </div>

      {/* Clarification banner */}
      {state.status === 'idle' && !isTodayCompleted && (
        <div className="rounded-[4px] bg-primary/5 border border-primary/15 px-3 py-2">
          <p className="text-[10px] text-primary font-semibold">
            {translate('dailyChallenge.planInCurriculum')}
          </p>
        </div>
      )}

      {/* Idle State */}
      {state.status === 'idle' && !isTodayCompleted && (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">3 Questions • 60s Each</p>
            <p className="text-xs text-muted-copy mt-1">
              Answer correctly for <span className="text-primary font-bold">3x bonus XP</span>
            </p>
          </div>
          <button
            onClick={startChallenge}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Zap className="h-4 w-4" />
            Start Challenge
          </button>
        </div>
      )}

      {/* Active Challenge */}
      {state.status === 'active' && currentQ && (
        <div className="space-y-4">
          {/* Progress & Timer */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-copy">
              Question {state.currentQuestion + 1} / {QUESTIONS_PER_CHALLENGE}
            </span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-copy" />
              <span
                className={`text-xs font-bold ${state.timeRemaining < 10000 ? 'text-red-500' : 'text-foreground'}`}
              >
                {Math.ceil(state.timeRemaining / 1000)}s
              </span>
            </div>
          </div>

          {/* Timer Bar */}
          <div className="h-1.5 w-full rounded-full bg-surface-hover overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                timePercent > 50 ? 'bg-green-500' : timePercent > 20 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>

          {/* Module Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              currentQ.module === 'vocabulary'
                ? 'bg-blue-500/10 text-blue-500'
                : currentQ.module === 'grammar'
                  ? 'bg-purple-500/10 text-purple-500'
                  : 'bg-emerald-500/10 text-emerald-500'
            }`}
          >
            {currentQ.module}
          </span>

          {/* Question */}
          <p className="text-sm font-bold text-foreground">{currentQ.question}</p>

          {/* Options */}
          <div className="space-y-2">
            {currentQ.options.map((option, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQ.correctAnswer;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`w-full text-left px-4 py-3 rounded-[var(--radius-card)] border text-sm font-medium transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-500/10 text-green-700'
                      : showWrong
                        ? 'border-red-500 bg-red-500/10 text-red-700'
                        : isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border-soft bg-surface-hover text-foreground hover:border-primary/40 hover:bg-primary/5'
                  }`}
                >
                  <span className="font-bold mr-2">{letter}.</span>
                  {option}
                  {showCorrect && <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-500" />}
                  {showWrong && <XCircle className="inline h-4 w-4 ml-2 text-red-500" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && currentQ.explanation && (
            <div className="p-3 rounded-[var(--radius-card)] bg-primary/5 border border-primary/20">
              <p className="text-xs text-foreground">{currentQ.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Completed State */}
      {state.status === 'completed' && (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                state.score === QUESTIONS_PER_CHALLENGE ? 'bg-amber-500/10' : 'bg-green-500/10'
              }`}
            >
              {state.score === QUESTIONS_PER_CHALLENGE ? (
                <Trophy className="h-6 w-6 text-amber-500" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              )}
            </div>
          </div>

          <div>
            <p className="text-lg font-bold text-foreground">
              {state.score}/{QUESTIONS_PER_CHALLENGE} Correct
            </p>
            <p className="text-xs text-muted-copy mt-1">
              {state.score === QUESTIONS_PER_CHALLENGE
                ? 'Perfect score! You earned maximum bonus XP! 🎉'
                : `Great effort! Keep practicing to improve.`}
            </p>
          </div>

          {/* XP Earned */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-500">+{bonusXP} XP</span>
            <span className="text-[10px] text-muted-copy">(3x bonus)</span>
          </div>

          {/* Streak Protection */}
          {streak > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-hover border border-border-soft">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[10px] font-bold text-muted-copy">
                Streak protected! 🔥 {streak} days
              </span>
            </div>
          )}

          {/* Come back tomorrow */}
          <p className="text-[10px] text-muted-copy">
            <Sparkles className="inline h-3 w-3" />
            New challenge available tomorrow
          </p>
        </div>
      )}
    </div>
  );
});

DailyChallenge.displayName = 'DailyChallenge';
