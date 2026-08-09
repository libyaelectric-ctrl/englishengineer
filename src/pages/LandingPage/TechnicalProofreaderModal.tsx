import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  FileText,
  Lock,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { logger } from '@/shared/logger';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';
import {
  ProofreadResult,
  analyzeTechnicalText,
} from '@/features/tools/technical-proofreader.engine';

interface TechnicalProofreaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_DRAFTS: Array<{ loadKey: TranslationKey; text: string }> = [
  {
    loadKey: 'landing.proofreaderLoad1',
    text: 'Dear engineer, concrete pouring is delay because rain, please give extra time for us.',
  },
  {
    loadKey: 'landing.proofreaderLoad2',
    text: 'Resident engineer, concrete is bad on Truck 4, please reply fast on how to fix.',
  },
];

const LIMIT_KEY = 'engvox_proofreader_guest_usage';

export const TechnicalProofreaderModal = ({ isOpen, onClose }: TechnicalProofreaderModalProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [inputText, setInputText] = useState(SAMPLE_DRAFTS[0].text);
  const [analysisResult, setAnalysisResult] = useState<ProofreadResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getUsageCount = (): number => {
    try {
      return parseInt(localStorage.getItem(LIMIT_KEY) || '0', 10);
    } catch (e) {
      logger.w('[TechnicalProofreader] Failed to read usage count from localStorage', e);
      return 0;
    }
  };

  const usageCount = getUsageCount();
  const isLimitReached = usageCount >= 1;

  if (!isOpen) return null;

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLimitReached) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeTechnicalText(inputText);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      try {
        localStorage.setItem(LIMIT_KEY, '1');
      } catch (e) {
        logger.w('[TechnicalProofreader] Failed to write usage count to localStorage', e);
      }
    }, 800);
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    try {
      navigator.clipboard.writeText(analysisResult.improvedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      logger.w('[Clipboard] Failed to copy', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Technical document proofreader"
        tabIndex={-1}
        className="w-full max-w-3xl rounded-[var(--radius-card)] border border-primary/40 bg-surface/95 p-5 sm:p-6 shadow-2xl relative light-sweep-container overflow-hidden max-h-[82vh] flex flex-col space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-soft pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-foreground">
              {translate('landing.proofreaderTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close proofreader"
            className="text-muted-copy hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar">
          {/* Input & Preset Buttons */}
          <form onSubmit={handleAnalyze} className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="draft-input"
                className="text-xs font-bold text-foreground flex items-center gap-1.5"
              >
                <FileText className="h-4 w-4 text-primary" /> {translate('landing.proofreaderDesc')}
              </label>
              <div className="flex gap-1.5">
                {SAMPLE_DRAFTS.map((sample) => (
                  <button
                    key={sample.loadKey}
                    type="button"
                    onClick={() => {
                      setInputText(sample.text);
                      setAnalysisResult(null);
                    }}
                    className="rounded-[var(--radius-card)] bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
                  >
                    {translate(sample.loadKey)}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              id="draft-input"
              rows={4}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setAnalysisResult(null);
              }}
              placeholder={translate('landing.proofreaderPlaceholder')}
              className="w-full rounded-[var(--radius-card)] border border-border-soft bg-background p-3 text-xs text-foreground font-medium focus:border-primary outline-none"
              required
            />

            {isLimitReached ? (
              <div className="rounded-[var(--radius-card)] border border-amber-500/40 bg-amber-500/10 p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>{translate('landing.proofreaderLimitReached')}</span>
                </div>
                <p className="text-[11px] text-muted-copy leading-relaxed">
                  You have used your 1 free guest technical check. Create a free account or upgrade
                  to Pro to unlock{' '}
                  <b>
                    unlimited AI proofreading, PDF document uploads, and contract legal clause
                    checks
                  </b>
                  .
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/signup');
                    }}
                    className="flex-1 py-2 rounded-[var(--radius-card)] bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover transition cursor-pointer shadow-md text-center"
                  >
                    Create Free Account / Go Pro ➔
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isAnalyzing || !inputText.trim()}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-card)] bg-primary hover:bg-primary-hover text-xs font-bold text-primary-foreground shadow-md transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <span>Analyzing ASTM / FIDIC Terminology & Grammatical Precision...</span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{translate('landing.proofreaderAnalyzeButton')}</span>
                  </>
                )}
              </button>
            )}
          </form>

          {/* Real Analysis Output */}
          {analysisResult && (
            <div className="space-y-4 animate-in fade-in pt-2 border-t border-border-soft">
              {/* Score Indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[var(--radius-card)] border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                      {translate('landing.proofreaderFormalityScore')}
                    </span>
                    <div className="text-lg font-extrabold text-emerald-600 font-mono">
                      {analysisResult.formalityScore}%
                    </div>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>

                <div className="rounded-[var(--radius-card)] border border-primary/30 bg-primary/10 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                      {translate('landing.proofreaderPrecisionScore')}
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
                        className="rounded-[var(--radius-card)] border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1"
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
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />{' '}
                    {translate('landing.proofreaderRefinedTitle')}
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
                    <span>{copied ? '✓' : translate('landing.proofreaderCopyButton')}</span>
                  </button>
                </div>

                <pre className="whitespace-pre-wrap font-mono text-xs text-foreground bg-background p-4 rounded-[var(--radius-card)] border border-emerald-500/30 leading-relaxed">
                  {analysisResult.improvedText}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
