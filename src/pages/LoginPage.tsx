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
  UserCheck,
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

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signUp, demoLogin, initialize, isLoading, providerMode } =
    useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(
    location.pathname === '/signup'
  );
  const [error, setError] = useState<string | null>(null);
  const isSupabaseMode = providerMode === 'supabase';
  const isLocalAuthBlocked = !isSupabaseMode && !AUTH_CONFIG.localAuthAllowed;
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);

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
    if (!displayName.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

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
        await signUp(displayName.trim(), email.trim(), password);
        ProductAnalyticsService.track('signup_completed', '/login', {
          metadata: { source: 'system' },
        });
      } else {
        await login(
          displayName.trim(),
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f7f8fb] p-6 font-sans text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-70" />

      <div className="w-full max-w-md space-y-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-14 w-14 bg-gradient-to-tr from-primary to-engineer-cyan rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Terminal className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950">
              EngineerOS
            </h1>
            <p className="mt-1 text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
              Engineering Communication Operating System
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-[20px] border border-slate-200 bg-white/88 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-950">
              Master the English you actually use on site.
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {isSupabaseMode
                ? 'Supabase provider active. Email/password auth is enabled from env.'
                : isLocalAuthBlocked
                  ? 'Secure authentication is not configured. Supabase auth is required for production.'
                  : 'Demo mode: local-only, not a secure account.'}
            </p>
          </div>

          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
            Interface language
            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as 'en' | 'tr')
              }
              className="mt-2 min-h-10 w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 text-sm font-semibold normal-case tracking-normal text-slate-800"
            >
              {AVAILABLE_INTERFACE_LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md text-xs flex items-start gap-2.5 leading-relaxed">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="text-[10px] font-black tracking-widest text-slate-500 uppercase block"
              >
                Display Name
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-400 focus:bg-white focus:outline-none"
                  placeholder="e.g. Demo Engineer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-[10px] font-black tracking-widest text-slate-500 uppercase block"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-400 focus:bg-white focus:outline-none"
                  placeholder="sara.haddad@engineeros.dev"
                />
              </div>
            </div>

            {isSupabaseMode && (
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-[10px] font-black tracking-widest text-slate-500 uppercase block"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-400 focus:bg-white focus:outline-none"
                    placeholder="Supabase password"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsSignUpMode((current) => !current)}
                  className="text-[10px] font-mono text-blue-700 hover:text-blue-900 transition-colors uppercase tracking-widest"
                >
                  {isSignUpMode
                    ? 'Use existing Supabase account'
                    : 'Create Supabase account instead'}
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || isLocalAuthBlocked}
              className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 font-bold"
            >
              <LogIn className="h-4 w-4" />
              <span>
                {isLoading
                  ? 'Verifying Credentials...'
                  : isSupabaseMode && isSignUpMode
                    ? 'Create Supabase Account'
                    : 'Enter EngineerOS'}
              </span>
            </Button>
          </form>

          {!isSupabaseMode && !isLocalAuthBlocked && (
            <>
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="mx-4 flex-shrink text-[9px] font-mono uppercase tracking-widest text-slate-400">
                  or bypass
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleDemoSubmit}
                disabled={isLoading}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              >
                <Sparkles className="h-4 w-4 text-engineer-cyan" />
                <span>Use Demo Engineer</span>
              </Button>
            </>
          )}
        </div>

        <p className="text-[10px] font-mono text-slate-600 text-center uppercase tracking-widest leading-relaxed">
          EngineerOS v4.0.1 — Engineering Communication Operating System
          <br />
          LOCAL MODE STORES PROGRESS ON THIS DEVICE
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
