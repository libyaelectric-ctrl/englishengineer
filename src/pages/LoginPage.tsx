import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useLocalizationStore } from '@/features/localization';
import { AUTH_COPY } from './LoginPage/constants';
import { TopNavBar } from './LoginPage/TopNavBar';
import { SocialLoginButtons } from './LoginPage/SocialLoginButtons';
import { SSOForm } from './LoginPage/SSOForm';
import { EmailPasswordForm } from './LoginPage/EmailPasswordForm';
import { useLoginHandlers } from './LoginPage/useLoginHandlers';

const LoginPage = () => {
  const h = useLoginHandlers();
  const language = useLocalizationStore((state) => state.language);
  const copy = AUTH_COPY[language] ?? AUTH_COPY.en;

  useEffect(() => {
    void h.initialize();
  }, [h.initialize]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-hidden">
      {/* Technical Grid Background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

      <TopNavBar />

      <div className="flex flex-1 items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md rounded-[4px] border border-border-soft bg-surface p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.05)] space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="text-center">
            <h1 className="text-sm font-bold uppercase tracking-widest text-foreground font-mono">
              {h.isSignUpMode ? copy.signupTitle : copy.loginTitle}
            </h1>
            <p className="mt-1.5 text-xs font-medium text-muted-copy">
              {h.isSignUpMode ? copy.signupSubtitle : copy.loginSubtitle}
            </p>
          </div>

          {h.error && (
            <div className="flex items-start gap-2 rounded-[4px] border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-500 font-bold uppercase tracking-wider">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{h.error}</span>
            </div>
          )}

          <SocialLoginButtons
            socialLoading={h.socialLoading}
            onSocialLogin={h.handleSocialLogin}
            orContinueWith={copy.orContinueWith}
          />

          {h.showSsoForm ? (
            <SSOForm
              ssoDomain={h.ssoDomain}
              onSsoDomainChange={h.setSsoDomain}
              ssoLoading={h.ssoLoading}
              onSubmit={h.handleSsoSubmit}
              onBack={() => {
                h.setShowSsoForm(false);
                h.setError(null);
              }}
            />
          ) : (
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
              onShowSsoForm={() => {
                h.setShowSsoForm(true);
                h.setError(null);
              }}
              copy={copy}
            />
          )}

          <p className="text-center text-xs text-muted-copy font-bold uppercase tracking-wider">
            {h.isSignUpMode ? copy.hasAccount : copy.noAccount}{' '}
            <button
              type="button"
              onClick={h.toggleSignUpMode}
              className="font-bold text-primary hover:underline cursor-pointer"
            >
              {h.isSignUpMode ? copy.loginLink : copy.signupLink}
            </button>
          </p>

          {h.isLocalDemoMode && (
            <div className="text-center border-t border-border-soft pt-4">
              <button
                type="button"
                onClick={h.handleDemoSubmit}
                disabled={h.isLoading}
                className="text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer transition-colors"
              >
                Try demo mode →
              </button>
              <p className="mt-1 text-[9px] font-bold text-muted-copy uppercase tracking-wider">
                {copy.demoMessage}
              </p>
            </div>
          )}

          <p className="text-center text-[10px] text-muted-copy font-bold uppercase tracking-wider">
            By continuing, you agree to our{' '}
            <Link to="/legal/terms" className="underline hover:text-primary">
              Terms
            </Link>{' '}
            and{' '}
            <Link
              to="/legal/privacy"
              className="underline hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
