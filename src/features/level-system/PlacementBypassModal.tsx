import { Award, CheckCircle2, KeyRound, Sparkles, X, Zap } from 'lucide-react';

import { useState } from 'react';

import { setProgressionBypassed } from './progression-lock.helpers';

interface PlacementBypassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export const PlacementBypassModal = ({
  isOpen,
  onClose,
  onUnlocked,
}: PlacementBypassModalProps) => {
  const [quizStep, setQuizStep] = useState<'intro' | 'quiz' | 'passed'>('intro');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleInstantBypass = () => {
    setProgressionBypassed(true);
    onUnlocked();
    onClose();
  };

  const handlePassQuiz = () => {
    if (selectedOption === 1) {
      // Correct answer: Extension of Time
      setQuizStep('passed');
      setTimeout(() => {
        setProgressionBypassed(true);
        onUnlocked();
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-primary/40 bg-surface/95 p-6 shadow-2xl space-y-4 relative light-sweep-container overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              Level Assessment & Bypass
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-copy hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {quizStep === 'intro' && (
          <div className="space-y-4 text-xs text-muted-copy">
            <p className="leading-relaxed">
              Are you an experienced engineer (B2/C1 level)? You don't have to complete all
              introductory tasks. You can unlock all modules instantly or take a 30-second skill
              placement test!
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setQuizStep('quiz')}
                className="w-full flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-3 hover:bg-primary/20 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <div className="font-bold text-foreground">Option 1: 30s Placement Test</div>
                    <div className="text-[10px] text-muted-copy">
                      Answer 1 FIDIC/ASTM question to prove proficiency
                    </div>
                  </div>
                </div>
                <Sparkles className="h-4 w-4 text-primary" />
              </button>

              <button
                type="button"
                onClick={handleInstantBypass}
                className="w-full flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 hover:bg-emerald-500/20 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-bold text-foreground">
                      Option 2: Senior Engineer Instant Unlock
                    </div>
                    <div className="text-[10px] text-muted-copy">
                      1-Click bypass all progression locks
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </button>
            </div>
          </div>
        )}

        {quizStep === 'quiz' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Placement Question 1/1
              </span>
              <p className="text-xs font-bold text-foreground">
                In a FIDIC Yellow Book contract, what does the acronym "EOT" stand for in site
                delays?
              </p>
            </div>

            <div className="space-y-2">
              {[
                'Execution of Transport',
                'Extension of Time (Correct)',
                'Equipment Overhead Tax',
                'Estimate of Total Costs',
              ].map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedOption(i)}
                  className={`w-full rounded-xl border p-2.5 text-left text-xs font-medium transition cursor-pointer ${
                    selectedOption === i
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                      : 'border-border-soft bg-background hover:border-primary/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={selectedOption === null}
              onClick={handlePassQuiz}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover disabled:opacity-50 transition cursor-pointer shadow-md"
            >
              Submit & Unlock All Skills
            </button>
          </div>
        )}

        {quizStep === 'passed' && (
          <div className="py-6 text-center space-y-2 animate-in fade-in">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto animate-bounce" />
            <div className="text-sm font-extrabold text-foreground">
              Placement Assessment Passed!
            </div>
            <p className="text-xs text-muted-copy">
              All Reading, Writing, Listening & Speaking modules are now fully unlocked.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
