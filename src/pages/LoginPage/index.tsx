import { ShieldAlert, X } from 'lucide-react';

import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLocalizationStore } from '@/features/localization';

import { EmailPasswordForm } from './EmailPasswordForm';
import { SocialLoginButtons } from './SocialLoginButtons';
import { useLoginHandlers } from './useLoginHandlers';

const LoginPage = () => {
  const h = useLoginHandlers();
  const translate = useLocalizationStore((state) => state.translate);
  const navigate = useNavigate();

  useEffect(() => {
    void h.initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialize is a stable ref from useLoginHandlers
  }, [h.initialize]);

  const handleClose = () => {
    navigate('/');
  };

  return (
    /* Full-page backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Modal card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-700 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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
            onShowSsoForm={() => {}}
          />

          {/* Sign in / Sign up toggle */}
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {h.isSignUpMode ? (
              <>
                Already have an account?{' '}
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
                {"Don't have an account?"}{' '}
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
