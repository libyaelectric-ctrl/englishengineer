import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-border-soft/80 bg-surface/90 backdrop-blur-2xl py-3.5 shadow-md">
      <div className="flex w-full max-w-7xl items-center justify-between px-6">
        {/* Crisp High-Contrast Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-blue-600 to-cyan-500 p-0.5 shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background">
              <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-foreground group-hover:text-primary transition-colors font-sans">
              EngVox
            </span>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary font-mono shadow-inner">
              v1.4.1
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden items-center gap-4 text-xs font-extrabold uppercase tracking-wider md:flex">
          <a
            href="/#disciplines"
            className="rounded-xl border border-border-soft/80 bg-background/50 px-4 py-2 text-foreground/90 transition hover:bg-surface-hover hover:border-primary/50 hover:text-foreground shadow-sm"
          >
            Engineering Tracks
          </a>
          <Link
            to="/pricing"
            className="rounded-xl border border-border-soft/80 bg-background/50 px-4 py-2 text-foreground/90 transition hover:bg-surface-hover hover:border-primary/50 hover:text-foreground shadow-sm"
          >
            Pricing & Plans
          </Link>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover shadow-md shadow-primary/20 cursor-pointer"
          >
            <span>Start free</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
