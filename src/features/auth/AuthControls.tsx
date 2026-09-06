import { ArrowRight, LogOut, UserRound } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useLocalizationStore } from '@/features/localization';

import { useFirebaseAuth } from './FirebaseAuth';
import { useAuthStore } from './auth.store';
import { AUTH_SIGN_IN_URL, AUTH_SIGN_UP_URL } from './firebase.config';

/**
 * Navbar auth controls. Signed out: login/sign-up links. Signed in: an avatar
 * button with a small dropdown (profile + sign out) — replaces Clerk's
 * UserButton now that Firebase Auth is the provider.
 */
export const AuthControls = () => {
  const translate = useLocalizationStore((s) => s.translate);
  const { isSignedIn } = useFirebaseAuth();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  const appAuthLinks = (
    <div className="flex items-center gap-1.5">
      <Link
        to={AUTH_SIGN_IN_URL}
        className="inline-flex items-center rounded-lg border border-border-soft bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover hover:border-primary/40 transition-colors cursor-pointer whitespace-nowrap"
      >
        {translate('common.login') || 'Log in'}
      </Link>
      <Link
        to={AUTH_SIGN_UP_URL}
        className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors cursor-pointer whitespace-nowrap"
        aria-label={translate('landing.startFree') || 'Start Free'}
      >
        {translate('landing.startFree') || 'Sign Up'}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );

  if (!isSignedIn || !currentUser) {
    return appAuthLinks;
  }

  const handleSignOut = async (): Promise<void> => {
    setMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Account menu"
        aria-expanded={menuOpen}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border-soft bg-surface text-[11px] font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-surface-hover cursor-pointer"
      >
        {currentUser.avatarInitials || 'U'}
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-9 z-50 w-44 overflow-hidden rounded-xl border border-border-soft bg-surface shadow-xl">
          <div className="border-b border-border-soft px-3 py-2">
            <p className="truncate text-xs font-bold text-foreground">{currentUser.displayName}</p>
            <p className="truncate text-[10px] text-muted-copy">{currentUser.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              navigate('/profile');
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-surface-hover cursor-pointer"
          >
            <UserRound className="h-3.5 w-3.5" />
            {translate('common.profile') || 'Profile'}
          </button>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-rose-400 transition-colors hover:bg-surface-hover cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            {translate('common.logout') || 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
};
