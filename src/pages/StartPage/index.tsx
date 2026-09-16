import { PRODUCT_VERSION } from '@/config/product.config';
import { ArrowRight, BookOpen, Brain, LogIn, Target, UserPlus, Zap } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { useEffect, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { AUTH_SIGN_IN_URL, AUTH_SIGN_UP_URL } from '@/features/auth/firebase.config';

import { Footer } from '@/pages/LandingPage/Footer';
import { Navbar } from '@/pages/LandingPage/Navbar';

const ONBOARDING_STEPS = [
  {
    step: 1,
    icon: Target,
    title: 'Alanını seç',
    description:
      'İnşaat, makine, elektrik, yazılım ve diğer mühendislik alanlarına göre içerik al.',
    color: 'from-blue-500 to-cyan-400', // palette-exempt: decorative topic accent gradient
  },
  {
    step: 2,
    icon: BookOpen,
    title: 'Demo dersi dene',
    description: 'Gerçek teknik doküman, toplantı ve saha diliyle kısa bir pratik yap.',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    step: 3,
    icon: Brain,
    title: 'Gelişimini gör',
    description: 'Seviye, seri ve beceri ilerlemesini tek panelden takip et.',
    color: 'from-violet-500 to-purple-400',
  },
] as const;

const StartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuthStore();
  const prefersReduced = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (isAuthenticated || currentUser) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, currentUser, navigate]);
  useEffect(() => {
    if (prefersReduced) return;
    const id = setInterval(
      () => setActiveStep((prev) => (prev + 1) % ONBOARDING_STEPS.length),
      4000
    );
    return () => clearInterval(id);
  }, [prefersReduced]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background pb-20 pt-20 text-foreground">
      <Navbar />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Zap className="h-3.5 w-3.5" /> Demo · v{PRODUCT_VERSION}
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            EngVox’a nasıl başlamak istersin?
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-copy">
            Hesap oluşturabilir, giriş yapabilir veya kayıt olmadan demo mühendis olarak platformu
            deneyebilirsin.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ONBOARDING_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            return (
              <motion.div
                key={step.step}
                initial={prefersReduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReduced ? 0 : index * 0.08, duration: 0.35 }}
                onClick={() => setActiveStep(index)}
                className={`relative cursor-pointer rounded-2xl border p-5 shadow-sm transition-all ${isActive ? 'border-primary bg-surface shadow-md' : 'border-border-soft bg-surface hover:border-border-hover'}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${step.color} shadow-sm`}
                  >
                    <Icon className="h-5 w-5 text-on-solid" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                    Adım {step.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-copy">{step.description}</p>
                {isActive && (
                  <motion.div
                    layoutId="tour-indicator"
                    className="absolute -bottom-px left-5 right-5 h-0.5 rounded-full bg-primary"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="flex flex-col rounded-2xl border border-border-soft bg-surface p-6 shadow-sm">
            <UserPlus className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-xl font-bold text-foreground">Ücretsiz hesap oluştur</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-copy">
              İlerlemen kaydedilsin, çalışmaların cihazlar arasında güvenle devam etsin.
            </p>
            <Link
              to={AUTH_SIGN_UP_URL}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary-hover active:scale-95 cursor-pointer"
            >
              Ücretsiz başlayın <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
          <section className="flex flex-col rounded-2xl border border-border-soft bg-surface p-6 shadow-sm">
            <LogIn className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-xl font-bold text-foreground">Giriş yap</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-copy">
              Mevcut hesabınla kaldığın yerden mühendislik İngilizcesi çalışmaya devam et.
            </p>
            <Link
              to={AUTH_SIGN_IN_URL}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface px-5 py-2.5 text-sm font-bold text-foreground shadow-sm transition hover:bg-surface-hover active:scale-95 cursor-pointer"
            >
              Giriş yap <LogIn className="h-4 w-4" />
            </Link>
          </section>
        </div>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              useAuthStore.getState().enterDemoUser();
              navigate('/dashboard');
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-soft bg-surface px-6 py-2.5 text-sm font-bold text-primary shadow-sm transition hover:bg-surface-hover active:scale-95 cursor-pointer"
          >
            <Zap className="h-4 w-4" /> Kayıt olmadan demo mühendis olarak başla →
          </button>
        </div>
      </div>
      <Footer className="fixed bottom-0 inset-x-0 z-40" />
    </main>
  );
};

export default StartPage;
