import { FEATURES } from './constants';
import { AnimatedCard, SectionIntro } from './AnimatedComponents';

export function FeatureSection() {
  return (
    <section className="border-t border-border-soft bg-background/40 px-6 py-12 md:px-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Skill Modules"
          title={<>Everything you need for engineering English excellence.</>}
          desc="Six specialized modules designed for real-world project communication and career growth."
          align="center"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedCard
                key={feature.title}
                delay={index * 50}
                className="p-6 bg-surface/90 backdrop-blur-xl border border-border-soft/80 shadow-xl rounded-2xl"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-copy font-medium">
                  {feature.desc}
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
