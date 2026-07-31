import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Code2,
  Cog,
  Compass,
  Cpu,
  Factory,
  FlaskConical,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react';

import { useState } from 'react';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { discipline: string; role: string; cefrTarget: string }) => void;
}

const DISCIPLINES = [
  { id: 'civil', name: 'Civil Engineering', icon: Building2 },
  { id: 'mechanical', name: 'Mechanical Engineering', icon: Cog },
  { id: 'electrical', name: 'Electrical Engineering', icon: Zap },
  { id: 'software', name: 'Software / IT', icon: Code2 },
  { id: 'architecture', name: 'Architecture & BIM', icon: Compass },
  { id: 'hse', name: 'HSE & Safety', icon: ShieldAlert },
  { id: 'industrial', name: 'Industrial & Lean', icon: Factory },
  { id: 'electronics', name: 'Electronics & Embedded', icon: Cpu },
  { id: 'chemical', name: 'Chemical Process', icon: FlaskConical },
  { id: 'robotics', name: 'Mechatronics & Robotics', icon: Bot },
];

const ROLES = [
  {
    id: 'site_engineer',
    title: 'Site Engineer',
    desc: 'Daily site operations & contractor management',
  },
  {
    id: 'lead_auditor',
    title: 'Lead QA/QC Auditor',
    desc: 'ISO/ASTM spec compliance & inspections',
  },
  {
    id: 'project_director',
    title: 'Project Director',
    desc: 'FIDIC claims, EOT & executive presentations',
  },
  {
    id: 'procurement',
    title: 'Procurement Specialist',
    desc: 'Vendor tenders & material submittals',
  },
];

const CEFR_TARGETS = [
  { level: 'B2 Professional', desc: 'Fluent site meetings, daily email correspondence & RFIs' },
  { level: 'C1 Technical', desc: 'High-precision ASTM specs, technical reports & oral defense' },
  {
    level: 'C2 Executive',
    desc: 'FIDIC dispute adjudication, legal claims & C-suite presentations',
  },
];

export const OnboardingWizardModal = ({
  isOpen,
  onClose,
  onComplete,
}: OnboardingWizardModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDiscipline, setSelectedDiscipline] = useState('Civil Engineering');
  const [selectedRole, setSelectedRole] = useState('site_engineer');
  const [selectedCefr, setSelectedCefr] = useState('C1 Technical');

  if (!isOpen) return null;

  const handleFinish = () => {
    onComplete({
      discipline: selectedDiscipline,
      role: selectedRole,
      cefrTarget: selectedCefr,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-primary/30 bg-surface/95 p-6 shadow-2xl space-y-6 relative light-sweep-container overflow-hidden">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold font-mono">
            <span className="text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" /> Step {step} of 3:
              Onboarding Setup
            </span>
            <span className="text-muted-copy">
              {step === 1 ? 'Discipline & Role' : step === 2 ? 'CEFR Goal' : 'Finalize Profile'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-border-soft overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Discipline & Role */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-foreground">Select Primary Discipline</h3>
              <p className="text-xs text-muted-copy">
                This pre-configures your ASTM, ISO, and Eurocode technical vocabulary.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {DISCIPLINES.map((d) => {
                const Icon = d.icon;
                const isSel = selectedDiscipline === d.name;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDiscipline(d.name)}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition cursor-pointer ${
                      isSel
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border-soft bg-background hover:border-primary/40'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{d.name}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                Your Role (RBAC)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`rounded-lg border p-2.5 text-left text-xs transition cursor-pointer ${
                      selectedRole === r.id
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border-soft bg-background hover:border-primary/40'
                    }`}
                  >
                    <div className="font-bold">{r.title}</div>
                    <div className="text-[9px] text-muted-copy leading-tight">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: CEFR Target */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-foreground">Target CEFR Benchmark Goal</h3>
              <p className="text-xs text-muted-copy">
                Choose your target English proficiency for site defenses and executive meetings.
              </p>
            </div>
            <div className="space-y-2.5">
              {CEFR_TARGETS.map((t) => (
                <button
                  key={t.level}
                  type="button"
                  onClick={() => setSelectedCefr(t.level)}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer ${
                    selectedCefr === t.level
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-md'
                      : 'border-border-soft bg-background hover:border-primary/40'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-foreground">{t.level}</div>
                    <div className="text-xs text-muted-copy font-normal">{t.desc}</div>
                  </div>
                  {selectedCefr === t.level && (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Summary & Launch */}
        {step === 3 && (
          <div className="space-y-4 text-center py-2 animate-in fade-in">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <UserCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Your Profile is Ready!</h3>
              <p className="text-xs text-muted-copy max-w-sm mx-auto">
                We have customized your AI Coach curriculum, ASTM/FIDIC termsets, and CEFR roadmap.
              </p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-background/80 p-3 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-copy">Discipline:</span>
                <span className="font-bold text-primary">{selectedDiscipline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-copy">Role Access:</span>
                <span className="font-bold text-foreground capitalize">
                  {selectedRole.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-copy">CEFR Target:</span>
                <span className="font-bold text-emerald-500">{selectedCefr}</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border-soft">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="text-xs font-bold text-muted-copy hover:text-foreground cursor-pointer"
            >
              ← Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-muted-copy hover:text-foreground cursor-pointer"
            >
              Skip for now
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md cursor-pointer"
            >
              <span>Launch Workspace</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
