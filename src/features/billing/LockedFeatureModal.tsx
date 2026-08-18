import { LockKeyhole } from 'lucide-react';

import { useEffect, useRef } from 'react';

import { Button } from '@/shared/components/Button';

import { canAccessFeature } from './billing.entitlements';
import { BILLING_PLANS } from './billing.helpers';
import { useBillingStore } from './billing.store';
import type { BillingFeature } from './billing.types';

export interface LockedFeatureModalItem {
  label: string;
  feature?: BillingFeature;
  comingSoon?: boolean;
}

interface LockedFeatureModalProps {
  item: LockedFeatureModalItem | null;
  onClose: () => void;
  onSeePlans: () => void;
}

/**
 * Explains which plan unlocks a locked menu item before the user is sent to
 * the pricing page. For "coming soon" items (Team) it explains the feature
 * is not available yet instead of demanding an upgrade.
 */
export const LockedFeatureModal = ({ item, onClose, onSeePlans }: LockedFeatureModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const subscription = useBillingStore((state) => state.subscription);

  const open = item !== null;
  const requiredPlan = item?.feature
    ? canAccessFeature(subscription, item.feature).requiredPlan
    : null;

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!item) return null;

  const plan = requiredPlan ? BILLING_PLANS[requiredPlan] : null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.comingSoon ? 'Coming soon' : 'Upgrade required'}
        tabIndex={-1}
        data-testid="locked-feature-modal"
        className="max-h-[calc(100vh-2rem)] w-full max-w-md space-y-5 overflow-y-auto rounded-[var(--radius-card)] border border-border-soft bg-surface p-6 text-center shadow-xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover">
          <LockKeyhole className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            {item.comingSoon ? 'Coming soon' : 'Upgrade required'}
          </h3>
          <p className="text-sm leading-6 text-muted-copy">
            {item.comingSoon
              ? `${item.label} is on its way. We will let you know as soon as it is available.`
              : plan
                ? `${item.label} is included in the ${plan.name} plan. Upgrade to unlock it.`
                : `${item.label} is not available on any plan yet.`}
          </p>
        </div>

        {plan && (
          <div className="mx-auto inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-primary/25 bg-primary/10 px-4 py-2">
            <span className="text-xs font-medium text-muted-copy">Requires</span>
            <span className="text-sm font-bold text-primary">{plan.name}</span>
            <span className="text-xs font-medium text-muted-copy">plan</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Maybe later
          </Button>
          {!item.comingSoon && (
            <Button onClick={onSeePlans} className="flex-1">
              See plans
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
