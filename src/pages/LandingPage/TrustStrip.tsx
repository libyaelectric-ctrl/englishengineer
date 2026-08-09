import { Brain } from 'lucide-react';

import { useLocalizationStore } from '@/features/localization';

export function TrustStrip() {
  const language = useLocalizationStore((s) => s.language);
  const isTr = language === 'tr';

  return (
    <section className="bg-background px-4 sm:px-6 py-1.5">
      <div className="mx-auto max-w-7xl flex justify-center">
        <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-border-soft bg-surface px-3 py-1 shadow-sm">
          <Brain className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-extrabold text-foreground leading-none">
            {isTr ? '14.000+' : '14,000+'}
          </span>
          <span className="text-[11px] font-medium text-foreground/65 leading-none">
            {isTr ? 'Teknik Terim' : 'Technical Terms'}
          </span>
        </div>
      </div>
    </section>
  );
}

export default TrustStrip;
