import {
  ArrowLeftRight,
  BookOpen,
  Check,
  Copy,
  Globe2,
  Languages,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@/shared/logger';

import { TranslationResult, translationService } from '../services/translation.service';

type Lang = 'auto' | 'en' | 'tr';
type TargetLang = 'en' | 'tr';

const useDebouncedTranslation = (
  inputText: string,
  sourceLang: Lang,
  targetLang: TargetLang,
  autoTranslateEnabled: boolean,
  executeTranslation: (text: string, src: Lang, tgt: TargetLang) => Promise<void>,
  setTranslatedText: (v: string) => void,
  setResultData: (v: TranslationResult | null) => void
) => {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!autoTranslateEnabled) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!inputText.trim()) {
      setTranslatedText('');
      setResultData(null);
      return;
    }
    debounceTimerRef.current = setTimeout(() => {
      executeTranslation(inputText, sourceLang, targetLang);
    }, 500);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [
    inputText,
    sourceLang,
    targetLang,
    autoTranslateEnabled,
    executeTranslation,
    setTranslatedText,
    setResultData,
  ]);
};

const ErrorBanner = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => (
  <div className="rounded-[var(--radius-card)] border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs font-semibold text-amber-600 flex items-center justify-between">
    <span>⚠️ {message}</span>
    <span
      role="button"
      tabIndex={0}
      className="text-[10px] underline cursor-pointer"
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onDismiss();
      }}
    >
      Dismiss
    </span>
  </div>
);

const WordAnalysisCard = ({
  wordAnalysis,
  translatedText,
}: {
  wordAnalysis: TranslationResult['wordAnalysis'];
  translatedText: string;
}) => {
  if (!wordAnalysis?.isSingleWord) return null;
  return (
    <div className="rounded-[var(--radius-card)] border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
            Single-Word Technical Analysis
          </span>
        </div>
        <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 font-mono uppercase">
          {wordAnalysis.partOfSpeech || 'General'}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-muted-copy font-bold">Word: </span>
          <span className="font-extrabold text-foreground font-mono">{wordAnalysis.word}</span>
        </div>
        <div>
          <span className="text-muted-copy font-bold">Primary Meaning: </span>
          <span className="font-extrabold text-emerald-600 font-mono">{translatedText}</span>
        </div>
      </div>
      {wordAnalysis.alternativeMeanings && wordAnalysis.alternativeMeanings.length > 0 && (
        <div className="pt-1 text-xs space-y-1">
          <span className="text-[10px] font-bold text-muted-copy uppercase tracking-wider block">
            Alternative Meanings & Technical Synonyms:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {wordAnalysis.alternativeMeanings.map((alt) => (
              <span
                key={alt}
                className="rounded-md bg-surface border border-border-soft px-2 py-0.5 text-[11px] font-semibold text-foreground"
              >
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TranslatorFormProps {
  inputText: string;
  setInputText: (v: string) => void;
  translatedText: string;
  isTranslating: boolean;
  autoTranslateEnabled: boolean;
  sourceLang: 'auto' | 'en' | 'tr';
  setSourceLang: (v: 'auto' | 'en' | 'tr') => void;
  targetLang: 'en' | 'tr';
  setTargetLang: (v: 'en' | 'tr') => void;
  resultData: TranslationResult | null;
  copied: boolean;
  onManualTranslate: (e: React.FormEvent) => void;
  onSwapLanguages: () => void;
  onCopy: () => void;
  onClear: () => void;
}

const TranslationGrid = ({
  inputText,
  setInputText,
  translatedText,
  isTranslating,
  autoTranslateEnabled,
  resultData,
  copied,
  onManualTranslate,
  onCopy,
  onClear,
}: Omit<
  TranslatorFormProps,
  'sourceLang' | 'setSourceLang' | 'targetLang' | 'setTargetLang' | 'onSwapLanguages'
>) => (
  <form onSubmit={onManualTranslate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <label htmlFor="translator-source" className="text-xs font-bold text-foreground">
          Source Text / Word
        </label>
        <button
          type="button"
          onClick={onClear}
          disabled={!inputText}
          className="text-[10px] text-muted-copy hover:text-rose-500 font-bold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-30"
        >
          <RotateCcw className="h-3 w-3" /> Clear
        </button>
      </div>
      <textarea
        id="translator-source"
        rows={4}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type or paste English/Turkish technical text or single word..."
        className="w-full rounded-[var(--radius-card)] border border-border-soft bg-background p-3 text-xs text-foreground font-medium focus:border-primary outline-none transition-all"
      />
      {!autoTranslateEnabled && (
        <button
          type="submit"
          disabled={isTranslating || !inputText.trim()}
          className="w-full py-2 rounded-[var(--radius-card)] bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Zap className="h-3.5 w-3.5" /> Translate Now
        </button>
      )}
    </div>
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground flex items-center gap-1">
          Translated Output
          {resultData?.serviceUsed && (
            <span className="text-[9px] font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded">
              via {resultData.serviceUsed}
            </span>
          )}
        </label>
        {translatedText && (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        )}
      </div>
      <div className="relative">
        <textarea
          rows={4}
          readOnly
          value={isTranslating ? 'Translating...' : translatedText}
          placeholder="Translation will appear here instantly..."
          className="w-full rounded-[var(--radius-card)] border border-border-soft bg-background p-3 text-xs text-foreground font-semibold focus:border-primary outline-none leading-relaxed"
        />
        {isTranslating && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-[var(--radius-card)] flex items-center justify-center text-xs font-bold text-primary gap-2">
            <Sparkles className="h-4 w-4 animate-spin" /> Translating...
          </div>
        )}
      </div>
    </div>
  </form>
);

const TranslatorForm = ({
  inputText,
  setInputText,
  translatedText,
  isTranslating,
  autoTranslateEnabled,
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  resultData,
  copied,
  onManualTranslate,
  onSwapLanguages,
  onCopy,
  onClear,
}: TranslatorFormProps) => (
  <>
    <div className="flex items-center justify-between gap-3 bg-background p-2 rounded-[var(--radius-card)] border border-border-soft text-xs">
      <div className="flex items-center gap-2">
        <Globe2 className="h-4 w-4 text-primary shrink-0" />
        <span className="font-bold text-muted-copy">From:</span>
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value as 'auto' | 'en' | 'tr')}
          className="rounded-[var(--radius-card)] border border-border-soft bg-surface px-2.5 py-1 text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
        >
          <option value="auto">✨ Auto Detect</option>
          <option value="en">English (EN)</option>
          <option value="tr">Türkçe (TR)</option>
        </select>
      </div>
      <button
        type="button"
        onClick={onSwapLanguages}
        className="p-1.5 rounded-[var(--radius-card)] border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer"
        title="Swap English ↔ Türkçe"
      >
        <ArrowLeftRight className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2">
        <span className="font-bold text-muted-copy">To:</span>
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value as 'en' | 'tr')}
          className="rounded-[var(--radius-card)] border border-border-soft bg-surface px-2.5 py-1 text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
        >
          <option value="tr">Türkçe (TR)</option>
          <option value="en">English (EN)</option>
        </select>
      </div>
    </div>
    <TranslationGrid
      inputText={inputText}
      setInputText={setInputText}
      translatedText={translatedText}
      isTranslating={isTranslating}
      autoTranslateEnabled={autoTranslateEnabled}
      resultData={resultData}
      copied={copied}
      onManualTranslate={onManualTranslate}
      onCopy={onCopy}
      onClear={onClear}
    />
  </>
);

export const DashboardTranslatorWidget = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState<'auto' | 'en' | 'tr'>('auto');
  const [targetLang, setTargetLang] = useState<'en' | 'tr'>('tr');
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);
  const [resultData, setResultData] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executeTranslation = useCallback(
    async (textToTranslate: string, src: 'auto' | 'en' | 'tr', tgt: 'en' | 'tr') => {
      const trimmed = textToTranslate.trim();
      if (!trimmed) {
        setTranslatedText('');
        setResultData(null);
        setErrorMessage(null);
        return;
      }
      setIsTranslating(true);
      setErrorMessage(null);
      try {
        const result = await translationService.translate({
          text: trimmed,
          sourceLang: src,
          targetLang: tgt,
        });
        setTranslatedText(result.translatedText);
        setResultData(result);
      } catch (e) {
        logger.w('[DashboardTranslator] Translation request failed', e);
        setErrorMessage('Network or translation service unreachable. Fallback mode active.');
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  useDebouncedTranslation(
    inputText,
    sourceLang,
    targetLang,
    autoTranslateEnabled,
    executeTranslation,
    setTranslatedText,
    setResultData
  );

  const handleManualTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    executeTranslation(inputText, sourceLang, targetLang);
  };

  const handleSwapLanguages = () => {
    const nextSource = targetLang;
    const nextTarget = sourceLang === 'tr' ? 'en' : 'tr';
    setSourceLang(nextSource);
    setTargetLang(nextTarget);
    if (inputText.trim()) {
      executeTranslation(inputText, nextSource, nextTarget);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    try {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      logger.w('[Clipboard] Failed to copy', e);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setResultData(null);
    setErrorMessage(null);
  };

  return (
    <div className="w-full rounded-[var(--radius-card)] border border-primary/30 bg-surface/95 p-5 shadow-xl space-y-4 relative overflow-hidden transition-all duration-300">
      {/* Widget Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-soft pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-[var(--radius-card)] bg-primary/10 text-primary border border-primary/20">
            <Languages className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              Instant Engineering Translator
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 font-mono">
                LibreTranslate Open-Source
              </span>
            </h3>
            <p className="text-[11px] text-muted-copy">
              Bi-directional EN ↔ TR translation, technical word analysis & 0-cost API core
            </p>
          </div>
        </div>

        {/* Live Auto-Translate Toggle */}
        <label className="flex items-center gap-2 text-xs font-bold text-muted-copy cursor-pointer hover:text-foreground transition-colors">
          <input
            type="checkbox"
            checked={autoTranslateEnabled}
            onChange={(e) => setAutoTranslateEnabled(e.target.checked)}
            className="rounded border-border-soft text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
          />
          <span>Translate as you type (500ms)</span>
        </label>
      </div>

      <TranslatorForm
        inputText={inputText}
        setInputText={setInputText}
        translatedText={translatedText}
        isTranslating={isTranslating}
        autoTranslateEnabled={autoTranslateEnabled}
        sourceLang={sourceLang}
        setSourceLang={setSourceLang}
        targetLang={targetLang}
        setTargetLang={setTargetLang}
        resultData={resultData}
        copied={copied}
        onManualTranslate={handleManualTranslate}
        onSwapLanguages={handleSwapLanguages}
        onCopy={handleCopy}
        onClear={handleClear}
      />

      {errorMessage && (
        <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      )}

      <WordAnalysisCard wordAnalysis={resultData?.wordAnalysis} translatedText={translatedText} />
    </div>
  );
};
