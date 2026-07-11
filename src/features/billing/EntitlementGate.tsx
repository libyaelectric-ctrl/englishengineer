import { useId, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useBillingStore } from './billing.store';
import { canAccessFeature } from './billing.entitlements';
import type { BillingFeature } from './billing.types';
import { StatusBadge } from '@/shared/components/StatusBadge';

interface EntitlementGateProps {
  feature: BillingFeature;
  children: ReactNode;
  title?: string;
  description?: string;
}

export const EntitlementGate = ({
  feature,
  children,
  title = 'Upgrade required',
  description,
}: EntitlementGateProps) => {
  const titleId = useId();
  const subscription = useBillingStore((state) => state.subscription);
  const entitlement = canAccessFeature(subscription, feature);

  if (entitlement.allowed) return children;

  return (
    <section
      className="rounded-[16px] border border-primary/20 bg-primary/5 p-6 text-center shadow-sm"
      aria-labelledby={titleId}
    >
      <StatusBadge label="Locked" tone="info" />
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-[12px] border border-primary/20 bg-surface text-primary">
        <LockKeyhole className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 id={titleId} className="mt-4 text-lg font-bold text-foreground">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-copy">
        {description ?? entitlement.reason}
      </p>
      <Link to="/pricing" className="public-primary-action mt-5">
        View plans
      </Link>
    </section>
  );
};
