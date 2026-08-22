import { Lock, Sparkles } from 'lucide-react';

import { Link } from 'react-router-dom';

import { cn } from '@/shared/utils/cn';

interface FeatureLockOverlayProps {
  /** The feature name to display */
  featureName: string;
  /** Required plan to unlock */
  requiredPlan?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Overlay shown on locked feature sections.
 * Displays a lock icon, the feature name, and an upgrade CTA.
 */
export const FeatureLockOverlay = ({
  featureName,
  requiredPlan = 'Junior',
  className,
}: FeatureLockOverlayProps) => (
  <div
    className={cn(
      'absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[var(--radius-card)] bg-background/80 backdrop-blur-sm border border-border-soft',
      className
    )}
  >
    <div className="flex flex-col items-center gap-3 text-center px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted-copy/10 border border-border-soft">
        <Lock className="h-5 w-5 text-muted-copy" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{featureName}</p>
        <p className="mt-1 text-xs text-muted-copy">Requires {requiredPlan} plan or higher</p>
      </div>
      <Link
        to="/pricing"
        className="inline-flex items-center gap-1.5 rounded-[4px] bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-primary/90 transition-colors shadow-sm"
      >
        <Sparkles className="h-3 w-3" />
        Upgrade to Unlock
      </Link>
    </div>
  </div>
);

/**
 * Inline lock badge for feature items in lists.
 * Shows a small lock icon next to the feature name.
 */
export const LockBadge = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded bg-warning/10 border border-warning/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning',
      className
    )}
  >
    <Lock className="h-2.5 w-2.5" />
    Locked
  </span>
);
