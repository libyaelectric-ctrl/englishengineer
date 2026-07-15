import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-[#ece9df] px-6 py-8 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-muted-copy md:flex-row">
        <span>Copyright 2026 EngVox. All rights reserved.</span>
        <div className="flex gap-6">
          <Link to="/legal/privacy" className="transition hover:text-black">
            Privacy
          </Link>
          <Link to="/legal/terms" className="transition hover:text-black">
            Terms
          </Link>
          <Link to="/legal/cookies" className="transition hover:text-black">
            Cookies
          </Link>
          <Link to="/admin" className="transition hover:text-black opacity-40">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
