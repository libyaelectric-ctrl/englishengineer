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
} from 'lucide-react';
import { useState } from 'react';
import { PageMetadata } from '@/shared/components/PageMetadata';

const FAQ_ITEMS = [
  {
    q: 'What is EngineerOS?',
    a: 'An English training platform built specifically for engineers on international projects. Practice RFIs, site meetings, emails, and commissioning reports in your discipline.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. Free plan is permanent with no credit card required. You get core learning modules, vocabulary, and 3 AI coach requests per day.',
  },
  {
    q: 'Which engineering disciplines?',
    a: 'Electrical, civil, mechanical, and multi-discipline project environments. Content adapts to your discipline during onboarding.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your Profile page. Your plan stays active until the end of the billing period.',
  },
];

const FEATURES = [
  { icon: PenLine, title: 'Writing', desc: 'Draft RFIs, NCRs, and client emails with AI feedback' },
  { icon: Mic, title: 'Speaking', desc: 'Practice site meetings and presentations' },
  { icon: Headphones, title: 'Listening', desc: 'Comprehend technical briefings and meetings' },
  { icon: BookOpen, title: 'Reading', desc: 'Analyze specs, contracts, and reports' },
  { icon: Brain, title: 'AI Coach', desc: 'Personalized feedback on every attempt' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track mistakes, progress, and improvement' },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    cta: 'Start Free',
    href: '/start',
    features: ['Core learning modules', 'Vocabulary + grammar', '3 AI requests/day', 'Progress tracking'],
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    cta: 'Upgrade to Pro',
    href: '/pricing',
    features: ['Unlimited AI feedback', 'Full A1–C2 access', 'Mistake Log', '2 doc uploads/month'],
  },
  {
    name: 'Project',
    price: '$39',
    period: '/month',
    cta: 'Upgrade to Project',
    href: '/pricing',
    features: ['3 project workspaces', 'Workspace memory', '20 docs/month', 'LinkedIn optimizer'],
  },
  {
    name: 'Max',
    price: '$59',
    period: '/month',
    cta: 'Upgrade to Max',
    href: '/pricing',
    features: ['Voice pronunciation', 'Unlimited workspaces', 'Unlimited uploads', 'Custom voice minutes'],
  },
  {
    name: 'Exec',
    price: '$99',
    period: '/month',
    cta: 'Upgrade to Exec',
    href: '/pricing',
    features: ['Executive coaching', 'Priority support', 'Offline audio', 'Custom scenarios'],
  },
  {
    name: 'Private',
    price: '$999',
    period: '/month',
    cta: 'Contact Sales',
    href: '/business',
    features: ['Dedicated private proxy', 'Ultimate personalization', 'Compliance reporting', 'Unlimited everything'],
  },
];

const LandingPage = () => {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <PageMetadata
        title="EngineerOS — Engineering English Training Platform"
        description="English training for engineers on international projects. Practice RFIs, site meetings, emails and reports."
      />

      {/* HERO */}
      <section className="border-b border-border-soft py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs font-medium text-muted-copy">Built for engineers on international projects</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Engineering English<br />that works on site.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-copy leading-relaxed">
            Practice the exact emails, RFIs, site meetings, and commissioning
            reports you write every day — with AI feedback.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/start" className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity">
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 rounded-lg border border-border-soft px-6 py-3 text-sm font-medium hover:bg-surface-hover transition-colors">
              See Features
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-copy">
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Free plan included</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-b border-border-soft py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-copy">Features</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Every tool your project communication needs.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-border-soft p-5 hover:border-border-hover transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1 text-xs text-muted-copy leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-border-soft bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-copy">How it works</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Three steps to project confidence.</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { step: '1', title: 'Set your profile', desc: 'Choose discipline, level, and goals. System builds your curriculum.' },
              { step: '2', title: 'Practice scenarios', desc: 'Work through real engineering communication tasks with AI feedback.' },
              { step: '3', title: 'Fix what matters', desc: 'Mistake Log tracks errors. Spaced repetition ensures they stick.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">{s.step}</div>
                <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-copy leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-b border-border-soft py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-copy">Pricing</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Start free. Upgrade when ready.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.name} className="rounded-xl border border-border-soft p-6 hover:border-border-hover transition-colors">
                <p className="text-xs font-medium text-muted-copy">{p.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-xs text-muted-copy">{p.period}</span>
                </div>
                <ul className="mt-5 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-copy">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />{f}
                    </li>
                  ))}
                </ul>
                <Link to={p.href} className="mt-5 flex h-10 w-full items-center justify-center rounded-lg border border-border-soft text-sm font-medium hover:bg-surface-hover transition-colors">
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border-soft bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-copy">FAQ</p>
            <h2 className="mt-2 text-2xl font-bold">Common questions</h2>
          </div>
          <div className="mt-8 space-y-0">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border-b border-border-soft last:border-0">
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="text-sm font-medium">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-copy transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && <p className="pb-4 text-sm text-muted-copy leading-relaxed">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to start?</h2>
          <p className="mt-3 text-sm text-muted-copy">Join engineers building communication skills for international projects.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/start" className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity">
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-border-soft px-6 py-3 text-sm font-medium hover:bg-surface-hover transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border-soft py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background text-[10px] font-bold">EO</div>
            <span className="text-xs text-muted-copy">© {new Date().getFullYear()} EngineerOS</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-copy">
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
