import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Headphones,
  MessageSquareText,
  Mic2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { PageMetadata } from '@/shared/components/PageMetadata';

const capabilities = [
  {
    icon: BookOpen,
    title: 'Engineering reading',
    text: 'Build comprehension around specifications, reports and site correspondence.',
  },
  {
    icon: MessageSquareText,
    title: 'Professional writing',
    text: 'Practice RFIs, NCR responses, progress updates and consultant replies.',
  },
  {
    icon: Headphones,
    title: 'Listening practice',
    text: 'Train for meetings, inspections, toolbox talks and commissioning discussions.',
  },
  {
    icon: Mic2,
    title: 'Speaking roleplay',
    text: 'Respond with clarity in site coordination and client-facing situations.',
  },
];

const useCases = [
  'Site meetings and coordination',
  'Inspection and QA/QC comments',
  'Commissioning and handover',
  'Technical emails and RFIs',
  'Progress and delay reporting',
  'Client and consultant communication',
];

const previews = [
  {
    icon: ClipboardCheck,
    title: 'Learning Hub',
    text: 'Independent skill paths with CEFR-aware tasks and review queues.',
  },
  {
    icon: Mic2,
    title: 'Site roleplay',
    text: 'Mission-based speaking practice grounded in engineering situations.',
  },
  {
    icon: ShieldCheck,
    title: 'Mistake Log',
    text: 'Turn recurring communication errors into targeted practice.',
  },
  {
    icon: BarChart3,
    title: 'Progress analytics',
    text: 'See skill trends, retention and recommended next work.',
  },
];

const LandingPage = () => (
  <main>
    <PageMetadata
      title="Engineering Communication Operating System"
      description="AI-powered communication training for engineers on international projects."
    />
    <section className="relative min-h-[620px] overflow-hidden border-b border-slate-200 bg-white">
      <img
        src="/brand/engineeros-hero.webp"
        alt="Electrical engineer reviewing a data center installation with a tablet"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-full bg-white/82 sm:w-[58%] sm:shadow-[70px_0_70px_70px_rgba(255,255,255,0.78)] lg:w-[50%]"
      />
      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-xl py-3 sm:py-8">
          <p className="public-eyebrow">Built for international project work</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.08] text-slate-950 sm:text-5xl">
            Engineering English for real project work.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
            AI-powered communication training for engineers on international
            projects, including hospitals, data centers, airports,
            infrastructure and industrial plants.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/start" className="public-primary-action">
              Start free <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/pricing" className="public-secondary-action">
              View plans
            </Link>
          </div>
          <div
            className="mt-5 flex flex-wrap gap-2"
            aria-label="Product status"
          >
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              Instant demo access
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800">
              Private local progress
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
              Cloud verification pending
            </span>
          </div>
          <p className="mt-3 max-w-lg text-xs leading-5 text-slate-500">
            Explore core learning workflows without payment details. Connected
            account, AI and billing services remain available only after
            verification.
          </p>
        </div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="public-eyebrow">From site note to clear communication</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-black text-slate-950">
          Practice the transformation your work requires.
        </h2>
        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <article className="public-card p-5 sm:p-6">
            <p className="text-xs font-bold uppercase text-slate-500">
              Sample site note
            </p>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Cable tray work is late because ceiling support is not finished.
              We need two more days.
            </p>
          </article>
          <ArrowRight
            className="mx-auto h-5 w-5 rotate-90 text-sky-700 lg:rotate-0"
            aria-hidden="true"
          />
          <article className="public-card border-sky-200 bg-sky-50/50 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase text-sky-700">
              Professional project update
            </p>
            <p className="mt-4 text-base leading-7 text-slate-800">
              Cable tray installation is two days behind schedule because the
              ceiling supports are incomplete. We have coordinated the revised
              sequence and will confirm recovery progress tomorrow.
            </p>
          </article>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Illustrative communication example, not a live AI response.
        </p>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="public-eyebrow">The communication gap</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">
            Technical knowledge is not the same as communication readiness.
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Engineers often know the work but lose precision when explaining
            delays, responding to inspections or leading a meeting in English.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {useCases.map((item) => (
            <div
              key={item}
              className="public-card flex items-center gap-3 px-4 py-4 text-sm font-semibold text-slate-800"
            >
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>

    <section id="product" className="border-b border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="public-eyebrow">One learning system</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">
            Practice every part of engineering communication.
          </h2>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, text }) => (
            <article key={title} className="public-card p-5">
              <Icon className="h-5 w-5 text-sky-700" aria-hidden="true" />
              <h3 className="mt-5 font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {previews.map(({ icon: Icon, title, text }) => (
            <article key={title} className="public-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-sky-50 text-sky-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-white py-16">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-7">
          <p className="text-xs font-bold uppercase text-sky-700">
            For individuals
          </p>
          <h2 className="mt-3 text-2xl font-black">
            Start with the Free plan.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Build a daily learning rhythm, then move to Pro when secure AI
            feedback and cloud features are verified.
          </p>
          <Link to="/pricing" className="public-text-link mt-4">
            Compare plans <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="rounded-[16px] border border-sky-200 bg-sky-50 p-7">
          <div className="flex items-center gap-2 text-sky-700">
            <Users className="h-5 w-5" aria-hidden="true" />
            <p className="text-xs font-bold uppercase">For engineering teams</p>
          </div>
          <h2 className="mt-3 text-2xl font-black">
            Prepare teams for project communication.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Manager summaries, role-based practice and reporting are code-ready
            and clearly labelled when demo data is used.
          </p>
          <Link to="/business" className="public-text-link mt-4">
            Explore Team <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="public-eyebrow">FAQ</p>
        <h2 className="mt-3 text-3xl font-black text-slate-950">
          Clear boundaries before you start.
        </h2>
        <div className="mt-8 divide-y divide-slate-200 rounded-[16px] border border-slate-200 bg-white px-5">
          {[
            [
              'Is EngineerOS general English training?',
              'No. It focuses on communication used in engineering projects, while still supporting the grammar and vocabulary needed to communicate clearly.',
            ],
            [
              'Does the Free plan require payment details?',
              'No. Local demo access does not require a payment method. Verified paid access is unavailable until the billing backend passes live verification.',
            ],
            [
              'Does EngineerOS provide an official CEFR certificate?',
              'No. CEFR levels are internal learning estimates and are labelled accordingly.',
            ],
            [
              'Can companies view private learner answers?',
              'The Team design exposes manager summaries, not raw writing or speaking responses. Live organization access still requires verified Supabase RLS.',
            ],
          ].map(([question, answer]) => (
            <details key={question} className="group py-5">
              <summary className="relative cursor-pointer list-none rounded-[10px] pr-8 text-sm font-bold text-slate-900">
                {question}
                <ChevronDown
                  className="absolute right-0 top-0 h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-sky-50 py-16 text-slate-950">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-black">
          Communicate engineering work with clarity.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          Start in local demo mode today. Connect verified services only when
          your deployment environment is ready.
        </p>
        <Link to="/start" className="public-primary-action mt-7">
          Start free
        </Link>
      </div>
    </section>
  </main>
);

export default LandingPage;
