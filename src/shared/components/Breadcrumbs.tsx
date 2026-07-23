import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ROUTE_NAME_MAP: Record<string, string> = {
  dashboard: 'Home',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  reading: 'Reading',
  writing: 'Writing',
  listening: 'Listening',
  speaking: 'Speaking',
  curriculum: 'Learning Hub',
  tools: 'Tools & AI Copilot',
  team: 'Team & Organization',
  profile: 'Profile & Settings',
  progress: 'Progress & Analytics',
  placement: 'Placement Test',
  billing: 'Billing & Subscriptions',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || location.pathname === '/') return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 py-2 text-xs text-muted-copy"
    >
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName =
          ROUTE_NAME_MAP[value] ||
          value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-copy/50" />
            {isLast ? (
              <span className="font-semibold text-foreground truncate">
                {displayName}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-foreground transition-colors capitalize"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
