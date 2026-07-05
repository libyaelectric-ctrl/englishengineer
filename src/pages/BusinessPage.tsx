import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  Mail,
  ShieldCheck,
  Settings2,
  Users,
} from 'lucide-react';
import { PageMetadata } from '@/shared/components/PageMetadata';

const cases = [
  [
    'Site coordination',
    'Prepare engineers to clarify sequence, ownership and constraints in coordination meetings.',
  ],
  [
    'QA/QC inspection',
    'Practice concise comments, evidence requests and professional responses.',
  ],
  [
    'Commissioning',
    'Build confidence for testing updates, issues, witness points and handover.',
  ],
  [
    'Client meetings',
    'Explain progress, risk and recovery actions without losing technical precision.',
  ],
  [
    'Project reporting',
    'Standardize progress updates, delay explanations and management summaries.',
  ],
] as const;

const previewMetrics = [
  ['Learners', '24'],
  ['Progress', '64%'],
  ['At risk', '3'],
] as const;

const previewSkills = [
  ['Writing readiness', 68],
  ['Speaking confidence', 54],
  ['Site vocabulary', 73],
] as const;

const benefits = [
  {
    icon: Users,
    title: 'Clear role boundaries',
    text: 'Owners and managers see team summaries. Members see only their own learning workspace.',
  },
  {
    icon: BarChart3,
    title: 'Manager summaries',
    text: 'Aggregated readiness without exposing raw learner responses.',
  },
  {
    icon: Settings2,
    title: 'Custom onboarding',
    text: 'Role, industry, communication goals and independent skill paths.',
  },
] as const;

const BusinessPage = () => (
  <main className="bg-white">
    <PageMetadata
      title="EngineerOS for Teams"
      description="Role-based engineering communication training and manager summaries for contractors, consultants and project teams."
    />
    <section className="border-b border-border-soft bg-surface-hover py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="public-eyebrow">EngineerOS Team</p>
          <h1 className="mt-3 text-4xl font-medium leading-tight">
            Communication readiness for engineering organizations.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-copy">
            Give electrical, MEP, commissioning, QA/QC and project teams a
            role-specific learning system with manager-level summaries.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/signup" className="public-primary-action">
              Explore Team locally{' '}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              disabled
              title="Sales contact channel is not configured"
              aria-describedby="sales-status"
              className="public-secondary-action disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Mail className="h-4 w-4" aria-hidden="true" /> Contact sales
            </button>
          </div>
          <div
            id="sales-status"
            className="mt-5 flex max-w-xl items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs leading-5 text-warning"
          >
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>
              Team access and the sales channel are still in preview. No email,
              purchase or customer commitment is created here.
            </span>
          </div>
        </div>

        <div className="public-card p-6">
          <div className="flex items-center justify-between border-b border-border-soft pb-4">
            <div>
              <p className="text-sm font-medium">Team overview</p>
              <p className="text-xs text-muted-copy">
                Illustrative product preview
              </p>
            </div>
            <span className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-[10px] font-medium text-warning">
              DEMO DATA
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {previewMetrics.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-border-soft bg-surface-hover p-3"
              >
                <p className="text-[10px] text-muted-copy">{label}</p>
                <p className="mt-1 text-xl font-medium">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {previewSkills.map(([label, value]) => (
              <div key={label}>
                <div className="flex justify-between text-xs">
                  <span>{label}</span>
                  <strong>{value}%</strong>
                </div>
                <div className="mt-1 h-2 rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="border-b border-border-soft py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="public-eyebrow">Project communication use cases</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-medium">
          Training connected to project communication.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map(([title, text]) => (
            <article key={title} className="public-card p-5">
              <ClipboardCheck
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-copy">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-surface-hover py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="public-eyebrow">Trust and management boundaries</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-medium">
          Useful team visibility without exposing private practice.
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article key={title} className="public-card p-6">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-copy">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default BusinessPage;
