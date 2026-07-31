import { CheckCircle2, Download, FileCheck, Shield, Sparkles, X } from 'lucide-react';

import { useState } from 'react';

interface DpaContractGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DpaContractGeneratorModal = ({ isOpen, onClose }: DpaContractGeneratorModalProps) => {
  const [contractType, setContractType] = useState<'dpa' | 'msa'>('dpa');
  const [generated, setGenerated] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setGenerated(true);
    setTimeout(() => {
      setGenerated(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-primary/30 bg-surface/95 p-5 shadow-2xl space-y-4 relative light-sweep-container overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              Instant Legal Agreement Generator (DPA & MSA)
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

        <p className="text-xs text-muted-copy leading-relaxed">
          Generate an instantly pre-signed Data Processing Addendum (DPA) or Master Services
          Agreement (MSA) for corporate legal review.
        </p>

        {/* Contract Type Selection */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setContractType('dpa')}
            className={`rounded-xl border p-3 text-left transition cursor-pointer ${
              contractType === 'dpa'
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                : 'border-border-soft bg-background'
            }`}
          >
            <div className="text-xs font-bold">GDPR / KVKK DPA</div>
            <div className="text-[9px] text-muted-copy font-normal">Data Processing Addendum</div>
          </button>

          <button
            type="button"
            onClick={() => setContractType('msa')}
            className={`rounded-xl border p-3 text-left transition cursor-pointer ${
              contractType === 'msa'
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                : 'border-border-soft bg-background'
            }`}
          >
            <div className="text-xs font-bold">Master Services Agreement (MSA)</div>
            <div className="text-[9px] text-muted-copy font-normal">Enterprise SLA & Terms</div>
          </button>
        </div>

        <div className="rounded-xl border border-primary/20 bg-background/80 p-3 space-y-1 text-xs font-mono text-muted-copy">
          <div className="flex justify-between text-foreground font-bold">
            <span>Pre-Executed Counterparty:</span>
            <span className="text-primary">EngVox Technologies Inc.</span>
          </div>
          <div>Governing Law: Delaware, USA / EU GDPR Standards</div>
          <div>Execution Status: Digitally Executed & Ready</div>
        </div>

        {generated ? (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Generating & Downloading Executed {contractType.toUpperCase()} (PDF)...</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-xs font-bold text-primary-foreground shadow-md transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Generate & Download Executed {contractType.toUpperCase()} (PDF)</span>
          </button>
        )}
      </div>
    </div>
  );
};
