import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';

import { useMemo, useState } from 'react';

import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';

import type { AdminUserRecord } from '@/features/admin';

const PAGE_SIZE = 10;

interface UsersTabProps {
  users: AdminUserRecord[];
  onPromote: (id: string) => void;
  isLoading: boolean;
}

export const UsersTab = ({ users, onPromote, isLoading }: UsersTabProps) => {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.discipline.toLowerCase().includes(q);
      const matchesPlan = planFilter === 'all' || u.plan === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [users, search, planFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const uniquePlans = useMemo(() => {
    const plans = new Set(users.map((u) => u.plan));
    return Array.from(plans).sort();
  }, [users]);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePlanFilterChange = (value: string) => {
    setPlanFilter(value);
    setPage(1);
  };

  return (
    <SectionCard title="Active User Management" icon={Search}>
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-copy" />
          <input
            type="text"
            placeholder="Search by name, email, or discipline..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-[4px] border border-border-soft bg-surface pl-8 pr-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/15 transition-all shadow-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-copy pointer-events-none" />
          <select
            value={planFilter}
            onChange={(e) => handlePlanFilterChange(e.target.value)}
            className="appearance-none rounded-[4px] border border-border-soft bg-surface pl-8 pr-6 py-2 text-xs font-bold text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/15 transition-all shadow-sm cursor-pointer"
          >
            <option value="all">All Plans</option>
            {uniquePlans.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy whitespace-nowrap self-center">
          {filtered.length} of {users.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-copy">Loading users...</div>
        ) : paged.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-copy">
            {users.length === 0 ? 'No users found.' : 'No users match your filters.'}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-soft text-[10px] uppercase font-bold text-muted-copy">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4">CEFR Level</th>
                <th className="py-3 px-4">Plan Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border-soft hover:bg-surface-hover/30 text-xs"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-foreground">{u.name}</p>
                    <p className="text-[10px] text-muted-copy">{u.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-muted-copy">{u.discipline}</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-bold text-primary">
                      {u.level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`rounded px-1.5 py-0.5 font-semibold text-[10px] ${
                        u.plan.includes('senior')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-surface-hover text-muted-copy'
                      }`}
                    >
                      {u.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      className="min-h-11 px-2.5 text-[11px]"
                      onClick={() => onPromote(u.id)}
                    >
                      Toggle Plan
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border-soft mt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              className="min-h-11 px-2.5 text-[11px]"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, and nearby pages
                if (p === 1 || p === totalPages) return true;
                return Math.abs(p - safePage) <= 1;
              })
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                  acc.push('ellipsis');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-1 text-[10px] text-muted-copy">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`min-h-11 min-w-[32px] rounded-[4px] px-2 text-[11px] font-bold transition-all cursor-pointer ${
                      item === safePage
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border-soft bg-surface text-foreground hover:bg-surface-hover'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <Button
              variant="ghost"
              className="min-h-11 px-2.5 text-[11px]"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
};
