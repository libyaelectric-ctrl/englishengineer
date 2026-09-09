import { PRODUCT_VERSION } from '@/config/product.config';
import { FirebaseError } from 'firebase/app';
import { ArrowLeft, LogIn, UserCheck } from 'lucide-react';

import { useEffect, useState } from 'react';

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
  onBusyChange: (b: boolean) => void;
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
        } catch (redirectErr) {
          setError(describeGoogleAuthError(redirectErr));
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
        className="flex w-full items-center justify-center gap-3 rounded-[var(--radius-button)] border border-border-soft bg-surface px-4 py-3 text-base font-black text-foreground shadow-sm transition hover:bg-surface-hover disabled:opacity-60"
      >
        Google ile devam et
      </button>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
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
  onBusyChange: (b: boolean) => void;
}) => {
  const { signInWithEmail, signUpWithEmail } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (event: React.FormEvent) => {
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
    'w-full rounded-[var(--radius-input)] border border-border-soft bg-surface px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-copy focus:border-primary';
  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      {mode === 'sign-up' && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ad Soyad (isteğe bağlı)"
          className={inputClass}
        />
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ornek@engvox.com"
        className={inputClass}
      />
      <input
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Şifre (en az 6 karakter)"
        className={inputClass}
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 py-3 text-base font-black text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
      >
        {mode === 'sign-in' ? <LogIn className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
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
  const targetDestination =
    mode === 'sign-in'
      ? (returnTarget ?? AUTH_SIGN_IN_FALLBACK_REDIRECT_URL)
      : (returnTarget ?? AUTH_SIGN_UP_FALLBACK_REDIRECT_URL);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  useEffect(() => {
    if (isSignedIn) navigate(targetDestination, { replace: true });
  }, [isSignedIn, navigate, targetDestination]);
  const handleQuickDemoStart = () => {
    useAuthStore.getState().enterDemoUser();
    navigate(targetDestination, { replace: true });
  };
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background text-foreground">
      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-4 py-4">
        <div className="flex w-full max-w-md shrink-0 items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-base font-bold text-muted-copy transition hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            Ana sayfa
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <img
              src="/brand/logo.svg"
              alt="EngVox"
              className="h-9 w-9 rounded-[var(--radius-button)]"
            />
            <span className="text-xs font-black text-primary">v{PRODUCT_VERSION}</span>
          </div>
        </div>
        <div className="w-full max-w-md shrink-0 rounded-[var(--radius-dialog)] border border-border-soft bg-surface p-7 shadow-card">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {mode === 'sign-in' ? 'Giriş yap' : 'Ücretsiz başlayın'}
          </h1>
          <p className="mt-2 text-base font-semibold leading-7 text-muted-copy">
            {mode === 'sign-in'
              ? 'Mühendislik İngilizcesi çalışmalarına kaldığın yerden devam et.'
              : 'Hesabını oluştur, ilerlemen güvenle kaydedilsin.'}
          </p>
          <div className="mt-6">
            <GoogleButton busy={authBusy} onBusyChange={setAuthBusy} />
          </div>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border-soft" />
            <span className="text-sm font-bold text-muted-copy">veya</span>
            <div className="h-px flex-1 bg-border-soft" />
          </div>
          {!showAccountForm ? (
            <button
              type="button"
              onClick={() => setShowAccountForm(true)}
              className="flex w-full items-center justify-center rounded-[var(--radius-button)] border border-border-soft bg-surface py-3 text-base font-black text-foreground transition hover:bg-surface-hover"
            >
              E-posta ile devam et
            </button>
          ) : (
            <EmailPasswordForm mode={mode} busy={authBusy} onBusyChange={setAuthBusy} />
          )}
          <p className="mt-5 text-base text-muted-copy">
            {mode === 'sign-in' ? (
              <>
                Hesabınız yok mu?{' '}
                <Link to={AUTH_SIGN_UP_URL} className="font-black text-primary hover:underline">
                  Kayıt olun
                </Link>
              </>
            ) : (
              <>
                Zaten hesabınız var mı?{' '}
                <Link to={AUTH_SIGN_IN_URL} className="font-black text-primary hover:underline">
                  Giriş yapın
                </Link>
              </>
            )}
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-border-soft pt-5">
            <p className="text-sm text-muted-copy">Sadece denemek mi istiyorsun?</p>
            <button
              type="button"
              onClick={handleQuickDemoStart}
              className="text-sm font-black text-primary hover:underline"
            >
              Demo ile devam et
            </button>
          </div>
        </div>
        <p className="max-w-md text-center text-xs font-semibold text-muted-copy">
          Verileriniz güvenli şekilde korunur.
        </p>
      </div>
    </div>
  );
};
export default AuthPage;
