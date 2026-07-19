import { useState } from 'react';
import { FAQ_ITEMS } from './constants';
import { AnimatedSection, SectionIntro } from './AnimatedComponents';

export function FAQSection() {
  const [openQuestion, setOpenQuestion] = useState('');

  return (
    <section className="border-t border-border-soft bg-background px-6 py-12 md:px-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        <SectionIntro
          eyebrow="FAQ"
          title={<>Clear answers before you start.</>}
          align="center"
        />
        <AnimatedSection className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openQuestion === item.question;
            return (
              <div
                key={item.question}
                className="rounded-[4px] border border-border-soft bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.05)]"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-foreground cursor-pointer"
                  aria-expanded={isOpen}
                  onClick={() => setOpenQuestion(isOpen ? '' : item.question)}
                >
                  <span>{item.question}</span>
                  <span className="text-lg font-bold text-primary">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen ? (
                  <p className="px-5 pb-5 text-xs leading-relaxed text-muted-copy animate-in fade-in duration-200">
                    {item.answer}
                  </p>
                ) : null}
              </div>
            );
          })}
        </AnimatedSection>
      </div>
    </section>
  );
}
