import { Check, Clock, Headphones, ShieldCheck, X } from 'lucide-react';

interface SlaGuaranteeMatrixProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLA_TIERS = [
  {
    tier: 'Standard SLA',
    uptime: '99.5% Uptime',
    response: '24-hour Email Support',
    csm: 'Community Support',
    dedicatedServer: 'Shared Cloud Cluster',
  },
  {
    tier: 'Pro / Project SLA',
    uptime: '99.9% Guaranteed Uptime',
    response: '4-hour Priority Queue',
    csm: 'Assigned Support Specialist',
    dedicatedServer: 'Isolated Proxy Routing',
  },
  {
    tier: 'Exec / Private SLA',
    uptime: '99.99% Mission Critical Uptime',
    response: '15-min Emergency Hotline',
    csm: 'Dedicated Account Executive & Trainer',
    dedicatedServer: 'Dedicated Private VPC Instance',
  },
];

export const SlaGuaranteeMatrix = ({ isOpen, onClose }: SlaGuaranteeMatrixProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-primary/30 bg-surface/95 p-6 shadow-2xl space-y-5 relative light-sweep-container overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-foreground">
              Service Level Agreement (SLA) & Uptime Matrix
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-copy hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SLA_TIERS.map((t, i) => (
            <div
              key={t.tier}
              className={`rounded-xl border p-4 space-y-3 ${
                i === 2
                  ? 'border-emerald-500/40 bg-emerald-500/10 shadow-lg'
                  : 'border-border-soft bg-background/80'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
                  Tier 0{i + 1}
                </span>
                <h4 className="text-sm font-bold text-foreground">{t.tier}</h4>
              </div>

              <div className="space-y-2 text-xs font-medium">
                <div className="flex items-start gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t.uptime}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{t.response}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Headphones className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{t.csm}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover transition cursor-pointer"
          >
            Close SLA Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
