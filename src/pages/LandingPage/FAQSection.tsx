import { ChevronDown } from 'lucide-react';

import { useState } from 'react';

import { AnimatedSection } from './AnimatedComponents';
import { FAQ_ITEMS } from './constants';

export function FAQSection() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="border-t border-border-soft bg-surface px-6 py-8 md:px-12 md:py-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Single Row Compact Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              FAQ
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Common questions.
            </h2>
          </div>
          <p className="text-xs text-foreground/80 font-medium max-w-xl leading-tight">
            Clear answers regarding plans, AI coaching, engineering disciplines, and offline usage.
          </p>
        </div>

        {/* Compact 2-Column Accordion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openQuestion === index;
            return (
              <AnimatedSection key={index} delay={index * 30}>
                <div
                  className={`rounded-lg border transition-all ${
                    isOpen
                      ? 'border-primary/60 bg-background shadow-md'
                      : 'border-border-soft bg-background hover:border-primary/30'
                  }`}
                >
                  <button
                    onClick={() => setOpenQuestion(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="flex w-full items-center justify-between p-4 text-left cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-foreground pr-3 leading-snug">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <p className="border-t border-border-soft/60 px-4 py-3 text-xs font-medium text-foreground/85 leading-normal">
                      {item.answer}
                    </p>
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
