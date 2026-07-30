import { AnimatedCard, SectionIntro } from './AnimatedComponents';
import { WORKFLOW } from './constants';

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="border-t border-border-soft bg-surface px-6 py-12 md:px-12 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Workflow"
          title={<>Define, compose and improve through one guided loop.</>}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {WORKFLOW.map((item, index) => (
            <AnimatedCard
              key={item.title}
              delay={index * 60}
              className="p-5 bg-background border border-border-soft shadow-sm rounded"
            >
              <div className="relative z-10 overflow-hidden rounded border border-border-soft bg-[#faf8ff]">
                <img
                  src={item.image}
                  alt=""
                  className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <div className="relative z-10 pt-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono">
                  {item.kicker}
                </div>
                <h3 className="mt-2 text-base font-bold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-copy">{item.desc}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
export default WorkflowSection;
