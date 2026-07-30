import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border-soft bg-background px-6 py-12 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary"><Terminal className="h-4 w-4 text-primary-foreground" /></div>
            <span className="text-sm font-bold text-foreground">EngVox</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium text-muted-copy">
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/business" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-muted-copy">© {new Date().getFullYear()} EngVox. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
