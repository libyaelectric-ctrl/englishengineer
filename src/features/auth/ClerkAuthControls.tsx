import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { ArrowRight } from 'lucide-react';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Link } from 'react-router-dom';

import { useLocalizationStore } from '@/features/localization';

import { CLERK_PUBLISHABLE_KEY } from './clerk.config';

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
        to="/login"
        className="hidden sm:inline-flex items-center rounded border border-border-soft bg-surface px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-surface-hover hover:border-primary/40 transition-colors ml-1"
      >
        {translate('common.login') || 'Log in'}
      </Link>
      <Link
        to="/signup"
        className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors ml-0.5"
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
