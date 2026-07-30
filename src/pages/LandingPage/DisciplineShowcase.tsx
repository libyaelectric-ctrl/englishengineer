import { useState } from 'react';
import { Zap, Building2, ShieldCheck, Code2, Briefcase, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedSection, SectionIntro } from './AnimatedComponents';

const DISCIPLINES = [
  { id: 'electrical', title: 'Mechanical & Electrical', icon: Zap, badge: 'HVAC, Piping & Electrical', description: 'Master technical English for HVAC commissioning, piping & pressure testing, switchgear, load calculations, and site safety talks.', scenarios: ['Substation Inspection & Lockout/Tagout (LOTO)', 'Single Line Diagram (SLD) Clarifications', 'NFPA & IEC Standards Presentation'], sampleTerm: 'Dielectric Breakdown Voltage' },
  { id: 'civil', title: 'Civil & Structural', icon: Building2, badge: 'Infrastructure & FIDIC', description: 'Communicate confidently regarding reinforced concrete core tests, structural calculations, foundation submittals, and FIDIC claims.', scenarios: ['Method Statement for Deep Excavation & Piling', 'FIDIC Sub-Clause 13.3 Variation Requests', 'Concrete Slump & Compression Test Non-Conformance'], sampleTerm: 'Characteristic Compressive Strength' },
  { id: 'qaqc', title: 'QA/QC & Inspection', icon: ShieldCheck, badge: 'Standards & ISO 9001', description: 'Draft authoritative Non-Conformance Reports (NCRs), Material Inspection Requests (MIRs), and site audit summaries.', scenarios: ['Site Quality Audit & NCR Resolution', 'Welding & NDT Inspection Protocols', 'Material Submittal Defect Defense'], sampleTerm: 'Remedial Action Disposition' },
  { id: 'software', title: 'Software & DevOps', icon: Code2, badge: 'Architecture & CI/CD', description: 'Conduct clear Pull Request code reviews, incident post-mortems, system architecture proposals, and agile sprint retros.', scenarios: ['PR Review & Refactoring Rationale', 'System Architecture Defense & ADRs', 'P0 Incident Post-Mortem Briefing'], sampleTerm: 'Idempotent Execution Guarantee' },
  { id: 'pm', title: 'Project Management', icon: Briefcase, badge: 'Client & Stakeholder', description: 'Lead high-stakes steering committee meetings, contractor negotiations, budget variance reports, and risk register reviews.', scenarios: ['Client Progress & Extension of Time (EOT) Meetings', 'Commercial Risk Mitigation Briefings', 'Subcontractor Procurement Negotiations'], sampleTerm: 'Critical Path Schedule Float' },
];

export function DisciplineShowcase() {
  const [activeTab, setActiveTab] = useState(DISCIPLINES[0].id);
  const active = DISCIPLINES.find(d => d.id === activeTab) || DISCIPLINES[0];
  return (
    <section id="disciplines" className="border-t border-border-soft bg-surface px-6 py-12 md:px-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="Disciplines" title={<>Built for every engineering field.</>} desc="Specialized vocabulary, scenarios, and assessments tailored to your discipline." align="center" />
        <AnimatedSection className="mb-8 flex flex-wrap justify-center gap-2">
          {DISCIPLINES.map(d => {
            const Icon = d.icon; const isActive = activeTab === d.id;
            return (
              <button key={d.id} onClick={() => setActiveTab(d.id)} className={`inline-flex items-center gap-2 rounded px-4 py-2.5 text-xs font-semibold transition-all ${isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background text-muted-copy border border-border-soft hover:text-foreground'}`}>
                <Icon className="h-4 w-4" />{d.title}
              </button>
            );
          })}
        </AnimatedSection>
        <AnimatedSection delay={100}>
          <div className="rounded border border-border-soft bg-background p-6 md:p-10 shadow-sm">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <span className="inline-block rounded bg-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary mb-4">{active.badge}</span>
                <h3 className="text-2xl font-bold text-foreground">{active.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-copy">{active.description}</p>
                <ul className="mt-6 space-y-3">
                  {active.scenarios.map(s => <li key={s} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="text-sm text-foreground">{s}</span></li>)}
                </ul>
                <div className="mt-6 rounded bg-surface border border-border-soft p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">Sample Term</span>
                  <p className="mt-1 text-sm font-semibold text-primary">{active.sampleTerm}</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-sm rounded bg-surface border border-border-soft p-8 text-center">
                  <active.icon className="mx-auto h-12 w-12 text-primary mb-4" />
                  <p className="text-sm font-medium text-muted-copy">Practice real scenarios from {active.title.toLowerCase()} projects</p>
                  <Link to="/signup" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Start practicing <ArrowUpRight className="h-3 w-3" /></Link>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
export default DisciplineShowcase;
