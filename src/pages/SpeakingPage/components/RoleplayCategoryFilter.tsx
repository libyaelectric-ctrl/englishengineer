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
          className={`min-h-11 rounded-lg border px-4 text-sm font-medium transition-colors ${
            roleplayFilter === category
              ? 'border-primary bg-primary/10 text-foreground'
              : 'border-border-soft bg-surface text-muted-copy hover:border-primary/30 hover:bg-surface-hover'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </SectionCard>
);
