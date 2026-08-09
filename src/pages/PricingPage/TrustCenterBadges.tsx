import { Building2, FileCheck2, Lock, ShieldCheck, UserCheck } from 'lucide-react';

interface TrustCenterBadgesProps {
  onOpenSecurityWhitepaper: () => void;
  onOpenSlaMatrix: () => void;
}

export const TrustCenterBadges = ({
  onOpenSecurityWhitepaper,
  onOpenSlaMatrix,
}: TrustCenterBadgesProps) => {
  return (
    <section className="py-8 border-t border-border-soft bg-surface/40">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              Enterprise Trust, Legal & Security Compliance
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSecurityWhitepaper}
              className="inline-flex items-center gap-1 rounded-md bg-soft border border-border-soft px-3 py-1 text-xs font-bold text-primary hover:border-primary/40 transition cursor-pointer"
            >
              <FileCheck2 className="h-3.5 w-3.5 text-primary" /> Security Whitepaper (PDF)
            </button>
            <button
              type="button"
              onClick={onOpenSlaMatrix}
              className="inline-flex items-center gap-1 rounded-md bg-soft border border-border-soft px-3 py-1 text-xs font-bold text-emerald-600 hover:border-emerald-500/40 transition cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 99.9% SLA Matrix
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-[var(--radius-card)] border border-primary/20 bg-background/80 p-3.5 flex items-center gap-3">
            <Lock className="h-6 w-6 text-primary shrink-0" />
            <div>
              <div className="text-xs font-bold text-foreground">SOC-2 Type II Certified</div>
              <div className="text-[10px] text-muted-copy">Annual third-party audit</div>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-primary/20 bg-background/80 p-3.5 flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary shrink-0" />
            <div>
              <div className="text-xs font-bold text-foreground">FIDIC & ASTM Aligned</div>
              <div className="text-[10px] text-muted-copy">Official contract termsets</div>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-primary/20 bg-background/80 p-3.5 flex items-center gap-3">
            <FileCheck2 className="h-6 w-6 text-emerald-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-foreground">GDPR & ISO 27001</div>
              <div className="text-[10px] text-muted-copy">Zero data retention LLM</div>
            </div>
          </div>

          {/* ITEM 40: Dedicated CSM Badge */}
          <div className="rounded-[var(--radius-card)] border border-primary/20 bg-background/80 p-3.5 flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-amber-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-foreground">Dedicated CSM & Training</div>
              <div className="text-[10px] text-muted-copy">Zoom/On-site workshops</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
