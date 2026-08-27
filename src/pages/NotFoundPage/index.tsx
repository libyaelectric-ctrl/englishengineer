import { Home, Search, ShieldAlert } from 'lucide-react';

import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/shared/components/Button';

const SUGGESTED_LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Vocabulary', to: '/vocabulary' },
  { label: 'Grammar', to: '/grammar' },
  { label: 'Reading', to: '/reading' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Learning Path', to: '/learning-path' },
];

const NotFoundPage = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.trim().toLowerCase();
    // Try to match suggested links
    const match = SUGGESTED_LINKS.find((l) => l.label.toLowerCase().includes(q));
    if (match) {
      navigate(match.to);
    } else if (q.includes('vocab') || q.includes('word')) {
      navigate('/vocabulary');
    } else if (q.includes('grammar')) {
      navigate('/grammar');
    } else if (q.includes('read')) {
      navigate('/reading');
    } else if (q.includes('writ')) {
      navigate('/writing');
    } else if (q.includes('listen')) {
      navigate('/listening');
    } else if (q.includes('speak')) {
      navigate('/speaking');
    } else if (q.includes('price') || q.includes('plan')) {
      navigate('/pricing');
    } else if (q.includes('profile')) {
      navigate('/profile');
    } else if (q.includes('progress')) {
      navigate('/progress');
    } else if (q.includes('team')) {
      navigate('/team');
    } else if (q.includes('bill')) {
      navigate('/billing');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="p-6 bg-surface-hover rounded-[var(--radius-card)] mb-8 text-muted-copy">
        <ShieldAlert className="h-16 w-16" />
      </div>
      <h1 className="text-4xl sm:text-6xl font-medium tracking-tighter">404</h1>
      <p className="text-muted-copy mt-4 max-w-md text-lg">
        This page doesn't exist or has been moved. Let's get you back on track.
      </p>

      {/* Search suggestion */}
      <form onSubmit={handleSearch} className="mt-8 w-full max-w-sm">
        <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-border-soft bg-surface px-4 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-copy" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Where are you trying to go?"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-copy"
            aria-label="Search for a page"
          />
          <Button type="submit" size="sm" variant="ghost" className="min-h-8">
            Go
          </Button>
        </div>
      </form>

      {/* Quick links */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {SUGGESTED_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="inline-flex items-center gap-1 rounded-[4px] border border-border-soft bg-surface px-3 py-1.5 text-xs font-bold text-muted-copy transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Link to="/dashboard" className="mt-10">
        <Button variant="outline" className="gap-3 px-6 h-11 rounded-[var(--radius-card)]">
          <Home className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
