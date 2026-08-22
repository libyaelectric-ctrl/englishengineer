import { ArrowRight, BookOpen, Brain, LogIn, Target, UserPlus } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { useEffect, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';

const ONBOARDING_STEPS = [
  {
    step: 1,
    icon: Target,
    title: 'Pick your discipline',
    description:
      'Choose from 10+ engineering fields — Civil, Mechanical, Electrical, and more. Your content adapts to your specialty.',
    color: 'from-blue-500 to-cyan-400',
    glow: 'shadow-blue-500/20',
  },
  {
    step: 2,
    icon: BookOpen,
    title: 'Try a lesson',
    description:
      'Dive into vocabulary, grammar, reading, or writing — all tailored to real engineering documentation.',
    color: 'from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-500/20',
  },
  {
    step: 3,
    icon: Brain,
    title: 'Track your growth',
    description:
      'See your ELO score climb, maintain streaks, and unlock achievements as your engineering English improves.',
    color: 'from-violet-500 to-purple-400',
    glow: 'shadow-violet-500/20',
  },
] as const;

const StartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated || currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const prefersReduced = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance tour steps
  useEffect(() => {
    if (prefersReduced) return;
    const id = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % ONBOARDING_STEPS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [prefersReduced]);

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

        {/* Onboarding Tour */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ONBOARDING_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            return (
              <motion.div
                key={step.step}
                initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReduced ? 0 : index * 0.1, duration: 0.4 }}
                onClick={() => setActiveStep(index)}
                className={`relative rounded-[var(--radius-card)] border p-5 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-primary/40 bg-primary/5 shadow-lg'
                    : 'border-border-soft bg-surface hover:border-border-hover'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${step.color} shadow-md ${step.glow}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                    Step {step.step}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="mt-1 text-xs text-muted-copy leading-relaxed">{step.description}</p>
                {isActive && (
                  <motion.div
                    layoutId="tour-indicator"
                    className="absolute -bottom-px left-4 right-4 h-0.5 bg-primary rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            );
          })}
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
