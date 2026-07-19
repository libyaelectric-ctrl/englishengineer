import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-[#d9d9e3] bg-[#f0f0f5] px-6 py-8 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-foreground md:flex-row">
        <span>Copyright 2026 EngVox. All rights reserved.</span>
        <div className="flex gap-6">
          <Link to="/legal/privacy" className="transition hover:text-black opacity-70">
            Privacy
          </Link>
          <Link to="/legal/terms" className="transition hover:text-black opacity-70">
            Terms
          </Link>
          <Link to="/legal/cookies" className="transition hover:text-black opacity-70">
            Cookies
          </Link>
          <Link to="/admin" className="transition hover:text-black opacity-70">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
