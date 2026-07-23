import { useState } from 'react';
import { Mic, Volume2, CheckCircle } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';

interface SpeechRecognitionEvent {
  results: Array<{ 0: { transcript: string } }>;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface ListenerViewProps {
  title: string;
  transcript: string;
  onWordClick?: (word: string) => void;
}

export const ListenerView = ({ title, transcript, onWordClick }: ListenerViewProps) => {
  const [dictationText, setDictationText] = useState('');
  const [dictationResult, setDictationResult] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const checkDictation = () => {
    const original = transcript.toLowerCase().trim();
    const attempt = dictationText.toLowerCase().trim();
    const words = original.split(/\s+/);
    const matched = attempt.split(/\s+/).filter((w) => words.includes(w)).length;
    setDictationResult(Math.round((matched / words.length) * 100));
  };

  const startDictation = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const Ctor = (window as Record<string, unknown>).webkitSpeechRecognition
      ?? (window as Record<string, unknown>).SpeechRecognition;
    const recognition = new (Ctor as new () => SpeechRecognitionInstance)();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results.map((r) => r[0].transcript).join(' ');
      setDictationText(text);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
  };

  const words = transcript.split(/\s+/);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>

      <AudioPlayer />

      <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-6" style={{ fontSize: '18px', lineHeight: '1.8', maxWidth: '720px' }}>
        {words.map((word, i) => (
          <span key={i} onClick={() => onWordClick?.(word)} className={`cursor-pointer hover:bg-[#0047bb]/10 transition ${onWordClick ? 'border-b border-[#0047bb]/30 text-[#0047bb]' : ''}`}>
            {word}{' '}
          </span>
        ))}
      </div>

      <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-4 space-y-3">
        <p className="text-[10px] font-bold uppercase text-muted-copy">Dictation Practice</p>
        <textarea value={dictationText} onChange={(e) => setDictationText(e.target.value)} placeholder="Type what you heard..." className="w-full rounded-[4px] border border-border-soft bg-background p-3 text-sm outline-none focus:border-[#0047bb]/50" rows={3} />
        <div className="flex gap-2">
          <button onClick={startDictation} className={`flex items-center gap-1 rounded-[4px] px-3 py-1.5 text-[10px] font-bold ${isRecording ? 'bg-red-500 text-white' : 'border border-border-soft text-foreground hover:bg-surface-hover'}`}>
            <Mic className="h-3 w-3" /> {isRecording ? 'Recording...' : 'Speak'}
          </button>
          <button onClick={checkDictation} className="flex items-center gap-1 rounded-[4px] bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground">
            <CheckCircle className="h-3 w-3" /> Check
          </button>
        </div>
        {dictationResult !== null && (
          <p className="text-xs font-bold text-foreground">Accuracy: {dictationResult}%</p>
        )}
      </div>

      <div className="flex gap-2">
        <button className="flex items-center gap-1 rounded-[4px] border border-border-soft px-3 py-1.5 text-[10px] font-bold text-foreground hover:bg-surface-hover">
          <Volume2 className="h-3 w-3" /> Listen Again
        </button>
      </div>
    </div>
  );
};
