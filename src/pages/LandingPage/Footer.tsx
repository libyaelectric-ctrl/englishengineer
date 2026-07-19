import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border-soft bg-surface px-6 py-8 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-foreground md:flex-row">
        <span className="text-muted-copy">
          Copyright 2026 EngVox. All rights reserved.
        </span>
        <div className="flex gap-6">
          <Link
            to="/legal/privacy"
            className="text-muted-copy transition hover:text-foreground opacity-70"
          >
            Privacy
          </Link>
          <Link
            to="/legal/terms"
            className="text-muted-copy transition hover:text-foreground opacity-70"
          >
            Terms
          </Link>
          <Link
            to="/legal/cookies"
            className="text-muted-copy transition hover:text-foreground opacity-70"
          >
            Cookies
          </Link>
          <Link
            to="/admin"
            className="text-muted-copy transition hover:text-foreground opacity-70"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
