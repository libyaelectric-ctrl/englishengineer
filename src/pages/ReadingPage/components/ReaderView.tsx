import { useState } from 'react';
import { Volume2, Sparkles, BookOpen } from 'lucide-react';

interface ReaderViewProps {
  title: string;
  content: string;
  onWordClick?: (word: string) => void;
}

const TTS_BUTTONS = [
  { label: '0.5x', rate: 0.5 },
  { label: '0.75x', rate: 0.75 },
  { label: '1x', rate: 1 },
  { label: '1.25x', rate: 1.25 },
];

export const ReaderView = ({
  title,
  content,
  onWordClick,
}: ReaderViewProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedRate, setSelectedRate] = useState(1);

  const speak = (text: string, rate: number) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const words = content.split(/\s+/);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {TTS_BUTTONS.map((btn) => (
              <button
                key={btn.rate}
                onClick={() => setSelectedRate(btn.rate)}
                className={`rounded-[4px] px-2 py-1 text-[10px] font-bold transition ${
                  selectedRate === btn.rate
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border-soft text-muted-copy hover:text-foreground'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              isSpeaking ? stopSpeaking() : speak(content, selectedRate)
            }
            className="flex items-center gap-1 rounded-[4px] border border-border-soft px-2.5 py-1 text-[10px] font-bold text-foreground transition hover:bg-surface-hover"
          >
            <Volume2 className="h-3 w-3" />
            {isSpeaking ? 'Stop' : 'Listen'}
          </button>
        </div>
      </div>

      <div
        className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-6"
        style={{ fontSize: '18px', lineHeight: '1.8', maxWidth: '720px' }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            role={onWordClick ? 'button' : undefined}
            tabIndex={onWordClick ? 0 : undefined}
            onClick={() => onWordClick?.(word)}
            onKeyDown={(e) => {
              if (onWordClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onWordClick(word);
              }
            }}
            className={`cursor-pointer hover:bg-[#0047bb]/10 transition ${
              onWordClick ? 'border-b border-[#0047bb]/30 text-[#0047bb]' : ''
            }`}
          >
            {word}{' '}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="flex items-center gap-1 rounded-[4px] border border-border-soft px-3 py-1.5 text-[10px] font-bold text-foreground transition hover:bg-surface-hover">
          <BookOpen className="h-3 w-3" /> Add to Vocabulary
        </button>
        <button className="flex items-center gap-1 rounded-[4px] border border-border-soft px-3 py-1.5 text-[10px] font-bold text-foreground transition hover:bg-surface-hover">
          <Sparkles className="h-3 w-3" /> AI Summary
        </button>
      </div>
    </div>
  );
};
