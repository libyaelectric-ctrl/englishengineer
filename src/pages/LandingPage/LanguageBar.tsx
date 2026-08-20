import { ChevronDown, Globe } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { INTERFACE_LANGUAGES } from '@/features/localization';
import { useLocalizationStore } from '@/features/localization';

interface LanguageBarProps {
  className?: string;
}

export const LanguageBar = ({ className = '' }: LanguageBarProps) => {
  const { language, setLanguage } = useLocalizationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = INTERFACE_LANGUAGES.find((l) => l.id === language) || INTERFACE_LANGUAGES[0];

  return (
    <div className={`relative ${className}`}>
      {/* Fixed top language bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-10">
            {/* Left: Language selector with dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-[var(--radius-card)] border border-border-soft bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Select language"
              >
                <Globe className="h-4 w-4" />
                <span className="font-medium">
                  {currentLang.flag} {currentLang.label}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-1 w-48 origin-top-right rounded-[var(--radius-card)] border border-border-soft bg-background shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95">
                  <ul className="py-1" role="listbox">
                    {INTERFACE_LANGUAGES.map((lang) => (
                      <li key={lang.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={language === lang.id}
                          onClick={() => {
                            setLanguage(lang.id);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                            language === lang.id
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-surface'
                          }`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <span className="font-medium">{lang.nativeLabel}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {lang.label}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Theme toggle + Auth (placeholder for Navbar to use) */}
            <div className="flex items-center gap-2" id="navbar-right-slot" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageBar;
