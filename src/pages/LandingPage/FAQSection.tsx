import { useState } from 'react';
import { FAQ_ITEMS } from './constants';
import { AnimatedSection, SectionIntro } from './AnimatedComponents';

export function FAQSection() {
  const [openQuestion, setOpenQuestion] = useState('');

  return (
    <section className="border-t border-[#d9d9e3] bg-[#faf8ff] px-6 py-12 md:px-12 md:py-20 dark:bg-[#0B0E14] dark:border-[#2a2d35]">
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
                className="rounded-[4px] border border-[#d9d9e3] bg-white/60 shadow-sm dark:border-[#2a2d35] dark:bg-[#1C1F26]/60"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-[#111] cursor-pointer dark:text-[#E2E4E7]"
                  aria-expanded={isOpen}
                  onClick={() => setOpenQuestion(isOpen ? '' : item.question)}
                >
                  <span>{item.question}</span>
                  <span className="text-lg font-bold text-[#0047bb] dark:text-[#3b82f6]">
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
