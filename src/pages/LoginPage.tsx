/**
 * LoginPage Component
 *
 * Provides multiple authentication flows for users:
 * 1. Email & Password Sign-in/Sign-up (using Supabase Auth client).
 * 2. Social OAuth Providers - Integration for Google, LinkedIn, and Apple.
 * 3. Enterprise Single Sign-On (SSO) - SAML/Okta redirects using corporate email domains.
 * 4. Local Demo Mode - Fast sandbox login for testing in local environment.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { useLearningStore } from '@/core/learning';
import { AUTH_CONFIG } from '@/features/auth/auth.config';
import { Button } from '@/shared/components/Button';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import {
  AVAILABLE_INTERFACE_LANGUAGES,
  useLocalizationStore,
} from '@/features/localization';
import { getSupabaseClient } from '@/features/auth/supabase.client';
import { ShieldAlert, Mail, Lock, ArrowRight } from 'lucide-react';

interface RouteLocationState {
  from?: { pathname?: string };
}

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const AUTH_COPY = {
  en: {
    loginTitle: 'Welcome back',
    signupTitle: 'Create your account',
    loginSubtitle: 'Sign in to continue learning',
    signupSubtitle: 'Start your engineering English journey',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButton: 'Sign in',
    signupButton: 'Create account',
    orContinueWith: 'or continue with',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    signupLink: 'Sign up',
    loginLink: 'Sign in',
    demoMessage: 'Demo mode: local-only, not a secure account.',
    interfaceLanguage: 'Language',
    forgotPassword: 'Forgot password?',
  },
  tr: {
    loginTitle: 'Tekrar hoş geldin',
    signupTitle: 'Hesabını oluştur',
    loginSubtitle: 'Devam etmek için giriş yap',
    signupSubtitle: 'İngilizce öğrenme yolculuğuna başla',
    emailLabel: 'E-posta',
    passwordLabel: 'Şifre',
    loginButton: 'Giriş yap',
    signupButton: 'Hesap oluştur',
    orContinueWith: 'veya şununla devam et',
    noAccount: 'Hesabın yok mu?',
    hasAccount: 'Zaten hesabın var mı?',
    signupLink: 'Kayıt ol',
    loginLink: 'Giriş yap',
    demoMessage: 'Demo modu: yalnızca yerel, güvenli hesap değil.',
    interfaceLanguage: 'Dil',
    forgotPassword: 'Şifremi unuttum?',
  },
} as const;

const SOCIAL_PROVIDERS = [
  {
    name: 'Google',
    provider: 'google' as const,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    provider: 'linkedin' as const,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.607H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'Apple',
    provider: 'apple' as const,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signUp, demoLogin, initialize, isLoading, providerMode } =
    useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(
    location.pathname === '/signup'
  );
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [ssoDomain, setSsoDomain] = useState('');
  const [showSsoForm, setShowSsoForm] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const isSupabaseMode = providerMode === 'supabase';
  const isLocalAuthBlocked = !isSupabaseMode && !AUTH_CONFIG.localAuthAllowed;
  const isLocalDemoMode = !isSupabaseMode && !isLocalAuthBlocked;
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);
  const copy = AUTH_COPY[language] ?? AUTH_COPY.en;

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const from =
    (location.state as RouteLocationState | null)?.from?.pathname ||
    '/dashboard';

  const handleSocialLogin = async (
    provider: 'google' | 'linkedin' | 'apple'
  ) => {
    const client = getSupabaseClient();
    if (!client) {
      setError(
        'Social login requires Supabase authentication to be configured.'
      );
      return;
    }

    try {
      setSocialLoading(provider);
      setError(null);
      const { error: authError } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (authError) {
        if (
          authError.message?.includes('not enabled') ||
          authError.message?.includes('Unsupported provider')
        ) {
          setError(
            `${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not yet enabled. Please use email login or try the demo mode.`
          );
        } else {
          throw authError;
        }
      }
    } catch (err: unknown) {
      setSocialLoading(null);
      const msg = getErrorMessage(err, `${provider} sign-in failed.`);
      if (msg.includes('not enabled') || msg.includes('Unsupported provider')) {
        setError(
          `${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not yet enabled. Please use email login or try the demo mode.`
        );
      } else {
        setError(msg);
      }
    }
  };

  const handleDemoSubmit = async () => {
    try {
      setError(null);
      useLearningStore.getState().resetAll();
      await demoLogin();
      const loggedUser = useAuthStore.getState().currentUser;
      if (loggedUser) {
        const { LearningProfileRepository } =
          await import('@/features/profile/profile.repository');
        LearningProfileRepository.updatePreferences(loggedUser.id, {
          onboardingCompleted: true,
        });
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to initialize demo'));
    }
  };

  const handleSsoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoDomain.trim()) {
      setError('Please enter your company domain or SSO Provider ID.');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setError('SSO requires Supabase authentication to be configured.');
      return;
    }

    try {
      setSsoLoading(true);
      setError(null);
      const domainOrId = ssoDomain.trim();
      const domain = domainOrId.includes('@')
        ? domainOrId.split('@')[1]
        : domainOrId;
      const { data, error: authError } = await client.auth.signInWithSSO({
        domain,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (authError) throw authError;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError('No redirect URL returned from SSO provider.');
      }
    } catch (err: unknown) {
      setSsoLoading(false);
      setError(getErrorMessage(err, 'SSO authentication failed.'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const derivedDisplayName = email.trim().split('@')[0] || 'EngVox User';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isSupabaseMode && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setError(null);
      if (isSupabaseMode && isSignUpMode) {
        ProductAnalyticsService.track('signup_started', '/login', {
          metadata: { source: 'user' },
        });
        await signUp(derivedDisplayName, email.trim(), password);
        ProductAnalyticsService.track('signup_completed', '/login', {
          metadata: { source: 'system' },
        });
      } else {
        await login(
          derivedDisplayName,
          email.trim(),
          isSupabaseMode ? password : undefined
        );
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Sign-in failed.'));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      {/* Top nav */}
      <nav className="flex items-center justify-between border-b border-border-soft px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/brand/logo.png"
            alt="EngVox"
            className="h-8 w-8 rounded-lg"
          />
          <span className="text-sm font-semibold">EngVox</span>
        </Link>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'tr')}
            className="rounded-lg border border-border-soft bg-surface px-2 py-1.5 text-xs text-foreground outline-none"
          >
            {AVAILABLE_INTERFACE_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-xl font-semibold">
              {isSignUpMode ? copy.signupTitle : copy.loginTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-copy">
              {isSignUpMode ? copy.signupSubtitle : copy.loginSubtitle}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-error/20 bg-error/5 p-3 text-xs text-error">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Social logins */}
          <div className="space-y-3">
            {SOCIAL_PROVIDERS.map((sp) => (
              <button
                key={sp.provider}
                type="button"
                onClick={() => handleSocialLogin(sp.provider)}
                disabled={socialLoading !== null}
                className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border-soft bg-surface text-sm font-medium text-foreground hover:bg-surface-hover hover:border-border-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {socialLoading === sp.provider ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                ) : (
                  sp.icon
                )}
                {socialLoading === sp.provider
                  ? 'Connecting...'
                  : `Continue with ${sp.name}`}
              </button>
            ))}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-soft" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-background px-3 text-muted-copy">
                  {copy.orContinueWith}
                </span>
              </div>
            </div>
          </div>

          {/* Email/Password or SSO Form */}
          {showSsoForm ? (
            <form onSubmit={handleSsoSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Company email domain
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
                  <input
                    required
                    type="text"
                    value={ssoDomain}
                    onChange={(e) => setSsoDomain(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border-soft bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted-copy/50 outline-none focus:border-border-hover transition-colors"
                    placeholder="company.com"
                  />
                </div>
                <p className="mt-1.5 text-[10px] leading-4 text-muted-copy">
                  Enter your organization's email domain or provider ID to
                  redirect to SAML SSO.
                </p>
              </div>

              <Button
                type="submit"
                disabled={ssoLoading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background hover:opacity-90 transition-opacity"
              >
                {ssoLoading ? 'Connecting to SSO...' : 'Sign in with SSO'}
                {!ssoLoading && <ArrowRight className="h-4 w-4" />}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowSsoForm(false);
                  setError(null);
                }}
                className="w-full text-center text-xs font-medium text-muted-copy hover:text-foreground transition-colors py-2"
              >
                ← Back to regular login
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    {copy.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-lg border border-border-soft bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted-copy/50 outline-none focus:border-border-hover transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="mb-1.5 block text-xs font-medium text-foreground">
                      {copy.passwordLabel}
                    </label>
                    {!isSignUpMode && (
                      <button
                        type="button"
                        className="text-xs text-muted-copy hover:text-foreground transition-colors"
                      >
                        {copy.forgotPassword}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 w-full rounded-lg border border-border-soft bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted-copy/50 outline-none focus:border-border-hover transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || isLocalAuthBlocked}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background hover:opacity-90 transition-opacity"
                >
                  {isLoading
                    ? 'Loading...'
                    : isSignUpMode
                      ? copy.signupButton
                      : copy.loginButton}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              {isSupabaseMode && !isSignUpMode && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSsoForm(true);
                    setError(null);
                  }}
                  className="w-full text-center text-xs font-medium text-muted-copy hover:text-foreground transition-colors pt-2"
                >
                  Sign in with Single Sign-On (SSO)
                </button>
              )}
            </>
          )}

          {/* Switch mode */}
          <p className="text-center text-sm text-muted-copy">
            {isSignUpMode ? copy.hasAccount : copy.noAccount}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode((m) => !m);
                setError(null);
              }}
              className="font-medium text-foreground hover:underline"
            >
              {isSignUpMode ? copy.loginLink : copy.signupLink}
            </button>
          </p>

          {/* Demo mode */}
          {isLocalDemoMode && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleDemoSubmit}
                disabled={isLoading}
                className="text-xs text-muted-copy hover:text-foreground transition-colors"
              >
                Try demo mode →
              </button>
              <p className="mt-1 text-[10px] text-muted-copy">
                {copy.demoMessage}
              </p>
            </div>
          )}

          {/* Footer */}
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
