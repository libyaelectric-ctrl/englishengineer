import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

interface BillingUpgradeCTAProps {
  planId: string;
}

const PRO_BENEFITS = [
  'Spaced repetition full repeats',
  'Writing tasks + secure AI feedback',
  'Advanced Mistake Log analytics',
  'Client / consultant roleplay scenarios',
  '12-month progress history storage',
  'Direct Stripe billing portal access',
];

export const BillingUpgradeCTA = ({ planId }: BillingUpgradeCTAProps) => (
  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
    <h5 className="text-xs font-medium text-foreground uppercase tracking-wider flex items-center gap-1.5">
      <Crown className="h-4 w-4 text-warning fill-warning/20" />
      Pro subscription benefits
    </h5>
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-copy">
      {PRO_BENEFITS.map((benefit) => (
        <li key={benefit} className="flex items-center gap-1.5">
          <span className="text-success font-medium">✓</span> {benefit}
        </li>
      ))}
    </ul>
    {planId !== 'private' && (
      <Link
        to="/pricing"
        className="w-full mt-2 h-9 inline-flex items-center justify-center rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/95 transition-colors text-center"
      >
        {planId === 'free' ? 'Upgrade Plan' : 'Change / Upgrade Plan'}
      </Link>
    )}
  </div>
);
