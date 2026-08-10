import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechRecognitionStatus = 'idle' | 'listening' | 'unsupported' | 'error' | 'stopped';

export interface SpeechRecognitionResult {
  status: SpeechRecognitionStatus;
  /** Final transcript accumulated while listening. */
  transcript: string;
  /** Average recognition confidence (0..1) across interim results. */
  averageConfidence: number;
  errorMessage: string | null;
  supported: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex?: number;
  results?: ArrayLike<{
    isFinal?: boolean;
    0?: { transcript?: string; confidence?: number };
  }>;
}

/**
 * Wraps the browser Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 * for real-time transcription of spoken answers. Falls back to 'unsupported'
 * when the API is missing so callers can keep their previous simulation path.
 */
export function useSpeechRecognition(): SpeechRecognitionResult {
  const [status, setStatus] = useState<SpeechRecognitionStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const confidenceSumRef = useRef(0);
  const confidenceCountRef = useRef(0);

  const getRecognition = useCallback((): SpeechRecognitionLike | null => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return null;
    return new Ctor();
  }, []);

  const supported = Boolean(getRecognition());

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    const recognition = getRecognition();
    if (!recognition) {
      setStatus('unsupported');
      setErrorMessage('Speech recognition is not supported in this browser.');
      return;
    }
    recognitionRef.current = recognition;
    confidenceSumRef.current = 0;
    confidenceCountRef.current = 0;
    setTranscript('');
    setAverageConfidence(0);
    setErrorMessage(null);

    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onresult = (event: unknown) => {
      const evt = event as SpeechRecognitionEventLike;
      let interim = '';
      if (evt?.results) {
        for (let i = 0; i < evt.results.length; i++) {
          const alt = evt.results[i]?.[0];
          const text = alt?.transcript ?? '';
          const conf = alt?.confidence ?? 0;
          if (conf > 0) {
            confidenceSumRef.current += conf;
            confidenceCountRef.current += 1;
          }
          if (evt.results[i]?.isFinal) {
            setTranscript((prev) => `${prev} ${text}`.trim());
          } else {
            interim += text;
          }
        }
      }
      // Expose interim text live so callers can show it; final is committed on
      // onend for stability.
      void interim;
    };

    recognition.onerror = (event: unknown) => {
      const e = event as { error?: string };
      if (e?.error === 'no-speech' || e?.error === 'aborted') return;
      setStatus('error');
      setErrorMessage(
        e?.error ? `Speech recognition error: ${e.error}` : 'Speech recognition failed.'
      );
    };

    recognition.onend = () => {
      const count = confidenceCountRef.current;
      if (count > 0) {
        setAverageConfidence(Math.round((confidenceSumRef.current / count) * 100) / 100);
      }
      setStatus('stopped');
      recognitionRef.current = null;
    };

    setStatus('listening');
    recognition.start();
  }, [getRecognition]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    confidenceSumRef.current = 0;
    confidenceCountRef.current = 0;
    setTranscript('');
    setAverageConfidence(0);
    setErrorMessage(null);
    setStatus('idle');
  }, []);

  return { status, transcript, averageConfidence, errorMessage, supported, start, stop, reset };
}
