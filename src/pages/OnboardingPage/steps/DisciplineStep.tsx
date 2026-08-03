import {
  Bot,
  Building2,
  Code2,
  Cpu,
  Factory,
  FlaskConical,
  HardHat,
  ShieldCheck,
  Wrench,
  Zap,
} from 'lucide-react';

import {
  DISCIPLINE_META,
  ENGINEERING_DISCIPLINES,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  FlaskConical,
  HardHat,
  Zap,
  Cpu,
  ShieldCheck,
  Factory,
  Wrench,
  Bot,
  Code2,
};

type DisciplineStepProps = {
  discipline: EngineeringDiscipline;
  setDiscipline: (d: EngineeringDiscipline) => void;
};

export const DisciplineStep = ({ discipline, setDiscipline }: DisciplineStepProps) => {
  const { translate } = useLocalizationStore();

  return (
    <section>
      <h2 className="text-xl font-medium">{translate('onboarding.selectDiscipline')}</h2>
      <p className="mt-2 text-sm text-muted-copy">{translate('onboarding.roleContext')}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {ENGINEERING_DISCIPLINES.map((id) => {
          const meta = DISCIPLINE_META[id];
          const IconComponent = ICON_MAP[meta.icon];
          const isSelected = discipline === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setDiscipline(id)}
              className={`flex items-start gap-3 rounded-[var(--radius-card)] border p-4 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border-soft bg-surface hover:border-border-hover hover:bg-surface-hover'
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isSelected ? 'bg-primary/10 text-primary' : 'bg-surface-hover text-muted-copy'
                }`}
              >
                {IconComponent && <IconComponent className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}
                >
                  {translate(meta.labelKey as TranslationKey)}
                </p>
                <p className="mt-0.5 text-xs text-muted-copy">
                  {translate(meta.descriptionKey as TranslationKey)}
                </p>
                <p className="mt-1 text-[10px] font-medium text-muted-copy/70">
                  {meta.wordCount.toLocaleString()} terms
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
