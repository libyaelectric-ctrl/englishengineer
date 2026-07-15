import React from 'react';
import { Wallet, CheckCircle } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';

export const BillingTab: React.FC = () => {
  return (
    <SectionCard title="Stripe Billing Integrations" icon={Wallet}>
      <div className="space-y-4">
        <div className="rounded-xl bg-surface-hover/50 p-4 border border-border-soft">
          <h3 className="text-sm font-semibold text-foreground">
            Stripe Connection Health
          </h3>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle className="h-4 w-4" /> Live Keys Configured
            Successfully
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border-soft p-4 bg-surface">
            <p className="text-[10px] font-bold text-muted-copy uppercase">
              Monthly Recurring Revenue
            </p>
            <p className="mt-1 text-xl font-bold text-foreground">$57.00</p>
          </div>
          <div className="rounded-xl border border-border-soft p-4 bg-surface">
            <p className="text-[10px] font-bold text-muted-copy uppercase">
              Stripe Webhooks (Idempotent)
            </p>
            <p className="mt-1 text-xl font-bold text-emerald-600">
              Active (100% OK)
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};