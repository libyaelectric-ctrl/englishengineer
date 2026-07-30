import { Link } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';
import { PRODUCT_VERSION } from '@/config/product.config';

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-border-soft glass py-3 shadow-sm">
      <div className="flex w-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex h-9 w-9 items-center justify-center rounded bg-primary p-0.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[2px] bg-primary-foreground">
              <Terminal className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">EngVox</span>
            <span className="rounded bg-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary font-mono border border-border-soft">v{PRODUCT_VERSION}</span>
          </div>
        </Link>
        <div className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-wider md:flex">
          <a href="#features" className="text-muted-copy hover:text-foreground transition-colors">Features</a>
          <a href="#disciplines" className="text-muted-copy hover:text-foreground transition-colors">Disciplines</a>
          <a href="#workflow" className="text-muted-copy hover:text-foreground transition-colors">Workflow</a>
          <a href="#pricing" className="text-muted-copy hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden text-xs font-semibold text-muted-copy hover:text-foreground transition-colors sm:inline">Log in</Link>
          <Link to="/signup" className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors">
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
