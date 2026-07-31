import { Eye, KeyRound, Lock } from 'lucide-react';

import { useState } from 'react';

import { LockProgressBar } from './LockProgressBar';
import { PlacementBypassModal } from './PlacementBypassModal';

interface SkillLockedStateProps {
  skillName: string;
  readingDone: number;
  writingDone: number;
  readingThreshold: number;
  writingThreshold: number;
  onPreview?: () => void;
  onUnlocked?: () => void;
}

export const SkillLockedState = ({
  skillName,
  readingDone,
  writingDone,
  readingThreshold,
  writingThreshold,
  onPreview,
  onUnlocked,
}: SkillLockedStateProps) => {
  const [bypassModalOpen, setBypassModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-[4px] border-2 border-primary bg-surface p-8 text-center space-y-4 shadow-2xl relative light-sweep-container overflow-hidden">
        <Lock className="mx-auto h-10 w-10 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{skillName} Locked</h2>
        <p className="text-xs text-muted-copy leading-relaxed">
          Complete {readingThreshold} readings and {writingThreshold} writings to unlock {skillName}
          .
        </p>
        <div className="space-y-2 text-[10px]">
          <LockProgressBar label="Reading" done={readingDone} total={readingThreshold} />
          <LockProgressBar label="Writing" done={writingDone} total={writingThreshold} />
        </div>

        {/* Bypass & Placement Test Options */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={() => setBypassModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary/15 border border-primary/30 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/25 transition cursor-pointer"
          >
            <KeyRound className="h-4 w-4" />
            <span>Placement Test or Senior Engineer Bypass</span>
          </button>

          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-muted-copy hover:text-foreground transition cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5 text-emerald-500" />
              <span>Try 1 Free Sample Preview Mission</span>
            </button>
          )}
        </div>
      </div>

      <PlacementBypassModal
        isOpen={bypassModalOpen}
        onClose={() => setBypassModalOpen(false)}
        onUnlocked={() => {
          if (onUnlocked) onUnlocked();
        }}
      />
    </div>
  );
};
