import { CheckCircle2, Download, FileCheck2, X } from 'lucide-react';

import { useState } from 'react';

interface SecurityWhitepaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityWhitepaperModal = ({ isOpen, onClose }: SecurityWhitepaperModalProps) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-primary/30 bg-surface/95 p-5 shadow-2xl space-y-4 relative light-sweep-container overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              Corporate Security Whitepaper (PDF)
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

        <div className="space-y-2 text-xs text-muted-copy leading-relaxed">
          <p>
            Download our official 18-page Enterprise Data Protection & LLM Architecture Whitepaper
            for IT Procurement and Security Compliance Auditors.
          </p>
          <div className="rounded-[var(--radius-card)] border border-primary/20 bg-background/80 p-3 space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between text-foreground">
              <span>SOC-2 Type II Audit Report</span>
              <span className="text-emerald-500 font-bold">VERIFIED ✓</span>
            </div>
            <div className="flex justify-between text-foreground">
              <span>GDPR / EU Data Residency</span>
              <span className="text-emerald-500 font-bold">FRANKFURT AWS</span>
            </div>
            <div className="flex justify-between text-foreground">
              <span>LLM Zero-Training Policy</span>
              <span className="text-emerald-500 font-bold">ENFORCED</span>
            </div>
          </div>
        </div>

        {downloaded ? (
          <div className="rounded-[var(--radius-card)] bg-emerald-500/15 border border-emerald-500/30 p-3 text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Downloading EngVox_Security_Whitepaper_2026.pdf...</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleDownload}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-card)] bg-primary hover:bg-primary-hover text-xs font-bold text-primary-foreground shadow-md transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download Official Security Whitepaper (PDF)</span>
          </button>
        )}
      </div>
    </div>
  );
};
