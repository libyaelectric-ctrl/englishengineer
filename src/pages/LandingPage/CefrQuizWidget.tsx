import { HelpCircle, RefreshCw, Sparkles } from 'lucide-react';

import { useState } from 'react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'How do you state a delay notice under international site contracts?',
    options: [
      { text: 'Heavy rain came, workers stopped, give money.', level: 'A2' },
      { text: 'We delayed work due to bad weather yesterday.', level: 'B1' },
      {
        text: 'Pursuant to Clause 8.4, critical path delay is logged due to adverse climatic conditions.',
        level: 'C1',
      },
    ],
  },
  {
    id: 2,
    question: 'How do you report a technical RFI discrepancy on a BIM model?',
    options: [
      { text: 'Rebar drawing is confusing, please check.', level: 'A2' },
      { text: 'We found an error in drawing S-204 rebar detail.', level: 'B1' },
      {
        text: 'RFI #104: Clarification requested regarding top reinforcement rebar grade per BS 4449.',
        level: 'C1',
      },
    ],
  },
  {
    id: 3,
    question: 'How do you defend your technical presentation before the project board?',
    options: [
      { text: 'The pump is good and will not break.', level: 'A2' },
      { text: 'We tested the pump pressure and it passed.', level: 'B1' },
      {
        text: 'Hydrostatic test pressure envelopes confirm full compliance with ISO 10816 vibration limits.',
        level: 'C1',
      },
    ],
  },
];

export function CefrQuizWidget() {
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
              Item 06 / CEFR Assessment
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              30-Second Engineering CEFR Level Calculator.
            </h2>
          </div>
          <p className="text-xs text-foreground/80 font-medium max-w-xl leading-tight">
            Answer 3 rapid technical scenarios to instantly estimate your site communication level.
          </p>
        </div>

        <div className="rounded-xl border border-primary/20 bg-background p-5 md:p-6 shadow-xl max-w-3xl mx-auto light-sweep-container">
          {!calculatedLevel ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-border-soft pb-2">
                <span className="font-bold text-primary font-mono flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 text-primary" /> Question 0{currentStep + 1} of 03
                </span>
                <span className="text-muted-copy font-medium">
                  {Math.round(((currentStep + 1) / 3) * 100)}% Complete
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                {QUIZ_QUESTIONS[currentStep].question}
              </h3>

              <div className="space-y-2" role="radiogroup" aria-label="Quiz answer options">
                {QUIZ_QUESTIONS[currentStep].options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={false}
                    onClick={() => handleSelectOption(opt.level)}
                    className="w-full text-left p-3 rounded-lg border border-border-soft bg-surface hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-medium text-foreground flex items-center justify-between group cursor-pointer"
                  >
                    <span>{opt.text}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy group-hover:text-primary font-mono">
                      Select ➔
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
                Your Estimated Site Level:
              </h3>

              <div className="inline-block rounded-xl bg-primary text-primary-foreground px-6 py-2 text-base font-extrabold shadow-lg font-mono tracking-wider">
                {calculatedLevel}
              </div>

              <p className="text-xs text-foreground/80 max-w-md mx-auto leading-relaxed">
                EngVox AI Coach has auto-generated a custom practice module for your level.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-hover transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retake 30-Sec Test</span>
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
