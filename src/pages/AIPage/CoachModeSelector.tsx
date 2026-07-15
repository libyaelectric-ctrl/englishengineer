import { Brain, Lock, Sparkles } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import {
  canAccessFeature,
  type BillingFeature,
  type SubscriptionSnapshot,
} from '@/features/billing';
import type {
  AICoachModeId,
  AICoachMode,
  AIPromptTemplate,
} from '@/features/ai';
import { MODE_REQUIRED_FEATURES } from './hooks/useAIPage';

interface CoachModeSelectorProps {
  modes: AICoachMode[];
  selectedModeId: AICoachModeId;
  selectedMode: AICoachMode | null;
  promptTemplates: AIPromptTemplate[];
  subscription: SubscriptionSnapshot;
  onSetMode: (id: AICoachModeId) => void;
  onSetInput: (input: string) => void;
}

export const CoachModeSelector = ({
  modes,
  selectedModeId,
  selectedMode,
  promptTemplates,
  subscription,
  onSetMode,
  onSetInput,
}: CoachModeSelectorProps) => (
  <>
    <SectionCard
      title="Coach Mode"
      subtitle="Choose a practical engineering communication mode"
      icon={Brain}
    >
      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => {
          const isActive = mode.id === selectedModeId;
          return (
            <button
              key={mode.id}
              onClick={() => onSetMode(mode.id)}
              className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-border-soft bg-surface text-muted-copy hover:border-primary/40'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {mode.name}
                {(() => {
                  const reqFeat = MODE_REQUIRED_FEATURES[mode.id];
                  const isLocked = reqFeat
                    ? !canAccessFeature(subscription, reqFeat as BillingFeature)
                        .allowed
                    : false;
                  return isLocked ? (
                    <Lock className="h-3 w-3 text-muted-copy" />
                  ) : null;
                })()}
              </span>
            </button>
          );
        })}
      </div>
      {selectedMode && (
        <p className="mt-2 text-[11px] text-muted-copy">
          {selectedMode.description}
        </p>
      )}
    </SectionCard>

    {promptTemplates.length > 0 && (
      <SectionCard
        title="Prompt Templates"
        subtitle="Quick starting points"
        icon={Sparkles}
      >
        <div className="flex flex-wrap gap-2">
          {promptTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onSetInput(template.prompt)}
              className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-left text-xs font-medium transition-all hover:border-primary/40 hover:bg-surface-hover"
            >
              {template.title}
            </button>
          ))}
        </div>
      </SectionCard>
    )}
  </>
);
