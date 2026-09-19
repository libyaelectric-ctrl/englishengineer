import { PRODUCT_VERSION } from '@/config/product.config';
import { LogOut, Wallet } from 'lucide-react';

interface SidebarFooterProps {
  copy: {
    betaNotice: string;
    poweredBy: string;
    privacy: string;
    terms: string;
    contact: string;
    [key: string]: string;
  };
  collapsed?: boolean;
  currentUser?: { displayName?: string; avatarInitials?: string } | null;
  planName?: string;
  notificationsOpen?: boolean;
  setNotificationsOpen?: (open: boolean) => void;
  onLogout?: () => void;
  onBilling?: () => void;
  navigate?: (path: string) => void;
  startTransition?: (callback: () => void) => void;
  closeSidebarOnMobile?: () => void;
  notificationsCount?: number;
}

export const SidebarFooter = ({
  copy,
  collapsed = false,
  currentUser,
  planName = 'free',
  onLogout,
  onBilling,
}: SidebarFooterProps) => {
  if (collapsed) return null;

  return (
    <div className="flex flex-col gap-3 p-3 border-t border-border-soft">
      {currentUser && (
        <div className="space-y-2 border-b border-border-soft pb-3">
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {currentUser.avatarInitials ||
                currentUser.displayName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-foreground">
                {currentUser.displayName}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                {planName} plan
              </span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onBilling}
              className="flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[4px] border border-border-soft bg-surface text-[10px] font-bold uppercase tracking-wider text-muted-copy transition-colors hover:border-primary hover:text-primary"
            >
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.billing}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[4px] border border-border-soft bg-surface text-[10px] font-bold uppercase tracking-wider text-muted-copy transition-colors hover:border-border-hover hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.logout}
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 text-[10px] text-muted-copy">
        <span className="font-bold text-foreground">{PRODUCT_VERSION}</span>
        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">{copy.betaNotice}</span>
        <span className="mx-1">|</span>
        <span>{copy.poweredBy} EngVox</span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="mailto:support@engvox.com"
          aria-label="Email"
          className="text-muted-copy hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </a>
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-muted-copy">
        <a href="/legal/privacy" className="hover:text-foreground transition-colors">
          Privacy
        </a>
        <span className="mx-1">|</span>
        <a href="/legal/terms" className="hover:text-foreground transition-colors">
          Terms
        </a>
        <span className="mx-1">|</span>
        <a href="mailto:support@engvox.com" className="hover:text-foreground transition-colors">
          Contact
        </a>
      </div>
    </div>
  );
};
