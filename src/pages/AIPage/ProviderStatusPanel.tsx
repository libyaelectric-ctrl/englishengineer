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
  <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#0047bb]/25 bg-surface/80 shadow-sm font-sans">
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold text-foreground">
          {providerStatus.label}
        </p>
        <StatusBadge
          label={
            providerStatus.state === 'mock-fallback' ? 'Mock AI' : 'Secure AI'
          }
          tone={providerTone}
          className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider py-0"
        />
        <StatusBadge
          label={AI_ACCESS_POLICY.freeAccess}
          tone="info"
          className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider py-0 hidden sm:inline-flex"
        />
      </div>
      <p className="text-[11px] text-muted-copy font-medium line-clamp-1">
        {providerStatus.state === 'mock-fallback'
          ? 'Mock AI active. Connect proxy for live model responses.'
          : providerStatus.detail}
      </p>
      {typeof subscription.topupCredits === 'number' &&
        subscription.topupCredits > 0 && (
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 uppercase tracking-wider">
            ✓ Top-up Credits: {subscription.topupCredits} requests remaining
          </p>
        )}
      {buyError && (
        <p className="text-[10px] text-rose-500 font-medium">
          Error: {buyError}
        </p>
      )}
    </div>
    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
      <Button
        type="button"
        onClick={onBuyCredits}
        disabled={isBuyingCredits}
        className="h-7 rounded-[4px] border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 text-[9px] font-bold uppercase tracking-wider text-emerald-600 cursor-pointer shadow-sm gap-1 transition-all px-3 inline-flex items-center justify-center"
      >
        {isBuyingCredits ? 'Processing...' : '+ Buy 50 AI Credits ($5)'}
      </Button>
    </div>
  </div>
);
