import { ArrowRight, Check, Clock, Lock, X, Zap } from 'lucide-react';
import { motion } from 'motion/react';

import React, { useState } from 'react';

interface PlanTier {
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
  badge?: string;
  isPopular?: boolean;
  isComingSoon?: boolean;
  modules: {
    placement: boolean;
    learningHub: boolean;
    progress: boolean;
    vocabulary: boolean;
    grammar: boolean;
    translator: boolean;
    reading: boolean;
    writing: boolean;
    speaking: boolean;
    listening: boolean;
    tool: boolean;
    aiCopilot: boolean;
  };
}

const PLANS: PlanTier[] = [
  {
    id: 'junior',
    name: 'Junior',
    monthlyPrice: 29,
    description: 'Temel öğrenme çekirdeği. Kelime ve dilbilgisi üzerine odaklananlar için.',
    modules: {
      placement: true,
      learningHub: true,
      progress: true,
      vocabulary: true,
      grammar: true,
      translator: false,
      reading: false,
      writing: false,
      speaking: false,
      listening: false,
      tool: false,
      aiCopilot: false,
    },
  },
  {
    id: 'senior',
    name: 'Senior',
    monthlyPrice: 59,
    description: 'Junior + Okuma, Yazma ve Çeviri modülleri ile profesyonel dokümantasyon dili.',
    modules: {
      placement: true,
      learningHub: true,
      progress: true,
      vocabulary: true,
      grammar: true,
      translator: true,
      reading: true,
      writing: true,
      speaking: false,
      listening: false,
      tool: false,
      aiCopilot: false,
    },
  },
  {
    id: 'specialist',
    name: 'Specialist',
    monthlyPrice: 79,
    description:
      'Senior + Sesli Dinleme ve Konuşma modülleri ile uluslararası toplantılara hazırlık.',
    isPopular: true,
    badge: 'En Popüler',
    modules: {
      placement: true,
      learningHub: true,
      progress: true,
      vocabulary: true,
      grammar: true,
      translator: true,
      reading: true,
      writing: true,
      speaking: true,
      listening: true,
      tool: false,
      aiCopilot: false,
    },
  },
  {
    id: 'master',
    name: 'Master',
    monthlyPrice: 99,
    description: 'Tüm modüller + Tool ve Yapay Zeka AI Copilot ile tam erişim paketiniz.',
    badge: 'Sınırsız Güç',
    modules: {
      placement: true,
      learningHub: true,
      progress: true,
      vocabulary: true,
      grammar: true,
      translator: true,
      reading: true,
      writing: true,
      speaking: true,
      listening: true,
      tool: true,
      aiCopilot: true,
    },
  },
  {
    id: 'team',
    name: 'Team',
    monthlyPrice: 999,
    description: 'Kurumsal mühendislik ekipleri için özel dağıtım ve merkezi yönetim.',
    isComingSoon: true,
    badge: 'Coming Soon',
    modules: {
      placement: true,
      learningHub: true,
      progress: true,
      vocabulary: true,
      grammar: true,
      translator: true,
      reading: true,
      writing: true,
      speaking: true,
      listening: true,
      tool: true,
      aiCopilot: true,
    },
  },
];

const MODULE_NAMES: { key: keyof PlanTier['modules']; label: string }[] = [
  { key: 'placement', label: 'Placement CEFR Testi' },
  { key: 'learningHub', label: 'Learning Hub' },
  { key: 'progress', label: 'Progress & Streak Takibi' },
  { key: 'vocabulary', label: 'Sabit Kelime Havuzu (Vocabulary)' },
  { key: 'grammar', label: 'Grammar Modülü' },
  { key: 'translator', label: 'Teknik Translator' },
  { key: 'reading', label: 'Reading (Okuma Metinleri)' },
  { key: 'writing', label: 'Writing (Teknik Yazma)' },
  { key: 'speaking', label: 'Speaking (Konuşma Simülasyonu)' },
  { key: 'listening', label: 'Listening (Teknik Dinleme)' },
  { key: 'tool', label: 'Engineer Tools Access' },
  { key: 'aiCopilot', label: 'Yapay Zeka AI Copilot' },
];

export const WowPricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Şeffaf Fiyatlandırma</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            İhtiyacınız Olan Modülü Seçin, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              Sadece Kullandığınız Kadar Ödeyin
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Hangi paketi alırsanız alın, kilitlediğiniz **mühendislik dalı kelime havuzunuz
            sabittir.** Üst paketler yeni modülleri (Reading, Speaking, AI Copilot...) açar.
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="mt-10 inline-flex items-center gap-3 p-1.5 rounded-[var(--radius-card)] bg-slate-950 border border-slate-800 shadow-inner">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-[var(--radius-card)] text-xs sm:text-sm font-bold transition-all ${
                !isAnnual
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Aylık Ödeme
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-[var(--radius-card)] text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                isAnnual
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Yıllık Ödeme</span>
              <span className="px-2 py-0.5 rounded-[var(--radius-card)] bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                %25 İskonto
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {PLANS.map((plan) => {
            const finalPrice = isAnnual ? Math.round(plan.monthlyPrice * 0.75) : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`relative rounded-3xl p-6 bg-slate-950 border flex flex-col justify-between shadow-xl transition-all duration-300 ${
                  plan.isPopular
                    ? 'border-indigo-500/80 ring-2 ring-indigo-500/30 bg-slate-950'
                    : plan.isComingSoon
                      ? 'border-slate-800/80 opacity-75'
                      : 'border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Badge if Popular or Coming Soon */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  {/* Plan Name */}
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <p className="mt-2 text-xs text-slate-400 min-h-[36px] leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price Display */}
                  <div className="mt-6 flex items-baseline gap-1">
                    {plan.isComingSoon ? (
                      <span className="text-2xl font-bold text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-5 h-5 text-amber-400" /> Yakında
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-white">${finalPrice}</span>
                        <span className="text-xs text-slate-400 font-medium">/ ay</span>
                        {isAnnual && (
                          <span className="ml-1 text-[10px] line-through text-slate-400 font-mono">
                            ${plan.monthlyPrice}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {isAnnual && !plan.isComingSoon && (
                    <div className="mt-1 text-[10px] text-emerald-400 font-semibold">
                      Yıllık abonelikte otomatik %25 tasarruf!
                    </div>
                  )}

                  {/* Modules Checklist */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2.5">
                    {MODULE_NAMES.map((mod) => {
                      const isIncluded = plan.modules[mod.key];
                      return (
                        <div key={mod.key} className="flex items-center justify-between text-xs">
                          <span
                            className={
                              isIncluded
                                ? 'text-slate-200 font-medium'
                                : 'text-slate-400 line-through opacity-70'
                            }
                          >
                            {mod.label}
                          </span>
                          {isIncluded ? (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8">
                  {plan.isComingSoon ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-[var(--radius-card)] bg-slate-900 text-slate-400 font-semibold text-xs border border-slate-800 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" /> Bekleme Listesine Katıl
                    </button>
                  ) : (
                    <a
                      href={`/checkout?plan=${plan.id}&billing=${isAnnual ? 'annual' : 'monthly'}${isAnnual ? '&coupon=YEARLY25' : ''}`}
                      className={`w-full py-3 rounded-[var(--radius-card)] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
                      }`}
                    >
                      <span>{plan.name} Paketini Seç</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Note */}
        <div className="mt-12 text-center text-xs text-slate-400 max-w-xl mx-auto flex items-center justify-center gap-2">
          <span>
            🔒 256-bit SSL Şifreleme ile %100 Güvenli Ödeme • Dilediğiniz zaman tek tıkla iptal
            edebilirsiniz.
          </span>
        </div>
      </div>
    </section>
  );
};
