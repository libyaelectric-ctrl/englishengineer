import { CheckCircle2, Globe, Layers, Lock } from 'lucide-react';
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

import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import {
  CORE_VOCABULARY_WORD_COUNT,
  DISCIPLINE_META,
} from '@/shared/constants/engineering-disciplines';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { INTERFACE_LANGUAGES } from '@/features/localization/localization.data';
import { useLocalizationStore } from '@/features/localization/localization.store';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

import { ContentPreview } from '@/pages/ProfilePage/ContentPreview';

const DISCIPLINE_ICONS: Record<EngineeringDiscipline, typeof Bot> = {
  architecture: Building2,
  chemical: FlaskConical,
  civil: HardHat,
  electrical: Zap,
  electronics: Cpu,
  hse: ShieldCheck,
  industrial: Factory,
  mechanical: Wrench,
  mechatronics: Bot,
  software: Code2,
};

interface LanguageDisciplineSectionProps {
  currentDiscipline: EngineeringDiscipline;
  profileDiscipline?: EngineeringDiscipline;
  onDisciplineChange: (discipline: EngineeringDiscipline) => void;
  onSave: () => void;
  saved: boolean;
  /** When true the discipline is permanently locked and cannot be changed. */
  locked?: boolean;
}

export const LanguageDisciplineSection = ({
  currentDiscipline,
  profileDiscipline,
  onDisciplineChange,
  onSave,
  saved,
  locked = false,
}: LanguageDisciplineSectionProps) => {
  const { language, setLanguage } = useLocalizationStore();

  return (
    <section id="language-discipline" className="animate-in fade-in duration-200 space-y-6">
      {/* Interface Language */}
      <SectionCard
        title="Interface Language"
        subtitle="Choose the language for the application interface"
        icon={Globe}
      >
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {INTERFACE_LANGUAGES.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as SupportedInterfaceLanguage)}
                  className={`flex items-center gap-2.5 rounded-[4px] border px-3 py-2.5 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                      : 'border-border-soft bg-surface hover:border-primary/40 text-muted-copy hover:text-foreground'
                  }`}
                >
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate">{lang.nativeLabel}</h4>
                    <p className="text-[9px] text-muted-copy truncate">{lang.label}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* Engineering Discipline */}
      <SectionCard
        title="Engineering Discipline"
        subtitle={
          locked
            ? 'Your discipline was chosen at sign-up and is permanent'
            : 'Select your engineering field for tailored vocabulary and content'
        }
        icon={Layers}
      >
        <div className="space-y-4">
          {locked && (
            <p className="flex items-center gap-1.5 rounded-[4px] border border-primary/25 bg-primary/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Lock className="h-3 w-3" />
              Permanently locked — this choice cannot be changed
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(DISCIPLINE_META).map(([id, meta]) => {
              const discipline = id as EngineeringDiscipline;
              const isSelected = currentDiscipline === discipline;
              const Icon = DISCIPLINE_ICONS[discipline];
              return (
                <button
                  key={discipline}
                  type="button"
                  disabled={locked}
                  onClick={() => onDisciplineChange(discipline)}
                  className={`flex items-center gap-3 rounded-[4px] border px-3 py-3 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                      : locked
                        ? 'border-border-soft bg-surface text-muted-copy/50 cursor-not-allowed'
                        : 'border-border-soft bg-surface hover:border-primary/40 text-muted-copy hover:text-foreground cursor-pointer'
                  }`}
                >
                  <span className="text-lg leading-none">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate">{meta.labelKey}</h4>
                    <p className="text-[9px] text-muted-copy">
                      {((meta.wordCount ?? 0) + CORE_VOCABULARY_WORD_COUNT).toLocaleString()} words
                    </p>
                  </div>
                  {isSelected &&
                    (locked ? (
                      <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    ))}
                </button>
              );
            })}
          </div>
          {!locked && currentDiscipline !== profileDiscipline && (
            <ContentPreview discipline={currentDiscipline} />
          )}
        </div>
      </SectionCard>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="rounded-[4px] border border-success/20 bg-success/5 px-2.5 py-1 text-[10px] font-bold text-success uppercase tracking-wider animate-pulse">
            SAVED
          </span>
        )}
        <Button
          onClick={onSave}
          className="text-xs min-h-9 bg-primary hover:bg-primary/90 border border-primary text-white font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
        >
          Save Changes
        </Button>
      </div>
    </section>
  );
};
