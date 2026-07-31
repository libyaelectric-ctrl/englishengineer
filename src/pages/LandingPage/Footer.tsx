import { PRODUCT_VERSION } from '@/config/product.config';

import { Link } from 'react-router-dom';

export function Footer({ className = '' }: { className?: string }) {
  return (
    <footer className={`border-t border-border-soft bg-background px-6 py-3 md:px-12 ${className}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded shadow-sm overflow-hidden">
              <img
                src="/brand/logo.webp"
                alt="EngVox Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">EngVox</span>
              <span className="rounded bg-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary font-mono border border-border-soft">
                v{PRODUCT_VERSION}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium text-foreground/80">
            <Link to="/legal/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/legal/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/business" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
          <p className="text-xs text-muted-copy font-medium">
            © {new Date().getFullYear()} EngVox. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
