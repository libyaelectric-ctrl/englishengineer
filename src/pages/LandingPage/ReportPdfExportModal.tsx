import { CheckCircle2, Download, FileSpreadsheet, FileText, X } from 'lucide-react';

import { useState } from 'react';

interface ReportPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportPdfExportModal = ({ isOpen, onClose }: ReportPdfExportModalProps) => {
  const [exporting, setExporting] = useState<string | null>(null);

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
      <div className="w-full max-w-md rounded-2xl border border-primary/30 bg-surface/95 p-5 shadow-2xl space-y-4 relative light-sweep-container overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              Technical Email & Report Exporter
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
          Export AI-refined site correspondence, FIDIC Extension of Time (EOT) claims, and technical
          audit reports directly to PDF or Word DOCX formats.
        </p>

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
              <div className="text-xs font-bold text-foreground">Export as PDF</div>
              <div className="text-[9px] text-muted-copy">Official Printable Document</div>
            </button>

            <button
              type="button"
              onClick={() => handleExport('docx')}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 hover:bg-blue-500/20 transition cursor-pointer"
            >
              <FileSpreadsheet className="h-8 w-8 text-blue-500" />
              <div className="text-xs font-bold text-foreground">Export as DOCX</div>
              <div className="text-[9px] text-muted-copy">Editable Microsoft Word</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
