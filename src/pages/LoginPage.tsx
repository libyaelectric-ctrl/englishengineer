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
    <div className="flex min-h-screen flex-col bg-transparent">
      <TopNavBar />

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-semibold">
              {h.isSignUpMode ? copy.signupTitle : copy.loginTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-copy">
              {h.isSignUpMode ? copy.signupSubtitle : copy.loginSubtitle}
            </p>
          </div>

          {h.error && (
            <div className="flex items-start gap-2 rounded-lg border border-error/20 bg-error/5 p-3 text-xs text-error">
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

          <p className="text-center text-sm text-muted-copy">
            {h.isSignUpMode ? copy.hasAccount : copy.noAccount}{' '}
            <button
              type="button"
              onClick={h.toggleSignUpMode}
              className="font-medium text-foreground hover:underline"
            >
              {h.isSignUpMode ? copy.loginLink : copy.signupLink}
            </button>
          </p>

          {h.isLocalDemoMode && (
            <div className="text-center">
              <button
                type="button"
                onClick={h.handleDemoSubmit}
                disabled={h.isLoading}
                className="text-xs text-muted-copy hover:text-foreground transition-colors"
              >
                Try demo mode →
              </button>
              <p className="mt-1 text-[10px] text-muted-copy">
                {copy.demoMessage}
              </p>
            </div>
          )}

          <p className="text-center text-[10px] text-muted-copy">
            By continuing, you agree to our{' '}
            <Link to="/legal/terms" className="underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/legal/privacy" className="underline">
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
