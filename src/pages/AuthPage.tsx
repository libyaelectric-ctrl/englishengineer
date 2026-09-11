import { PRODUCT_VERSION } from '@/config/product.config';
import { FirebaseError } from 'firebase/app';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';

import { useEffect, useId, useState, type FormEvent } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ThemeToggle } from '@/shared/components/ThemeToggle';

import { useAuthStore } from '@/features/auth';
import { useFirebaseAuth } from '@/features/auth/FirebaseAuth';
import {
  AUTH_SIGN_IN_FALLBACK_REDIRECT_URL,
  AUTH_SIGN_IN_URL,
  AUTH_SIGN_UP_FALLBACK_REDIRECT_URL,
  AUTH_SIGN_UP_URL,
} from '@/features/auth/firebase.config';

type AuthPageProps = { mode: 'sign-in' | 'sign-up' };
type AuthLocationState = { from?: { pathname?: string } } | null;

const getReturnTarget = (search: string, state: AuthLocationState): string | undefined => {
  const redirectUrl = new URLSearchParams(search).get('redirect_url');
  if (redirectUrl?.startsWith('/')) return redirectUrl;
  const fromPath = state?.from?.pathname;
  if (fromPath && fromPath !== AUTH_SIGN_IN_URL && fromPath !== AUTH_SIGN_UP_URL) return fromPath;
  return undefined;
};

const describeAuthError = (error: unknown): string =>
  error instanceof FirebaseError
    ? error.code === 'auth/email-already-in-use'
      ? 'Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.'
      : error.code === 'auth/weak-password'
        ? 'Şifre en az 6 karakter olmalı.'
        : error.code === 'auth/network-request-failed'
          ? 'Ağ bağlantısı kurulamadı. İnternetinizi kontrol edin.'
          : 'E-posta veya şifre hatalı.'
    : error instanceof Error
      ? error.message
      : 'Giriş başarısız oldu.';

const describeGoogleAuthError = (error: unknown): string =>
  error instanceof FirebaseError
    ? error.code === 'auth/popup-closed-by-user'
      ? 'Google penceresi kapatıldı. Tekrar deneyin.'
      : error.code === 'auth/popup-blocked'
        ? 'Tarayıcı Google penceresini engelledi. Yönlendirme deneniyor…'
        : `Google girişi başarısız oldu (${error.code}).`
    : error instanceof Error
      ? error.message
      : 'Google girişi başarısız oldu.';

const GOOGLE_REDIRECT_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/invalid-credential',
  'auth/internal-error',
  'auth/network-request-failed',
]);

const GoogleButton = ({
  busy,
  onBusyChange,
}: {
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
}) => {
  const { signInWithGoogle, signInWithGoogleRedirect } = useFirebaseAuth();
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    onBusyChange(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : null;
      if (code && GOOGLE_REDIRECT_FALLBACK_CODES.has(code)) {
        try {
          setError(describeGoogleAuthError(err));
          await signInWithGoogleRedirect();
          return;
        } catch (redirectError) {
          setError(describeGoogleAuthError(redirectError));
          onBusyChange(false);
          return;
        }
      }
      setError(describeGoogleAuthError(err));
      onBusyChange(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={busy}
        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-button)] border border-border-soft bg-surface px-4 py-3 text-sm font-black text-foreground shadow-sm transition-[border-color,background-color,transform,opacity] duration-200 hover:border-primary/40 hover:bg-surface-hover active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full border border-border-soft bg-background text-xs font-black text-foreground">
          G
        </span>
        <span>{busy ? 'Google bağlantısı kuruluyor…' : 'Google ile devam et'}</span>
      </button>
      {error && (
        <p className="mt-2 text-sm leading-5 text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

const EmailPasswordForm = ({
  mode,
  busy,
  onBusyChange,
}: {
  mode: 'sign-in' | 'sign-up';
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
}) => {
  const { signInWithEmail, signUpWithEmail } = useFirebaseAuth();
  const formId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onBusyChange(true);
    setError(null);
    try {
      if (mode === 'sign-in') await signInWithEmail(email.trim(), password);
      else await signUpWithEmail(email.trim(), password, name.trim() || undefined);
    } catch (err) {
      setError(describeAuthError(err));
      onBusyChange(false);
    }
  };

  const inputClass =
    'mt-2 min-h-12 w-full rounded-[var(--radius-input)] border border-border-soft bg-background px-4 py-3 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-copy focus:border-primary focus:ring-4 focus:ring-primary/10';

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4" noValidate={false}>
      {mode === 'sign-up' && (
        <div>
          <label htmlFor={`${formId}-name`} className="text-sm font-bold text-foreground">
            Ad soyad <span className="font-normal text-muted-copy">(isteğe bağlı)</span>
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ad Soyad"
            className={inputClass}
          />
        </div>
      )}
      <div>
        <label htmlFor={`${formId}-email`} className="text-sm font-bold text-foreground">
          E-posta adresi
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" aria-hidden="true" />
          <input
            id={`${formId}-email`}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ornek@engvox.com"
            className={`${inputClass} pl-11`}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${formId}-password`} className="text-sm font-bold text-foreground">
          Şifre
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" aria-hidden="true" />
          <input
            id={`${formId}-password`}
            type="password"
            name="password"
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="En az 6 karakter"
            className={`${inputClass} pl-11`}
          />
        </div>
        {mode === 'sign-up' && <p className="mt-1.5 text-xs text-muted-copy">En az 6 karakter kullanın.</p>}
      </div>
      {error && (
        <p className="rounded-[var(--radius-button)] border border-error/25 bg-error/10 px-3 py-2.5 text-sm leading-5 text-error" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 py-3 text-sm font-black text-primary-foreground shadow-sm transition-[background-color,transform,opacity] duration-200 hover:bg-primary-hover active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : mode === 'sign-in' ? <LogIn className="h-4 w-4" aria-hidden="true" /> : <UserCheck className="h-4 w-4" aria-hidden="true" />}
        <span>{busy ? 'İşleniyor…' : mode === 'sign-in' ? 'Giriş yap' : 'Hesap oluştur'}</span>
      </button>
    </form>
  );
};

const AuthPage = ({ mode }: AuthPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn } = useFirebaseAuth();
  const returnTarget = getReturnTarget(location.search, location.state as AuthLocationState);
  const targetDestination = mode === 'sign-in'
    ? (returnTarget ?? AUTH_SIGN_IN_FALLBACK_REDIRECT_URL)
    : (returnTarget ?? AUTH_SIGN_UP_FALLBACK_REDIRECT_URL);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (isSignedIn) navigate(targetDestination, { replace: true });
  }, [isSignedIn, navigate, targetDestination]);

  const handleQuickDemoStart = () => {
    useAuthStore.getState().enterDemoUser();
    navigate(targetDestination, { replace: true });
  };

  const isSignIn = mode === 'sign-in';

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border-soft bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] text-sm font-black text-muted-copy transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Ana sayfa
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="flex items-center gap-2" aria-label="EngVox ana sayfa">
              <img src="/brand/logo.svg" alt="EngVox" width="36" height="36" className="h-9 w-9 rounded-[var(--radius-button)]" />
              <span className="hidden text-xs font-black text-primary sm:inline">v{PRODUCT_VERSION}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] lg:gap-16 lg:py-16">
        <section className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Mühendislik İngilizcesi için çalışma alanın
          </div>
          <h1 className="mt-5 max-w-lg text-balance text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">
            {isSignIn ? 'Çalışmalarına kaldığın yerden devam et.' : 'Teknik iletişimde daha net ol.'}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-copy sm:text-lg">
            {isSignIn
              ? 'İlerlemen, hedeflerin ve pratiklerin seni bekliyor.'
              : 'Alanına uygun kelimeler, gerçek iş senaryoları ve ölçülebilir ilerleme tek bir yerde.'}
          </p>
          <ul className="mt-8 space-y-4" aria-label="EngVox avantajları">
            {['Alanına uygun teknik içerik', 'Kısa ve düzenli pratikler', 'İlerlemeni tek panelden takip et'].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-bold text-foreground">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="auth-title" className="w-full">
          <div className="rounded-[var(--radius-dialog)] border border-border-soft bg-surface p-5 shadow-dialog sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                {isSignIn ? 'Hesabına dön' : 'Yeni hesap'}
              </p>
              <h2 id="auth-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                {isSignIn ? 'Giriş yap' : 'Ücretsiz başlayın'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-copy">
                {isSignIn ? 'Güvenli çalışma alanına devam edin.' : 'İlerlemenizi kaydetmek için hesabınızı oluşturun.'}
              </p>
            </div>

            <GoogleButton busy={authBusy} onBusyChange={setAuthBusy} />

            <div className="my-6 flex items-center gap-3" aria-hidden="true">
              <div className="h-px flex-1 bg-border-soft" />
              <span className="text-xs font-bold text-muted-copy">veya e-posta ile</span>
              <div className="h-px flex-1 bg-border-soft" />
            </div>

            <EmailPasswordForm mode={mode} busy={authBusy} onBusyChange={setAuthBusy} />

            <p className="mt-6 text-center text-sm text-muted-copy">
              {isSignIn ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}{' '}
              <Link
                to={isSignIn ? AUTH_SIGN_UP_URL : AUTH_SIGN_IN_URL}
                className="font-black text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {isSignIn ? 'Kayıt olun' : 'Giriş yapın'}
              </Link>
            </p>

            <div className="mt-6 border-t border-border-soft pt-5">
              <button
                type="button"
                onClick={handleQuickDemoStart}
                className="group flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-primary/25 bg-primary/5 px-4 py-2.5 text-sm font-black text-primary transition-[background-color,transform] duration-200 hover:bg-primary/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Kayıt olmadan demo ile başla
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-muted-copy">
            <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
            İlerlemeniz güvenli şekilde korunur.
          </p>
        </section>
      </main>

      <footer className="relative z-10 px-4 pb-6 text-center text-xs text-muted-copy sm:px-6">
        EngVox ile daha net teknik iletişim kurun.
      </footer>
    </div>
  );
};

export default AuthPage;
