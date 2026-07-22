import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { AI_ACCESS_POLICY } from '@/config/product.config';
import type { AIProviderStatus } from '@/features/ai';
import type { SubscriptionSnapshot } from '@/features/billing';

interface ProviderStatusPanelProps {
  providerStatus: AIProviderStatus;
  providerTone: 'success' | 'danger' | 'warning';
  subscription: SubscriptionSnapshot;
  buyError: string | null;
  isBuyingCredits: boolean;
  onBuyCredits: () => void;
}

export const ProviderStatusPanel = ({
  providerStatus,
  providerTone,
  subscription,
  buyError,
  isBuyingCredits,
  onBuyCredits,
}: ProviderStatusPanelProps) => (
  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#0047bb]/25 bg-surface/80 shadow-sm font-sans">
    <div>
      <p className="text-sm font-bold text-foreground">
        {providerStatus.label}
      </p>
      <p className="text-xs text-muted-copy mt-1 font-medium">
        {providerStatus.state === 'mock-fallback'
          ? 'Mock AI is active for this demo. Secure AI feedback is not connected.'
          : providerStatus.detail}{' '}
        Provider credentials are never requested or stored in this workspace.
      </p>
      {typeof subscription.topupCredits === 'number' &&
        subscription.topupCredits > 0 && (
          <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1 uppercase tracking-wider">
            ✓ Active Top-up Credits: {subscription.topupCredits} requests
            remaining
          </p>
        )}
      {buyError && (
        <p className="text-xs text-rose-500 font-medium mt-2">
          Error: {buyError}
        </p>
      )}
    </div>
    <div className="flex flex-col sm:items-end gap-2 shrink-0">
      <div className="flex flex-wrap gap-2">
        <StatusBadge
          label={AI_ACCESS_POLICY.freeAccess}
          tone="info"
          className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider"
        />
        <StatusBadge
          label={
            providerStatus.state === 'mock-fallback' ? 'Mock AI' : 'Secure AI'
          }
          tone={providerTone}
          className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider"
        />
      </div>
      <Button
        type="button"
        onClick={onBuyCredits}
        disabled={isBuyingCredits}
        className="h-8 rounded-[4px] border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 text-[10px] font-bold uppercase tracking-wider text-emerald-600 cursor-pointer shadow-sm gap-1 transition-all mt-1 px-3 inline-flex items-center justify-center"
      >
        {isBuyingCredits ? 'Processing...' : '+ Buy 50 AI Credits ($5)'}
      </Button>
    </div>
  </div>
);
