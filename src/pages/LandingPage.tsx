import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, Mic, BookOpen, Brain, PenLine, Headphones, BarChart3 } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { PageMetadata } from '@/shared/components/PageMetadata';
import { ProductAnalyticsService } from '@/features/analytics';

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'EngVox',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  description: 'AI-powered English training for engineers.',
  url: 'https://englishengineer.vercel.app',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const FAQ = [
  { q: 'What is EngVox?', a: 'AI-powered English training for engineers — writing, speaking, listening, reading with discipline-specific content.' },
  { q: 'Is there a free plan?', a: 'Yes. Permanent free plan with no credit card. Core modules, vocabulary, grammar, and 3 AI requests/day.' },
  { q: 'Which disciplines?', a: 'Electrical, civil, mechanical, MEP, commissioning, and more.' },
  { q: 'How does AI work?', a: 'Real-time feedback on writing, pronunciation scoring, adaptive learning paths.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no hidden fees.' },
  { q: 'Is my data secure?', a: 'Yes. Local-first storage, encrypted in transit.' },
];

const FEATURES = [
  { icon: PenLine, title: 'Writing', desc: 'RFIs, NCRs, emails, submittals. AI reviews technical accuracy, grammar, and tone.' },
  { icon: Mic, title: 'Speaking', desc: 'Site meetings, toolbox talks, progress updates. Pronunciation scoring in real-time.' },
  { icon: Headphones, title: 'Listening', desc: 'Technical briefings, commissioning reports, safety protocols.' },
  { icon: BookOpen, title: 'Reading', desc: 'Specifications, contracts, technical reports. Vocabulary through real documents.' },
  { icon: Brain, title: 'AI Coach', desc: 'Personalized feedback on every attempt. Adapts to your learning style.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track progress across all skills. Identify weak areas and measure improvement.' },
];

const STATS = [
  { value: '6', label: 'Skill modules' },
  { value: 'A1–C2', label: 'CEFR levels' },
  { value: '90+', label: 'Engineering scenarios' },
  { value: '24/7', label: 'AI availability' },
];

// Scroll-triggered animation hook (Agentic style)
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Reusable animated section
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Reusable animated card with mouse tracking
function AnimatedCard({ children, className = '', delay = 0, dark = false }: { children: React.ReactNode; className?: string; delay?: number; dark?: boolean }) {
  const { ref, isVisible } = useScrollReveal();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mouse-x', `${x}%`);
    el.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  return (
    <div
      ref={(node) => {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      onMouseMove={handleMouseMove}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-700 hover:border-black/[0.15] ${dark ? '' : 'hover:bg-[#fafaf8]'} ${className}`}
      style={{
        border: dark ? '1px solid #111' : '1px solid rgba(0,0,0,0.07)',
        background: dark ? '#111' : '#fff',
        color: dark ? '#fff' : undefined,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      {/* Mouse-tracking radial gradient */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.03), transparent 60%)' }}></div>
      {children}
    </div>
  );
}

const LandingPage = () => {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    ProductAnalyticsService.track('screen_viewed', 'landing');
    // Hero animation triggers on mount
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen antialiased" style={{ background: '#F5F4F0', color: '#111', fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
      <PageMetadata title="EngVox — Engineering English Training" description="AI-powered English training for engineers." canonical="https://englishengineer.vercel.app" jsonLd={STRUCTURED_DATA} />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-black focus:px-4 focus:py-2 focus:text-sm focus:text-white">Skip to content</a>

      {/* NAV - Glass morphism */}
      <nav className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-3xl flex items-center justify-between px-5 py-3 rounded-2xl" style={{ border: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(16px)', background: 'rgba(245,244,240,0.80)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <span className="text-xs font-bold tracking-[0.25em]" style={{ color: 'rgba(0,0,0,0.7)' }}>ENGVOX</span>
          <div className="hidden md:flex items-center gap-6 text-[11px]" style={{ color: 'rgba(0,0,0,0.6)' }}>
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-black transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
          </div>
          <Link to="/login" className="text-[11px] px-4 py-2 rounded-xl hover:bg-black/5 transition-all" style={{ border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.6)' }}>START FREE</Link>
        </div>
      </nav>

      {/* HERO - Agentic blur-to-clear animation */}
      <section ref={heroRef} className="relative min-h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/brand/back2.png')", opacity: 0.05 }}></div>
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: '65%', background: 'linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)' }}></div>
        <div className="relative z-30 flex flex-col px-6 md:px-12 pb-16 max-w-3xl">
          {/* Title - blur to clear */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[1.0] tracking-tight mb-8" style={{ fontFamily: '"IBM Plex Sans", sans-serif', opacity: heroVisible ? 1 : 0, filter: heroVisible ? 'blur(0px)' : 'blur(24px)', transform: heroVisible ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1), filter 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)' }}>
            Master the<br />engineering<br />English.
          </h1>
          {/* Subtitle - delayed */}
          <p className="text-base leading-relaxed max-w-md mb-10" style={{ color: 'rgba(0,0,0,0.45)', fontFamily: '"IBM Plex Sans", sans-serif', opacity: heroVisible ? 1 : 0, filter: heroVisible ? 'blur(0px)' : 'blur(16px)', transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 120ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 120ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 120ms' }}>
            The only platform built specifically for engineering communication — with AI feedback on every attempt.
          </p>
          {/* Stats - delayed more */}
          <div className="flex gap-8 sm:gap-12 mb-10" style={{ opacity: heroVisible ? 1 : 0, filter: heroVisible ? 'blur(0px)' : 'blur(16px)', transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 200ms' }}>
            {STATS.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl sm:text-3xl font-light tracking-tight">{stat.value}</div>
                <div className="text-[10px] tracking-widest uppercase mt-1" style={{ color: 'rgba(0,0,0,0.4)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
          {/* Buttons - delayed more */}
          <div className="flex gap-4" style={{ opacity: heroVisible ? 1 : 0, filter: heroVisible ? 'blur(0px)' : 'blur(16px)', transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 280ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 280ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 280ms' }}>
            <Link to="/start" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-colors" style={{ background: '#111', color: '#fff' }}>Start Free <ArrowRight className="h-4 w-4" /></Link>
            <a href="#features" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all" style={{ border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.6)' }}>See Features</a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest" style={{ color: 'rgba(0,0,0,0.4)', background: 'rgba(0,0,0,0.04)' }}>FEATURES</span>
            <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-[1.05]">Everything you need<br />to master engineering English.</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((f, i) => (
              <AnimatedCard key={i} delay={i * 80} className="p-7 min-h-[180px]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 relative z-10" style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                  <f.icon className="h-5 w-5" style={{ color: 'rgba(0,0,0,0.6)' }} />
                </div>
                <h3 className="text-lg font-light mb-2 relative z-10">{f.title}</h3>
                <p className="text-sm leading-relaxed relative z-10" style={{ color: 'rgba(0,0,0,0.45)' }}>{f.desc}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 lg:px-20" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest" style={{ color: 'rgba(0,0,0,0.4)', background: 'rgba(0,0,0,0.04)' }}>HOW IT WORKS</span>
            <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-[1.05]">Three steps to<br />project confidence.</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { num: '01', title: 'Set your profile', desc: 'Choose your discipline, current level, and career goals.' },
              { num: '02', title: 'Practice real scenarios', desc: 'Work through authentic engineering communication tasks.' },
              { num: '03', title: 'Track and improve', desc: 'AI-powered analytics identify weak areas.' },
            ].map((step, i) => (
              <AnimatedCard key={i} delay={i * 80} className="p-7 min-h-[200px]">
                <span className="text-[11px] tracking-widest font-mono relative z-10" style={{ color: 'rgba(0,0,0,0.2)' }}>{step.num}</span>
                <h3 className="text-xl font-light mt-4 mb-3 relative z-10">{step.title}</h3>
                <p className="text-sm leading-relaxed relative z-10" style={{ color: 'rgba(0,0,0,0.45)' }}>{step.desc}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6 md:px-12 lg:px-20" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest" style={{ color: 'rgba(0,0,0,0.4)', background: 'rgba(0,0,0,0.04)' }}>PRICING</span>
            <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-[1.05]">Start free.<br />Upgrade when ready.</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'Free', price: '$0', period: 'forever', features: ['Core learning modules', 'Vocabulary + grammar', '3 AI requests/day', 'Progress tracking'], cta: 'Start Free', primary: false },
              { name: 'Pro', price: '$19', period: '/month', features: ['Unlimited AI feedback', 'Full A1–C2 access', 'Mistake Log', '2 doc uploads/month'], cta: 'Upgrade to Pro', primary: true },
              { name: 'Project', price: '$39', period: '/month', features: ['3 project workspaces', 'Workspace memory', '20 docs/month', 'LinkedIn optimizer'], cta: 'Upgrade to Project', primary: false },
            ].map((plan, i) => (
              <AnimatedCard key={i} delay={i * 80} dark={plan.primary} className={`p-7 flex flex-col ${plan.primary ? 'text-white' : ''}`}>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <span className="text-sm font-medium">{plan.name}</span>
                  {plan.primary && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}>Popular</span>}
                </div>
                <div className="mb-6 relative z-10">
                  <span className="text-3xl font-light">{plan.price}</span>
                  <span className="text-sm ml-1" style={{ color: plan.primary ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 relative z-10">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4" style={{ color: plan.primary ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)' }} />
                      <span style={{ color: plan.primary ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/start" className="block w-full text-center rounded-xl py-3 text-sm font-medium transition-colors mt-auto relative z-10" style={plan.primary ? { background: '#fff', color: '#111' } : { border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.6)' }}>{plan.cta}</Link>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 md:px-12 lg:px-20" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest" style={{ color: 'rgba(0,0,0,0.4)', background: 'rgba(0,0,0,0.04)' }}>FAQ</span>
            <h2 className="mt-5 text-3xl md:text-4xl font-light tracking-tight">Common questions</h2>
          </AnimatedSection>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <AnimatedCard key={i} delay={i * 50} className="overflow-hidden">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left relative z-10">
                  <span className="text-sm font-light">{item.q}</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-300" style={{ color: 'rgba(0,0,0,0.3)', transform: faqOpen === i ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {faqOpen === i && <div className="px-6 pb-5 relative z-10"><p className="text-sm leading-relaxed" style={{ color: 'rgba(0,0,0,0.45)' }}>{item.a}</p></div>}
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 lg:px-20 text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <AnimatedSection className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">Ready to level up your<br />engineering English?</h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(0,0,0,0.45)' }}>Join engineers worldwide who are mastering technical communication.</p>
          <Link to="/start" className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-medium transition-colors" style={{ background: '#111', color: '#fff' }}>Start Free <ArrowRight className="h-4 w-4" /></Link>
        </AnimatedSection>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 md:px-12" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>© 2026 EngVox. All rights reserved.</span>
          <div className="flex gap-6 text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>
            <Link to="/legal/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link to="/legal/terms" className="hover:text-black transition-colors">Terms</Link>
            <Link to="/legal/cookies" className="hover:text-black transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
