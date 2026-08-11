import React from 'react';
import { Gem, Heart, Flame, Zap, Shield, Check } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export const EngDuaShop: React.FC = () => {
  const { gems, hearts, maxHearts, addGems, refillHearts } = useGameStore();

  const handleBuyHearts = () => {
    if (gems < 50) {
      alert('Yetersiz elmas! Ders tamamlayarak elmas kazanın.');
      return;
    }
    if (hearts >= maxHearts) {
      alert('Canlarınız zaten tam!');
      return;
    }
    addGems(-50);
    refillHearts();
    alert('❤️ Canlarınız fulleme yapıldı!');
  };

  const handleBuyStreakFreeze = () => {
    if (gems < 100) {
      alert('Yetersiz elmas! 100 💎 gerekli.');
      return;
    }
    addGems(-100);
    alert('🔥 Seri Dondurucu aktif edildi! Bir gün ders kaçırsanız dahi seriniz korunur.');
  };

  const handleBuyXpBoost = () => {
    if (gems < 80) {
      alert('Yetersiz elmas! 80 💎 gerekli.');
      return;
    }
    addGems(-80);
    alert('⚡ 2x XP Takviyesi aktif edildi! Sonraki 3 derste çift XP kazanırsınız.');
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--color-border-soft)] rounded-3xl p-6 shadow-xl space-y-6">
      {/* Shop Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] pb-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--foreground)]">Mühendis Mağazası 🛒</h2>
          <p className="text-xs text-[var(--color-muted-copy)]">Elmaslarınızı güçlendirmeler ve özel rozetler için kullanın.</p>
        </div>
        <div className="flex items-center gap-2 bg-sky-500/10 px-4 py-2 rounded-full border border-sky-500/30">
          <Gem className="h-6 w-6 text-sky-500 fill-sky-500" />
          <span className="font-black text-lg text-sky-600 dark:text-sky-400">{gems} 💎</span>
        </div>
      </div>

      {/* Shop Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Item 1: Heart Refill */}
        <div className="p-5 rounded-2xl bg-[var(--background)] border border-[var(--color-border-soft)] flex flex-col justify-between gap-4 hover:border-rose-500/50 transition-all shadow-sm">
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 w-fit">
              <Heart className="h-7 w-7 fill-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">Can Deposu</h3>
            <p className="text-xs text-[var(--color-muted-copy)]">Tüm canlarınızı anında doldurun (5/5 ❤️).</p>
          </div>
          <button
            onClick={handleBuyHearts}
            className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow transition-transform active:scale-95"
          >
            <span>50 💎 Al</span>
          </button>
        </div>

        {/* Item 2: Streak Freeze */}
        <div className="p-5 rounded-2xl bg-[var(--background)] border border-[var(--color-border-soft)] flex flex-col justify-between gap-4 hover:border-amber-500/50 transition-all shadow-sm">
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 w-fit">
              <Flame className="h-7 w-7 fill-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">Seri Dondurucu</h3>
            <p className="text-xs text-[var(--color-muted-copy)]">Bir gün girmeseniz dahi gün serinizi sıfırlanmaktan korur.</p>
          </div>
          <button
            onClick={handleBuyStreakFreeze}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow transition-transform active:scale-95"
          >
            <span>100 💎 Al</span>
          </button>
        </div>

        {/* Item 3: 2x XP Boost */}
        <div className="p-5 rounded-2xl bg-[var(--background)] border border-[var(--color-border-soft)] flex flex-col justify-between gap-4 hover:border-purple-500/50 transition-all shadow-sm">
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 w-fit">
              <Zap className="h-7 w-7 fill-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">2x XP Takviyesi</h3>
            <p className="text-xs text-[var(--color-muted-copy)]">Sonraki 3 derste kazanılan tüm XP miktarlarını ikiye katlar.</p>
          </div>
          <button
            onClick={handleBuyXpBoost}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow transition-transform active:scale-95"
          >
            <span>80 💎 Al</span>
          </button>
        </div>
      </div>
    </div>
  );
};
