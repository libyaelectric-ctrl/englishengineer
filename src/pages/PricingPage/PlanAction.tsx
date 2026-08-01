import { Link } from 'react-router-dom';

import { CommercialPlanPreview } from '@/features/billing';

import { isPlanUnavailable, getPlanActionLabel, getPlanActionStyle } from './pricing.utils';

export const FreePlanButton = ({ currentUser }: { currentUser: { id: string } | null }) => (
  <Link
    to={currentUser ? '/dashboard' : '/start'}
    className="mt-4 flex h-9 w-full items-center justify-center rounded-lg border border-border-soft bg-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-hover transition-all cursor-pointer shadow-sm text-foreground"
  >
    {currentUser ? 'Go to dashboard' : 'Start free'}
  </Link>
);

export const PlanAction = ({
  plan,
  isCurrent,
  inProgress,
  disabled,
  onClick,
}: {
  plan: CommercialPlanPreview;
  isCurrent: boolean;
  inProgress: boolean;
  disabled: boolean;
  onClick: () => void;
}) => {
  const unavailable = isPlanUnavailable(plan);
  const label = getPlanActionLabel({
    planId: plan.id,
    isCurrent,
    inProgress,
    isUnavailable: unavailable,
  });
  const style = getPlanActionStyle({ isUnavailable: unavailable, isCurrent });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-full items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${style}`}
    >
      {label}
    </button>
  );
};
