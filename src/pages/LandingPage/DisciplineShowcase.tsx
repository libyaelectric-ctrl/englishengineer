import { useState } from 'react';
import {
  Zap,
  Building2,
  ShieldCheck,
  Code2,
  Briefcase,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedSection, SectionIntro } from './AnimatedComponents';

const DISCIPLINES = [
  {
    id: 'electrical',
    title: 'MEP & Electrical',
    icon: Zap,
    badge: 'High Voltage & Substation',
    description:
      'Master technical English for HV/LV switchgear commissioning, transformer testing, load calculations, and site safety talks.',
    scenarios: [
      'Substation Inspection & Lockout/Tagout (LOTO)',
      'Single Line Diagram (SLD) Clarifications',
      'NFPA & IEC Standards Presentation',
    ],
    sampleTerm: 'Dielectric Breakdown Voltage',
  },
  {
    id: 'civil',
    title: 'Civil & Structural',
    icon: Building2,
    badge: 'Infrastructure & FIDIC',
    description:
      'Communicate confidently regarding reinforced concrete core tests, structural calculations, foundation submittals, and FIDIC claims.',
    scenarios: [
      'Method Statement for Deep Excavation & Piling',
      'FIDIC Sub-Clause 13.3 Variation Requests',
      'Concrete Slump & Compression Test Non-Conformance',
    ],
    sampleTerm: 'Characteristic Compressive Strength',
  },
  {
    id: 'qaqc',
    title: 'QA/QC & Inspection',
    icon: ShieldCheck,
    badge: 'Standards & ISO 9001',
    description:
      'Draft authoritative Non-Conformance Reports (NCRs), Material Inspection Requests (MIRs), and site audit summaries.',
    scenarios: [
      'Site Quality Audit & NCR Resolution',
      'Welding & NDT Inspection Protocols',
      'Material Submittal Defect Defense',
    ],
    sampleTerm: 'Remedial Action Disposition',
  },
  {
    id: 'software',
    title: 'Software & DevOps',
    icon: Code2,
    badge: 'Architecture & CI/CD',
    description:
      'Conduct clear Pull Request code reviews, incident post-mortems, system architecture proposals, and agile sprint retros.',
    scenarios: [
      'PR Review & Refactoring Rationale',
      'System Architecture Defense & ADRs',
      'P0 Incident Post-Mortem Briefing',
    ],
    sampleTerm: 'Idempotent Execution Guarantee',
  },
  {
    id: 'pm',
    title: 'Project Management',
    icon: Briefcase,
    badge: 'Client & Stakeholder',
    description:
      'Lead high-stakes steering committee meetings, contractor negotiations, budget variance reports, and risk register reviews.',
    scenarios: [
      'Client Progress & Extension of Time (EOT) Meetings',
      'Commercial Risk Mitigation Briefings',
      'Subcontractor Procurement Negotiations',
    ],
    sampleTerm: 'Critical Path Schedule Float',
  },
];

export function DisciplineShowcase() {
  const [activeTab, setActiveTab] = useState(DISCIPLINES[0].id);

  const activeDiscipline =
    DISCIPLINES.find((d) => d.id === activeTab) || DISCIPLINES[0];

  return (
    <section className="border-t border-border-soft bg-background/50 px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Specialized Tracks"
          title={<>Tuned specifically for your engineering domain.</>}
          desc="EngVox does not teach generic English. Every exercise, audio scenario, and vocabulary item is calibrated to your specific discipline."
          align="center"
        />

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {DISCIPLINES.map((d) => {
            const Icon = d.icon;
            const isActive = d.id === activeTab;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveTab(d.id)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground shadow-md'
                    : 'border-border-soft bg-surface text-muted-copy hover:border-border-hover hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{d.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Discipline Active Card */}
        <AnimatedSection className="rounded-2xl border border-border-soft bg-surface p-6 md:p-8 shadow-xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                  {activeDiscipline.badge}
                </span>
                <span className="text-xs text-muted-copy font-semibold">
                  Sample Jargon:{' '}
                  <strong className="text-foreground">
                    {activeDiscipline.sampleTerm}
                  </strong>
                </span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {activeDiscipline.title} Communication Track
              </h3>

              <p className="text-sm leading-relaxed text-muted-copy font-medium">
                {activeDiscipline.description}
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                  Featured Real-World Site Scenarios:
                </h4>
                <ul className="space-y-2.5">
                  {activeDiscipline.scenarios.map((scenario) => (
                    <li
                      key={scenario}
                      className="flex items-start gap-2 text-xs font-medium text-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{scenario}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-border-soft bg-background p-6 space-y-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border-soft bg-surface text-primary shadow-inner">
                <activeDiscipline.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Ready to test your {activeDiscipline.title} level?
                </h4>
                <p className="mt-1 text-xs text-muted-copy">
                  3-minute diagnostic assessment calibrated for CEFR A1 - C2.
                </p>
              </div>
              <Link
                to="/placement"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md transition hover:bg-primary-hover cursor-pointer"
              >
                <span>Take Diagnostic Test</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
