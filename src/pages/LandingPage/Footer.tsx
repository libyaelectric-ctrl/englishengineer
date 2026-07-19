import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-[#E9ECEF] bg-white px-6 py-8 md:px-12 dark:bg-[#0B0E14] dark:border-[#2a2d35]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs md:flex-row dark:text-[#949BA4]">
        <span className="text-[#5b5d72]">Copyright 2026 EngVox. All rights reserved.</span>
        <div className="flex gap-6">
          <Link to="/legal/privacy" className="text-[#5b5d72] transition hover:text-[#1c1d22] dark:hover:text-[#E2E4E7] opacity-70">
            Privacy
          </Link>
          <Link to="/legal/terms" className="text-[#5b5d72] transition hover:text-[#1c1d22] dark:hover:text-[#E2E4E7] opacity-70">
            Terms
          </Link>
          <Link to="/legal/cookies" className="text-[#5b5d72] transition hover:text-[#1c1d22] dark:hover:text-[#E2E4E7] opacity-70">
            Cookies
          </Link>
          <Link to="/admin" className="text-[#5b5d72] transition hover:text-[#1c1d22] dark:hover:text-[#E2E4E7] opacity-70">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
