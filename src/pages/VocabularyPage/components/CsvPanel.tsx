import { useRef, useState } from 'react';
import {
  Download,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import {
  VocabularyCsvService,
  type CsvWord,
  type ImportResult,
} from '@/features/vocabulary';

interface CsvPanelProps {
  words: CsvWord[];
  onImport?: (words: CsvWord[]) => void;
}

export function CsvPanel({ words, onImport }: CsvPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleExport = () => {
    VocabularyCsvService.downloadCsv(words);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = VocabularyCsvService.parseCsv(content);
      const result = VocabularyCsvService.validateImport(parsed);
      setImportResult(result);
      setShowResult(true);

      if (result.imported > 0 && onImport) {
        onImport(parsed.filter((w) => w.term && w.turkishMeaning));
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <SectionCard
      title="CSV Import / Export"
      subtitle="Manage your vocabulary lists"
      icon={FileText}
    >
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center gap-1.5 text-[10px]"
        >
          <Download className="h-3 w-3" />
          Export CSV ({words.length} words)
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-[10px]"
        >
          <Upload className="h-3 w-3" />
          Import CSV
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {showResult && importResult && (
        <div className="mt-3 rounded-[4px] border border-border-soft bg-surface p-3">
          <div className="flex items-center gap-2 mb-2">
            {importResult.errors.length === 0 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-xs font-bold text-foreground">
              Import Result
            </span>
          </div>
          <div className="space-y-1 text-[10px] text-muted-copy">
            <p>Total rows: {importResult.totalRows}</p>
            <p className="text-emerald-600 font-bold">
              Imported: {importResult.imported}
            </p>
            {importResult.skipped > 0 && (
              <p className="text-amber-600">Skipped: {importResult.skipped}</p>
            )}
          </div>
          {importResult.errors.length > 0 && (
            <div className="mt-2 space-y-1">
              {importResult.errors.slice(0, 5).map((err, i) => (
                <p key={i} className="text-[9px] text-rose-600">
                  {err}
                </p>
              ))}
              {importResult.errors.length > 5 && (
                <p className="text-[9px] text-muted-copy">
                  ...and {importResult.errors.length - 5} more errors
                </p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowResult(false)}
            className="mt-2 text-[9px] text-muted-copy underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </SectionCard>
  );
}
