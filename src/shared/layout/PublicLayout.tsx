import { Outlet, Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/utils/cn';

const links = [
  { label: 'Product', href: '/#product' },
  { label: 'Access', href: '/pricing' },
  { label: 'For Teams', href: '/business' },
];

export const PublicLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="public-shell min-h-screen bg-white text-slate-950">
      <a
        href="#public-content"
        className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-[10px] bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-[10px] py-1 pr-2 transition-colors hover:bg-slate-50"
            aria-label="EngineerOS home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-slate-900 text-sm font-black text-white">
              EO
            </span>
            <span>
              <strong className="block text-sm text-slate-950">
                EngineerOS
              </strong>
              <span className="hidden text-[10px] font-semibold uppercase text-slate-500 sm:block">
                Engineering Communication OS
              </span>
            </span>
          </Link>
          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Public navigation"
          >
            {links.map((item) =>
              item.href.startsWith('/#') ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-[10px] px-2 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'rounded-[10px] px-2 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700',
                      isActive && 'bg-sky-50 text-sky-700'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="inline-flex min-h-10 items-center rounded-[10px] px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              to="/start"
              className="public-primary-action min-h-10 px-4 py-2"
            >
              Start free
            </Link>
          </div>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-slate-200 bg-white text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 md:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
        {mobileOpen && (
          <nav
            className="border-t border-slate-200 bg-white px-4 py-4 md:hidden"
            aria-label="Mobile public navigation"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {links.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-[10px] px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4">
                <Link to="/login" className="public-secondary-action px-4 py-3">
                  Log in
                </Link>
                <Link to="/start" className="public-primary-action px-4 py-3">
                  Start free
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>
      <div id="public-content" tabIndex={-1}>
        <Outlet />
      </div>
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto_auto] lg:px-8">
          <div>
            <p className="font-bold text-slate-900">EngineerOS</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Engineering communication practice for international construction
              projects.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-bold text-slate-900">Product</p>
            <Link
              className="block text-slate-600 hover:text-sky-700"
              to="/pricing"
            >
              Access
            </Link>
            <Link
              className="block text-slate-600 hover:text-sky-700"
              to="/business"
            >
              For teams
            </Link>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-bold text-slate-900">Legal</p>
            <Link
              className="block text-slate-600 hover:text-sky-700"
              to="/legal/privacy"
            >
              Privacy
            </Link>
            <Link
              className="block text-slate-600 hover:text-sky-700"
              to="/legal/terms"
            >
              Terms
            </Link>
            <Link
              className="block text-slate-600 hover:text-sky-700"
              to="/legal/cookies"
            >
              Cookies
            </Link>
            <Link
              className="block text-slate-600 hover:text-sky-700"
              to="/legal/refund"
            >
              Refunds
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
