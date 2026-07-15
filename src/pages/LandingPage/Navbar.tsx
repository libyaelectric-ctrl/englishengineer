import { Link } from 'react-router-dom';
import { APP_VERSION } from './constants';

export function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-4xl items-center justify-between rounded-2xl border border-black/[0.07] bg-[#f6f4ee]/80 px-6 py-4 shadow-[0_16px_60px_rgba(17,17,17,0.10)] backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-1.5 text-sm font-bold uppercase text-black/70">
          EngVox
          <span className="text-[9px] font-medium text-black/40">v{APP_VERSION}</span>
        </Link>
        <div className="hidden items-center gap-7 text-[11px] font-medium text-muted-copy md:flex">
          <Link to="/pricing" className="transition-colors hover:text-black">
            Pricing
          </Link>
        </div>
        <Link
          to="/login"
          className="rounded-xl border border-black/10 px-5 py-2.5 text-xs font-semibold uppercase text-black/60 transition hover:bg-black/[0.04]"
        >
          Start free
        </Link>
      </div>
    </nav>
  );
}
