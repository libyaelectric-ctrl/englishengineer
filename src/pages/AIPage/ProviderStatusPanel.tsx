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
  <div className="premium-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between font-sans">
    <div>
      <p className="text-sm font-medium text-foreground">
        {providerStatus.label}
      </p>
      <p className="text-xs text-muted-copy mt-1">
        {providerStatus.state === 'mock-fallback'
          ? 'Mock AI is active for this demo. Secure AI feedback is not connected.'
          : providerStatus.detail}{' '}
        Provider credentials are never requested or stored in this workspace.
      </p>
      {typeof subscription.topupCredits === 'number' &&
        subscription.topupCredits > 0 && (
          <p className="text-xs text-emerald-500 font-medium mt-2 flex items-center gap-1">
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
        <StatusBadge label={AI_ACCESS_POLICY.freeAccess} tone="info" />
        <StatusBadge
          label={
            providerStatus.state === 'mock-fallback' ? 'Mock AI' : 'Secure AI'
          }
          tone={providerTone}
        />
      </div>
      <Button
        type="button"
        onClick={onBuyCredits}
        disabled={isBuyingCredits}
        className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 h-7 px-3 flex items-center gap-1 mt-1 rounded-card transition-all"
      >
        {isBuyingCredits ? 'Processing...' : '+ Buy 50 AI Credits ($5)'}
      </Button>
    </div>
  </div>
);
