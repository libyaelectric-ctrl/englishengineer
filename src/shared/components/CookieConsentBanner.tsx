import { useEffect, useState } from 'react';

const STORAGE_KEY = 'engvox_cookie_consent';

export type CookieConsent = 'accepted' | 'rejected' | null;

export const getCookieConsent = (): CookieConsent => {
  try {
    return localStorage.getItem(STORAGE_KEY) as CookieConsent;
  } catch {
    return null;
  }
};

export const setCookieConsent = (consent: CookieConsent): void => {
  try {
    if (consent) {
      localStorage.setItem(STORAGE_KEY, consent);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable
  }
};

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = async () => {
    setCookieConsent('accepted');
    setVisible(false);
    const { reloadApp } = await import('@/shared/utils/capacitor');
    await reloadApp();
  };

  const handleReject = () => {
    setCookieConsent('rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-soft bg-surface/95 backdrop-blur-sm shadow-lg lg:bottom-0"
      style={{ bottom: 'max(0px, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 sm:px-6 max-w-7xl">
        <p className="text-xs sm:text-sm text-muted-copy leading-relaxed">
          Bu site deneyimi iyileştirmek için çerez kullanır. Analitik çerezler yalnızca onayınızla
          etkinleştirilir.{' '}
          <a href="/legal/privacy" className="underline text-primary hover:text-primary/80">
            Detaylı bilgi
          </a>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReject}
            className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-card)] border border-border-soft text-muted-copy hover:text-foreground hover:bg-background/50 transition-all cursor-pointer"
          >
            Reddet
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 text-xs font-semibold rounded-[var(--radius-card)] bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
