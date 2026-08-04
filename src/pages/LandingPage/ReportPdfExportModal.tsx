import { CheckCircle2, Download, FileSpreadsheet, FileText, X } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { useLocalizationStore } from '@/features/localization';

interface ReportPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportPdfExportModal = ({ isOpen, onClose }: ReportPdfExportModalProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  const [exporting, setExporting] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = (format: 'pdf' | 'docx') => {
    setExporting(format);
    setTimeout(() => {
      setExporting(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Technical report export"
        className="w-full max-w-md rounded-2xl border border-primary/30 bg-surface/95 p-5 shadow-2xl space-y-4 relative light-sweep-container overflow-hidden focus:outline-none"
      >
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              {translate('landing.exportTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-copy hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-copy leading-relaxed">{translate('landing.exportDesc')}</p>

        {exporting ? (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>Exporting EngVox_Site_Report_2026.{exporting.toUpperCase()}...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 p-4 hover:bg-primary/20 transition cursor-pointer"
            >
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-xs font-bold text-foreground">
                {translate('landing.exportPdf')}
              </div>
              <div className="text-[9px] text-muted-copy">{translate('landing.exportPdfDesc')}</div>
            </button>

            <button
              type="button"
              onClick={() => handleExport('docx')}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 hover:bg-blue-500/20 transition cursor-pointer"
            >
              <FileSpreadsheet className="h-8 w-8 text-blue-500" />
              <div className="text-xs font-bold text-foreground">
                {translate('landing.exportDocx')}
              </div>
              <div className="text-[9px] text-muted-copy">
                {translate('landing.exportDocxDesc')}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
