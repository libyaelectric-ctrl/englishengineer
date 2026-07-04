import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  FileText,
  Mic,
  BookOpen,
  BarChart3,
  Brain,
  Shield,
  Star,
  Zap,
  Users,
  Globe,
  MessageSquare,
  PenLine,
  Headphones,
} from 'lucide-react';
import { useState } from 'react';
import { PageMetadata } from '@/shared/components/PageMetadata';

/* ─────────────────────────── FAQ DATA ─────────────────────────── */
const FAQ_ITEMS = [
  {
    q: 'Is this for general English or engineering English?',
    a: 'Engineering English only. Every scenario, vocabulary set, and AI exercise is built around real project communication — emails to clients, RFIs, site meeting preparation, NCRs, commissioning reports. There is no small talk or tourist vocabulary.',
  },
  {
    q: 'Which engineering disciplines are covered?',
    a: 'Electrical, civil, mechanical, and multi-discipline project environments are all covered. You can set your discipline during onboarding and the content adapts accordingly.',
  },
  {
    q: 'Do I need a credit card to start?',
    a: 'No. The Free plan is permanent and requires no payment details. You can explore the full learning system before deciding to upgrade.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. You can cancel directly from your Profile → Billing page. Your plan remains active until the end of the billing period and you will never be charged again.',
  },
  {
    q: 'What is the difference between the Pro and Project plans?',
    a: 'Pro ($19) gives you unlimited individual learning, AI feedback, and mistake tracking. Project ($39) adds isolated workspace memory, document uploads, and LinkedIn optimization tools for engineers managing complex scopes.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Payments are processed by Stripe (PCI-DSS Level 1). Your learning data is stored locally on your device by default and is never sold to third parties.',
  },
];

/* ─────────────────────────── FAQ ITEM ─────────────────────────── */
const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-slate-900">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm leading-7 text-slate-600">{a}</p>
      )}
    </div>
  );
};

/* ─────────────────────────── PAGE ─────────────────────────── */
const LandingPage = () => (
  <main className="bg-background text-foreground min-h-screen">
    <PageMetadata
      title="EngineerOS — Engineering Communication Training Platform"
      description="The English training platform built for engineers on international projects. Practice RFIs, site meetings, emails and reports in your discipline and CEFR level."
    />

    {/* ══════════════════════════════════════════════
        SECTION 1: HERO
    ══════════════════════════════════════════════ */}
    <section className="relative overflow-hidden border-b border-border-soft bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 py-16 md:py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_42%] lg:items-center lg:px-8">
        {/* Left: copy */}
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-sky-400">
            <Zap className="h-3 w-3" /> Built for international project engineers
          </p>

          <h1 className="mt-5 text-4xl font-black leading-[1.08] text-white sm:text-5xl lg:text-6xl">
            Engineering English<br />
            <span className="text-sky-400">that works on site.</span>
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">
            Practice the exact emails, RFIs, site meetings, and commissioning
            reports you write every day — in your discipline, at your CEFR
            level, with AI feedback on every attempt.
          </p>

          {/* Trust indicators row */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
            {['Free plan included', 'No credit card required', 'Cancel anytime'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-sky-400" />
                {t}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/start"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-sky-500 px-6 text-sm font-black text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-sky-400 hover:shadow-sky-400/30"
            >
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15"
            >
              See Features
            </a>
          </div>

          {/* Social proof numbers */}
          <div className="mt-10 flex flex-wrap gap-8 border-t border-white/10 pt-8">
            {[
              { value: '6', label: 'CEFR levels (A1→C2)' },
              { value: '100+', label: 'Engineering scenarios' },
              { value: '4', label: 'Disciplines covered' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[11px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: app preview mock */}
        <div className="w-full">
          <div className="relative rounded-[20px] border border-white/10 bg-slate-900/80 p-1 shadow-2xl shadow-black/40 backdrop-blur-md ring-1 ring-white/5">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/10">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="mx-auto text-[10px] font-mono text-slate-500">englishengineer.vercel.app/dashboard</span>
            </div>

            <div className="p-4 space-y-3 font-sans text-xs">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-[6px] bg-sky-500 flex items-center justify-center text-[10px] font-black text-white">EO</div>
                  <div>
                    <p className="text-[10px] font-bold text-white leading-none">EngineerOS</p>
                    <p className="text-[8px] text-slate-400 leading-none">Command Center</p>
                  </div>
                </div>
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[9px] font-bold text-sky-400">B1 · Electrical Eng.</span>
              </div>

              {/* Today's focus */}
              <div className="rounded-[10px] border border-sky-500/25 bg-sky-500/10 p-3 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-sky-400">Today's Focus</span>
                  <span className="text-[8px] text-slate-400">~14 min</span>
                </div>
                <p className="text-[11px] font-bold text-white leading-snug">Cable Tray Delivery — Client Email</p>
                <p className="text-[9px] text-slate-400 leading-relaxed">Draft a formal delay notification to the project owner with timeline relief request.</p>
                <div className="flex justify-between items-center pt-1">
                  <div className="flex gap-1.5">
                    {['Writing', 'Vocabulary'].map((tag) => (
                      <span key={tag} className="rounded-[4px] bg-white/10 px-1.5 py-0.5 text-[8px] font-semibold text-slate-300">{tag}</span>
                    ))}
                  </div>
                  <span className="rounded-[6px] bg-sky-500 px-2.5 py-1 text-[8px] font-bold text-white">Start →</span>
                </div>
              </div>

              {/* Skill grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Writing', pct: 78, level: 'B1', color: '#3b82f6' },
                  { name: 'Speaking', pct: 52, level: 'A2', color: '#06b6d4' },
                  { name: 'Reading', pct: 91, level: 'B2', color: '#10b981' },
                ].map((sk) => (
                  <div key={sk.name} className="rounded-[8px] bg-white/5 p-2 space-y-1.5 border border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-semibold text-slate-300">{sk.name}</span>
                      <span className="text-[8px] font-bold text-white">{sk.level}</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${sk.pct}%`, backgroundColor: sk.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Alerts */}
              <div className="flex gap-2">
                <div className="flex-1 rounded-[8px] bg-amber-500/10 border border-amber-500/20 px-2 py-1.5">
                  <p className="text-[8px] font-bold text-amber-400">4 vocabulary terms due</p>
                </div>
                <div className="flex-1 rounded-[8px] bg-rose-500/10 border border-rose-500/20 px-2 py-1.5">
                  <p className="text-[8px] font-bold text-rose-400">2 repeated mistakes</p>
                </div>
              </div>

              {/* Tools strip */}
              <div className="flex items-center justify-between rounded-[8px] bg-white/5 border border-white/10 px-2.5 py-2">
                <span className="text-[8px] font-bold text-slate-400">Tools:</span>
                {['AI Coach', 'Mistake Log', 'Voice Practice', 'LinkedIn'].map((t, i) => (
                  <span key={t} className={`text-[8px] font-bold ${i === 0 ? 'text-sky-400' : 'text-slate-400'}`}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════
        SECTION 2: PROBLEM / PAIN POINT
    ══════════════════════════════════════════════ */}
    <section className="border-b border-border-soft bg-slate-50 py-14 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">The problem</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl lg:text-4xl">
            Technical knowledge is not the bottleneck.<br />
            <span className="text-primary">Communication is.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Engineers working on international projects often have the technical skills but struggle to communicate confidently with clients, consultants, and contractors in English — especially under pressure.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            {
              emoji: '📧',
              title: 'Emails take hours',
              text: 'You know exactly what to say technically, but drafting a formal English email to a client still takes 45 minutes of second-guessing every sentence.',
            },
            {
              emoji: '🎤',
              title: 'Meetings are stressful',
              text: 'Site progress meetings in English feel like a performance. You prepare what to say but forget your vocabulary or freeze when asked a follow-up.',
            },
            {
              emoji: '📄',
              title: 'Documents lack authority',
              text: 'Your RFIs, NCRs, and commissioning reports don\'t read with the authority they should. You know the reviewer is judging your English, not just your engineering.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{item.emoji}</div>
              <h3 className="mt-3 text-sm font-black text-slate-900">{item.title}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════
        SECTION 3: HOW IT WORKS
    ══════════════════════════════════════════════ */}
    <section id="how-it-works" className="border-b border-border-soft bg-background py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
            From zero to project-confident in weeks, not years.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: '01',
              icon: Users,
              title: 'Profile your engineering context',
              text: 'Set your discipline (electrical, civil, mechanical), CEFR level, and daily communication goals. The system builds your personal curriculum automatically.',
              color: 'sky',
            },
            {
              step: '02',
              icon: PenLine,
              title: 'Practice real project scenarios',
              text: 'Work through writing tasks, reading exercises, and speaking roleplays built from actual engineering communication — not textbook dialogues.',
              color: 'primary',
            },
            {
              step: '03',
              icon: Brain,
              title: 'Fix what you actually get wrong',
              text: 'Your Mistake Log tracks every error across sessions. Spaced repetition ensures weak vocabulary and patterns come back until they stick.',
              color: 'emerald',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-[16px] border border-border-soft bg-surface p-7 text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${
                  item.color === 'sky' ? 'bg-sky-50 text-sky-600' :
                  item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-primary/10 text-primary'
                }`}>
                  <item.icon className="h-4 w-4" />
                </span>
                <span className={`text-xs font-black ${
                  item.color === 'sky' ? 'text-sky-500' :
                  item.color === 'emerald' ? 'text-emerald-500' :
                  'text-primary'
                }`}>{item.step}</span>
              </div>
              <h3 className="mt-4 text-sm font-black text-slate-900">{item.title}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════
        SECTION 4: FEATURES (SPECIFIC, NOT GENERIC)
    ══════════════════════════════════════════════ */}
    <section id="features" className="border-b border-border-soft bg-slate-50 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">What you get</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
            Every tool your project communication needs.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">
            Not a generic language app. A professional communication system built specifically for engineers on international projects.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: PenLine,
              badge: 'Writing',
              title: 'Project Document Practice',
              desc: 'Draft RFIs, NCRs, delay notifications, and handover emails with AI feedback on clarity, tone, and technical accuracy.',
              color: 'blue',
            },
            {
              icon: Mic,
              badge: 'Speaking',
              title: 'Site Meeting Roleplay',
              desc: 'Simulate consultant discussions, client presentations, and toolbox talks. Get scored on fluency, vocabulary, and engineering terminology.',
              color: 'cyan',
            },
            {
              icon: Headphones,
              badge: 'Listening',
              title: 'Technical Audio Comprehension',
              desc: 'Extract key information from engineering meeting recordings and technical briefings. Timed exercises matching real site scenarios.',
              color: 'violet',
            },
            {
              icon: BookOpen,
              badge: 'Reading',
              title: 'Technical Text Analysis',
              desc: 'Interpret specifications, contract clauses, and commissioning reports. Build the reading speed you need to process documents under deadline.',
              color: 'emerald',
            },
            {
              icon: Brain,
              badge: 'AI Coach',
              title: 'Personalized AI Feedback',
              desc: 'Ask questions, get grammar corrections, and request custom scenario rewrites. An AI coach that understands engineering context.',
              color: 'amber',
            },
            {
              icon: BarChart3,
              badge: 'Intelligence',
              title: 'Mistake Log & Analytics',
              desc: 'Every error is tracked, categorized, and scheduled for review. 12-month progress history so you can see your improvement over time.',
              color: 'rose',
            },
            {
              icon: FileText,
              badge: 'Project $39',
              title: 'Workspace Memory',
              desc: 'Inject your project glossary, client names, and site context into every AI session. Custom scenarios generated from your actual documents.',
              color: 'primary',
            },
            {
              icon: Globe,
              badge: 'Project $39',
              title: 'LinkedIn Profile Optimizer',
              desc: 'Rewrite your LinkedIn headline and bio for international visibility. Tailored to your engineering discipline and target market.',
              color: 'sky',
            },
            {
              icon: MessageSquare,
              badge: 'Max $59',
              title: 'Voice Pronunciation Analysis',
              desc: 'Record yourself speaking and get phoneme-level pronunciation feedback. Monthly voice minute wallet tracks your practice.',
              color: 'slate',
            },
          ].map((item) => {
            const colorMap: Record<string, string> = {
              blue: 'bg-blue-50 text-blue-600',
              cyan: 'bg-cyan-50 text-cyan-600',
              violet: 'bg-violet-50 text-violet-600',
              emerald: 'bg-emerald-50 text-emerald-600',
              amber: 'bg-amber-50 text-amber-600',
              rose: 'bg-rose-50 text-rose-600',
              primary: 'bg-primary/10 text-primary',
              sky: 'bg-sky-50 text-sky-600',
              slate: 'bg-slate-100 text-slate-600',
            };
            const isPaid = item.badge.includes('$');
            return (
              <article
                key={item.title}
                className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${colorMap[item.color] || 'bg-primary/10 text-primary'}`}>
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                    isPaid
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-black text-slate-900">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-600">{item.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════
        SECTION 5: PLAN COMPARISON
    ══════════════════════════════════════════════ */}
    <section className="border-b border-border-soft bg-background py-14 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
            Start free. Upgrade when you're ready.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              name: 'Free',
              price: '$0',
              sub: 'Permanent — no expiry',
              cta: 'Start Free',
              href: '/start',
              highlight: false,
              items: [
                'Core learning modules (A1–B2)',
                'Vocabulary + grammar exercises',
                '3 AI coach requests per day',
                'Basic progress tracking',
              ],
            },
            {
              name: 'Pro',
              price: '$19',
              sub: 'per month',
              cta: 'Upgrade to Pro',
              href: '/pricing',
              highlight: true,
              items: [
                'Everything in Free',
                'Unlimited AI feedback & coaching',
                'Full A1–C2 course access',
                'Mistake Log + 12-month history',
                '2 document uploads / month',
                'Ad-free workspace',
              ],
            },
            {
              name: 'Project',
              price: '$39',
              sub: 'per month',
              cta: 'See All Plans',
              href: '/pricing',
              highlight: false,
              items: [
                'Everything in Pro',
                '3 isolated project workspaces',
                'Workspace memory injection',
                '20 documents / month',
                'Custom scenario generator',
                'LinkedIn profile optimizer',
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[20px] border p-7 ${
                plan.highlight
                  ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                  : 'border-slate-200 bg-white text-slate-900 shadow-sm'
              }`}
            >
              <p className={`text-xs font-black uppercase tracking-widest ${plan.highlight ? 'text-sky-200' : 'text-primary'}`}>{plan.name}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-slate-950'}`}>{plan.price}</span>
                <span className={`text-xs ${plan.highlight ? 'text-sky-200' : 'text-slate-500'}`}>{plan.sub}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.items.map((item) => (
                  <li key={item} className={`flex items-start gap-2 text-xs ${plan.highlight ? 'text-sky-100' : 'text-slate-600'}`}>
                    <CheckCircle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${plan.highlight ? 'text-sky-300' : 'text-emerald-500'}`} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.href}
                className={`mt-8 flex h-10 w-full items-center justify-center rounded-[10px] text-xs font-black transition-all ${
                  plan.highlight
                    ? 'bg-white text-primary hover:bg-sky-50'
                    : 'bg-primary/10 text-primary hover:bg-primary/15'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Need voice pronunciation, unlimited workspaces, or dedicated coaching?{' '}
          <Link to="/pricing" className="font-bold text-primary hover:underline">See Max ($59) and Exec ($99) →</Link>
        </p>
      </div>
    </section>

    {/* ══════════════════════════════════════════════
        SECTION 6: TRUST / WHY US
    ══════════════════════════════════════════════ */}
    <section className="border-b border-border-soft bg-slate-50 py-14 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Why EngineerOS</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
            Not another general English app.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Shield,
              title: 'Built for engineers',
              text: 'Every word, scenario, and exercise comes from real project communication. Zero tourist English or office small talk.',
            },
            {
              icon: Star,
              title: 'CEFR-mapped content',
              text: 'Your skill level is assessed and all content is matched to A1–C2 standards. You always practice at the right difficulty.',
            },
            {
              icon: Globe,
              title: 'Discipline-specific',
              text: 'Electrical, civil, and mechanical contexts are separated. You practice the vocabulary your actual project uses.',
            },
            {
              icon: BarChart3,
              title: 'Intelligence-driven',
              text: 'The system tracks every mistake and builds a personal review queue. You spend time on what you actually need.',
            },
          ].map((item) => (
            <div key={item.title} className="text-center sm:text-left">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/10 text-primary sm:flex">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-black text-slate-900">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {[
            '🔒 Stripe Secured Payments',
            '📦 Local-first data storage',
            '🚫 No data sold to third parties',
            '✅ Cancel anytime',
          ].map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-600 shadow-sm"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════
        SECTION 7: FAQ
    ══════════════════════════════════════════════ */}
    <section className="border-b border-border-soft bg-background py-14 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
            Common questions
          </h2>
        </div>

        <div className="mt-10 rounded-[20px] border border-slate-200 bg-white px-6 shadow-sm">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════
        SECTION 8: FINAL CTA
    ══════════════════════════════════════════════ */}
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 py-20 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-sky-400">Get started today</p>
        <h2 className="mt-4 text-3xl font-black sm:text-4xl">
          Start communicating with<br />project-level confidence.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
          Join engineers on international projects who are actively building the communication skills their careers demand.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/start"
            className="inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-sky-500 px-8 text-sm font-black text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-sky-400"
          >
            Start Free — No Credit Card <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex min-h-12 items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15"
          >
            View Pricing
          </Link>
        </div>
        <p className="mt-5 text-[11px] text-slate-400">
          Free plan included · Cancel Pro anytime · Data stays on your device
        </p>
      </div>
    </section>

    {/* ══════════════════════════════════════════════
        FOOTER
    ══════════════════════════════════════════════ */}
    <footer className="border-t border-border-soft bg-slate-950 py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-[7px] bg-sky-500 flex items-center justify-center text-[11px] font-black text-white">EO</div>
              <div>
                <p className="text-sm font-black text-white leading-none">EngineerOS</p>
                <p className="text-[9px] text-slate-500 leading-none">Engineering Communication OS</p>
              </div>
            </div>
            <p className="mt-4 text-[11px] leading-6 text-slate-500">
              The English training platform built for engineers on international projects.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Product</p>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'Start Free', to: '/start' },
                { label: 'Features', to: '/#features' },
                { label: 'Pricing', to: '/pricing' },
                { label: 'For Teams', to: '/business' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Legal</p>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'Privacy Policy', to: '/legal/privacy' },
                { label: 'Terms of Service', to: '/legal/terms' },
                { label: 'Cookie Policy', to: '/legal/cookies' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Get Started</p>
            <Link
              to="/start"
              className="inline-flex min-h-10 items-center gap-2 rounded-[10px] bg-sky-500 px-5 text-xs font-black text-white transition-all hover:bg-sky-400"
            >
              Start Free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <p className="mt-3 text-[10px] text-slate-600">No credit card required.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-[11px] text-slate-600">© {new Date().getFullYear()} EngineerOS. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <Shield className="h-3 w-3" /> Payments secured by Stripe
          </div>
        </div>
      </div>
    </footer>
  </main>
);

export default LandingPage;
