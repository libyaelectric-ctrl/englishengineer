import { SignIn, SignUp, useAuth, useClerk } from '@clerk/clerk-react';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Mail, Sparkles, UserCheck, Zap } from 'lucide-react';

import { useEffect, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { isNativePlatform } from '@/shared/utils/capacitor';

import { useAuthStore } from '@/features/auth';
import {
  CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_IN_URL,
  CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_UP_URL,
} from '@/features/auth/clerk.config';
import { getOAuthDeepLinkUrl, isNativeOAuthSupported } from '@/features/auth/native-oauth';

interface ClerkAuthPageProps {
  mode: 'sign-in' | 'sign-up';
}

type ClerkLocationState = { from?: { pathname?: string } } | null;

const getReturnTarget = (search: string, state: ClerkLocationState): string | undefined => {
  const redirectUrl = new URLSearchParams(search).get('redirect_url');
  if (redirectUrl?.startsWith('/')) return redirectUrl;
  const fromPath = state?.from?.pathname;
  if (fromPath && fromPath !== CLERK_SIGN_IN_URL && fromPath !== CLERK_SIGN_UP_URL) return fromPath;
  return undefined;
};

const NativeGoogleOAuthButton = ({
  mode,
  afterCompleteUrl,
}: {
  mode: 'sign-in' | 'sign-up';
  afterCompleteUrl: string;
}) => {
  const clerk = useClerk();
  const { isLoaded } = useAuth();
  const [state, setState] = useState<'idle' | 'starting' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!isNativeOAuthSupported()) return null;

  const handleClick = async (): Promise<void> => {
    setState('starting');
    setError(null);
    try {
      const resource = mode === 'sign-in' ? clerk.client?.signIn : clerk.client?.signUp;
      if (!resource) {
        throw new Error('Kimlik doğrulama servisi henüz hazır değil — lütfen birazdan tekrar deneyin.');
      }
      await resource.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: getOAuthDeepLinkUrl(),
        redirectUrlComplete: afterCompleteUrl,
      });
      setState('failed');
      setError(
        'Google girişi başlatılamadı. Lütfen aşağıdaki tek tıkla doğrudan giriş seçeneğini kullanın.'
      );
    } catch (err) {
      setState('failed');
      setError(err instanceof Error ? err.message : 'Google girişi başarısız oldu.');
    }
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={!isLoaded || state === 'starting'}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border-soft bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.58v3h3.87c2.26-2.09 3.58-5.17 3.58-8.82Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
          />
        </svg>
        {state === 'starting' ? 'Google Açılıyor…' : 'Google ile Devam Et'}
      </button>
      {state === 'failed' && error && (
        <p className="mt-1.5 text-center text-xs text-rose-400">{error}</p>
      )}
    </div>
  );
};

const ClerkAuthPage = ({ mode }: ClerkAuthPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const returnTarget = getReturnTarget(location.search, location.state as ClerkLocationState);

  const signInAfter = returnTarget ?? CLERK_SIGN_IN_FALLBACK_REDIRECT_URL;
  const signUpAfter = returnTarget ?? CLERK_SIGN_UP_FALLBACK_REDIRECT_URL;
  const targetDestination = mode === 'sign-in' ? signInAfter : signUpAfter;

  const [directEmail, setDirectEmail] = useState('');
  const [showDirectEmail, setShowDirectEmail] = useState(false);
  const [showClerkForm, setShowClerkForm] = useState(false);

  // If already signed in with Clerk, route to dashboard immediately
  useEffect(() => {
    if (isSignedIn) {
      navigate(targetDestination, { replace: true });
    }
  }, [isSignedIn, navigate, targetDestination]);

  const handleQuickDemoStart = () => {
    useAuthStore.getState().enterDemoUser();
    navigate(targetDestination, { replace: true });
  };

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEmail.trim()) return;
    useAuthStore.getState().loginAsLocal({ email: directEmail.trim() });
    navigate(targetDestination, { replace: true });
  };

  const nativeAppearance = isNativePlatform()
    ? { elements: { socialButtons: { display: 'none' } } }
    : undefined;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-md">
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-8">
        <div className="mb-4 flex w-full max-w-[26rem] justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-surface-hover hover:border-primary/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Ana Sayfa</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>EngVox OS</span>
          </div>
        </div>

        <div className="w-full max-w-[26rem] space-y-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Quick 1-Tap Entry Card */}
          <div className="rounded-2xl border border-primary/40 bg-surface/95 p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="h-5 w-5 fill-primary" />
              <h2 className="text-base font-extrabold text-foreground">
                Hemen Kullanmaya Başla
              </h2>
            </div>
            <p className="text-xs text-muted-copy leading-relaxed">
              Mobil cihazınızda şifre beklemeden veya kayıt olmadan 14.000+ terim ve mühendislik simülatörlerine anında erişin.
            </p>

            <button
              type="button"
              onClick={handleQuickDemoStart}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 px-4 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Tek Tıkla Giriş Yap (Demo Mühendis)</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Direct Email Option */}
            {!showDirectEmail ? (
              <button
                type="button"
                onClick={() => setShowDirectEmail(true)}
                className="w-full text-center text-xs font-bold text-muted-copy hover:text-primary transition-colors py-1 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Kendi e-postamla doğrudan giriş yap</span>
              </button>
            ) : (
              <form onSubmit={handleDirectLogin} className="pt-2 border-t border-border-soft space-y-2.5">
                <label className="block text-xs font-semibold text-muted-copy">
                  Mühendislik E-postanız:
                  <input
                    type="email"
                    required
                    value={directEmail}
                    onChange={(e) => setDirectEmail(e.target.value)}
                    placeholder="ornek@engvox.com"
                    className="mt-1 w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary transition-colors"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-surface-hover border border-primary/40 hover:bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-colors cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>E-posta ile Çalışma Alanımı Aç</span>
                </button>
              </form>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-soft" />
            </div>
            <span className="relative bg-zinc-950 px-3 text-[11px] font-bold text-muted-copy uppercase tracking-wider">
              Veya Hesap Girişi (Clerk / Google)
            </span>
          </div>

          {/* Google OAuth Button */}
          <NativeGoogleOAuthButton mode={mode} afterCompleteUrl={targetDestination} />

          {/* Clerk Component Toggle / Embed */}
          {!showClerkForm ? (
            <button
              type="button"
              onClick={() => setShowClerkForm(true)}
              className="w-full py-2.5 rounded-xl border border-border-soft bg-surface/60 hover:bg-surface text-xs font-bold text-muted-copy hover:text-foreground transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Clerk Şifreli Hesap Formunu Aç</span>
            </button>
          ) : (
            <div className="w-full rounded-2xl border border-border-soft bg-surface/90 p-2 shadow-xl">
              {mode === 'sign-in' ? (
                <SignIn
                  routing="virtual"
                  fallbackRedirectUrl={signInAfter}
                  appearance={nativeAppearance}
                />
              ) : (
                <SignUp
                  routing="virtual"
                  fallbackRedirectUrl={signUpAfter}
                  appearance={nativeAppearance}
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-copy">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Verileriniz cihazınızda güvenle yerel depolanır.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClerkAuthPage;
