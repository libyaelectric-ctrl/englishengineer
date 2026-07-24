import React, { useState } from 'react';
import {
  FileCode,
  UploadCloud,
  FileCheck2,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

interface ExtractedTerm {
  word: string;
  definition: string;
  category: string;
  specClause: string;
}

export const PdfSpecExtractor: React.FC = () => {
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTerms, setExtractedTerms] = useState<ExtractedTerm[]>([]);
  const [copied, setCopied] = useState(false);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setExtractedTerms([]);

    setTimeout(() => {
      setExtractedTerms([
        {
          word: 'Allowable Bearing Capacity',
          definition:
            'The maximum pressure that soil can support without undergoing shear failure or excessive settlement.',
          category: 'Geotechnical Engineering',
          specClause: 'Section 02200 - Earthwork (Clause 3.2)',
        },
        {
          word: 'Coefficient of Thermal Expansion',
          definition:
            'Fractional change in size per degree change in temperature for structural steel joints.',
          category: 'Structural Engineering',
          specClause: 'Section 05120 - Structural Steel (Clause 4.1)',
        },
        {
          word: 'LOTO (Lockout/Tagout)',
          definition:
            'Safety procedure to ensure dangerous electrical equipment is properly shut off before maintenance.',
          category: 'HSE & Electrical Safety',
          specClause: 'Section 16010 - Electrical General (Clause 1.8)',
        },
        {
          word: 'BACnet Protocol Integration',
          definition:
            'Data communication protocol for Building Automation and Control networks (BMS).',
          category: 'MEP & Automation',
          specClause: 'Section 15950 - Building Automation (Clause 2.4)',
        },
      ]);
      setIsProcessing(false);
    }, 1200);
  };

  const handleCopyFlashcards = () => {
    const text = extractedTerms
      .map(
        (t) =>
          `• ${t.word} (${t.category}): ${t.definition} [Ref: ${t.specClause}]`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border-soft pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#0047bb]/10 text-[#0047bb]">
            <FileCode className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-foreground">
              21. 📄 PDF Specification Flashcard Extractor
            </h3>
            <p className="text-xs text-muted-copy">
              Upload BS/ISO/ASTM specification PDFs to automatically extract
              technical vocabulary and generate SRS study flashcards.
            </p>
          </div>
        </div>
      </div>

      {/* PDF Upload Dropzone */}
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-soft rounded-2xl bg-background/50 hover:bg-surface-hover transition-colors cursor-pointer text-center space-y-3 relative">
        <input
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleSimulatedUpload}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className="p-3 rounded-full bg-[#0047bb]/10 text-[#0047bb]">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-extrabold text-foreground">
            {fileName
              ? `Selected File: ${fileName}`
              : 'Click or Drag Specification PDF here'}
          </p>
          <p className="text-[11px] text-muted-copy mt-0.5">
            Supports PDF, DOCX, TXT (BS EN, ISO 9001, ASTM specs up to 50MB)
          </p>
        </div>
      </div>

      {isProcessing && (
        <div className="py-6 text-center space-y-2 animate-pulse">
          <Sparkles className="mx-auto h-6 w-6 text-[#0047bb] animate-spin" />
          <p className="text-xs font-bold text-foreground">
            Analyzing PDF specification & extracting technical vocabulary...
          </p>
        </div>
      )}

      {/* Extracted Terms Output */}
      {extractedTerms.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4" />
              Extracted {extractedTerms.length} Technical Terms & SRS Cards
            </span>
            <button
              type="button"
              onClick={handleCopyFlashcards}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied Decks!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted-copy" />
                  <span>Copy SRS Flashcards</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {extractedTerms.map((term, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border-soft bg-background p-4 space-y-2 hover:border-[#0047bb]/40 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-foreground">
                    {term.word}
                  </h4>
                  <span className="rounded-full bg-[#0047bb]/10 px-2 py-0.5 text-[9px] font-bold text-[#0047bb]">
                    {term.category}
                  </span>
                </div>
                <p className="text-xs text-muted-copy leading-relaxed">
                  {term.definition}
                </p>
                <p className="text-[10px] font-mono font-semibold text-primary/80 pt-1 border-t border-border-soft/60">
                  {term.specClause}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfSpecExtractor;
