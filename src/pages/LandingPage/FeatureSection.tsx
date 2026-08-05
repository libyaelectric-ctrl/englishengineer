import { useLocalizationStore } from '@/features/localization';

import { AnimatedCard } from './AnimatedComponents';
import { FEATURES } from './constants';

export function FeatureSection() {
  const translate = useLocalizationStore((s) => s.translate);

  return (
    <section
      id="features"
      className="bg-background px-6 py-7 md:px-12 md:py-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Single Row Compact Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {translate('landing.features')}
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              {translate('landing.featuresHeader')}
            </h2>
          </div>
          <p className="text-xs text-foreground/80 font-medium max-w-xl leading-tight">
            {translate('landing.featuresSubheader')}
          </p>
        </div>

        {/* Compact 6-Module Grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedCard
                key={feature.titleKey}
                delay={index * 40}
                className="p-4 bg-surface border border-border-soft shadow-sm rounded-lg hover:border-primary/50 transition-all light-sweep-container group hover:scale-[1.01] hover:shadow-md"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-soft text-primary border border-border-soft shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground leading-tight">
                    {translate(feature.titleKey)}
                  </h3>
                </div>
                <p className="text-xs font-medium leading-relaxed text-foreground/85">
                  {translate(feature.descKey)}
                </p>
              </AnimatedCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
