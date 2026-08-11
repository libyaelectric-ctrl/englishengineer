import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Flame,
  Star,
  Lock,
  Play,
  Heart,
  Gem,
  Building2,
  Zap,
  Wrench,
  Code2,
  FlaskConical,
  HardHat,
  Cpu,
  ShieldCheck,
  Factory,
  Bot,
  RefreshCw,
  ShoppingBag,
  ShieldAlert,
  Map,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/features/auth';
import {
  ENGINEERING_DISCIPLINES,
  DISCIPLINE_META,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';
import { generateDuolingoUnits } from '@/features/gamification/services/duolingo-curriculum.generator';
import { EngDuaLeague } from '@/features/gamification/components/EngDuaLeague';
import { EngDuaShop } from '@/features/gamification/components/EngDuaShop';
import { EngineeringDiagnosticLab } from '@/features/gamification/components/EngineeringDiagnosticLab';

const DISCIPLINE_ICONS: Record<EngineeringDiscipline, React.ElementType> = {
  architecture: Building2,
  chemical: FlaskConical,
  civil: HardHat,
  electrical: Zap,
  electronics: Cpu,
  hse: ShieldCheck,
  industrial: Factory,
  mechanical: Wrench,
  mechatronics: Bot,
  software: Code2,
};

type ActiveTab = 'path' | 'lab' | 'league' | 'shop';

export const LearningPathPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const { hearts, xp, streak, gems, completedLevelIds, levelStars, refillHearts } = useGameStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('path');
  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline>(
    (currentUser?.engineeringDiscipline as EngineeringDiscipline) || 'civil'
  );

  const units = generateDuolingoUnits(selectedDiscipline);

  const handleStartLevel = (levelId: string, isLocked: boolean) => {
    if (isLocked) return;
    if (hearts <= 0) {
      alert('Canınız tükendi! Lütfen mağazadan can yenileyin veya bekleyin.');
      return;
    }
    navigate(`/lesson/${levelId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-16">
      {/* Top HUD Header Bar */}
      <header className="sticky top-0 z-30 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--color-border-soft)] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <span className="font-extrabold text-lg text-[var(--foreground)] tracking-tight">EngDua</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Streak */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20" title="Seri Gün">
              <Flame className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse" />
              <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{streak} Gün</span>
            </div>

            {/* Gems */}
            <button
              onClick={() => setActiveTab('shop')}
              className="flex items-center gap-1.5 bg-sky-500/10 px-3 py-1.5 rounded-full border border-sky-500/20 hover:scale-105 transition-transform"
              title="Elmaslar / Mağaza"
            >
              <Gem className="h-5 w-5 text-sky-500 fill-sky-500" />
              <span className="font-black text-sky-600 dark:text-sky-400 text-sm">{gems}</span>
            </button>

            {/* XP */}
            <div className="flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20" title="Toplam XP">
              <span className="font-black text-purple-600 dark:text-purple-400 text-sm">⚡ {xp} XP</span>
            </div>

            {/* Hearts */}
            <div className="flex items-center gap-1.5 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
              <Heart className={`h-5 w-5 text-rose-500 fill-rose-500 ${hearts === 0 ? 'animate-bounce' : ''}`} />
              <span className="font-black text-rose-600 dark:text-rose-400 text-sm">{hearts}</span>
              {hearts === 0 && (
                <button
                  onClick={refillHearts}
                  className="ml-1 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-transform active:scale-95"
                  title="Canları Yenile"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <nav className="bg-[var(--surface)] border-b border-[var(--color-border-soft)]">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('path')}
            className={`py-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'path'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-[var(--color-muted-copy)] hover:text-[var(--foreground)]'
            }`}
          >
            <Map className="h-4 w-4" />
            <span>Yol Haritası</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`py-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'lab'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-[var(--color-muted-copy)] hover:text-[var(--foreground)]'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Teşhis Labı 🔬</span>
          </button>

          <button
            onClick={() => setActiveTab('league')}
            className={`py-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'league'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-[var(--color-muted-copy)] hover:text-[var(--foreground)]'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Ligler 🏆</span>
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`py-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'shop'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-[var(--color-muted-copy)] hover:text-[var(--foreground)]'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Mağaza 🛒</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-6">
        {/* TAB 1: Visual Learning Path */}
        {activeTab === 'path' && (
          <div className="space-y-8">
            {/* Engineering Discipline Selector Bar */}
            <section className="bg-[var(--surface)] border border-[var(--color-border-soft)] rounded-2xl p-4 shadow-sm">
              <label className="block text-xs font-black uppercase text-[var(--color-muted-copy)] mb-3 tracking-wider">
                Mühendislik Dalı Seçin (10 Branş)
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {ENGINEERING_DISCIPLINES.map((disc) => {
                  const IconComp = DISCIPLINE_ICONS[disc] || Building2;
                  const isSelected = selectedDiscipline === disc;
                  const meta = DISCIPLINE_META[disc];

                  return (
                    <button
                      key={disc}
                      onClick={() => setSelectedDiscipline(disc)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        isSelected
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md scale-105'
                          : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--color-border-soft)] hover:border-[var(--color-primary)]/40'
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                      <span>{meta ? disc.toUpperCase() : disc}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Units & Winding Path */}
            <div className="space-y-12">
              {units.map((unit, uIdx) => (
                <div key={unit.id} className="space-y-6">
                  {/* Unit Header Card */}
                  <div
                    className={`p-6 rounded-3xl bg-gradient-to-r ${unit.bgGradient} border-2 border-emerald-500/30 backdrop-blur-sm shadow-xl flex items-center justify-between gap-4`}
                  >
                    <div className="space-y-1">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-black text-white shadow-sm"
                        style={{ backgroundColor: unit.colorHex }}
                      >
                        ÜNİTE {unit.orderIndex}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                        {unit.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[var(--color-muted-copy)] font-medium">
                        {unit.description}
                      </p>
                    </div>
                    <div className="shrink-0 p-4 rounded-2xl bg-white/10 dark:bg-black/20 border border-white/20 shadow-inner">
                      <Trophy className="h-8 w-8 text-amber-400" />
                    </div>
                  </div>

                  {/* Duolingo Winding Path Nodes */}
                  <div className="flex flex-col items-center gap-6 py-4 relative">
                    {unit.levels.map((level, lIdx) => {
                      const isCompleted = completedLevelIds.includes(level.id);
                      const isUnlocked =
                        lIdx === 0 && uIdx === 0
                          ? true
                          : lIdx === 0
                          ? completedLevelIds.some((id) => id.startsWith(`unit_${selectedDiscipline}_${uIdx}`))
                          : completedLevelIds.includes(unit.levels[lIdx - 1].id);

                      const stars = levelStars[level.id] || 0;

                      const offsets = ['translate-x-0', 'translate-x-12', 'translate-x-0', '-translate-x-12'];
                      const offsetClass = offsets[lIdx % offsets.length];

                      return (
                        <div key={level.id} className={`flex flex-col items-center ${offsetClass} group`}>
                          <button
                            onClick={() => handleStartLevel(level.id, !isUnlocked)}
                            disabled={!isUnlocked}
                            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-black transition-all shadow-xl active:scale-95 ${
                              isCompleted
                                ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 ring-4 ring-amber-400/40 hover:scale-110'
                                : isUnlocked
                                ? 'bg-gradient-to-tr from-emerald-500 to-green-400 text-white ring-4 ring-emerald-500/40 animate-pulse hover:scale-110'
                                : 'bg-slate-700/50 text-slate-400 border-2 border-slate-600 cursor-not-allowed opacity-75'
                            }`}
                          >
                            {isCompleted ? (
                              <Star className="h-8 w-8 fill-amber-950" />
                            ) : isUnlocked ? (
                              <Play className="h-8 w-8 fill-white ml-1" />
                            ) : (
                              <Lock className="h-7 w-7" />
                            )}

                            <span className="text-[10px] uppercase font-black tracking-widest mt-0.5">
                              {level.orderIndex}. SEVİYE
                            </span>
                          </button>

                          <div className="mt-2 text-center max-w-[160px]">
                            <p className="text-xs font-bold text-[var(--foreground)] truncate">
                              {level.title}
                            </p>
                            {isCompleted && (
                              <div className="flex justify-center gap-0.5 mt-1">
                                {[1, 2, 3].map((starIdx) => (
                                  <Star
                                    key={starIdx}
                                    className={`h-3.5 w-3.5 ${
                                      starIdx <= stars
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-500'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Diagnostic Emergency Lab */}
        {activeTab === 'lab' && <EngineeringDiagnosticLab />}

        {/* TAB 3: Leagues */}
        {activeTab === 'league' && <EngDuaLeague />}

        {/* TAB 4: Shop */}
        {activeTab === 'shop' && <EngDuaShop />}
      </main>
    </div>
  );
};

export default LearningPathPage;
