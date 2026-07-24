import React, { useState } from 'react';
import { EngVoxMascot, MascotMood } from './EngVoxMascot';

export interface FloatingMascotWidgetProps {
  initialSpeech?: string;
  position?: 'bottom-right' | 'bottom-left';
}

const TIPS = [
  'Have you reviewed today’s engineering vocabulary cards?',
  'Practice your technical oral defense with EngVox AI!',
  'FIDIC contract writing and report guides are ready.',
  'Keep your daily study streak strong!',
  'Ask me or EngVox AI anytime if you need engineering help!',
];

export const FloatingMascotWidget: React.FC<FloatingMascotWidgetProps> = ({
  initialSpeech = 'Hello! I am your EngVox Assistant. How can I help you today?',
  position = 'bottom-right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [speechText, setSpeechText] = useState(initialSpeech);
  const [mood, setMood] = useState<MascotMood>('idle');
  const [isMinimized, setIsMinimized] = useState(false);

  // Cycle tips randomly or on click
  const handleMascotClick = () => {
    setMood('happy');
    const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
    setSpeechText(randomTip);
    setIsOpen(true);

    setTimeout(() => {
      setMood('idle');
    }, 2000);
  };

  const positionClasses =
    position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6';

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={`fixed ${positionClasses} z-50 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center border-2 border-emerald-400 cursor-pointer`}
        title="Open EngVox Assistant"
        type="button"
      >
        <span className="text-xl">🤖</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed ${positionClasses} z-50 flex flex-col items-end gap-2 group pointer-events-auto`}
    >
      {/* Speech Chat Window / Popup */}
      {isOpen && (
        <div className="w-72 bg-zinc-900/95 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                EngVox AI Bot
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-zinc-800 cursor-pointer"
              type="button"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed">{speechText}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={handleMascotClick}
              className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              type="button"
            >
              💡 Next Tip
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              type="button"
            >
              Minimize
            </button>
          </div>
        </div>
      )}

      {/* Interactive Mascot Avatar */}
      <div className="relative">
        <EngVoxMascot
          size="md"
          mood={mood}
          enableMouseTracking={true}
          showSpeechBubble={!isOpen}
          speechText={speechText}
          onClick={handleMascotClick}
        />
      </div>
    </div>
  );
};

export default FloatingMascotWidget;
