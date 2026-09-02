import { isNativePlatform } from '@/shared/utils/capacitor';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';

export const startSpeechRecognition = (
  w: Record<string, unknown>,
  setCurrentAnswer: Dispatch<SetStateAction<string>>,
  recognitionRef: MutableRefObject<unknown>,
  setIsRecording: (v: boolean) => void
) => {
  // Speech Recognition is not available in Android/iOS WebView
  if (isNativePlatform()) {
    console.warn('[SpeechRecognition] Not available in native WebView');
    setIsRecording(false);
    return;
  }

  const SpeechRecognitionConstructor = (w.SpeechRecognition ||
    w.webkitSpeechRecognition) as new () => {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: unknown) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    stop: () => void;
    start: () => void;
  };

  if (!SpeechRecognitionConstructor) {
    console.warn('[SpeechRecognition] API not supported in this environment');
    setIsRecording(false);
    return;
  }

  const recognition = new SpeechRecognitionConstructor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: unknown) => {
    const e = event as { results: SpeechRecognitionResultList };
    const finalTranscript = Array.from({ length: e.results.length }, (_, i) => {
      const result = e.results[i] as unknown as {
        isFinal: boolean;
        item: (index: number) => { transcript: string };
      };
      return result.isFinal ? result.item(0).transcript : '';
    }).join('');
    if (finalTranscript) {
      setCurrentAnswer((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
    }
  };

  recognition.onerror = () => setIsRecording(false);
  recognition.onend = () => setIsRecording(false);

  recognitionRef.current = recognition;
  recognition.start();
  setIsRecording(true);
};

export const getInterviewTitle = (type: 'system-design' | 'coding') =>
  type === 'system-design' ? 'System Design' : 'Coding';
