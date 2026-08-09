import { Download, Smartphone, WifiOff, X } from 'lucide-react';

import { useState } from 'react';

import { useLocalizationStore } from '@/features/localization';

export const PwaInstallBanner = () => {
  const translate = useLocalizationStore((s) => s.translate);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  if (dismissed) return null;

  const handleInstall = () => {
    setInstalled(true);
    setTimeout(() => {
      setDismissed(true);
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
      <div className="rounded-[var(--radius-card)] border border-primary/30 bg-surface/95 backdrop-blur-md p-2.5 shadow-lg space-y-1.5 light-sweep-container overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-card)] bg-primary/10 border border-primary/20 text-primary">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">
                {translate('landing.pwaTitle')}
              </div>
              <div className="text-[10px] text-muted-copy flex items-center gap-1">
                <WifiOff className="h-2.5 w-2.5 text-emerald-500" /> {translate('landing.pwaDesc')}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Close banner"
            className="text-muted-copy hover:text-foreground cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {installed ? (
          <div className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 rounded-[var(--radius-card)] p-2 text-center">
            {translate('landing.pwaInstalled')}
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] text-muted-copy font-medium">
              {translate('landing.pwaInstallDesc')}
            </span>
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex items-center gap-1 rounded-[var(--radius-card)] bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground hover:bg-primary-hover transition cursor-pointer shadow-sm shrink-0"
            >
              <Download className="h-2.5 w-2.5" /> {translate('landing.pwaInstallButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
