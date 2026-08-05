import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalizationStore } from '@/features/localization';
import { getLandingTranslations } from './landing-i18n';

interface Testimonial {
  name: string;
  role: string;
  discipline: string;
  quote: string;
  rating: number;
  metric: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Ahmet Y.',
    role: 'Site Engineer',
    discipline: 'Civil Engineering',
    quote: 'I went from struggling to write site reports to submitting them confidently in two months. The discipline-specific vocabulary changed everything.',
    rating: 5,
    metric: 'Band B1 → B2 in 8 weeks',
  },
  {
    name: 'Elena K.',
    role: 'Commissioning Engineer',
    discipline: 'Electrical Engineering',
    quote: 'Finally, an English tool that speaks my technical language. I can now lead commissioning meetings without a translator.',
    rating: 5,
    metric: 'First English-led commissioning in 3 weeks',
  },
  {
    name: 'Marco R.',
    role: 'QA/QC Coordinator',
    discipline: 'Industrial Engineering',
    quote: 'The daily streak keeps me consistent. I have not missed a day in 40 days. My NCR responses are now written entirely in English.',
    rating: 5,
    metric: '40-day streak · 120+ reports written',
  },
  {
    name: 'Priya S.',
    role: 'Design Engineer',
    discipline: 'Mechanical Engineering',
    quote: 'I selected Mechanical Engineering as my discipline and every word, every reading passage is relevant to my daily work. No generic content.',
    rating: 5,
    metric: '2,000+ discipline terms mastered',
  },
];

export const TestimonialsSection: React.FC = () => {
  const language = useLocalizationStore((s) => s.language);
  const t = getLandingTranslations(language);

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {t.testimonialsTitle ?? 'Engineers Like You Are Leveling Up'}
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            {t.testimonialsSub ?? 'Join thousands of engineers across 10 disciplines who transformed their professional English.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative p-6 lg:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-500/10 dark:text-blue-400/10" />

              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-sm lg:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role} · {testimonial.discipline}</p>
                </div>
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  {testimonial.metric}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};