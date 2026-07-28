import { useState } from 'react';
import { FAQ_ITEMS } from './constants';
import { AnimatedSection, SectionIntro } from './AnimatedComponents';
import { ChevronDown } from 'lucide-react';

export function FAQSection() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  return (
    <section className="border-t border-border-soft bg-surface px-6 py-12 md:px-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <SectionIntro eyebrow="FAQ" title={<>Common questions.</>} align="center" />
        <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openQuestion === index;
            return (
              <AnimatedSection key={index} delay={index * 40}>
                <div className={`rounded border transition-colors ${isOpen ? 'border-primary bg-background' : 'border-border-soft bg-background'}`}>
                  <button onClick={() => setOpenQuestion(isOpen ? null : index)} className="flex w-full items-center justify-between p-5 text-left">
                    <span className="text-sm font-semibold text-foreground pr-4">{item.question}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-muted-copy transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-copy">{item.answer}</p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export default FAQSection;
