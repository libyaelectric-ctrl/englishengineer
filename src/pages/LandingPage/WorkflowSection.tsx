import { ChevronRight, Layers, RefreshCw, Zap } from 'lucide-react';

import { useState } from 'react';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';

import { AnimatedSection } from './AnimatedComponents';

const WORKFLOW = [
  {
    kickerKey: 'landing.workflowStep1Kicker' as TranslationKey,
    titleKey: 'landing.workflowStep1Title' as TranslationKey,
    summaryKey: 'landing.workflowStep1Desc' as TranslationKey,
    descriptionKey: 'landing.workflowStep1Desc' as TranslationKey,
  },
  {
    kickerKey: 'landing.workflowStep2Kicker' as TranslationKey,
    titleKey: 'landing.workflowStep2Title' as TranslationKey,
    summaryKey: 'landing.workflowStep2Desc' as TranslationKey,
    descriptionKey: 'landing.workflowStep2Desc' as TranslationKey,
  },
  {
    kickerKey: 'landing.workflowStep3Kicker' as TranslationKey,
    titleKey: 'landing.workflowStep3Title' as TranslationKey,
    summaryKey: 'landing.workflowStep3Desc' as TranslationKey,
    descriptionKey: 'landing.workflowStep3Desc' as TranslationKey,
  },
];

export function WorkflowSection() {
  const translate = useLocalizationStore((s) => s.translate);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = WORKFLOW[activeStepIndex];

  return (
    <section
      id="workflow"
      className="border-t border-border-soft bg-surface px-6 py-8 md:px-12 md:py-10"
    >
      <div className="mx-auto max-w-7xl">
        {/* Compact Single Row Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {translate('landing.howItWorks')}
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              {translate('landing.workflowTitle')}
            </h2>
          </div>
          <p className="text-xs text-foreground/80 font-medium max-w-xl leading-tight">
            {translate('landing.workflowClickDesc')}
          </p>
        </div>

        {/* Interactive Step Switcher Tabs */}
        <AnimatedSection className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WORKFLOW.map((item, index) => {
            const isActive = activeStepIndex === index;
            return (
              <button
                key={item.titleKey}
                onClick={() => setActiveStepIndex(index)}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-[1.01]'
                    : 'bg-background text-muted-copy hover:text-foreground border-border-soft hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${
                      isActive
                        ? 'bg-white/20 border-white/30 text-white'
                        : 'bg-soft border-border-soft text-primary'
                    }`}
                  >
                    {translate(item.kickerKey)}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      isActive ? 'translate-x-0.5 text-white' : 'text-muted-copy/40'
                    }`}
                  />
                </div>
                <h3 className="text-sm font-bold leading-tight mb-1">{translate(item.titleKey)}</h3>
                <p className="text-xs leading-snug font-medium line-clamp-2 opacity-90">
                  {translate(item.summaryKey)}
                </p>
              </button>
            );
          })}
        </AnimatedSection>

        {/* Dynamic Detail Card for Active Step */}
        <AnimatedSection delay={80}>
          <div className="rounded-xl border border-border-soft bg-background p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono bg-soft border border-border-soft px-2 py-0.5 rounded">
                  {translate(activeStep.kickerKey)}
                </span>
                <h4 className="text-base font-extrabold text-foreground">
                  {translate(activeStep.titleKey)}
                </h4>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground/85 leading-normal">
                {translate(activeStep.descriptionKey)}
              </p>
            </div>

            <div className="rounded-lg bg-surface border border-border-soft p-4 flex items-center gap-3 shrink-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft text-primary border border-border-soft">
                {activeStepIndex === 0 ? (
                  <Layers className="h-5 w-5" />
                ) : activeStepIndex === 1 ? (
                  <Zap className="h-5 w-5" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-copy block">
                  {translate('landing.workflowActive')}
                </span>
                <p className="text-xs font-bold text-primary">{translate(activeStep.titleKey)}</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default WorkflowSection;
