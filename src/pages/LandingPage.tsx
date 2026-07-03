import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Compass,
  LineChart,
  MessageSquare,
} from 'lucide-react';
import { PageMetadata } from '@/shared/components/PageMetadata';

const LandingPage = () => (
  <main className="bg-background text-foreground min-h-screen">
    <PageMetadata
      title="Engineering Communication Operating System"
      description="Work-ready English for international engineering projects."
    />

    {/* Section 1: Hero */}
    <section className="relative overflow-hidden border-b border-border-soft bg-surface py-12 md:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_45%] lg:items-center lg:px-8">
        <div className="max-w-xl">
          <p className="public-eyebrow">Built for international project work</p>
          <h1 className="mt-4 text-3xl font-black leading-[1.1] text-slate-950 sm:text-4xl lg:text-5xl">
            Work-ready English for international engineering projects.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Practice the emails, reports, meetings and site communication
            engineers use every day.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/start" className="public-primary-action min-h-11">
              Start Free{' '}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="public-secondary-action min-h-11"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Authentic Dashboard Preview Visual */}
        <div className="w-full">
          <div className="rounded-card border border-border-soft bg-background p-4 shadow-md text-left text-xs space-y-3 font-sans">
            {/* Miniature Topbar / Header */}
            <div className="flex items-center justify-between border-b border-border-soft pb-2">
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 bg-primary rounded-[4px] flex items-center justify-center text-[10px] text-white font-bold">
                  E
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-900 leading-none">
                    EngineerOS
                  </p>
                  <p className="text-[8px] text-muted-copy leading-none">
                    Command Center
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary">
                  A1 Demo Path
                </span>
                <div className="h-4 w-4 rounded-full bg-slate-200"></div>
              </div>
            </div>

            {/* Today's Focus Card */}
            <div className="rounded-[8px] border border-primary/20 bg-primary/5 p-3 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-primary uppercase tracking-wider">
                  Today's Focus
                </span>
                <span className="text-[8px] font-bold text-slate-500">
                  Estimated: 12 min
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-xs">
                Lesson 1: Cable Tray Delivery Delay
              </h3>
              <p className="text-[9px] text-muted-copy leading-relaxed">
                Draft a formal email update requesting timeline relief from the
                project owner.
              </p>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[8px] text-primary font-bold">
                  Skills: Writing, Vocabulary
                </span>
                <span className="rounded-[4px] bg-primary px-2.5 py-1 text-[8px] font-bold text-white shadow-sm flex items-center gap-1">
                  Start Lesson <ArrowRight className="h-2 w-2" />
                </span>
              </div>
            </div>

            {/* Main Grid: Skills Progress & Review Priorities */}
            <div className="grid grid-cols-2 gap-3">
              {/* Skills Overview Panel */}
              <div className="rounded-[8px] border border-border-soft bg-surface/30 p-2.5 space-y-2">
                <span className="text-[8px] font-bold text-muted-copy uppercase tracking-wider block">
                  Skills Overview
                </span>
                <div className="space-y-1.5">
                  {[
                    { name: 'Writing', value: 75, badge: 'A2' },
                    { name: 'Reading', value: 90, badge: 'B1' },
                    { name: 'Speaking', value: 40, badge: 'A1' },
                  ].map((skill) => (
                    <div key={skill.name} className="space-y-0.5">
                      <div className="flex justify-between text-[9px] font-semibold">
                        <span>{skill.name}</span>
                        <span className="text-primary">{skill.badge}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${skill.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Priorities Panel */}
              <div className="rounded-[8px] border border-border-soft bg-surface/30 p-2.5 space-y-2">
                <span className="text-[8px] font-bold text-muted-copy uppercase tracking-wider block">
                  Review Priorities
                </span>
                <div className="space-y-1.5 text-[9px]">
                  <div className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-500/5 border border-amber-500/10 p-1 rounded-[4px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    <span>4 weak words due</span>
                  </div>
                  <div className="flex items-center gap-1 text-rose-600 font-semibold bg-rose-500/5 border border-rose-500/10 p-1 rounded-[4px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                    <span>2 repeated mistakes</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 font-semibold bg-slate-500/5 border border-slate-500/10 p-1 rounded-[4px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                    <span>Grammar route clear</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Tools Bar */}
            <div className="rounded-[8px] border border-border-soft bg-surface/40 p-2 flex items-center justify-between text-[9px]">
              <span className="font-semibold text-slate-800">
                Professional Tools:
              </span>
              <div className="flex gap-2 text-primary font-bold">
                <span>Writing Assist</span>
                <span>•</span>
                <span>Mistake Log</span>
                <span>•</span>
                <span>Simulator</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Section 2: How It Works */}
    <section
      id="how-it-works"
      className="border-b border-border-soft bg-background py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="public-eyebrow">Simple learning flow</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
            How EngineerOS Works
          </h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Set Target & Profession',
              text: 'Choose your profession and communication goals to customize your scenario practice.',
            },
            {
              step: '2',
              title: 'Practice Scenarios',
              text: 'Practice real engineering communication tasks, from emails and RFIs to meeting prep.',
            },
            {
              step: '3',
              title: 'Improve Weak Skills',
              text: 'Review mistakes automatically compiled in your Mistake Log and build weak skills.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-[16px] border border-border-soft bg-surface p-6 text-left shadow-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {item.step}
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Section 3: What You Can Do */}
    <section className="border-b border-border-soft bg-surface py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="public-eyebrow">Features & capabilities</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
            Complete Workspace Coverage
          </h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              title: 'Learn',
              desc: 'Vocabulary, grammar and technical language.',
            },
            {
              icon: Compass,
              title: 'Practice',
              desc: 'Reading, writing and project scenarios.',
            },
            {
              icon: MessageSquare,
              title: 'Produce',
              desc: 'Emails, reports, RFIs, NCRs and meeting preparation.',
            },
            {
              icon: LineChart,
              title: 'Improve',
              desc: 'Skill tracking, mistake intelligence and personalized review.',
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[16px] border border-border-soft bg-background p-6 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* Section 4: Final CTA */}
    <section className="bg-sky-50 py-16 text-slate-950">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-black">
          Communicate engineering work with clarity.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm text-slate-600 leading-6">
          Start your local learning flow today. Explore tailored project
          templates and check your access level options anytime.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/start" className="public-primary-action min-h-11">
            Start Free
          </Link>
          <Link
            to="/pricing"
            className="public-secondary-action min-h-11 border-slate-300 hover:bg-white/50"
          >
            Explore Access
          </Link>
        </div>
      </div>
    </section>
  </main>
);

export default LandingPage;
