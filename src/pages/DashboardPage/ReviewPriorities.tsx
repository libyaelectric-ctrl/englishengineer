import { Target } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';

import { useLocalizationStore } from '@/features/localization';

interface ReviewItem {
  id: string;
  label: string;
}

interface ReviewPrioritiesProps {
  reviewPriorities: ReviewItem[];
}

export const ReviewPriorities = ({ reviewPriorities }: ReviewPrioritiesProps) => {
  const navigate = useNavigate();
  const translate = useLocalizationStore((s) => s.translate);

  return (
    <SectionCard
      title={translate('dashboard.needsAttention')}
      subtitle={translate('dashboard.needsAttentionDesc')}
      icon={Target}
    >
      <div data-testid="dashboard-review-summary" className="grid gap-3 md:grid-cols-3">
        {reviewPriorities.length === 0 && (
          <p className="text-sm text-muted-copy col-span-3 text-center py-6">
            {translate('dashboard.noWeakAreas')}
          </p>
        )}
        {reviewPriorities.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate('/curriculum#review')}
            className="rounded-[4px] border border-border-soft bg-surface/60 p-4 text-left transition-all hover:border-primary/30 hover:bg-surface-hover cursor-pointer shadow-sm hover:shadow-md"
          >
            <StatusBadge
              label={
                index === 0
                  ? translate('dashboard.startHere')
                  : `${translate('dashboard.priority')} ${index + 1}`
              }
              tone={index === 0 ? 'warning' : 'neutral'}
            />
            <p className="mt-3 text-xs font-bold text-foreground">{item.label}</p>
          </button>
        ))}
      </div>
    </SectionCard>
  );
};
