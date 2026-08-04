import { ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react';

import { useState } from 'react';

import { useLocalizationStore } from '@/features/localization';

interface GuidedSpotlightTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    title: 'Discipline Vocabulary Engine',
    desc: 'Select your engineering field (Civil, Mechanical, Software, etc.) to load 5,000+ domain terms and ASTM/Eurocode specs.',
    target: 'Discipline Selector',
  },
  {
    title: 'AI Oral Defense & Writing Coach',
    desc: 'Practice real-time oral site defenses and get instant corrections on FIDIC contracts and technical reports.',
    target: 'AI Coach Sandbox',
  },
  {
    title: 'Multi-Currency & Team Workspaces',
    desc: 'Seamlessly switch between global currencies (USD, EUR, TRY, JPY, SAR, AED, KWD) and isolated company project workspaces.',
    target: 'Tenant & Billing Selector',
  },
  {
    title: 'Offline-First Desktop & Mobile App',
    desc: 'Work on remote job sites without internet connection. Your progress automatically syncs when back online.',
    target: 'PWA Offline Sync',
  },
];

export const GuidedSpotlightTour = ({ isOpen, onClose }: GuidedSpotlightTourProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) return null;

  const current = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-primary/40 bg-surface/95 p-5 shadow-2xl space-y-4 relative light-sweep-container overflow-hidden">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary font-mono bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
            {translate('login.tourTitle')} ({stepIndex + 1}/{TOUR_STEPS.length})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-copy hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h4 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>{current.title}</span>
          </h4>
          <p className="text-xs text-muted-copy leading-relaxed">{current.desc}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-border-soft">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-muted-copy hover:text-foreground cursor-pointer"
          >
            {translate('login.tourEnd')}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-md cursor-pointer"
          >
            <span>{isLast ? translate('login.tourGetStarted') : translate('login.tourNext')}</span>
            {isLast ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
