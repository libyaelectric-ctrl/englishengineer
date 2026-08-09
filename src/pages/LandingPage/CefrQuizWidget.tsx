import { HelpCircle, RefreshCw, Sparkles } from 'lucide-react';

import { useState } from 'react';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';

const QUIZ_QUESTIONS: Array<{
  id: number;
  question: TranslationKey;
  options: Array<{ text: TranslationKey; level: string }>;
}> = [
  {
    id: 1,
    question: 'landing.cefrQuizQ1',
    options: [
      { text: 'landing.cefrQuizQ1A1', level: 'A2' },
      { text: 'landing.cefrQuizQ1A2', level: 'B1' },
      { text: 'landing.cefrQuizQ1A3', level: 'C1' },
    ],
  },
  {
    id: 2,
    question: 'landing.cefrQuizQ2',
    options: [
      { text: 'landing.cefrQuizQ2A1', level: 'A2' },
      { text: 'landing.cefrQuizQ2A2', level: 'B1' },
      { text: 'landing.cefrQuizQ2A3', level: 'C1' },
    ],
  },
  {
    id: 3,
    question: 'landing.cefrQuizQ3',
    options: [
      { text: 'landing.cefrQuizQ3A1', level: 'A2' },
      { text: 'landing.cefrQuizQ3A2', level: 'B1' },
      { text: 'landing.cefrQuizQ3A3', level: 'C1' },
    ],
  },
];

export function CefrQuizWidget() {
  const translate = useLocalizationStore((s) => s.translate);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [calculatedLevel, setCalculatedLevel] = useState<string | null>(null);

  const handleSelectOption = (level: string) => {
    const nextAnswers = [...selectedAnswers, level];
    setSelectedAnswers(nextAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate level
      const c1Count = nextAnswers.filter((a) => a === 'C1').length;
      const b1Count = nextAnswers.filter((a) => a === 'B1').length;

      if (c1Count >= 2) setCalculatedLevel('C1 Advanced Engineering');
      else if (b1Count >= 2 || c1Count === 1) setCalculatedLevel('B2 Professional Engineering');
      else setCalculatedLevel('B1 Operational Engineering');
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedAnswers([]);
    setCalculatedLevel(null);
  };

  return (
    <section className="border-t border-border-soft bg-surface px-6 py-8 md:px-12 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
              {translate('landing.cefrQuizTitle')}
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              {translate('landing.cefrQuizDesc')}
            </h2>
          </div>
          <p className="text-xs text-foreground/80 font-medium max-w-xl leading-tight">
            {translate('landing.cefrQuizIntro')}
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-primary/20 bg-background p-5 md:p-6 shadow-xl max-w-3xl mx-auto light-sweep-container">
          {!calculatedLevel ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-border-soft pb-2">
                <span className="font-bold text-primary font-mono flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 text-primary" />{' '}
                  {translate('landing.cefrQuizProgress').replace('{n}', `0${currentStep + 1}`)}
                </span>
                <span className="text-muted-copy font-medium">
                  {Math.round(((currentStep + 1) / 3) * 100)}
                  {translate('landing.cefrQuizPercent')}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                {translate(QUIZ_QUESTIONS[currentStep].question)}
              </h3>

              <div className="space-y-2" role="radiogroup" aria-label="Quiz answer options">
                {QUIZ_QUESTIONS[currentStep].options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={false}
                    onClick={() => handleSelectOption(opt.level)}
                    className="w-full text-left p-3 rounded-[var(--radius-card)] border border-border-soft bg-surface hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-medium text-foreground flex items-center justify-between group cursor-pointer"
                  >
                    <span>{translate(opt.text)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy group-hover:text-primary font-mono">
                      ➔
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 py-4 animate-fadeIn">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 mx-auto">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-foreground">
                {translate('landing.cefrQuizResult')}
              </h3>

              <div className="inline-block rounded-[var(--radius-card)] bg-primary text-primary-foreground px-6 py-2 text-base font-extrabold shadow-lg font-mono tracking-wider">
                {calculatedLevel}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-card)] border border-border-soft bg-surface px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-hover transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{translate('landing.cefrQuizRetake')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CefrQuizWidget;
