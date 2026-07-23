import { WORKFLOW } from './constants';
import { AnimatedCard, SectionIntro } from './AnimatedComponents';

export function WorkflowSection() {
  return (
    <section className="border-t border-border-soft bg-background bg-[linear-gradient(to_right,#8080800b_1px,transparent_1px),linear-gradient(to_bottom,#8080800b_1px,transparent_1px)] bg-[size:24px_24px] px-6 py-12 md:px-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Workflow"
          title={<>Define, compose and improve through one guided loop.</>}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {WORKFLOW.map((item, index) => (
            <AnimatedCard key={item.title} delay={index * 60} className="p-4">
              <div className="relative z-10 overflow-hidden rounded-xl border border-border-soft bg-[#111]">
                <img
                  src={item.image}
                  alt=""
                  className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <div className="relative z-10 pt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-primary font-mono">
                  {item.kicker}
                </div>
                <h3 className="mt-2 text-base font-bold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-copy font-medium">
                  {item.desc}
                </p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
