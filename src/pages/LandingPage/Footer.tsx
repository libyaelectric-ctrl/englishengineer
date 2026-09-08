import { PRODUCT_VERSION } from '@/config/product.config';

import { Link } from 'react-router-dom';

import { useLocalizationStore } from '@/features/localization';

export function Footer({ className = '' }: { className?: string }) {
  const { translate } = useLocalizationStore();
  return (
    <footer className={`border-t border-white/10 px-3 py-2 sm:px-6 ${className}`} style={{ paddingBottom: 'max(0.45rem, env(safe-area-inset-bottom, 0px))' }}>
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-3 overflow-hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm ring-1 ring-white/15"><img src="/brand/logo.svg" alt="EngVox Logo" className="h-full w-full object-cover" width="48" height="48" /></div>
          <span className="hidden text-xs font-black text-white sm:inline">EngVox</span>
          <span className="rounded-md border border-cyan-200/20 bg-cyan-200/10 px-1.5 py-px text-[9px] font-black uppercase tracking-wider text-cyan-100 font-mono">v{PRODUCT_VERSION}</span>
        </div>
        <nav className="flex items-center gap-1 overflow-hidden text-[11px] font-bold text-white/68 sm:gap-3 sm:text-xs" aria-label="Footer navigation">
          <Link to="/pricing" className="inline-flex h-9 items-center px-2 transition-colors hover:text-cyan-100">{translate('landing.navPricing')}</Link>
          <Link to="/legal/privacy" className="hidden h-9 items-center px-2 transition-colors hover:text-cyan-100 sm:inline-flex">{translate('common.privacy')}</Link>
          <Link to="/legal/terms" className="hidden h-9 items-center px-2 transition-colors hover:text-cyan-100 sm:inline-flex">{translate('common.terms')}</Link>
          <Link to="/business" className="inline-flex h-9 items-center px-2 transition-colors hover:text-cyan-100">{translate('common.contact')}</Link>
        </nav>
        <p className="hidden shrink-0 text-[10px] font-semibold text-white/42 md:block">© {new Date().getFullYear()} EngVox</p>
      </div>
    </footer>
  );
}

export default Footer;
