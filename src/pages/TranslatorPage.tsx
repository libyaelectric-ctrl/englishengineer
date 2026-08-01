import {
  ArrowLeftRight,
  BookOpen,
  Check,
  Copy,
  Globe2,
  Info,
  Keyboard,
  RotateCcw,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { PageHeader } from '@/shared/components/PageHeader';
import { PageMetadata } from '@/shared/components/PageMetadata';
import { logger } from '@/shared/logger';

import { SupportedLang, TranslationResult, translationService } from '@/features/translation';

export const SUPPORTED_LANGUAGES: Array<{ code: SupportedLang; name: string; flag: string }> = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano (Italian)', flag: '🇮🇹' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'pt', name: 'Português (Portuguese)', flag: '🇵🇹' },
  { code: 'pl', name: 'Polski (Polish)', flag: '🇵🇱' },
];

const SPEECH_LANG_MAP: Record<string, string> = {
  en: 'en-US',
  tr: 'tr-TR',
  ar: 'ar-SA',
  zh: 'zh-CN',
  ru: 'ru-RU',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  fr: 'fr-FR',
  ja: 'ja-JP',
  ko: 'ko-KR',
  pt: 'pt-PT',
  pl: 'pl-PL',
};

const VIRTUAL_CHAR_BARS: Partial<Record<SupportedLang, string[]>> = {
  ar: ['مرحبا', 'تعال', 'شكرا', 'نعم', 'لا', 'كيف حالك', 'السلام عليكم', 'مشروع'],
  ru: ['Привет', 'Приходи', 'Спасибо', 'Да', 'Нет', 'Как дела', 'Здравствуйте'],
  zh: ['你好', '过来', '谢谢', '是的', '不是', '工程', '项目'],
  ja: ['こんにちは', '来て', 'ありがとう', 'はい', 'いいえ', 'プロジェクト'],
  ko: ['안녕하세요', '오세요', '감사합니다', '네', '아니오', '프로젝트'],
};

const LanguageBar: React.FC<{
  sourceLang: SupportedLang;
  setSourceLang: React.Dispatch<React.SetStateAction<SupportedLang>>;
  targetLang: SupportedLang;
  setTargetLang: React.Dispatch<React.SetStateAction<SupportedLang>>;
  handleSwapLanguages: () => void;
}> = ({ sourceLang, setSourceLang, targetLang, setTargetLang, handleSwapLanguages }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 bg-background p-3 rounded-xl border border-border-soft text-xs">
    <div className="flex items-center gap-2">
      <Globe2 className="h-4 w-4 text-primary shrink-0" />
      <span className="font-bold text-muted-copy">From:</span>
      <select
        value={sourceLang}
        onChange={(e) => setSourceLang(e.target.value as SupportedLang)}
        className="rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
      >
        <option value="auto">✨ Auto Detect</option>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>

    <button
      type="button"
      onClick={handleSwapLanguages}
      className="p-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer shadow-sm hover:scale-105"
      title="Swap Source ↔ Target Languages"
    >
      <ArrowLeftRight className="h-4 w-4" />
    </button>

    <div className="flex items-center gap-2">
      <span className="font-bold text-muted-copy">To:</span>
      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value as SupportedLang)}
        className="rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SourceInputPanel: React.FC<{
  inputText: string;
  setInputText: (v: string) => void;
  sourceLang: SupportedLang;
  isTranslating: boolean;
  liveTranslateEnabled: boolean;
  isPlayingAudio: 'source' | 'target' | null;
  handleClear: () => void;
  speakText: (text: string, lang: SupportedLang, type: 'source' | 'target') => void;
}> = (props) => {
  const { inputText, setInputText, sourceLang, isTranslating, liveTranslateEnabled, isPlayingAudio, handleClear, speakText } = props;
  const quickChars = VIRTUAL_CHAR_BARS[sourceLang];
  const isRtl = sourceLang === 'ar';
  const sourcePlaceholder = isRtl
    ? 'أدخل النص الفني أو المواصفات الهندسية...'
    : 'Enter technical text, engineering specs, contract clauses, or any words to translate...';
  const speakLabel = isPlayingAudio === 'source' ? 'Playing...' : 'Audio';
  const speakBtnClass = isPlayingAudio === 'source'
    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 animate-pulse'
    : 'border-border-soft bg-background hover:bg-surface-hover text-muted-copy';
  const hasInput = inputText.trim().length > 0;
  const speakBtn = hasInput ? (
    <button type="button" onClick={() => speakText(inputText, sourceLang, 'source')}
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded border transition cursor-pointer ${speakBtnClass}`}
      title="Listen Source Text Audio">
      <Volume2 className="h-3.5 w-3.5" /><span>{speakLabel}</span>
    </button>
  ) : null;
  const clearBtn = hasInput ? (
    <button type="button" onClick={handleClear}
      className="text-[10px] text-muted-copy hover:text-rose-500 font-bold transition-colors cursor-pointer flex items-center gap-1">
      <RotateCcw className="h-3 w-3" /> Clear Text
    </button>
  ) : null;
  const quickCharsBar = quickChars ? (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 bg-background/50 p-2 rounded-lg border border-border-soft">
      <span className="text-[10px] font-bold text-muted-copy flex items-center gap-1">
        <Keyboard className="h-3 w-3 text-primary" /> Hızlı Ekle:
      </span>
      {quickChars.map((phrase) => (
        <button key={phrase} type="button" onClick={() => setInputText(inputText ? `${inputText} ${phrase}` : phrase)}
          className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover border border-border-soft text-[11px] font-medium text-foreground transition cursor-pointer">
          {phrase}
        </button>
      ))}
    </div>
  ) : null;
  const translateBtn = !liveTranslateEnabled ? (
    <button type="submit" disabled={isTranslating || !hasInput}
      className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary-hover transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-3">
      <Zap className="h-4 w-4" /> {isTranslating ? 'Translating...' : 'Translate Text Now'}
    </button>
  ) : null;

  return (
    <div className="space-y-2 relative flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-foreground flex items-center gap-2">
            Source Text / Technical Document {speakBtn}
          </label>
          {clearBtn}
        </div>
        <textarea rows={8} dir={isRtl ? 'rtl' : 'ltr'} lang={sourceLang} value={inputText}
          onChange={(e) => setInputText(e.target.value)} placeholder={sourcePlaceholder}
          className="w-full rounded-xl border border-border-soft bg-background p-4 text-xs text-foreground font-medium focus:border-primary outline-none transition-all leading-relaxed font-sans" />
        {quickCharsBar}
      </div>
      {translateBtn}
    </div>
  );
};

const OutputPanel: React.FC<{
  translatedText: string;
  targetLang: SupportedLang;
  isTranslating: boolean;
  resultData: TranslationResult | null;
  copied: boolean;
  isPlayingAudio: 'source' | 'target' | null;
  handleCopy: () => void;
  speakText: (text: string, lang: SupportedLang, type: 'source' | 'target') => void;
}> = (props) => {
  const { translatedText, targetLang, isTranslating, resultData, copied, isPlayingAudio, handleCopy, speakText } = props;
  const hasOutput = translatedText.trim().length > 0;
  const speakLabel = isPlayingAudio === 'target' ? 'Playing...' : 'Audio';
  const speakBtnClass = isPlayingAudio === 'target'
    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 animate-pulse'
    : 'border-border-soft bg-background hover:bg-surface-hover text-muted-copy';
  const isRtl = targetLang === 'ar';
  const speakBtn = hasOutput ? (
    <button type="button" onClick={() => speakText(translatedText, targetLang, 'target')}
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded border transition cursor-pointer ${speakBtnClass}`}
      title="Listen Translated Audio">
      <Volume2 className="h-3.5 w-3.5" /><span>{speakLabel}</span>
    </button>
  ) : null;
  const serviceTag = resultData?.serviceUsed ? (
    <span className="text-[9px] font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded">
      via {resultData.serviceUsed}
    </span>
  ) : null;
  const copyBtn = hasOutput ? (
    <button type="button" onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? 'Copied!' : 'Copy Result'}</span>
    </button>
  ) : null;
  const translatingOverlay = isTranslating ? (
    <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center text-xs font-bold text-primary gap-2">
      <Sparkles className="h-4 w-4 animate-spin" /> Translating...
    </div>
  ) : null;

  return (
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-foreground flex items-center gap-2">
          Translated Output {speakBtn} {serviceTag}
        </label>
        {copyBtn}
      </div>
      <div className="relative">
        <textarea rows={8} readOnly dir={isRtl ? 'rtl' : 'ltr'} lang={targetLang}
          value={isTranslating ? 'Translating...' : translatedText}
          placeholder="Translated output will appear here automatically..."
          className="w-full rounded-xl border border-border-soft bg-background p-4 text-xs text-foreground font-semibold focus:border-primary outline-none leading-relaxed font-sans" />
        {translatingOverlay}
      </div>
    </div>
  );
};

const WordAnalysisCard: React.FC<{
  resultData: TranslationResult | null;
  translatedText: string;
}> = (props) => {
  const { resultData, translatedText } = props;
  const alternatives = resultData?.wordAnalysis?.alternativeMeanings;
  const hasAlternatives = alternatives && alternatives.length > 0;
  const posLabel = resultData?.wordAnalysis?.partOfSpeech?.toUpperCase() || 'GENERAL';
  const altList = hasAlternatives ? (
    <div className="pt-1 text-xs space-y-1">
      <span className="text-[10px] font-bold text-muted-copy uppercase tracking-wider block">
        Alternatif Türkçe Karşılıkları & Teknik Eş Anlamlılar:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {alternatives!.map((alt) => (
          <span key={alt} className="rounded-md bg-surface border border-border-soft px-2 py-0.5 text-[11px] font-semibold text-foreground">
            {alt}
          </span>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
            Single-Word Technical Analysis
          </span>
        </div>
        <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 font-mono uppercase">
          Kelime Türü: {posLabel}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-muted-copy font-bold">Word: </span>
          <span className="font-extrabold text-foreground font-mono">{resultData?.wordAnalysis?.word}</span>
        </div>
        <div>
          <span className="text-muted-copy font-bold">Primary Meaning: </span>
          <span className="font-extrabold text-emerald-600 font-mono">{translatedText}</span>
        </div>
      </div>
      {altList}
    </div>
  );
};

export const TranslatorPage = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState<SupportedLang>('auto');
  const [targetLang, setTargetLang] = useState<SupportedLang>('tr');
  const [isTranslating, setIsTranslating] = useState(false);
  const [liveTranslateEnabled, setLiveTranslateEnabled] = useState(true);
  const [resultData, setResultData] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<'source' | 'target' | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executeTranslation = useCallback(
    async (textToTranslate: string, src: SupportedLang, tgt: SupportedLang) => {
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
      } catch (err) {
        logger.e('[TranslatorPage] Translation failed', err);
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!liveTranslateEnabled) return;

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
  }, [inputText, sourceLang, targetLang, liveTranslateEnabled, executeTranslation]);

  const handleManualTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    executeTranslation(inputText, sourceLang, targetLang);
  };

  const handleSwapLanguages = () => {
    const nextSource = targetLang;
    const nextTarget = sourceLang === 'auto' ? 'en' : sourceLang;
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

  const speakText = (text: string, lang: SupportedLang, type: 'source' | 'target') => {
    if (!text.trim() || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = SPEECH_LANG_MAP[lang] || 'en-US';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsPlayingAudio(type);
    utterance.onend = () => setIsPlayingAudio(null);
    utterance.onerror = () => setIsPlayingAudio(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 pb-12 animate-in fade-in">
      <PageMetadata
        title="Engineering Multilingual Translator — Open-Source Engine"
        description="Multilingual EN, TR, AR, ZH, RU, DE, ES, IT, FR, JA, KO, PT, PL technical translation engine with audio speech synthesis."
      />

      <PageHeader
        title="Engineering Instant Translator"
        description="Open-source multi-lingual engineering translation engine supporting 13 languages with audio speech synthesis and automatic RTL layout."
      />

      {/* Main Container Card - Full Width 6XL Spacing */}
      <div className="rounded-2xl border border-primary/30 bg-surface/95 p-6 md:p-8 shadow-xl space-y-6 relative">
        {/* Attribution Badge & Live Translate Checkbox */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-copy">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>Infrastructure Attribution:</span>
            <span className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-extrabold text-primary font-mono">
              Powered by Google GTX & Lingva Open-Source Engines
            </span>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-muted-copy cursor-pointer hover:text-foreground transition-colors select-none">
            <input
              type="checkbox"
              checked={liveTranslateEnabled}
              onChange={(e) => setLiveTranslateEnabled(e.target.checked)}
              className="rounded border-border-soft text-primary focus:ring-primary h-4 w-4 cursor-pointer"
            />
            <span>Live Translate (500ms Auto-Debounce)</span>
          </label>
        </div>

        {/* Language Bar */}
        <LanguageBar
          sourceLang={sourceLang}
          setSourceLang={setSourceLang}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          handleSwapLanguages={handleSwapLanguages}
        />

        {/* Translation Form */}
        <form onSubmit={handleManualTranslate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SourceInputPanel
            inputText={inputText}
            setInputText={setInputText}
            sourceLang={sourceLang}
            isTranslating={isTranslating}
            liveTranslateEnabled={liveTranslateEnabled}
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

        {/* Single-Word Analysis Card */}
        {resultData?.wordAnalysis?.isSingleWord && (
          <WordAnalysisCard resultData={resultData} translatedText={translatedText} />
        )}
      </div>
    </main>
  );
};

export default TranslatorPage;
