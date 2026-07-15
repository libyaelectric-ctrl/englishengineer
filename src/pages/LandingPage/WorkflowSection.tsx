import { WORKFLOW } from './constants';
import { AnimatedCard, SectionIntro } from './AnimatedComponents';

export function WorkflowSection() {
  return (
    <section className="border-t border-black/[0.06] px-6 py-10 md:px-12 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Workflow"
          title={<>Define, compose and improve through one guided loop.</>}
        />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {WORKFLOW.map((item, index) => (
            <AnimatedCard key={item.title} delay={index * 60} className="p-3">
              <div className="relative z-10 overflow-hidden rounded-lg border border-black/[0.06] bg-[#111]">
                <img
                  src={item.image}
                  alt=""
                  className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <div className="relative z-10 p-3">
                <div className="text-[10px] font-medium uppercase text-black/38">
                  {item.kicker}
                </div>
                <h3 className="mt-1.5 text-base font-light leading-tight">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[11px] leading-4 text-muted-copy">
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
