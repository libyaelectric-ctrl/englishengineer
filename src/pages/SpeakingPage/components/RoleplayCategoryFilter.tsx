import { MessageSquareText } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import type { RoleplayFilter } from '../hooks/useSpeakingPage';

interface RoleplayCategoryFilterProps {
  roleplayFilters: RoleplayFilter[];
  roleplayFilter: RoleplayFilter;
  onFilterChange: (filter: RoleplayFilter) => void;
}

export const RoleplayCategoryFilter = ({
  roleplayFilters,
  roleplayFilter,
  onFilterChange,
}: RoleplayCategoryFilterProps) => (
  <SectionCard
    title="Roleplay Category"
    subtitle="Daily, workplace and engineering communication remain balanced"
    icon={MessageSquareText}
  >
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Speaking roleplay categories"
    >
      {roleplayFilters.map((category) => (
        <button
          key={category}
          type="button"
          role="tab"
          aria-selected={roleplayFilter === category}
          onClick={() => onFilterChange(category)}
          className={`min-h-9 rounded-[4px] border px-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            roleplayFilter === category
              ? 'border-[#0047bb] bg-[#0047bb]/10 text-foreground'
              : 'border-border-soft bg-surface text-muted-copy hover:border-[#0047bb]/30 hover:bg-[#0047bb]/5 hover:text-[#0047bb]'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </SectionCard>
);
