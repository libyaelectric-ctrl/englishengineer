import { Download, Smartphone, WifiOff, X } from 'lucide-react';

import { useState } from 'react';

export const PwaInstallBanner = () => {
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
    <div className="fixed bottom-4 left-4 z-40 max-w-sm rounded-2xl border border-primary/30 bg-surface/95 backdrop-blur-md p-3.5 shadow-2xl space-y-2 light-sweep-container overflow-hidden animate-in slide-in-from-bottom">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">EngVox PWA Mobile App</div>
            <div className="text-[10px] text-muted-copy flex items-center gap-1">
              <WifiOff className="h-2.5 w-2.5 text-emerald-500" /> Offline-First Site Practice
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted-copy hover:text-foreground cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {installed ? (
        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 rounded-lg p-2 text-center">
          ✓ App Installed! Launch from your home screen.
        </div>
      ) : (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[9px] text-muted-copy font-medium">
            Install for zero-lag offline audio
          </span>
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground hover:bg-primary-hover transition cursor-pointer shadow-sm"
          >
            <Download className="h-3 w-3" /> Install App
          </button>
        </div>
      )}
    </div>
  );
};
