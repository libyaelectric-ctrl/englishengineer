import { LogOut, Wallet } from 'lucide-react';

import React from 'react';

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

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  copy,
  collapsed = false,
  currentUser,
  planName = 'free',
  onLogout,
  onBilling,
}) => {
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
        <span className="font-bold text-foreground">4.0.22</span>
        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">{copy.betaNotice}</span>
        <span className="mx-1">|</span>
        <span>{copy.poweredBy} EngVox</span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-muted-copy hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.305-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          className="text-muted-copy hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.235 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-muted-copy hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.065 1.14 0 2.064.925 2.064 2.063 0 1.14-.925 2.063-2.064 2.063zm1.782 13.019H3.555V9h3.414v11.999z" />
          </svg>
        </a>
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
        <a href="/contact" className="hover:text-foreground transition-colors">
          Contact
        </a>
      </div>
    </div>
  );
};
