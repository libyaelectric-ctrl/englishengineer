import { Gift } from 'lucide-react';
import { Button } from '@/shared/components/Button';

export const DailyClaimBanner = ({ onClaim }: { onClaim: () => void }) => (
  <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-5">
    <div>
      <p className="text-xs font-medium text-primary uppercase tracking-widest">
        Daily Reward
      </p>
      <h3 className="mt-1 text-lg font-bold text-foreground">
        Claim your daily bonus
      </h3>
      <p className="text-xs text-muted-copy mt-0.5">
        Keep your streak alive and earn bonus XP.
      </p>
    </div>
    <Button
      onClick={onClaim}
      className="gap-2 bg-primary text-white font-medium rounded-lg"
    >
      <Gift className="h-4 w-4" /> Claim
    </Button>
  </div>
);
