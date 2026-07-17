import { Link } from 'react-router-dom';
import { APP_VERSION } from './constants';

export function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-[#d9d9e3] bg-[#faf8ff]/80 py-4 backdrop-blur-xl">
      <div className="flex w-full max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-black uppercase text-black/70 tracking-tight"
        >
          EngVox
          <span className="text-[9px] font-medium text-black/40">
            v{APP_VERSION}
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-wider text-muted-copy md:flex">
          <Link to="/pricing" className="transition-colors hover:text-black">
            Pricing
          </Link>
        </div>
        <Link
          to="/login"
          className="rounded-[4px] border border-black/10 px-5 py-2.5 text-xs font-bold uppercase text-black/60 transition hover:bg-black/[0.04]"
        >
          Start free
        </Link>
      </div>
    </nav>
  );
}
