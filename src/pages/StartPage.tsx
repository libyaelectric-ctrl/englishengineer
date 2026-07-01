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
  const { demoLogin, initialize, isLoading, providerMode } = useAuthStore();
  const accountAvailable = providerMode === 'supabase';
  const liteAvailable = AUTH_CONFIG.localAuthAllowed;
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const startLite = async () => {
    useLearningStore.getState().resetAll();
    await demoLogin();
    navigate('/onboarding?mode=lite', { replace: true });
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="public-eyebrow">Choose how to begin</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Start EngineerOS on your terms.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Try the local Lite workspace immediately, or use a verified
              account when Supabase authentication is configured.
            </p>
          </div>
          <label className="text-xs font-bold text-slate-600">
            Language
            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as 'en' | 'tr')
              }
              className="mt-1 min-h-10 rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
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
          <section className="flex flex-col rounded-[16px] border border-sky-200 bg-white p-6 shadow-sm">
            <Sparkles className="h-6 w-6 text-sky-700" />
            <h2 className="mt-5 text-lg font-black text-slate-950">Try Lite</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
              No account required. Progress stays on this device and can be
              cleared by the browser.
            </p>
            <span className="mt-4 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
              Local demo mode
            </span>
            <Button
              className="mt-5 w-full"
              onClick={startLite}
              disabled={isLoading || !liteAvailable}
            >
              {isLoading ? 'Preparing Lite...' : 'Try Lite'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            {!liteAvailable && (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Unavailable: local Lite mode is disabled in this production
                build.
              </p>
            )}
          </section>

          <section className="flex flex-col rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
            <UserPlus className="h-6 w-6 text-slate-700" />
            <h2 className="mt-5 text-lg font-black text-slate-950">
              Create account
            </h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
              Email and password account with session restore when the secure
              authentication backend is active.
            </p>
            {accountAvailable ? (
              <Link to="/signup" className="public-primary-action mt-5 w-full">
                Create account <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="mt-5">
                <button
                  type="button"
                  disabled
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-slate-400"
                >
                  <LockKeyhole className="h-4 w-4" /> Create account
                </button>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Unavailable: secure account service is not configured.
                </p>
              </div>
            )}
          </section>

          <section className="flex flex-col rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
            <LogIn className="h-6 w-6 text-slate-700" />
            <h2 className="mt-5 text-lg font-black text-slate-950">Log in</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
              Continue with an existing verified account. Local Lite users can
              return through Try Lite.
            </p>
            <Link to="/login" className="public-secondary-action mt-5 w-full">
              Log in <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>

        {!accountAvailable && (
          <p className="mt-6 rounded-[12px] border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Current status: local mode. A name or email entered locally does not
            create a secure account.{' '}
            {AUTH_CONFIG.localAuthAllowed
              ? 'Lite access is available.'
              : 'Secure authentication is required.'}
          </p>
        )}
      </div>
    </main>
  );
};

export default StartPage;
