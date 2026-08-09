import { Eye, KeyRound, Lock } from 'lucide-react';

import { useState } from 'react';

import { Link } from 'react-router-dom';

import { LockProgressBar } from './LockProgressBar';
import { PlacementBypassModal } from './PlacementBypassModal';

interface Prerequisite {
  label: string;
  done: number;
  threshold: number;
  route?: string;
}

interface SkillLockedStateProps {
  skillName: string;
  prerequisites: Prerequisite[];
  description?: string;
  navigationLinks?: Array<{ label: string; route: string }>;
  onPreview?: () => void;
  onUnlocked?: () => void;
}

export const SkillLockedState = ({
  skillName,
  prerequisites,
  description,
  navigationLinks,
  onPreview,
  onUnlocked,
}: SkillLockedStateProps) => {
  const [bypassModalOpen, setBypassModalOpen] = useState(false);

  const defaultDescription = prerequisites
    .map((p) => `${p.threshold} ${p.label.toLowerCase()}`)
    .join(' and ');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-[4px] border-2 border-primary bg-surface p-8 text-center space-y-4 shadow-2xl relative light-sweep-container overflow-hidden">
        <Lock className="mx-auto h-10 w-10 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{skillName} Locked</h2>
        <p className="text-xs text-muted-copy leading-relaxed">
          {description ?? `Learn ${defaultDescription} to unlock ${skillName}.`}
        </p>
        <div className="space-y-2 text-[10px]">
          {prerequisites.map((p) => (
            <LockProgressBar key={p.label} label={p.label} done={p.done} total={p.threshold} />
          ))}
        </div>

        {/* Bypass & Placement Test Options */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={() => setBypassModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-[var(--radius-card)] bg-primary/15 border border-primary/30 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/25 transition cursor-pointer"
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

          {navigationLinks && navigationLinks.length > 0 && (
            <div className="flex gap-2 justify-center pt-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.route}
                  to={link.route}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Go to {link.label}
                </Link>
              ))}
            </div>
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
