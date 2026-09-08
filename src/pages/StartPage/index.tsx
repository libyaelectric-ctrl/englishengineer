import { ArrowRight, BookOpen, Brain, LogIn, Target, UserPlus, Zap } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { useEffect, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { PRODUCT_VERSION } from '@/config/product.config';
import { useAuthStore } from '@/features/auth';
import { AUTH_SIGN_IN_URL, AUTH_SIGN_UP_URL } from '@/features/auth/firebase.config';

import { Footer } from '@/pages/LandingPage/Footer';
import { Navbar } from '@/pages/LandingPage/Navbar';

const ONBOARDING_STEPS = [
  { step: 1, icon: Target, title: 'Alanını seç', description: 'İnşaat, makine, elektrik, yazılım ve diğer mühendislik alanlarına göre içerik al.', color: 'from-blue-500 to-cyan-400' },
  { step: 2, icon: BookOpen, title: 'Demo dersi dene', description: 'Gerçek teknik doküman, toplantı ve saha diliyle kısa bir pratik yap.', color: 'from-emerald-500 to-teal-400' },
  { step: 3, icon: Brain, title: 'Gelişimini gör', description: 'Seviye, seri ve beceri ilerlemesini tek panelden takip et.', color: 'from-violet-500 to-purple-400' },
] as const;

const StartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuthStore();
  const prefersReduced = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => { if (isAuthenticated || currentUser) navigate('/dashboard', { replace: true }); }, [isAuthenticated, currentUser, navigate]);
  useEffect(() => { if (prefersReduced) return; const id = setInterval(() => setActiveStep((prev) => (prev + 1) % ONBOARDING_STEPS.length), 4000); return () => clearInterval(id); }, [prefersReduced]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-50 pb-20 pt-20 text-slate-950 dark:bg-[#040611] dark:text-white">
      <Navbar />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(6,182,212,0.16),transparent_28%),radial-gradient(circle_at_86%_16%,rgba(168,85,247,0.13),transparent_28%)] dark:bg-[radial-gradient(circle_at_18%_10%,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_86%_16%,rgba(168,85,247,0.18),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-100"><Zap className="h-3.5 w-3.5" /> Demo · v{PRODUCT_VERSION}</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">EngVox’a nasıl başlamak istersin?</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-200">Hesap oluşturabilir, giriş yapabilir veya kayıt olmadan demo mühendis olarak platformu deneyebilirsin.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ONBOARDING_STEPS.map((step, index) => { const Icon = step.icon; const isActive = index === activeStep; return (<motion.div key={step.step} initial={prefersReduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: prefersReduced ? 0 : index * 0.08, duration: 0.35 }} onClick={() => setActiveStep(index)} className={`relative cursor-pointer rounded-3xl border p-5 shadow-sm backdrop-blur-2xl transition-all ${isActive ? 'border-cyan-500/35 bg-white/82 dark:bg-white/[0.09]' : 'border-slate-900/10 bg-white/68 hover:bg-white/82 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.09]'}`}><div className="mb-3 flex items-center gap-3"><div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}><Icon className="h-5 w-5 text-white" /></div><span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-white/50">Adım {step.step}</span></div><h3 className="text-base font-black">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{step.description}</p>{isActive && <motion.div layoutId="tour-indicator" className="absolute -bottom-px left-5 right-5 h-0.5 rounded-full bg-cyan-500" transition={{ duration: 0.3 }} />}</motion.div>); })}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="flex flex-col rounded-[2rem] border border-slate-900/10 bg-white/74 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]"><UserPlus className="h-7 w-7 text-cyan-700 dark:text-cyan-100" /><h2 className="mt-5 text-xl font-black">Ücretsiz hesap oluştur</h2><p className="mt-2 flex-1 text-sm leading-6 text-slate-700 dark:text-slate-200">İlerlemen kaydedilsin, çalışmaların cihazlar arasında güvenle devam etsin.</p><Link to={AUTH_SIGN_UP_URL} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">Ücretsiz başlayın <ArrowRight className="h-4 w-4" /></Link></section>
          <section className="flex flex-col rounded-[2rem] border border-slate-900/10 bg-white/74 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]"><LogIn className="h-7 w-7 text-cyan-700 dark:text-cyan-100" /><h2 className="mt-5 text-xl font-black">Giriş yap</h2><p className="mt-2 flex-1 text-sm leading-6 text-slate-700 dark:text-slate-200">Mevcut hesabınla kaldığın yerden mühendislik İngilizcesi çalışmaya devam et.</p><Link to={AUTH_SIGN_IN_URL} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-900/10 bg-white/70 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-white dark:border-white/10 dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.12]">Giriş yap <LogIn className="h-4 w-4" /></Link></section>
        </div>
        <div className="mt-6 text-center"><button type="button" onClick={() => { useAuthStore.getState().enterDemoUser(); navigate('/dashboard'); }} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-6 py-3 text-sm font-black text-cyan-800 transition hover:-translate-y-0.5 hover:bg-cyan-500/16 dark:text-cyan-100"><Zap className="h-4 w-4" /> Kayıt olmadan demo mühendis olarak başla →</button></div>
      </div>
      <Footer className="fixed bottom-0 inset-x-0 z-40" />
    </main>
  );
};

export default StartPage;
