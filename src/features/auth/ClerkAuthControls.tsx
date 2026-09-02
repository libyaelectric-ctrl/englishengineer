import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { ArrowRight } from 'lucide-react';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Link } from 'react-router-dom';

import { useLocalizationStore } from '@/features/localization';

import { CLERK_PUBLISHABLE_KEY, CLERK_SIGN_IN_URL, CLERK_SIGN_UP_URL } from './clerk.config';

/**
 * Swallows the "no ClerkProvider detected" error so auth controls render
 * nothing instead of crashing when the provider is not mounted (e.g. in unit
 * tests or when the publishable key is missing at runtime).
 */
class ClerkBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Clerk context unavailable — fall back to the app's own auth links.
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export const ClerkAuthControls = () => {
  const translate = useLocalizationStore((s) => s.translate);

  const appAuthLinks = (
    <>
      <Link
        to={CLERK_SIGN_IN_URL}
        className="inline-flex items-center rounded-lg border border-border-soft bg-surface px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-foreground hover:bg-surface-hover hover:border-primary/40 transition-colors cursor-pointer"
      >
        {translate('common.login') || 'Log in'}
      </Link>
      <Link
        to={CLERK_SIGN_UP_URL}
        className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
      >
        {translate('landing.startFree')}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </>
  );

  if (!CLERK_PUBLISHABLE_KEY) {
    return appAuthLinks;
  }

  return (
    <ClerkBoundary>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>{appAuthLinks}</SignedOut>
    </ClerkBoundary>
  );
};
