import { Crown } from 'lucide-react';

import { Link } from 'react-router-dom';

import { hasActivePaidAccess } from '../billing.entitlements';
import type { SubscriptionSnapshot } from '../billing.types';

interface BillingUpgradeCTAProps {
  subscription: SubscriptionSnapshot;
}

const PRO_BENEFITS = [
  'Spaced repetition full repeats',
  'Writing tasks + secure AI feedback',
  'Advanced Mistake Log analytics',
  'Client / consultant roleplay scenarios',
  '12-month progress history storage',
  'Secure billing portal access',
];

export const BillingUpgradeCTA = ({ subscription }: BillingUpgradeCTAProps) => (
  <div className="mt-4 rounded-[4px] border border-primary/20 bg-primary/5 p-4 space-y-3 shadow-sm">
    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
      <Crown className="h-4 w-4 text-warning fill-warning/20" />
      Paid subscription benefits
    </h5>
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-copy font-medium">
      {PRO_BENEFITS.map((benefit) => (
        <li key={benefit} className="flex items-center gap-1.5">
          <span className="text-success font-bold">✓</span> {benefit}
        </li>
      ))}
    </ul>
    {/* `team` is a plan the backend can report and this app does not sell, so the CTA that
        points at /pricing stays hidden for it. What a `team` subscriber should be offered is
        an open product decision; this guard only withholds the control that does not apply.
        It needs no assertion: the snapshot's plan id is the incoming id type. */}
    {subscription.planId !== 'team' && (
      <Link
        to="/pricing"
        className="w-full mt-2 h-9 inline-flex items-center justify-center rounded-[4px] bg-primary hover:bg-primary/90 border border-primary text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors text-center cursor-pointer shadow-sm"
      >
        {!hasActivePaidAccess(subscription) ? 'Upgrade Plan' : 'Change / Upgrade Plan'}
      </Link>
    )}
  </div>
);
