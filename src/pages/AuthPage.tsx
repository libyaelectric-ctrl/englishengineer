import { FirebaseError } from 'firebase/app';
import { ArrowLeft, LogIn, UserCheck } from 'lucide-react';

import { useEffect, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { PRODUCT_VERSION } from '@/config/product.config';

import { useAuthStore } from '@/features/auth';
import { useFirebaseAuth } from '@/features/auth/FirebaseAuth';
import {
  AUTH_SIGN_IN_FALLBACK_REDIRECT_URL,
  AUTH_SIGN_IN_URL,
  AUTH_SIGN_UP_FALLBACK_REDIRECT_URL,
  AUTH_SIGN_UP_URL,
} from '@/features/auth/firebase.config';

interface AuthPageProps {
  mode: 'sign-in' | 'sign-up';
}

type AuthLocationState = { from?: { pathname?: string } } | null;

const getReturnTarget = (search: string, state: AuthLocationState): string | undefined => {
  const redirectUrl = new URLSearchParams(search).get('redirect_url');
  if (redirectUrl?.startsWith('/')) return redirectUrl;
  const fromPath = state?.from?.pathname;
  if (fromPath && fromPath !== AUTH_SIGN_IN_URL && fromPath !== AUTH_SIGN_UP_URL) return fromPath;
  return undefined;
};

/** Maps Firebase Auth error codes to user-facing Turkish messages (email/password flow). */
const describeAuthError = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-email':
        return 'E-posta veya şifre hatalı.';
      case 'auth/email-already-in-use':
        return 'Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.';
      case 'auth/weak-password':
        return 'Şifre en az 6 karakter olmalı.';
      case 'auth/operation-not-allowed':
        return 'E-posta/şifre girişi şu anda devre dışı. Lütfen Google ile devam edin.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Google penceresi kapatıldı. Tekrar deneyin.';
      case 'auth/network-request-failed':
        return 'Ağ bağlantısı kurulamadı. İnternetinizi kontrol edin.';
      default:
        return error.message || 'Giriş başarısız oldu.';
    }
  }
  return error instanceof Error ? error.message : 'Giriş başarısız oldu.';
};

/**
 * Maps Firebase Auth error codes for the GOOGLE sign-in flow specifically.
 * IMPORTANT: this must never reuse the email/password copy ("E-posta veya
 * şifre hatalı") — no email or password was ever entered here, so that
 * message is always wrong and hides the real cause (typically a Firebase
 * Console / Google Cloud OAuth configuration issue, e.g. the app's domain
 * missing from Authorized domains). We surface the real code so it can be
 * diagnosed instead of masking it.
 */
const describeGoogleAuthError = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Google penceresi kapatıldı. Tekrar deneyin.';
      case 'auth/popup-blocked':
        return 'Tarayıcı Google penceresini engelledi. Farklı bir yöntemle devam ediliyor…';
      case 'auth/network-request-failed':
        return 'Ağ bağlantısı kurulamadı. İnternetinizi kontrol edin.';
      case 'auth/unauthorized-domain':
        return 'Bu site Google girişi için yetkilendirilmemiş (yapılandırma hatası). Lütfen destek ile iletişime geçin.';
      case 'auth/account-exists-with-different-credential':
        return 'Bu e-posta başka bir giriş yöntemiyle kayıtlı. E-posta/şifre ile giriş yapmayı deneyin.';
      case 'auth/invalid-credential':
      case 'auth/internal-error':
        return `Google girişi tamamlanamadı (yapılandırma hatası: ${error.code}). Lütfen destek ile iletişime geçin.`;
      default:
        return `Google girişi başarısız oldu (${error.code}).`;
    }
  }
  return error instanceof Error ? error.message : 'Google girişi başarısız oldu.';
};

/** Error codes worth retrying once via a full-page redirect instead of a
 * popup — these are typically caused by the popup's cross-domain relay
 * (the authDomain iframe) being blocked by third-party storage partitioning
 * or an ad/tracker blocker, which a redirect flow avoids entirely. */
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

  const handleClick = async (): Promise<void> => {
    onBusyChange(true);
    setError(null);
    try {
      await signInWithGoogle();
      // On success the isSignedIn effect navigates away; stay busy until then.
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : null;
      if (code && GOOGLE_REDIRECT_FALLBACK_CODES.has(code)) {
        // Popup-based sign-in failed for a reason a full-page redirect can
        // route around (blocked popup, blocked third-party storage, etc).
        // signInWithGoogleRedirect navigates away from the page; on return,
        // FirebaseAuthProvider's getRedirectResult handling completes it.
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
        className="flex w-full items-center justify-center gap-3 rounded-button border border-border-soft bg-white px-4 py-3 text-base font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
        {busy ? 'Google açılıyor…' : 'Google ile devam et'}
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

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    onBusyChange(true);
    setError(null);
    try {
      if (mode === 'sign-in') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, name.trim() || undefined);
      }
      // On success the isSignedIn effect navigates away.
    } catch (err) {
      setError(describeAuthError(err));
      onBusyChange(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      {mode === 'sign-up' && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ad Soyad (isteğe bağlı)"
          className="w-full rounded-button border border-border-soft bg-background px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary"
        />
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ornek@engvox.com"
        className="w-full rounded-button border border-border-soft bg-background px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary"
      />
      <input
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Şifre (en az 6 karakter)"
        className="w-full rounded-button border border-border-soft bg-background px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-button bg-primary px-4 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mode === 'sign-in' ? (
          <LogIn className="h-5 w-5" />
        ) : (
          <UserCheck className="h-5 w-5" />
        )}
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

  const signInAfter = returnTarget ?? AUTH_SIGN_IN_FALLBACK_REDIRECT_URL;
  const signUpAfter = returnTarget ?? AUTH_SIGN_UP_FALLBACK_REDIRECT_URL;
  const targetDestination = mode === 'sign-in' ? signInAfter : signUpAfter;

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  // If already signed in with Firebase, route to dashboard immediately
  useEffect(() => {
    if (isSignedIn) {
      navigate(targetDestination, { replace: true });
    }
  }, [isSignedIn, navigate, targetDestination]);

  const handleQuickDemoStart = () => {
    useAuthStore.getState().enterDemoUser();
    navigate(targetDestination, { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background">
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-4">
        <div className="flex w-full max-w-md shrink-0 items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-base text-muted-copy transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Ana sayfa</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/brand/logo.svg" alt="EngVox" className="h-8" />
            <span className="text-xs text-muted-copy">v{PRODUCT_VERSION}</span>
          </div>
        </div>

        <div className="w-full max-w-md shrink-0 rounded-card border border-border-soft bg-surface p-8 shadow-card">
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'sign-in' ? 'Giriş yap' : 'Hesap oluştur'}
          </h1>
          <p className="mt-2 text-base text-muted-copy">
            {mode === 'sign-in'
              ? 'Mühendislik İngilizcenizi kaldığınız yerden sürdürün.'
              : 'İlerlemenizin kaydedilmesi için birkaç saniye sürer.'}
          </p>

          <div className="mt-6">
            <GoogleButton busy={authBusy} onBusyChange={setAuthBusy} />
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border-soft" />
            <span className="text-sm text-muted-copy">veya</span>
            <div className="h-px flex-1 bg-border-soft" />
          </div>

          {!showAccountForm ? (
            <button
              type="button"
              onClick={() => setShowAccountForm(true)}
              className="flex w-full items-center justify-center rounded-button border border-border-soft py-3 text-base font-medium text-muted-copy transition-colors hover:border-border-hover hover:text-foreground"
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
                <Link to={AUTH_SIGN_UP_URL} className="font-medium text-primary hover:underline">
                  Kayıt olun
                </Link>
              </>
            ) : (
              <>
                Zaten hesabınız var mı?{' '}
                <Link to={AUTH_SIGN_IN_URL} className="font-medium text-primary hover:underline">
                  Giriş yapın
                </Link>
              </>
            )}
          </p>

          <div className="mt-7 flex items-center justify-between border-t border-border-soft pt-5">
            <p className="text-sm text-muted-copy">Sadece göz atmak mı istiyorsunuz?</p>
            <button
              type="button"
              onClick={handleQuickDemoStart}
              className="text-sm font-medium text-primary hover:underline"
            >
              Demo mühendis olarak devam et
            </button>
          </div>
        </div>

        <div className="max-w-md shrink-0 text-center">
          <p className="text-xs text-muted-copy">Verileriniz cihazınızda güvenle yerel depolanır.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
