import { ArrowRight, Check, Cpu, Globe, Layers, ShieldCheck, Sparkles, X } from 'lucide-react';

import { useState } from 'react';

interface EnterpriseQuoteCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REGIONS = [
  { id: 'eu', name: 'Frankfurt, EU (GDPR Compliant)', flag: '🇪🇺' },
  { id: 'us', name: 'N. Virginia, US (SOC-2 Type II)', flag: '🇺🇸' },
  { id: 'uae', name: 'Dubai, UAE (ADGM & DIFC Certified)', flag: '🇦🇪' },
  { id: 'ksa', name: 'Riyadh, KSA (Saudi Data Authority)', flag: '🇸🇦' },
];

const SeatCalculator = ({
  seats,
  setSeats,
}: {
  seats: number;
  setSeats: (value: number) => void;
}) => (
  <div className="space-y-2.5 rounded-[var(--radius-card)] border border-primary/20 bg-background/80 p-4">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
        <Layers className="h-4 w-4 text-primary" /> Enterprise Engineering Seats
      </span>
      <span className="text-base font-extrabold text-primary font-mono">{seats} Seats</span>
    </div>
    <input
      type="range"
      min={10}
      max={200}
      step={5}
      value={seats}
      onChange={(e) => setSeats(Number(e.target.value))}
      className="w-full h-2 rounded-[var(--radius-card)] accent-primary cursor-pointer"
    />
    <div className="flex justify-between text-[10px] font-bold font-mono">
      <span className={seats >= 10 ? 'text-emerald-500' : 'text-muted-copy'}>10+ Seats (-15%)</span>
      <span className={seats >= 25 ? 'text-emerald-500 font-extrabold' : 'text-muted-copy'}>
        25+ Seats (-25%)
      </span>
      <span className={seats >= 50 ? 'text-primary font-extrabold' : 'text-muted-copy'}>
        50+ Seats (-35% Mega tier)
      </span>
    </div>
  </div>
);

const RegionSelector = ({
  selectedRegion,
  setSelectedRegion,
}: {
  selectedRegion: string;
  setSelectedRegion: (value: string) => void;
}) => (
  <div className="space-y-2">
    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
      <Globe className="h-4 w-4 text-primary" /> Data Residency & LLM Processing Region
    </p>
    <div className="grid grid-cols-2 gap-2">
      {REGIONS.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => setSelectedRegion(r.id)}
          className={`flex items-center gap-2 rounded-[var(--radius-card)] border p-2.5 text-left text-xs transition cursor-pointer ${
            selectedRegion === r.id
              ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
              : 'border-border-soft bg-background hover:border-primary/40'
          }`}
        >
          <span className="text-base">{r.flag}</span>
          <span className="truncate">{r.name}</span>
        </button>
      ))}
    </div>
  </div>
);

const ServiceOptions = ({
  dedicatedServer,
  setDedicatedServer,
  slaTier,
  setSlaTier,
}: {
  dedicatedServer: boolean;
  setDedicatedServer: (value: boolean) => void;
  slaTier: '99.9' | '99.99';
  setSlaTier: (value: '99.9' | '99.99') => void;
}) => (
  <div className="grid grid-cols-2 gap-3">
    <div
      role="button"
      tabIndex={0}
      onClick={() => setDedicatedServer(!dedicatedServer)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.currentTarget.click();
        }
      }}
      className={`rounded-[var(--radius-card)] border p-3 cursor-pointer transition ${
        dedicatedServer
          ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
          : 'border-border-soft bg-background'
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-bold">
        <Cpu className="h-4 w-4 text-primary" /> Dedicated Private LLM Proxy
      </div>
      <p className="text-[10px] text-muted-copy font-normal mt-1 leading-tight">
        Isolated VPC & zero data retention guarantee (+ $499/mo).
      </p>
    </div>
    <div
      role="button"
      tabIndex={0}
      onClick={() => setSlaTier(slaTier === '99.99' ? '99.9' : '99.99')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.currentTarget.click();
        }
      }}
      className={`rounded-[var(--radius-card)] border p-3 cursor-pointer transition ${
        slaTier === '99.99'
          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 font-bold shadow-sm'
          : 'border-border-soft bg-background'
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-bold">
        <ShieldCheck className="h-4 w-4 text-emerald-500" /> 99.99% Uptime SLA Tier
      </div>
      <p className="text-[10px] text-muted-copy font-normal mt-1 leading-tight">
        15-min emergency response & dedicated Account Manager (+ $199/mo).
      </p>
    </div>
  </div>
);

export const EnterpriseQuoteCalculatorModal = ({
  isOpen,
  onClose,
}: EnterpriseQuoteCalculatorModalProps) => {
  const [seats, setSeats] = useState(25);
  const [selectedRegion, setSelectedRegion] = useState('eu');
  const [dedicatedServer, setDedicatedServer] = useState(true);
  const [slaTier, setSlaTier] = useState<'99.9' | '99.99'>('99.99');
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [companyEmail, setCompanyEmail] = useState('');

  if (!isOpen) return null;

  const baseRatePerSeat = 35;
  let discountRate = 0;
  if (seats >= 50) discountRate = 0.35;
  else if (seats >= 25) discountRate = 0.25;
  else if (seats >= 10) discountRate = 0.15;

  const subtotalSeats = seats * baseRatePerSeat * (1 - discountRate);
  const serverCost = dedicatedServer ? 499 : 0;
  const slaCost = slaTier === '99.99' ? 199 : 0;
  const estimatedMonthlyTotal = Math.round(subtotalSeats + serverCost + slaCost);

  const handleSubmitRfq = (e: React.FormEvent) => {
    e.preventDefault();
    setRfqSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-[var(--radius-card)] border border-primary/40 bg-surface/95 p-6 shadow-2xl space-y-6 relative light-sweep-container overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-foreground">
              Custom Enterprise Quote & Seat Calculator
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

        {rfqSubmitted ? (
          <div className="text-center py-8 space-y-4 animate-in fade-in">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <Check className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-foreground">Enterprise RFQ Received!</h4>
              <p className="text-xs text-muted-copy max-w-md mx-auto">
                Our Lead Enterprise Account Manager has received your proposal for{' '}
                <span className="font-bold text-primary">{seats} seats</span> in{' '}
                <span className="font-bold text-foreground">
                  {REGIONS.find((r) => r.id === selectedRegion)?.name}
                </span>
                . A formal PDF quote will be emailed to{' '}
                <span className="font-mono text-emerald-500 font-bold">{companyEmail}</span> within
                1 hour.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-[var(--radius-card)] bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover transition cursor-pointer"
            >
              Done & Return to Pricing
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitRfq} className="space-y-5">
            <SeatCalculator seats={seats} setSeats={setSeats} />
            <RegionSelector selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
            <ServiceOptions
              dedicatedServer={dedicatedServer}
              setDedicatedServer={setDedicatedServer}
              slaTier={slaTier}
              setSlaTier={setSlaTier}
            />

            <div className="rounded-[var(--radius-card)] border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                  Estimated Enterprise Total
                </span>
                <div className="text-xl font-extrabold text-emerald-600 font-mono">
                  ${estimatedMonthlyTotal.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-muted-copy">/ month</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-600 font-mono">
                  {Math.round(discountRate * 100)}% Volume Savings Included
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="company-email" className="text-xs font-bold text-foreground block">
                Corporate Procurement Email
              </label>
              <div className="flex gap-2">
                <input
                  id="company-email"
                  required
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="flex-1 rounded-[var(--radius-card)] border border-border-soft bg-background px-3 py-2 text-xs text-foreground font-bold focus:border-primary outline-none"
                  placeholder="procurement@company.com"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-card)] bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-hover transition cursor-pointer shadow-md shrink-0"
                >
                  <span>Request PDF Proposal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
