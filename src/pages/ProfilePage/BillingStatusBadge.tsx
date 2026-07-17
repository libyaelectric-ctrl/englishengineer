interface BillingStatusBadgeProps {
  planId: string;
}

export const BillingStatusBadge = ({ planId }: BillingStatusBadgeProps) => (
  <span className="text-[10px] font-mono font-medium bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase">
    {planId === 'pro' ? 'Pro Plan Access' : 'Free Plan Access'}
  </span>
);
