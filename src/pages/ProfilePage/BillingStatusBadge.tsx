import { BILLING_PLANS } from '@/features/billing';
import type { BillingPlanId } from '@/features/billing';

interface BillingStatusBadgeProps {
  planId: string;
  status?: string;
}

export const BillingStatusBadge = ({ planId, status }: BillingStatusBadgeProps) => {
  const isFree = planId === 'free' || (planId === 'junior' && status === 'none');
  const planName = BILLING_PLANS[planId as BillingPlanId]?.name ?? 'Free';
  return (
    <span className="text-[10px] font-mono font-medium bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase">
      {isFree ? 'Free Plan Access' : `${planName} Plan Access`}
    </span>
  );
};
