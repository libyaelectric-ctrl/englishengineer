import {
  ArrowRight,
  LockKeyhole,
  LogIn,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AUTH_CONFIG } from '@/features/auth/auth.config';
import { useAuthStore } from '@/features/auth';
import { useLearningStore } from '@/core/learning';
import { Button } from '@/shared/components/Button';
import {
  AVAILABLE_INTERFACE_LANGUAGES,
  useLocalizationStore,
} from '@/features/localization';

const StartPage = () => {
  const navigate = useNavigate();
  const { demoLogin, initialize, isLoading, isAuthenticated, providerMode } =
    useAuthStore();
  const accountAvailable = providerMode === 'supabase';
  const liteAvailable = AUTH_CONFIG.localAuthAllowed;
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    navigate(isAuthenticated ? '/dashboard' : '/signup', { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  const startLite = async () => {
    useLearningStore.getState().resetAll();
    await demoLogin();
    navigate('/onboarding?mode=lite', { replace: true });
  };

  return (
    <main className="min-h-screen bg-transparent px-4 py-10 sm:px-6 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="public-eyebrow">Choose how to begin</p>
            <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              Start EngVox on your terms.
            </h1>
            <p className="mt-3 text-xs leading-5 text-muted-copy">
              Try the local Lite workspace immediately, or use a verified
              account when Supabase authentication is configured.
            </p>
          </div>
          <label className="text-xs font-bold text-foreground">
            Language
            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as 'en' | 'tr')
              }
              className="mt-1 min-h-10 rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-border-hover"
            >
              {AVAILABLE_INTERFACE_LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <section className="flex flex-col rounded-card border border-border-soft bg-surface p-6 shadow-sm">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="mt-5 text-base font-bold text-foreground">
              Try Lite
            </h2>
            <p className="mt-2 flex-1 text-xs leading-5 text-muted-copy">
              No account required. Progress stays on this device and can be
              cleared by the browser.
            </p>
            <span className="mt-4 rounded-full border border-warning/25 bg-warning/10 px-3 py-0.5 text-[9px] font-bold text-warning uppercase tracking-wider w-fit">
              Local demo mode
            </span>
            <Button
              className="mt-5 w-full text-xs min-h-10"
              onClick={startLite}
              disabled={isLoading || !liteAvailable}
            >
              {isLoading ? 'Preparing Lite...' : 'Try Lite'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            {!liteAvailable && (
              <p className="mt-2 text-[10px] leading-4 text-muted-copy">
                Unavailable: local Lite mode is disabled in this production
                build.
              </p>
            )}
          </section>

          <section className="flex flex-col rounded-card border border-border-soft bg-surface p-6 shadow-sm">
            <UserPlus className="h-6 w-6 text-muted-copy" />
            <h2 className="mt-5 text-base font-bold text-foreground">
              Create account
            </h2>
            <p className="mt-2 flex-1 text-xs leading-5 text-muted-copy">
              Email and password account with session restore when the secure
              authentication backend is active.
            </p>
            {accountAvailable ? (
              <Link
                to="/signup"
                className="public-primary-action mt-5 w-full text-center py-2 text-xs min-h-10 flex items-center justify-center gap-2"
              >
                Create account <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="mt-5">
                <button
                  type="button"
                  disabled
                  className="flex min-h-10 w-full items-center justify-center gap-2 rounded-card border border-border-soft bg-surface/50 px-4 text-xs font-bold text-muted-copy cursor-not-allowed"
                >
                  <LockKeyhole className="h-4 w-4" /> Create account
                </button>
                <p className="mt-2 text-[10px] leading-4 text-muted-copy">
                  Unavailable: secure account service is not configured.
                </p>
              </div>
            )}
          </section>

          <section className="flex flex-col rounded-card border border-border-soft bg-surface p-6 shadow-sm">
            <LogIn className="h-6 w-6 text-muted-copy" />
            <h2 className="mt-5 text-base font-bold text-foreground">Log in</h2>
            <p className="mt-2 flex-1 text-xs leading-5 text-muted-copy">
              Continue with an existing verified account. Local Lite users can
              return through Try Lite.
            </p>
            <Link
              to="/login"
              className="public-secondary-action mt-5 w-full text-center py-2 text-xs min-h-10 flex items-center justify-center gap-2"
            >
              Log in <LogIn className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
};

export default StartPage;
