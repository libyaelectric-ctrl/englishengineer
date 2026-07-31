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

const BUSINESS_CASES = [
  {
    icon: HardHat,
    title: 'Site Coordination & BIM Meetings',
    text: 'Prepare engineers to clarify sequence, BIM model clash detection, ownership, and structural constraints in international coordination meetings.',
  },
  {
    icon: ClipboardCheck,
    title: 'QA/QC Inspection & Audit Responses',
    text: 'Practice concise Non-Conformance Report (NCR) responses, core slump test evidence requests, and audit defenses.',
  },
  {
    icon: FileCheck2,
    title: 'FIDIC Contract & Submittal Writing',
    text: 'Standardize Sub-Clause 13.3 Variation notices, Extension of Time (EOT) claims, RFI drafts, and material approval requests.',
  },
  {
    icon: MessageSquareCode,
    title: 'Client Schematic Reviews & Defenses',
    text: 'Explain design revisions, risk mitigation strategies, and budget recovery actions with crisp technical precision.',
  },
  {
    icon: BarChart3,
    title: 'Project Reporting & Executive Briefings',
    text: 'Unify progress updates, delay root cause analyses, and C-level executive summaries across international project teams.',
  },
  {
    icon: Users,
    title: 'Toolbox Talks & Subcontractor Safety',
    text: 'Conduct ISO 45001 safety briefings, pre-work Job Safety Analyses (JSA), and Permit to Work (PTW) authorizations.',
  },
] as const;

const PREVIEW_METRICS = [
  { label: 'Active Engineers', value: '24' },
  { label: 'Overall Readiness', value: '78%' },
  { label: 'Risk Flags Pruned', value: '14' },
] as const;

const PREVIEW_SKILLS = [
  { label: 'Writing & RFI Readiness', value: 84 },
  { label: 'Speaking & Defense Confidence', value: 72 },
  { label: 'Technical Field Terminology', value: 91 },
] as const;

const ENTERPRISE_BENEFITS = [
  {
    icon: Users,
    title: 'Strict Role-Based Isolation',
    text: 'Team directors see aggregated readiness analytics. Individual engineer responses and mistake logs remain private.',
  },
  {
    icon: BarChart3,
    title: 'Manager Skill Readiness Summaries',
    text: 'Track team CEFR progression, identify communication risk areas before site milestones, and deploy targeted modules.',
  },
  {
    icon: Settings2,
    title: 'Custom Discipline & Role Paths',
    text: 'Tailored onboarding by discipline (Civil, Mechanical, Software, Electrical, etc.) and project role (Site Lead, QA/QC, BIM Manager).',
  },
] as const;

const BusinessPage = () => {
  return (
    <main className="bg-background min-h-screen pt-20 sm:pt-24 pb-16 text-foreground">
      <PageMetadata
        title="EngVox for Teams & Enterprises — Engineering Communication OS"
        description="Role-based technical English training, automated manager readiness analytics, and project workspace isolation across all 10 engineering disciplines."
      />

      {/* Hero Section */}
      <section className="px-6 md:px-12 pb-12 max-w-7xl mx-auto border-b border-border-soft">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-soft border border-border-soft px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" /> EngVox Enterprise & Teams
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Engineering English readiness for <span className="text-primary">global teams</span>
            </h1>

            <p className="text-xs sm:text-sm text-muted-copy leading-relaxed max-w-2xl">
              Equip your site teams, MEP engineers, QA/QC inspectors, and BIM managers with a
              role-specific communication operating system. Protect data privacy while gaining team
              readiness analytics.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow transition-all hover:bg-primary/95"
              >
                Explore Team Workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:sales@englishengineer.vercel.app?subject=EngVox%20Enterprise%20Inquiry"
                className="inline-flex items-center gap-2 rounded-lg bg-surface border border-border-soft px-5 py-2.5 text-xs font-bold text-foreground hover:bg-surface-hover transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" /> Contact Enterprise Sales
              </a>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-copy">
              <span className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> SOC-2 Type II Bounds
              </span>
              <span className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> ISO/IEC 27001 Security
              </span>
              <span className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Zero AI Model Training
              </span>
            </div>
          </div>

          {/* Team Dashboard Preview Card */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-xl border border-border-soft bg-surface p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-border-soft pb-3 mb-4">
                <div>
                  <h3 className="text-xs font-bold text-foreground">Team Readiness Dashboard</h3>
                  <p className="text-[10px] text-muted-copy">Live Team Analytics Demo</p>
                </div>
                <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wider">
                  ENTERPRISE DEMO
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {PREVIEW_METRICS.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg border border-border-soft bg-background p-2.5 text-center"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                      {m.label}
                    </p>
                    <p className="text-lg font-extrabold text-foreground mt-0.5">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {PREVIEW_SKILLS.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs font-medium text-foreground mb-1">
                      <span>{s.label}</span>
                      <span className="font-bold text-primary">{s.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-border-soft/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-1000"
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto border-b border-border-soft">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Use Cases
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Training connected directly to real project communication.
            </h2>
          </div>
          <p className="text-xs text-muted-copy max-w-xl leading-tight">
            Designed for site management, contract claims, BIM coordination, and technical audits.
          </p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESS_CASES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-lg border border-border-soft bg-surface p-4 shadow-sm hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-soft text-primary border border-border-soft shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-muted-copy">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Management & Privacy Section */}
      <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Management & Privacy
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Enterprise governance without exposing individual learner privacy.
            </h2>
          </div>
          <p className="text-xs text-muted-copy max-w-xl leading-tight">
            Role-based privacy boundaries ensure individual practice stays private while managers
            get actionable data.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {ENTERPRISE_BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm hover:border-primary/40 transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-soft text-primary border border-border-soft mb-3">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">{b.title}</h3>
                <p className="text-xs leading-relaxed text-muted-copy">{b.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Link Back to Home */}
      <section className="px-6 md:px-12 pt-8 pb-4 max-w-7xl mx-auto border-t border-border-soft">
        <div className="flex items-center justify-between text-xs text-muted-copy">
          <span>EngVox Engineering Operating System © 2026</span>
          <Link to="/" className="font-bold text-primary hover:underline flex items-center gap-1">
            <span>Back to Home</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default BusinessPage;
