import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Headphones,
  Mic,
  PenLine,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { PageMetadata } from '@/shared/components/PageMetadata';

const APP_VERSION = '4.0.1';
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

const STATS = [
  { value: '6', label: 'skill modules' },
  { value: 'A1-C2', label: 'CEFR path' },
  { value: '90+', label: 'site scenarios' },
  { value: '24/7', label: 'AI coach' },
];

const FEATURES: Array<{ icon: LucideIcon; title: string; desc: string }> = [
  {
    icon: PenLine,
    title: 'Writing desk',
    desc: 'RFIs, NCRs, submittals and email drafts reviewed for clarity, grammar and engineering tone.',
  },
  {
    icon: Mic,
    title: 'Speaking room',
    desc: 'Meeting updates, site briefings and toolbox talks with pronunciation and fluency feedback.',
  },
  {
    icon: Headphones,
    title: 'Listening lab',
    desc: 'Commissioning notes, safety talks and technical briefings tuned for real project audio.',
  },
  {
    icon: BookOpen,
    title: 'Reading vault',
    desc: 'Specifications, contracts and reports converted into vocabulary and comprehension practice.',
  },
  {
    icon: Brain,
    title: 'AI coach',
    desc: 'Personal feedback loops remember weak points and turn each attempt into a next action.',
  },
  {
    icon: BarChart3,
    title: 'Progress control',
    desc: 'Skill analytics show readiness, risk areas and what to practice before the next project moment.',
  },
];

const WORKFLOW = [
  {
    image: '/agentic/define.png',
    kicker: '01 / Define',
    title: 'Profile the engineering context',
    desc: 'Discipline, CEFR level, project role and communication goal are translated into a focused practice path.',
  },
  {
    image: '/agentic/compose.png',
    kicker: '02 / Compose',
    title: 'Practice in realistic project scenes',
    desc: 'The interface frames writing, speaking, reading and listening tasks around actual site communication.',
  },
  {
    image: '/agentic/deploy.png',
    kicker: '03 / Improve',
    title: 'Turn feedback into the next action',
    desc: 'AI review, mistake memory and analytics keep the learner moving from attempt to measurable progress.',
  },
];

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -56px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 720ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 720ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function AnimatedCard({
  children,
  className = '',
  delay = 0,
  dark = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  dark?: boolean;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      cardRef.current = node;
    },
    [ref]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const element = cardRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty(
        '--mouse-x',
        `${((event.clientX - rect.left) / rect.width) * 100}%`
      );
      element.style.setProperty(
        '--mouse-y',
        `${((event.clientY - rect.top) / rect.height) * 100}%`
      );
    },
    []
  );

  return (
    <div
      ref={setRefs}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-2xl transition-colors duration-300 ${className}`}
      style={{
        background: dark ? '#111111' : 'rgba(255,255,255,0.92)',
        border: dark ? '1px solid #111111' : '1px solid rgba(17,17,17,0.08)',
        color: dark ? '#ffffff' : '#111111',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 720ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 720ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, background-color 250ms ease, border-color 250ms ease`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: dark
            ? 'radial-gradient(440px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.10), transparent 62%)'
            : 'radial-gradient(440px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(17,17,17,0.045), transparent 62%)',
        }}
      />
      {children}
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  desc,
  align = 'left',
}: {
  eyebrow: string;
  title: ReactNode;
  desc?: string;
  align?: 'left' | 'center';
}) {
  return (
    <AnimatedSection
      className={
        align === 'center'
          ? 'mx-auto mb-12 max-w-3xl text-center'
          : 'mb-12 max-w-3xl'
      }
    >
      <span className="inline-flex rounded-full bg-black/[0.05] px-3 py-1 text-[11px] font-medium uppercase text-muted-copy">
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl font-light leading-[1.05] text-[#111] md:text-5xl">
        {title}
      </h2>
      {desc ? (
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-copy">
          {desc}
        </p>
      ) : null}
    </AnimatedSection>
  );
}

const LandingPage = () => {
  const [heroVisible, setHeroVisible] = useState(false);
  const [scrollShift, setScrollShift] = useState(0);

  useEffect(() => {
    ProductAnalyticsService.track('screen_viewed', 'landing');
    const timer = window.setTimeout(() => setHeroVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() =>
        setScrollShift(Math.min(window.scrollY * 0.08, 72))
      );
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f4ee] text-[#111] antialiased">
      <PageMetadata
        title="EngVox - Engineering English Training"
        description="AI-powered English training for engineers."
        canonical="https://englishengineer.vercel.app"
        jsonLd={STRUCTURED_DATA}
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-black focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <nav className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div className="flex w-full max-w-4xl items-center justify-between rounded-2xl border border-black/[0.07] bg-[#f6f4ee]/80 px-6 py-4 shadow-[0_16px_60px_rgba(17,17,17,0.10)] backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-1.5 text-sm font-bold uppercase text-black/70">
            EngVox
            <span className="text-[9px] font-medium text-black/40">v{APP_VERSION}</span>
          </Link>
          <div className="hidden items-center gap-7 text-[11px] font-medium text-muted-copy md:flex">
            <Link to="/pricing" className="transition-colors hover:text-black">
              Pricing
            </Link>
          </div>
          <Link
            to="/login"
            className="rounded-xl border border-black/10 px-5 py-2.5 text-xs font-semibold uppercase text-black/60 transition hover:bg-black/[0.04]"
          >
            Start free
          </Link>
        </div>
      </nav>

      <section
        id="main-content"
        className="relative flex min-h-[50svh] items-end overflow-hidden px-6 pb-6 pt-20 md:px-12 md:pb-8"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/agentic/org-arc.png')",
            opacity: 0.34,
            transform: `translate3d(0, ${scrollShift}px, 0) scale(1.04)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,244,238,0.18)_0%,rgba(246,244,238,0.36)_34%,rgba(246,244,238,0.96)_88%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(246,244,238,0)_0%,#f6f4ee_80%)]" />

        <div className="relative z-10 grid w-full grid-cols-1 items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.55fr)]">
          <div className="max-w-4xl">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/55 px-2.5 py-0.5 text-[10px] font-medium text-muted-copy backdrop-blur"
              style={{
                opacity: heroVisible ? 1 : 0,
                filter: heroVisible ? 'blur(0)' : 'blur(12px)',
                transform: heroVisible ? 'translateY(0)' : 'translateY(18px)',
                transition:
                  'opacity 760ms cubic-bezier(0.16,1,0.3,1), filter 760ms cubic-bezier(0.16,1,0.3,1), transform 760ms cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#5b6f11]" />
              AI English operating system for engineers
            </span>
            <h1
              className="mt-4 max-w-4xl text-xl font-light leading-[1.05] text-[#111] sm:text-2xl md:text-3xl lg:text-4xl"
              style={{
                opacity: heroVisible ? 1 : 0,
                filter: heroVisible ? 'blur(0)' : 'blur(24px)',
                transform: heroVisible ? 'translateY(0)' : 'translateY(36px)',
                transition:
                  'opacity 1000ms cubic-bezier(0.16,1,0.3,1) 80ms, filter 1000ms cubic-bezier(0.16,1,0.3,1) 80ms, transform 1000ms cubic-bezier(0.16,1,0.3,1) 80ms',
              }}
            >
              Engineering English OS for project teams.
            </h1>
            <p
              className="mt-2 max-w-xl text-xs leading-5 text-muted-copy"
              style={{
                opacity: heroVisible ? 1 : 0,
                filter: heroVisible ? 'blur(0)' : 'blur(16px)',
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition:
                  'opacity 820ms cubic-bezier(0.16,1,0.3,1) 220ms, filter 820ms cubic-bezier(0.16,1,0.3,1) 220ms, transform 820ms cubic-bezier(0.16,1,0.3,1) 220ms',
              }}
            >
              EngVox turns writing, speaking, listening and reading into an
              orchestrated practice system for real engineering work.
            </p>
            <div
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              style={{
                opacity: heroVisible ? 1 : 0,
                filter: heroVisible ? 'blur(0)' : 'blur(16px)',
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition:
                  'opacity 820ms cubic-bezier(0.16,1,0.3,1) 340ms, filter 820ms cubic-bezier(0.16,1,0.3,1) 340ms, transform 820ms cubic-bezier(0.16,1,0.3,1) 340ms',
              }}
            >
              <Link
                to="/start"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#2a2a2a]"
              >
                Start free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/45 px-5 py-2.5 text-xs font-semibold text-black/65 transition hover:bg-white/70 hover:text-black"
              >
                View pricing
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="rounded-lg border border-black/[0.06] bg-white/68 p-3 backdrop-blur">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md border border-black/10 bg-white">
                    <feature.icon className="h-3.5 w-3.5 text-black/60" />
                  </div>
                  <h3 className="text-xs font-medium text-[#111]">{feature.title}</h3>
                  <p className="mt-1 text-[10px] leading-3.5 text-muted-copy">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl border border-black/10 bg-white/62 p-4 shadow-[0_24px_80px_rgba(17,17,17,0.13)] backdrop-blur-xl"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible
                ? 'translateY(0) scale(1)'
                : 'translateY(28px) scale(0.98)',
              transition:
                'opacity 900ms cubic-bezier(0.16,1,0.3,1) 420ms, transform 900ms cubic-bezier(0.16,1,0.3,1) 420ms',
            }}
          >
            <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-[#111]">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="aspect-[16/10] w-full object-cover"
                poster="/agentic/arc.png"
              >
                <source src="/agentic-hero.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-black/[0.06] bg-white/68 p-2.5"
                >
                  <div className="text-xl font-light text-[#111]">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-[9px] font-medium uppercase text-black/40">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.06] px-6 py-10 md:px-12 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Workflow"
            title={<>Define, compose and improve through one guided loop.</>}
          />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {WORKFLOW.map((item, index) => (
              <AnimatedCard key={item.title} delay={index * 60} className="p-3">
                <div className="relative z-10 overflow-hidden rounded-lg border border-black/[0.06] bg-[#111]">
                  <img
                    src={item.image}
                    alt=""
                    className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                  />
                </div>
                <div className="relative z-10 p-3">
                  <div className="text-[10px] font-medium uppercase text-black/38">
                    {item.kicker}
                  </div>
                  <h3 className="mt-1.5 text-base font-light leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[11px] leading-4 text-muted-copy">
                    {item.desc}
                  </p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.06] px-6 py-12 md:px-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Pricing"
            title={<>Start free. Upgrade when ready.</>}
            align="center"
          />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {[
              { name: 'Free', price: '$0', period: 'forever', features: ['Core modules', 'Vocabulary & grammar', '3 AI requests/day'], cta: 'Start free', primary: false },
              { name: 'Pro', price: '$19', period: '/mo', features: ['Unlimited AI feedback', 'Full A1-C2 access', 'Mistake log'], cta: 'Upgrade to Pro', primary: true },
              { name: 'Project', price: '$39', period: '/mo', features: ['3 workspaces', 'Workspace memory', '20 docs/month'], cta: 'Upgrade to Project', primary: false },
            ].map((plan, index) => (
              <AnimatedCard
                key={plan.name}
                delay={index * 70}
                dark={plan.primary}
                className="flex min-h-[280px] flex-col p-6"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <h3 className="text-base font-medium">{plan.name}</h3>
                  {plan.primary ? (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-medium text-white/75">Popular</span>
                  ) : null}
                </div>
                <div className="relative z-10 mt-5">
                  <span className="text-3xl font-light">{plan.price}</span>
                  <span className={plan.primary ? 'ml-1.5 text-xs text-white/45' : 'ml-1.5 text-xs text-black/42'}>
                    {plan.period}
                  </span>
                </div>
                <ul className="relative z-10 mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className={plan.primary ? 'flex items-center gap-2 text-xs text-white/76' : 'flex items-center gap-2 text-xs text-black/60'}>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/pricing"
                  className={plan.primary
                    ? 'relative z-10 mt-auto rounded-xl bg-white px-4 py-2.5 text-center text-xs font-semibold text-[#111] transition hover:bg-white/90'
                    : 'relative z-10 mt-auto rounded-xl border border-black/10 px-4 py-2.5 text-center text-xs font-semibold text-black/60 transition hover:bg-black/[0.04] hover:text-black'
                  }
                >
                  {plan.cta}
                </Link>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-black/[0.06] bg-[#ece9df] px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-muted-copy md:flex-row">
          <span>Copyright 2026 EngVox. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/legal/privacy" className="transition hover:text-black">
              Privacy
            </Link>
            <Link to="/legal/terms" className="transition hover:text-black">
              Terms
            </Link>
            <Link to="/legal/cookies" className="transition hover:text-black">
              Cookies
            </Link>
            <Link to="/admin" className="transition hover:text-black opacity-40">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
