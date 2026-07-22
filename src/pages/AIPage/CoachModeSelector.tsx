import { Brain, Lock, Sparkles } from 'lucide-react';
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
  <div className="rounded-xl border border-[#0047bb]/25 bg-surface/80 p-3.5 shadow-sm space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-[#0047bb]" />
        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
          Coach Mode
        </span>
      </div>
      {selectedMode && (
        <span className="text-[10px] font-mono text-muted-copy line-clamp-1">
          {selectedMode.description}
        </span>
      )}
    </div>

    <div className="flex flex-wrap gap-1.5">
      {modes.map((mode) => {
        const isActive = mode.id === selectedModeId;
        return (
          <button
            key={mode.id}
            onClick={() => onSetMode(mode.id)}
            className={`px-3 py-1.5 rounded-[4px] border text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
              isActive
                ? 'bg-[#0047bb]/10 border-[#0047bb]/50 text-[#0047bb]'
                : 'border-border-soft bg-surface text-muted-copy hover:border-[#0047bb]/40 hover:text-foreground'
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

    {promptTemplates.length > 0 && (
      <div className="pt-2 border-t border-border-soft/60 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-muted-copy">
          <Sparkles className="h-3 w-3 text-[#0047bb]" />
          <span>Quick Prompt Templates</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {promptTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onSetInput(template.prompt)}
              className="rounded-[4px] border border-border-soft bg-surface-hover px-2.5 py-1 text-left text-[10px] font-bold uppercase tracking-wider text-foreground transition-all hover:border-[#0047bb]/40 cursor-pointer shadow-sm"
            >
              {template.title}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);
