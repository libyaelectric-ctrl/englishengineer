import { Mic } from 'lucide-react';
import { ProgressBar } from '@/shared/components/ProgressBar';

interface VoiceMinuteWalletProps {
  voiceMinutesUsedThisMonth: number;
  maxVoiceMinutes: number;
  walletPercent: number;
}

export const VoiceMinuteWallet = ({
  voiceMinutesUsedThisMonth,
  maxVoiceMinutes,
  walletPercent,
}: VoiceMinuteWalletProps) => {
  const isOverQuota = voiceMinutesUsedThisMonth >= maxVoiceMinutes;
  const isWarning = voiceMinutesUsedThisMonth >= 96;

  return (
    <div className="flex items-center gap-4 rounded-[4px] border border-border-soft bg-[#f3f3fd] px-4 py-3 shadow-sm">
      <Mic className="h-4 w-4 shrink-0 text-[#0047bb]" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-bold text-foreground uppercase tracking-wider text-[10px]">
            Monthly Voice Minutes
          </span>
          <span
            className={`font-mono font-bold ${
              isOverQuota
                ? 'text-rose-600'
                : isWarning
                  ? 'text-warning'
                  : 'text-[#0047bb]'
            }`}
          >
            {voiceMinutesUsedThisMonth} / {maxVoiceMinutes} min
          </span>
        </div>
        <ProgressBar
          value={walletPercent}
          color={isOverQuota ? 'rose' : isWarning ? 'warning' : 'primary'}
        />
        <p className="mt-1 text-[10px] font-bold text-muted-copy uppercase tracking-wider">
          {isOverQuota
            ? 'Monthly voice quota reached. Upgrade to Exec for unlimited minutes.'
            : `${maxVoiceMinutes - voiceMinutesUsedThisMonth} min remaining this month`}
        </p>
      </div>
    </div>
  );
};
