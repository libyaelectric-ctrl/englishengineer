import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { useLearningStore } from '@/core/learning';
import { AUTH_CONFIG } from '@/features/auth/auth.config';
import { Button } from '@/shared/components/Button';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import {
  AVAILABLE_INTERFACE_LANGUAGES,
  useLocalizationStore,
} from '@/features/localization';
import {
  Terminal,
  ShieldAlert,
  Sparkles,
  Mail,
  LogIn,
  Lock,
} from 'lucide-react';

interface RouteLocationState {
  from?: {
    pathname?: string;
  };
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const AUTH_COPY = {
  en: {
    loginTab: 'Login',
    createAccountTab: 'Create Account',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    loginButton: 'Login',
    createAccountButton: 'Create Account',
    enterButton: 'Enter EngineerOS',
    alreadyHaveAccount: 'Already have an account?',
    newHere: 'New here?',
    switchToLogin: 'Login',
    switchToCreate: 'Create account',
    heroTitle: 'Master the English you actually use on site.',
    demoMessage: 'Demo mode: local-only, not a secure account.',
    interfaceLanguage: 'Interface language',
  },
  tr: {
    loginTab: 'Giriş Yap',
    createAccountTab: 'Hesap Oluştur',
    emailLabel: 'E-posta Adresi',
    passwordLabel: 'Şifre',
    loginButton: 'Giriş Yap',
    createAccountButton: 'Hesap Oluştur',
    enterButton: 'Enter EngineerOS',
    alreadyHaveAccount: 'Zaten hesabın var mı?',
    newHere: 'Yeni misin?',
    switchToLogin: 'Giriş yap',
    switchToCreate: 'Hesap oluştur',
    heroTitle: 'Şantiyede gerçekten kullandığın İngilizcede ustalaş.',
    demoMessage: 'Demo modu: yalnızca yerel kullanım, güvenli bir hesap değildir.',
    interfaceLanguage: 'Arayüz dili',
  },
} as const;

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
  const isSupabaseMode = providerMode === 'supabase';
  const isLocalAuthBlocked = !isSupabaseMode && !AUTH_CONFIG.localAuthAllowed;
  const isLocalDemoMode = !isSupabaseMode && !isLocalAuthBlocked;
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);
  const copy = AUTH_COPY[language] ?? AUTH_COPY.en;

  useEffect(() => {
    void initialize();
  }, [initialize]);

  // Fallback destination is /dashboard
  const from =
    (location.state as RouteLocationState | null)?.from?.pathname ||
    '/dashboard';

  const handleDemoSubmit = async () => {
    try {
      setError(null);
      useLearningStore.getState().resetAll();
      await demoLogin();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to initialize demo engineer'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const derivedDisplayName = email.trim().split('@')[0] || 'EngineerOS User';

    // Quick simple regex check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isSupabaseMode && password.length < 6) {
      setError(
        'Secure account access requires a password with at least 6 characters.'
      );
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 font-sans text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] opacity-70" />

      <div className="w-full max-w-md space-y-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-550">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 bg-primary rounded-[8px] flex items-center justify-center shadow-md">
            <Terminal className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              EngineerOS
            </h1>
            <p className="mt-1 text-[9px] font-mono uppercase tracking-wider text-muted-copy">
              Engineering Communication Operating System
            </p>
          </div>
        </div>

        <div className="space-y-5 rounded-card border border-border-soft bg-surface p-6 sm:p-8 shadow-lg">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-foreground">
              {copy.heroTitle}
            </h2>
            <p className="text-[11px] font-medium text-muted-copy">
              {isLocalAuthBlocked
                ? 'Secure authentication is not configured. Supabase auth is required for production.'
                : isLocalDemoMode
                  ? copy.demoMessage
                  : null}
            </p>
          </div>

          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-copy">
            {copy.interfaceLanguage}
            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as 'en' | 'tr')
              }
              className="mt-2 min-h-10 w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-border-hover"
            >
              {AVAILABLE_INTERFACE_LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <div className="p-3 bg-error/5 border border-error/20 text-error rounded-[8px] text-xs flex items-start gap-2.5 leading-relaxed">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 rounded-card border border-border-soft bg-surface-hover/50 p-1">
            <button
              type="button"
              onClick={() => setIsSignUpMode(false)}
              className={`rounded-card px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                !isSignUpMode
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-copy hover:text-foreground'
              }`}
            >
              {copy.loginTab}
            </button>
            <button
              type="button"
              onClick={() => setIsSignUpMode(true)}
              className={`rounded-card px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                isSignUpMode
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-copy hover:text-foreground'
              }`}
            >
              {copy.createAccountTab}
            </button>
          </div>

          <p className="text-xs text-muted-copy">
            {isSignUpMode ? copy.alreadyHaveAccount : copy.newHere}{' '}
            <button
              type="button"
              onClick={() => setIsSignUpMode((current) => !current)}
              className="font-bold text-primary hover:text-primary-hover cursor-pointer"
            >
              {isSignUpMode ? copy.switchToLogin : copy.switchToCreate}
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-[10px] font-bold tracking-wider text-muted-copy uppercase block"
              >
                {copy.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-copy" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-input border border-border-soft bg-surface py-2 pl-10 pr-4 text-xs font-medium text-foreground placeholder:text-muted-copy/50 transition-all focus:border-border-hover focus:outline-none"
                  placeholder="sara.haddad@engineeros.dev"
                />
              </div>
            </div>

            {isSupabaseMode && (
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-[10px] font-bold tracking-wider text-muted-copy uppercase block"
                >
                  {copy.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-copy" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-input border border-border-soft bg-surface py-2 pl-10 pr-4 text-xs font-medium text-foreground placeholder:text-muted-copy/50 transition-all focus:border-border-hover focus:outline-none"
                    placeholder="Supabase password"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || isLocalAuthBlocked}
              className="mt-2 flex h-10 w-full cursor-pointer items-center justify-center gap-2 font-bold text-xs"
            >
              <LogIn className="h-4 w-4" />
              <span>
                {isLoading
                  ? 'Verifying Credentials...'
                  : isSignUpMode
                    ? copy.createAccountButton
                    : copy.enterButton}
              </span>
            </Button>
          </form>

          {isLocalDemoMode && (
            <>
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border-soft/40"></div>
                <span className="mx-4 flex-shrink text-[9px] font-mono uppercase tracking-widest text-muted-copy">
                  or bypass
                </span>
                <div className="flex-grow border-t border-border-soft/40"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleDemoSubmit}
                disabled={isLoading}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 text-xs"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Use Demo Engineer</span>
              </Button>
            </>
          )}
        </div>

        <p className="text-[9px] font-mono text-muted-copy text-center uppercase tracking-wider leading-relaxed">
          EngineerOS v4.0.1 — Engineering Communication Operating System
          <br />
          LOCAL MODE STORES PROGRESS ON THIS DEVICE
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
