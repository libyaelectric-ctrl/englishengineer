import { Gift } from 'lucide-react';
import { Button } from '@/shared/components/Button';

export const DailyClaimBanner = ({ onClaim }: { onClaim: () => void }) => (
  <div className="flex items-center justify-between rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-5 shadow-sm">
    <div>
      <p className="text-xs font-bold text-[#0047bb] uppercase tracking-widest">
        Daily Reward
      </p>
      <h3 className="mt-1 text-lg font-bold text-foreground">
        Claim your daily bonus
      </h3>
      <p className="text-xs text-muted-copy mt-0.5 font-medium">
        Keep your streak alive and earn bonus XP.
      </p>
    </div>
    <Button
      onClick={onClaim}
      className="gap-2 bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-white font-bold uppercase tracking-wider text-[11px] rounded-[4px] h-10 px-4 cursor-pointer shadow-sm"
    >
      <Gift className="h-4 w-4" /> Claim
    </Button>
  </div>
);
