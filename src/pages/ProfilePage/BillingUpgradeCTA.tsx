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
  <div className="mt-4 rounded-[4px] border border-[#0047bb]/20 bg-[#0047bb]/5 p-4 space-y-3 shadow-sm">
    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
      <Crown className="h-4 w-4 text-warning fill-warning/20" />
      Pro subscription benefits
    </h5>
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-copy font-medium">
      {PRO_BENEFITS.map((benefit) => (
        <li key={benefit} className="flex items-center gap-1.5">
          <span className="text-success font-bold">✓</span> {benefit}
        </li>
      ))}
    </ul>
    {planId !== 'private' && (
      <Link
        to="/pricing"
        className="w-full mt-2 h-9 inline-flex items-center justify-center rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-xs font-bold uppercase tracking-wider text-white transition-colors text-center cursor-pointer shadow-sm"
      >
        {planId === 'free' ? 'Upgrade Plan' : 'Change / Upgrade Plan'}
      </Link>
    )}
  </div>
);
