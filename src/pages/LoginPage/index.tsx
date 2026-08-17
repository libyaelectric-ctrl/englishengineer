import { CheckCircle2, ChevronDown, ShieldAlert, X } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AVAILABLE_INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization';

import { EmailPasswordForm } from './EmailPasswordForm';
import { SocialLoginButtons } from './SocialLoginButtons';
import { useLoginHandlers } from './useLoginHandlers';

const LoginPage = () => {
  const h = useLoginHandlers();
  const { language, setLanguage, translate } = useLocalizationStore();
  const navigate = useNavigate();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentLangOption = AVAILABLE_INTERFACE_LANGUAGES.find((l) => l.id === language) || {
    id: 'en' as SupportedInterfaceLanguage,
    label: 'English',
    nativeLabel: 'English',
    flag: 'EN',
  };

  useEffect(() => {
    void h.initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialize is a stable ref from useLoginHandlers
  }, [h.initialize]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  return (
    /* Full-page backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClose();
      }}
    >
      {/* Modal card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-700 animate-in fade-in zoom-in-95 duration-200">
        {/* Language selector in top-left */}
        <div className="absolute left-4 top-4 z-20" ref={langMenuRef}>
          <button
            type="button"
            onClick={() => setLangMenuOpen((prev) => !prev)}
            aria-label="Change language"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 cursor-pointer shadow-xs"
          >
            <span className="text-sm leading-none font-bold font-mono">
              {currentLangOption.id === 'en' ? 'EN' : currentLangOption.flag}
            </span>
            <span className="uppercase font-semibold tracking-wider text-[11px]">
              {currentLangOption.id}
            </span>
            <ChevronDown
              className={`h-3 w-3 text-zinc-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {langMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-44 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150 [scrollbar-width:thin]">
              {AVAILABLE_INTERFACE_LANGUAGES.map((opt) => {
                const isSelected = opt.id === language;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setLanguage(opt.id as SupportedInterfaceLanguage);
                      setLangMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60'
                    }`}
                  >
                    <span className="text-sm leading-none font-bold font-mono">
                      {opt.id === 'en' ? 'EN' : opt.flag}
                    </span>
                    <span className="flex-1 text-left truncate">
                      {opt.nativeLabel || opt.label}
                    </span>
                    <span className="text-[10px] uppercase text-zinc-400 font-mono">{opt.id}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 py-10 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {h.isSignUpMode
                ? translate('login.createYourAccount')
                : translate('login.welcomeBack')}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {h.isSignUpMode ? translate('login.startJourney') : translate('login.signInContinue')}
            </p>
          </div>

          {/* Success notice */}
          {h.notice && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{h.notice}</span>
            </div>
          )}

          {/* Error alert */}
          {h.error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-2.5 text-sm text-rose-600 dark:text-rose-400 animate-in fade-in">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{h.error}</span>
            </div>
          )}

          {/* Social login buttons */}
          <SocialLoginButtons socialLoading={h.socialLoading} onSocialLogin={h.handleSocialLogin} />

          {/* Email / password form */}
          <EmailPasswordForm
            email={h.email}
            onEmailChange={h.setEmail}
            password={h.password}
            onPasswordChange={h.setPassword}
            isSignUpMode={h.isSignUpMode}
            isLoading={h.isLoading}
            isLocalAuthBlocked={h.isLocalAuthBlocked}
            isSupabaseMode={h.isSupabaseMode}
            onSubmit={h.handleSubmit}
            onForgotPassword={h.handleForgotPassword}
            onShowSsoForm={() => {}}
          />

          {/* Sign in / Sign up toggle */}
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {h.isSignUpMode ? (
              <>
                {translate('login.hasAccount')}{' '}
                <button
                  type="button"
                  onClick={h.toggleSignUpMode}
                  className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer"
                >
                  {translate('login.signIn')}
                </button>
              </>
            ) : (
              <>
                {translate('login.noAccount')}{' '}
                <button
                  type="button"
                  onClick={h.toggleSignUpMode}
                  className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer"
                >
                  {translate('login.createAccount')}
                </button>
              </>
            )}
          </p>

          {/* Demo workspace */}
          <button
            type="button"
            onClick={h.handleDemoSubmit}
            disabled={h.isLoading}
            className="mx-auto block text-xs font-medium text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {translate('login.launchDemo')}
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-8 py-3 rounded-b-2xl">
          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-600">
            EngineerOS · Secure Authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
