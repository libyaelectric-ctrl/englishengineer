import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Mic,
  BookOpen,
  Brain,
  PenLine,
  Headphones,
  BarChart3,
  Globe,
  Shield,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageMetadata } from '@/shared/components/PageMetadata';
import { ProductAnalyticsService } from '@/features/analytics';

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'EngVox',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  description: 'AI-powered English training platform for engineers working on international projects. Practice writing, speaking, listening, and reading with discipline-specific content.',
  url: 'https://englishengineer.vercel.app',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free plan available',
  },
  author: {
    '@type': 'Organization',
    name: 'EngVox',
  },
};

const FAQ_ITEMS = [
  {
    q: 'What is EngVox?',
    a: 'EngVox is an AI-powered English training platform built specifically for engineers working on international projects. It covers writing (RFIs, NCRs, emails), speaking (site meetings, presentations), listening (technical briefings), and reading (specs, contracts) — all with discipline-specific content.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. The Free plan is permanent with no credit card required. You get core learning modules, vocabulary practice, grammar exercises, and 3 AI coach requests per day.',
  },
  {
    q: 'Which engineering disciplines are supported?',
    a: 'Electrical, civil, mechanical, MEP, commissioning, QA/QC, and multi-discipline project environments. The system adapts content to your discipline during onboarding.',
  },
  {
    q: 'How does the AI coach work?',
    a: 'After each writing or speaking exercise, the AI analyzes your response for technical accuracy, grammar, professional tone, and vocabulary usage. It provides specific corrections and suggestions based on real engineering communication standards.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your Profile page. Your plan stays active until the end of the current billing period. No questions asked.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use Supabase for authentication and data storage. Local-first progress means your data stays on your device by default. Cloud sync only happens when you enable it.',
  },
];

const FEATURES = [
  {
    icon: PenLine,
    title: 'Writing',
    desc: 'Draft RFIs, NCRs, submittals, and client emails. AI reviews technical accuracy, grammar, and professional tone.',
  },
  {
    icon: Mic,
    title: 'Speaking',
    desc: 'Practice site meetings, toolbox talks, and progress updates. Get feedback on clarity and engineering terminology.',
  },
  {
    icon: Headphones,
    title: 'Listening',
    desc: 'Comprehend technical briefings, commissioning reports, and safety protocols. Train your ear for engineering English.',
  },
  {
    icon: BookOpen,
    title: 'Reading',
    desc: 'Analyze specifications, contracts, and technical reports. Build vocabulary through real engineering documents.',
  },
  {
    icon: Brain,
    title: 'AI Coach',
    desc: 'Personalized feedback on every attempt. Tracks your mistakes and adapts to your learning style.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'Track progress across all skills. Identify weak areas and measure improvement over time.',
  },
];

const STATS = [
  { value: '6', label: 'Skill modules' },
  { value: 'A1–C2', label: 'CEFR levels' },
  { value: '90+', label: 'Engineering scenarios' },
  { value: '24/7', label: 'AI availability' },
];

const LandingPage = () => {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    ProductAnalyticsService.track('screen_viewed', 'landing');
  }, []);

  return (
    <main className="bg-transparent text-foreground min-h-screen">
      <PageMetadata
        title="EngVox — Engineering English Training Platform"
        description="AI-powered English training for engineers on international projects. Practice RFIs, site meetings, emails and reports with discipline-specific content."
        canonical="https://englishengineer.vercel.app"
        jsonLd={STRUCTURED_DATA}
      />

      {/* Skip to main content - accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background"
      >
        Skip to main content
      </a>

      {/* HERO */}
      <section className="relative border-b border-border-soft py-16 md:py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: "url('/brand/back2.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95"></div>
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-3 py-1 text-xs text-muted-copy">
            <Globe className="h-3 w-3" />
            Built for engineers on international projects
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Master the emails, RFIs,<br />and site meetings that shape<br />your engineering career.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-copy leading-relaxed">
            The only platform built specifically for engineering communication —
            with AI feedback on every attempt.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/start"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity"
            >
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-border-soft px-6 py-3 text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              See Features
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-copy">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> Free plan included
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> Cancel anytime
            </span>
          </div>
          <div className="mt-8 flex justify-center">
            <img src="/brand/mascot.png" alt="EngVox Mascot" className="h-32 w-auto md:h-40" />
          </div>
        </div>
      </section>

      {/* VIDEO DEMO */}
      <section className="border-b border-border-soft py-10 md:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-copy">See It In Action</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Real engineering English practice
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-copy">
              Watch how EngVox helps engineers master site meetings, RFIs, and technical reporting with AI-powered feedback.
            </p>
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-sm">
            <div className="relative aspect-video">
              <img
                src="/brand/background.webp"
                alt="EngVox demo preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-105">
                  <svg className="ml-1 h-6 w-6 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-copy">
            2-minute overview of all learning modules and AI coaching
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border-soft bg-surface py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:px-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-copy">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-b border-border-soft py-10 md:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-copy">Features</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Everything your engineering communication needs.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-copy">
              Six specialized modules designed for real-world engineering scenarios.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border-soft p-5 hover:border-border-hover transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1 text-xs text-muted-copy leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-border-soft bg-surface py-10 md:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-copy">How it works</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Three steps to project confidence.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Set your profile',
                desc: 'Choose your discipline, current level, and career goals. The system builds a personalized curriculum.',
              },
              {
                step: '2',
                title: 'Practice real scenarios',
                desc: 'Work through authentic engineering communication tasks — from daily reports to client presentations.',
              },
              {
                step: '3',
                title: 'Track and improve',
                desc: 'AI-powered analytics identify weak areas. Spaced repetition ensures you retain what you learn.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">
                  {s.step}
                </div>
                <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-copy leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY ENGVOX */}
      <section className="border-b border-border-soft py-10 md:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-copy">Why EngVox</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Built by engineers, for engineers.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: 'Discipline-specific',
                desc: 'Content adapts to your field — electrical, civil, mechanical, or multi-discipline.',
              },
              {
                icon: Shield,
                title: 'Industry standards',
                desc: 'Scenarios based on real RFIs, NCRs, FAT reports, and commissioning protocols.',
              },
              {
                icon: Globe,
                title: 'International teams',
                desc: 'Designed for engineers working across borders with diverse technical backgrounds.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-foreground">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-copy leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-b border-border-soft py-10 md:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-copy">Pricing</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Start free. Upgrade when ready.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-copy">
              No hidden fees. Cancel anytime.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                cta: 'Start Free',
                href: '/start',
                features: [
                  'Core learning modules',
                  'Vocabulary + grammar',
                  '3 AI requests/day',
                  'Progress tracking',
                ],
              },
              {
                name: 'Pro',
                price: '$19',
                period: '/month',
                cta: 'Upgrade to Pro',
                href: '/pricing',
                features: [
                  'Unlimited AI feedback',
                  'Full A1–C2 access',
                  'Mistake Log',
                  '2 doc uploads/month',
                ],
                popular: true,
              },
              {
                name: 'Project',
                price: '$39',
                period: '/month',
                cta: 'Upgrade to Project',
                href: '/pricing',
                features: [
                  '3 project workspaces',
                  'Workspace memory',
                  '20 docs/month',
                  'LinkedIn optimizer',
                ],
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-xl border p-6 transition-colors ${
                  p.popular
                    ? 'border-foreground bg-surface shadow-sm'
                    : 'border-border-soft hover:border-border-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-copy">
                    {p.name}
                  </p>
                  {p.popular && (
                    <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                      Popular
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-xs text-muted-copy">{p.period}</span>
                </div>
                <ul className="mt-5 space-y-2">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs text-muted-copy"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={p.href}
                  className={`mt-5 flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p.popular
                      ? 'bg-foreground text-background hover:opacity-90'
                      : 'border border-border-soft hover:bg-surface-hover'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted-copy">
            Need more?{' '}
            <Link to="/pricing" className="underline hover:text-foreground">
              See all plans
            </Link>{' '}
            including Max, Exec, and Private.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border-soft bg-surface py-10 md:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-copy">FAQ</p>
            <h2 className="mt-2 text-2xl font-bold">Common questions</h2>
          </div>
          <div className="mt-8 space-y-0">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="border-b border-border-soft last:border-0"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="text-sm font-medium">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-copy transition-transform ${
                      faqOpen === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {faqOpen === i && (
                  <p className="pb-4 text-sm text-muted-copy leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="border-t border-border-soft py-10">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="rounded-xl border border-border-soft bg-surface p-6">
            <p className="text-sm leading-relaxed text-muted-copy italic">
              "EngVox helped me prepare for my first international site meeting in Dubai.
              The RFI templates and commissioning report practice saved me hours of preparation."
            </p>
            <p className="mt-3 text-xs font-medium text-foreground">
              Electrical Engineer, 3 years experience
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
