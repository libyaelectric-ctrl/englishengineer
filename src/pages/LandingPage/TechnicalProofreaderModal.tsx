import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  FileText,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

import { useState } from 'react';

import {
  ProofreadResult,
  analyzeTechnicalText,
} from '@/features/tools/technical-proofreader.engine';

interface TechnicalProofreaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_DRAFTS = [
  {
    title: 'FIDIC Weather Delay Email',
    text: 'Dear engineer, concrete pouring is delay because rain, please give extra time for us.',
  },
  {
    title: 'ASTM Concrete Slump Failure',
    text: 'Resident engineer, concrete is bad on Truck 4, please reply fast on how to fix.',
  },
];

export const TechnicalProofreaderModal = ({ isOpen, onClose }: TechnicalProofreaderModalProps) => {
  const [inputText, setInputText] = useState(SAMPLE_DRAFTS[0].text);
  const [analysisResult, setAnalysisResult] = useState<ProofreadResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeTechnicalText(inputText);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 800);
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult.improvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-3xl rounded-2xl border border-primary/40 bg-surface/95 p-6 shadow-2xl space-y-5 relative light-sweep-container overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-foreground">
              Technical Document & Site Correspondence Proofreader
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

        {/* Input & Preset Buttons */}
        <form onSubmit={handleAnalyze} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> Paste Draft Site Email / Report
            </label>
            <div className="flex gap-1.5">
              {SAMPLE_DRAFTS.map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => {
                    setInputText(sample.text);
                    setAnalysisResult(null);
                  }}
                  className="rounded-md bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
                >
                  Load {sample.title}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setAnalysisResult(null);
            }}
            placeholder="Paste your site email, RFI, or daily report here..."
            className="w-full rounded-xl border border-border-soft bg-background p-3 text-xs text-foreground font-medium focus:border-primary outline-none"
            required
          />

          <button
            type="submit"
            disabled={isAnalyzing || !inputText.trim()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-xs font-bold text-primary-foreground shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <span>Analyzing ASTM / FIDIC Terminology & Grammatical Precision...</span>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Analyze & Refine Technical Correspondence</span>
              </>
            )}
          </button>
        </form>

        {/* Real Analysis Output */}
        {analysisResult && (
          <div className="space-y-4 animate-in fade-in pt-2 border-t border-border-soft">
            {/* Score Indicators */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                    Formality Score
                  </span>
                  <div className="text-lg font-extrabold text-emerald-600 font-mono">
                    {analysisResult.formalityScore}%
                  </div>
                </div>
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                    Technical Precision Score
                  </span>
                  <div className="text-lg font-extrabold text-primary font-mono">
                    {analysisResult.technicalPrecisionScore}%
                  </div>
                </div>
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>

            {/* Detected Issues */}
            {analysisResult.issues.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-500" /> Detected Technical & Phrasing
                  Refinements ({analysisResult.issues.length})
                </span>
                <div className="space-y-2">
                  {analysisResult.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-rose-500 line-through font-bold">
                          {issue.originalText}
                        </span>
                        <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.2 text-[9px] font-bold text-amber-600 font-mono">
                          {issue.category} • {issue.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="font-mono text-emerald-600 font-bold">
                        ➔ {issue.suggestedText}
                      </div>
                      <p className="text-[10px] text-muted-copy">{issue.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improved Output Text Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Refined C1/C2 Technical
                  Version
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy Refined Text'}</span>
                </button>
              </div>

              <pre className="whitespace-pre-wrap font-mono text-xs text-foreground bg-background p-4 rounded-xl border border-emerald-500/30 leading-relaxed">
                {analysisResult.improvedText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
