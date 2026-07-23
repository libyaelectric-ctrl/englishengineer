import { useState, useRef } from 'react';
import { Play, Pause, Sparkles, Volume2, VolumeX, Maximize2, ShieldCheck, Zap } from 'lucide-react';
import { AnimatedSection, SectionIntro } from './AnimatedComponents';

export function LandingVideoShowcase() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section className="border-t border-border-soft bg-background bg-[linear-gradient(to_right,#8080800b_1px,transparent_1px),linear-gradient(to_bottom,#8080800b_1px,transparent_1px)] bg-[size:24px_24px] px-6 py-16 md:px-12 md:py-24 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-r from-primary/15 via-blue-500/10 to-cyan-500/15 blur-3xl opacity-50" />

      <div className="mx-auto max-w-6xl relative z-10">
        <SectionIntro
          eyebrow="System Interface In Action"
          title={<>See EngVox AI Operating System Live in Action.</>}
          desc="Watch how real engineering conversations, FIDIC contract corrections, and AI vocal feedback operate in real-time."
          align="center"
        />

        {/* Video Showcase Box */}
        <AnimatedSection className="group relative rounded-3xl border border-border-soft bg-surface/80 p-3 sm:p-5 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-border-hover">
          {/* Glass Header Bar */}
          <div className="flex items-center justify-between pb-3 px-2 border-b border-border-soft/60 mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-bold text-foreground flex items-center gap-1.5 font-mono">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                ENGVOX_AGENTIC_CORE.MP4
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-muted-copy">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] text-primary uppercase font-bold">
                <Zap className="h-3 w-3" />
                1080p HD Video
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Live Engineering Session
              </span>
            </div>
          </div>

          {/* Video Element Wrapper */}
          <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-black shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="aspect-[16/9] w-full object-cover rounded-2xl"
              poster="/agentic/arc.webp"
            >
              <source src="/agentic-hero.mp4" type="video/mp4" />
            </video>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/20 bg-black/60 backdrop-blur-md px-4 py-2.5 text-white transition-opacity duration-300 opacity-95 group-hover:opacity-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="rounded-lg bg-white/20 p-2 hover:bg-white/30 transition cursor-pointer text-white"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="rounded-lg bg-white/20 p-2 hover:bg-white/30 transition cursor-pointer text-white"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>

                <span className="text-xs font-mono font-semibold text-white/80 hidden sm:inline">
                  AI Vocal Coaching & Real-Time Corrections
                </span>
              </div>

              <button
                type="button"
                onClick={toggleFullScreen}
                className="rounded-lg bg-white/20 p-2 hover:bg-white/30 transition cursor-pointer text-white"
                title="Full Screen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
