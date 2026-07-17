import { useState } from 'react';
import { FAQ_ITEMS } from './constants';
import { AnimatedSection, SectionIntro } from './AnimatedComponents';

export function FAQSection() {
  const [openQuestion, setOpenQuestion] = useState('');

  return (
    <section className="border-t border-black/[0.06] px-6 py-12 md:px-12 lg:py-16">
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
                className="rounded-xl border border-black/[0.08] bg-white/75"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-[#111]"
                  aria-expanded={isOpen}
                  onClick={() => setOpenQuestion(isOpen ? '' : item.question)}
                >
                  <span>{item.question}</span>
                  <span className="text-lg font-light text-black/45">
                    {isOpen ? '-' : '+'}
                  </span>
                </button>
                {isOpen ? (
                  <p className="px-5 pb-5 text-sm leading-6 text-muted-copy">
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
