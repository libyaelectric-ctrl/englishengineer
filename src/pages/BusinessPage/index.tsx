import { PRODUCT_VERSION } from '@/config/product.config';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  HardHat,
  Mail,
  MessageSquareCode,
  Settings2,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import { PageMetadata } from '@/shared/components/PageMetadata';

import { AUTH_SIGN_UP_URL } from '@/features/auth/firebase.config';

import { Footer } from '@/pages/LandingPage/Footer';
import { Navbar } from '@/pages/LandingPage/Navbar';

const BUSINESS_CASES = [
  {
    icon: HardHat,
    title: 'Site Coordination & BIM Meetings',
    text: 'Prepare engineers for international coordination meetings, site decisions, and technical constraints.',
  },
  {
    icon: ClipboardCheck,
    title: 'QA/QC Inspection Responses',
    text: 'Practice concise inspection answers, NCR responses, and audit-ready technical explanations.',
  },
  {
    icon: FileCheck2,
    title: 'FIDIC & Submittal Writing',
    text: 'Draft variation notices, RFI messages, EOT claims, and material approval requests with confidence.',
  },
  {
    icon: MessageSquareCode,
    title: 'Client Review Defenses',
    text: 'Explain design revisions, risks, and budget recovery actions with precise technical English.',
  },
  {
    icon: BarChart3,
    title: 'Project Reporting',
    text: 'Turn progress updates and delay reasons into clear executive summaries.',
  },
  {
    icon: Users,
    title: 'Toolbox Talks & Safety',
    text: 'Run safety briefings, JSA talks, and PTW conversations in professional English.',
  },
] as const;

const ENTERPRISE_BENEFITS = [
  {
    icon: Users,
    title: 'Role-based privacy',
    text: 'Managers see readiness trends while individual practice stays private.',
  },
  {
    icon: BarChart3,
    title: 'Readiness analytics',
    text: 'Find communication risks before important project milestones.',
  },
  {
    icon: Settings2,
    title: 'Custom paths',
    text: 'Tailor learning by discipline, role, and project communication needs.',
  },
] as const;

const BusinessPage = () => {
  return (
    <main className="min-h-screen bg-background pb-20 pt-20 text-foreground">
      <PageMetadata
        title="EngVox for Teams"
        description="AI-supported technical English training for engineering teams."
      />
      <Navbar />
      <section className="relative mx-auto max-w-7xl px-6 pb-10 md:px-12">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> EngVox Teams · v{PRODUCT_VERSION}
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Engineering English readiness for{' '}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                global teams
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-copy">
              Give site teams, MEP engineers, QA/QC inspectors, and BIM managers practical English
              training for real project communication.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={AUTH_SIGN_UP_URL}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover active:scale-95 cursor-pointer"
              >
                Start team workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={async () => {
                  const { openMailto } = await import('@/shared/utils/capacitor');
                  await openMailto('sales@engvox.com', 'EngVox Enterprise Inquiry', '');
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-surface px-5 py-2.5 text-sm font-bold text-foreground shadow-sm transition hover:bg-surface-hover active:scale-95 cursor-pointer"
              >
                <Mail className="h-4 w-4 text-primary" /> Contact sales
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-copy">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Privacy-first
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Zero AI model training
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Team analytics
              </span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-border-soft pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Team readiness dashboard</h3>
                  <p className="text-xs text-muted-copy">Live preview</p>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  DEMO
                </span>
              </div>
              {['Writing & RFI readiness', 'Speaking confidence', 'Technical terminology'].map(
                (label, i) => (
                  <div key={label} className="mb-4">
                    <div className="mb-1.5 flex justify-between text-xs font-semibold">
                      <span>{label}</span>
                      <span className="text-primary">{82 + i * 5}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-hover">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
                        style={{ width: `${82 + i * 5}%` }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="relative mx-auto max-w-7xl border-t border-border-soft px-6 py-10 md:px-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Built for real project conversations
          </h2>
          <p className="mt-1 text-sm text-muted-copy">
            Not generic English. Practical communication for engineering work.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESS_CASES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-copy">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="relative mx-auto max-w-7xl px-6 py-10 md:px-12">
        <div className="grid gap-4 md:grid-cols-3">
          {ENTERPRISE_BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm"
              >
                <Icon className="mb-3 h-6 w-6 text-primary" />
                <h3 className="font-bold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-copy">{b.text}</p>
              </div>
            );
          })}
        </div>
      </section>
      <Footer className="fixed bottom-0 inset-x-0 z-40" />
    </main>
  );
};

export default BusinessPage;
