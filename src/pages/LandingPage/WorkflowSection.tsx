import { ChevronRight, Layers, RefreshCw, Zap } from 'lucide-react';

import { useState } from 'react';

import { AnimatedSection } from './AnimatedComponents';

const WORKFLOW = [
  {
    kicker: '01 / DEFINE',
    title: 'Profile the engineering context',
    summary:
      'Discipline, CEFR level, project role and communication goal are translated into a focused practice path.',
    description:
      'Establish your exact engineering discipline, site role, and project target to auto-generate personalized technical drills.',
  },
  {
    kicker: '02 / COMPOSE',
    title: 'Practice in realistic project scenes',
    summary:
      'The interface frames writing, speaking, reading and listening tasks around actual site communication.',
    description:
      'Simulate FIDIC contract negotiations, site safety briefings, technical RFI drafting, and oral defenses with live AI feedback.',
  },
  {
    kicker: '03 / IMPROVE',
    title: 'Turn feedback into the next action',
    summary:
      'AI review, mistake memory and analytics keep the learner moving from attempt to measurable progress.',
    description:
      'Every mistake is logged to your personal Mistake Memory bank with tailored remedial exercises for continuous mastery.',
  },
];

export function WorkflowSection() {
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
              Workflow
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Define, compose and improve through one guided loop.
            </h2>
          </div>
          <p className="text-xs text-foreground/80 font-medium max-w-xl leading-tight">
            Click each step below to preview how EngVox transforms technical communication.
          </p>
        </div>

        {/* Interactive Step Switcher Tabs */}
        <AnimatedSection className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WORKFLOW.map((item, index) => {
            const isActive = activeStepIndex === index;
            return (
              <button
                key={item.title}
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
                    {item.kicker}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      isActive ? 'translate-x-0.5 text-white' : 'text-muted-copy/40'
                    }`}
                  />
                </div>
                <h3 className="text-sm font-bold leading-tight mb-1">{item.title}</h3>
                <p className="text-xs leading-snug font-medium line-clamp-2 opacity-90">
                  {item.summary}
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
                  {activeStep.kicker}
                </span>
                <h4 className="text-base font-extrabold text-foreground">{activeStep.title}</h4>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground/85 leading-normal">
                {activeStep.description}
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
                  Active Guided Action
                </span>
                <p className="text-xs font-bold text-primary">{activeStep.title}</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default WorkflowSection;
