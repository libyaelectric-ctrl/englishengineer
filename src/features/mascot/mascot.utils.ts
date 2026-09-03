export const playTone = (
  frequencies: number[],
  duration: number,
  waveType: OscillatorType = 'sine',
  volume = 0.1
): void => {
  try {
    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const audioCtx = new AudioContextCtor();
    const now = audioCtx.currentTime;
    frequencies.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = waveType;
      osc.frequency.value = freq;
      gain.gain.value = volume;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + duration / 1000);
    });
  } catch {
    // Silent fail if audio not supported
  }
};

export const spawnConfetti = (container: HTMLElement | null): void => {
  if (!container) return;
  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 50}%;
      width: 8px;
      height: 8px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      animation: confetti-fall ${1 + Math.random()}s ease-out forwards;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
};

// Add confetti animation if not exists
if (typeof document !== 'undefined' && !document.getElementById('confetti-style')) {
  const style = document.createElement('style');
  style.id = 'confetti-style';
  style.textContent = `
    @keyframes confetti-fall {
      to {
        transform: translateY(100px) rotate(360deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
