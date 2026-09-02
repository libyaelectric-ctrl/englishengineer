import { PRODUCT_VERSION } from '@/config/product.config';

import { Link } from 'react-router-dom';

import { useLocalizationStore } from '@/features/localization';

export function Footer({ className = '' }: { className?: string }) {
  const { translate } = useLocalizationStore();
  return (
    <footer className={`border-t border-border-soft bg-background px-4 sm:px-6 py-2 md:py-3 md:px-12 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] ${className}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex h-6 w-6 items-center justify-center rounded shadow-sm overflow-hidden">
              <img
                src="/brand/logo.svg"
                alt="EngVox Logo"
                className="h-full w-full object-cover"
                width="48"
                height="48"
              />
            </div>
            <span className="text-xs font-bold text-foreground">EngVox</span>
            <span className="rounded bg-soft px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-primary font-mono border border-border-soft">
              v{PRODUCT_VERSION}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 text-[11px] sm:text-xs font-medium text-foreground/80">
            <Link to="/pricing" className="hover:text-primary transition-colors">
              {translate('landing.navPricing')}
            </Link>
            <Link to="/legal/privacy" className="hover:text-primary transition-colors">
              {translate('common.privacy')}
            </Link>
            <Link to="/legal/terms" className="hover:text-primary transition-colors">
              {translate('common.terms')}
            </Link>
            <Link to="/business" className="hover:text-primary transition-colors">
              {translate('common.contact')}
            </Link>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-copy font-medium">
            © {new Date().getFullYear()} EngVox. {translate('common.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
