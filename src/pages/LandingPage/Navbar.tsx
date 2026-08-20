import { Moon, Sun } from 'lucide-react';

import { useLocation, useNavigate } from 'react-router-dom';

import { ClerkAuthControls } from '@/features/auth/ClerkAuthControls';
import { useLocalizationStore } from '@/features/localization';
import { useTheme } from '@/features/theme/ThemeProvider';

interface NavbarProps {
  onDemoClick?: () => void;
  onOpenProofreader?: () => void;
}

export function Navbar({ onDemoClick, onOpenProofreader: _ }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const { translate } = useLocalizationStore();

  const handleDemoClick = () => {
    if (onDemoClick) {
      onDemoClick();
      return;
    }
    navigate('/signup');
  };

  return (
    <div className="flex items-center gap-2" id="navbar-right-content">
      {/* Try Demo Button */}
      <button
        type="button"
        onClick={handleDemoClick}
        className="inline-flex items-center rounded border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer hidden sm:inline-flex"
      >
        {translate('landing.tryDemo')}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-border-soft bg-background text-muted-copy hover:text-foreground transition-colors cursor-pointer"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-amber-500" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      {!isAuthPage && <ClerkAuthControls />}
    </div>
  );
}

export default Navbar;
