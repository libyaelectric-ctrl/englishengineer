import { ArrowRight, LogIn, UserPlus } from 'lucide-react';

import { useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';

const StartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated || currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  return (
    <main className="min-h-screen bg-transparent px-4 py-10 sm:px-6 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="public-eyebrow">Choose how to begin</p>
            <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              Start EngVox with a secure account.
            </h1>
            <p className="mt-3 text-xs leading-5 text-muted-copy">
              Sign up with a Clerk-managed account to keep your progress synced and accessible.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="flex flex-col rounded-card border border-border-soft bg-surface p-6 shadow-sm">
            <UserPlus className="h-6 w-6 text-muted-copy" />
            <h2 className="mt-5 text-base font-bold text-foreground">Create account</h2>
            <p className="mt-2 flex-1 text-xs leading-5 text-muted-copy">
              Email and password account secured with Clerk, with session restore and profile
              persistence.
            </p>
            <Link
              to="/signup"
              className="public-primary-action mt-5 w-full text-center py-2 text-xs min-h-10 flex items-center justify-center gap-2"
            >
              Create account <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <section className="flex flex-col rounded-card border border-border-soft bg-surface p-6 shadow-sm">
            <LogIn className="h-6 w-6 text-muted-copy" />
            <h2 className="mt-5 text-base font-bold text-foreground">Log in</h2>
            <p className="mt-2 flex-1 text-xs leading-5 text-muted-copy">
              Continue with an existing verified account.
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
