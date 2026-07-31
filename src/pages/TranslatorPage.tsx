import {
  ArrowLeftRight,
  BookOpen,
  Check,
  Copy,
  Globe2,
  Info,
  RotateCcw,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { PageHeader } from '@/shared/components/PageHeader';
import { PageMetadata } from '@/shared/components/PageMetadata';

import { TranslationResult, translationService } from '@/features/translation';

interface TranslatorPageFormProps {
  sourceLang: 'auto' | 'en' | 'tr';
  setSourceLang: React.Dispatch<React.SetStateAction<'auto' | 'en' | 'tr'>>;
  targetLang: 'en' | 'tr';
  setTargetLang: React.Dispatch<React.SetStateAction<'en' | 'tr'>>;
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
  translatedText: string;
  isTranslating: boolean;
  resultData: TranslationResult | null;
  copied: boolean;
  isPlayingAudio: 'source' | 'target' | null;
  handleSwapLanguages: () => void;
  handleManualTranslate: (e: React.FormEvent) => void;
  handleClear: () => void;
  handleCopy: () => void;
  speakText: (text: string, lang: 'en' | 'tr', type: 'source' | 'target') => void;
}

const LanguageBar: React.FC<{
  sourceLang: 'auto' | 'en' | 'tr';
  setSourceLang: React.Dispatch<React.SetStateAction<'auto' | 'en' | 'tr'>>;
  targetLang: 'en' | 'tr';
  setTargetLang: React.Dispatch<React.SetStateAction<'en' | 'tr'>>;
  handleSwapLanguages: () => void;
}> = ({ sourceLang, setSourceLang, targetLang, setTargetLang, handleSwapLanguages }) => (
  <div className="flex items-center justify-between gap-3 bg-background p-2.5 rounded-xl border border-border-soft text-xs">
    <div className="flex items-center gap-2">
      <Globe2 className="h-4 w-4 text-primary shrink-0" />
      <span className="font-bold text-muted-copy">From:</span>
      <select
        value={sourceLang}
        onChange={(e) => setSourceLang(e.target.value as 'auto' | 'en' | 'tr')}
        className="rounded-lg border border-border-soft bg-surface px-2.5 py-1.5 text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
      >
        <option value="auto">✨ Auto Detect</option>
        <option value="en">English (EN)</option>
        <option value="tr">Türkçe (TR)</option>
      </select>
    </div>

    <button
      type="button"
      onClick={handleSwapLanguages}
      className="p-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer shadow-sm"
      title="Swap English ↔ Türkçe"
    >
      <ArrowLeftRight className="h-4 w-4" />
    </button>

    <div className="flex items-center gap-2">
      <span className="font-bold text-muted-copy">To:</span>
      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value as 'en' | 'tr')}
        className="rounded-lg border border-border-soft bg-surface px-2.5 py-1.5 text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
      >
        <option value="tr">Türkçe (TR)</option>
        <option value="en">English (EN)</option>
      </select>
    </div>
  </div>
);

const SourceInputPanel: React.FC<{
  inputText: string;
  setInputText: (v: string) => void;
  sourceLang: 'auto' | 'en' | 'tr';
  isTranslating: boolean;
  isPlayingAudio: 'source' | 'target' | null;
  handleClear: () => void;
  speakText: (text: string, lang: 'en' | 'tr', type: 'source' | 'target') => void;
}> = ({
  inputText,
  setInputText,
  sourceLang,
  isTranslating,
  isPlayingAudio,
  handleClear,
  speakText,
}) => (
  <div className="space-y-2 relative">
    <div className="flex items-center justify-between">
      <label className="text-xs font-bold text-foreground flex items-center gap-2">
        Source Text / Word
        {inputText.trim() && (
          <button
            type="button"
            onClick={() => speakText(inputText, sourceLang === 'tr' ? 'tr' : 'en', 'source')}
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
              isPlayingAudio === 'source'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 animate-pulse'
                : 'border-border-soft bg-background hover:bg-surface-hover text-muted-copy'
            }`}
            title="Listen Source Audio"
          >
            <Volume2 className="h-3 w-3" />
            <span>{isPlayingAudio === 'source' ? 'Playing...' : 'Audio'}</span>
          </button>
        )}
      </label>
      {inputText && (
        <button
          type="button"
          onClick={handleClear}
          className="text-[10px] text-muted-copy hover:text-rose-500 font-bold transition-colors cursor-pointer flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Clear
        </button>
      )}
    </div>

    <textarea
      rows={6}
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      placeholder="Enter technical text, FIDIC clause, ASTM test term, or single word to translate..."
      className="w-full rounded-xl border border-border-soft bg-background p-4 text-xs text-foreground font-medium focus:border-primary outline-none transition-all leading-relaxed"
    />

    <button
      type="submit"
      disabled={isTranslating || !inputText.trim()}
      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
    >
      <Zap className="h-4 w-4" /> {isTranslating ? 'Translating...' : 'Translate Text Now'}
    </button>
  </div>
);

const OutputPanel: React.FC<{
  translatedText: string;
  targetLang: 'en' | 'tr';
  isTranslating: boolean;
  resultData: TranslationResult | null;
  copied: boolean;
  isPlayingAudio: 'source' | 'target' | null;
  handleCopy: () => void;
  speakText: (text: string, lang: 'en' | 'tr', type: 'source' | 'target') => void;
}> = ({
  translatedText,
  targetLang,
  isTranslating,
  resultData,
  copied,
  isPlayingAudio,
  handleCopy,
  speakText,
}) => (
  <div className="space-y-2 relative">
    <div className="flex items-center justify-between">
      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
        Translated Output
        {translatedText.trim() && (
          <button
            type="button"
            onClick={() => speakText(translatedText, targetLang, 'target')}
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
              isPlayingAudio === 'target'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 animate-pulse'
                : 'border-border-soft bg-background hover:bg-surface-hover text-muted-copy'
            }`}
            title="Listen Translated Audio"
          >
            <Volume2 className="h-3 w-3" />
            <span>{isPlayingAudio === 'target' ? 'Playing...' : 'Audio'}</span>
          </button>
        )}
        {resultData?.serviceUsed && (
          <span className="text-[9px] font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded">
            via {resultData.serviceUsed}
          </span>
        )}
      </label>

      {translatedText && (
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
          <span>{copied ? 'Copied!' : 'Copy Result'}</span>
        </button>
      )}
    </div>

    <div className="relative">
      <textarea
        rows={6}
        readOnly
        value={isTranslating ? 'Translating...' : translatedText}
        placeholder="Translated text and technical terms will appear here..."
        className="w-full rounded-xl border border-border-soft bg-background p-4 text-xs text-foreground font-semibold focus:border-primary outline-none leading-relaxed"
      />
      {isTranslating && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center text-xs font-bold text-primary gap-2">
          <Sparkles className="h-4 w-4 animate-spin" /> Translating...
        </div>
      )}
    </div>
  </div>
);

const TranslatorPageForm: React.FC<TranslatorPageFormProps> = ({
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  inputText,
  setInputText,
  translatedText,
  isTranslating,
  resultData,
  copied,
  isPlayingAudio,
  handleSwapLanguages,
  handleManualTranslate,
  handleClear,
  handleCopy,
  speakText,
}) => (
  <>
    <LanguageBar
      sourceLang={sourceLang}
      setSourceLang={setSourceLang}
      targetLang={targetLang}
      setTargetLang={setTargetLang}
      handleSwapLanguages={handleSwapLanguages}
    />

    <form onSubmit={handleManualTranslate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <SourceInputPanel
        inputText={inputText}
        setInputText={setInputText}
        sourceLang={sourceLang}
        isTranslating={isTranslating}
        isPlayingAudio={isPlayingAudio}
        handleClear={handleClear}
        speakText={speakText}
      />
      <OutputPanel
        translatedText={translatedText}
        targetLang={targetLang}
        isTranslating={isTranslating}
        resultData={resultData}
        copied={copied}
        isPlayingAudio={isPlayingAudio}
        handleCopy={handleCopy}
        speakText={speakText}
      />
    </form>
  </>
);

interface WordAnalysisCardProps {
  resultData: TranslationResult | null;
  translatedText: string;
}

const WordAnalysisCard: React.FC<WordAnalysisCardProps> = ({ resultData, translatedText }) => (
  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 animate-in fade-in">
    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
          Single-Word Technical Analysis
        </span>
      </div>
      <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 font-mono uppercase">
        Kelime Türü: {resultData?.wordAnalysis?.partOfSpeech?.toUpperCase() || 'GENERAL'}
      </span>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
      <div>
        <span className="text-muted-copy font-bold">Word: </span>
        <span className="font-extrabold text-foreground font-mono">
          {resultData?.wordAnalysis?.word}
        </span>
      </div>
      <div>
        <span className="text-muted-copy font-bold">Primary Meaning: </span>
        <span className="font-extrabold text-emerald-600 font-mono">{translatedText}</span>
      </div>
    </div>

    {resultData?.wordAnalysis?.alternativeMeanings?.length ? (
      <div className="pt-1 text-xs space-y-1">
        <span className="text-[10px] font-bold text-muted-copy uppercase tracking-wider block">
          Alternatif Türkçe Karşılıkları & Teknik Eş Anlamlılar:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {resultData.wordAnalysis.alternativeMeanings.map((alt) => (
            <span
              key={alt}
              className="rounded-md bg-surface border border-border-soft px-2 py-0.5 text-[11px] font-semibold text-foreground"
            >
              {alt}
            </span>
          ))}
        </div>
      </div>
    ) : null}
  </div>
);

export const TranslatorPage = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState<'auto' | 'en' | 'tr'>('auto');
  const [targetLang, setTargetLang] = useState<'en' | 'tr'>('tr');
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);
  const [resultData, setResultData] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<'source' | 'target' | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executeTranslation = useCallback(
    async (textToTranslate: string, src: 'auto' | 'en' | 'tr', tgt: 'en' | 'tr') => {
      const trimmed = textToTranslate.trim();
      if (!trimmed) {
        setTranslatedText('');
        setResultData(null);
        return;
      }

      setIsTranslating(true);

      try {
        const result = await translationService.translate({
          text: trimmed,
          sourceLang: src,
          targetLang: tgt,
        });
        setTranslatedText(result.translatedText);
        setResultData(result);
      } catch {
        // Handled gracefully in translationService
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!autoTranslateEnabled) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

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
  }, [inputText, sourceLang, targetLang, autoTranslateEnabled, executeTranslation]);

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
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setResultData(null);
  };

  const speakText = (text: string, lang: 'en' | 'tr', type: 'source' | 'target') => {
    if (!text.trim() || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = lang === 'en' ? 'en-US' : 'tr-TR';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsPlayingAudio(type);
    utterance.onend = () => setIsPlayingAudio(null);
    utterance.onerror = () => setIsPlayingAudio(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 pb-12 animate-in fade-in">
      <PageMetadata
        title="Engineering Translator — LibreTranslate Open Source Engine"
        description="Instant bi-directional EN ↔ TR technical translation with audio speech synthesis and word analysis."
      />

      <PageHeader
        title="Engineering Instant Translator"
        description="Open-source bi-directional EN ↔ TR technical translation engine with audio speech synthesis."
      />

      <div className="rounded-2xl border border-primary/30 bg-surface/95 p-6 shadow-xl space-y-5 relative">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-soft pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-copy">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>Infrastructure Attribution:</span>
            <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-extrabold text-primary font-mono">
              Powered by LibreTranslate Open-Source Engine
            </span>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-muted-copy cursor-pointer hover:text-foreground transition-colors">
            <input
              type="checkbox"
              checked={autoTranslateEnabled}
              onChange={(e) => setAutoTranslateEnabled(e.target.checked)}
              className="rounded border-border-soft text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
            />
            <span>Live Translate (500ms Debounce)</span>
          </label>
        </div>

        <TranslatorPageForm
          sourceLang={sourceLang}
          setSourceLang={setSourceLang}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          inputText={inputText}
          setInputText={setInputText}
          translatedText={translatedText}
          isTranslating={isTranslating}
          resultData={resultData}
          copied={copied}
          isPlayingAudio={isPlayingAudio}
          handleSwapLanguages={handleSwapLanguages}
          handleManualTranslate={handleManualTranslate}
          handleClear={handleClear}
          handleCopy={handleCopy}
          speakText={speakText}
        />

        {resultData?.wordAnalysis?.isSingleWord && (
          <WordAnalysisCard resultData={resultData} translatedText={translatedText} />
        )}
      </div>
    </main>
  );
};

export default TranslatorPage;
