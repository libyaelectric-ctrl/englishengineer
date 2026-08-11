import React from 'react';
import { Trophy, Award, Crown, Shield, Flame, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export interface LeaderboardUser {
  rank: number;
  name: string;
  discipline: string;
  xp: number;
  streak: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export const EngDuaLeague: React.FC = () => {
  const { xp, streak } = useGameStore();

  const leagueName = xp >= 500 ? 'Elmas Mühendis Ligi' : xp >= 250 ? 'Altın Mühendis Ligi' : 'Gümüş Mühendis Ligi';
  const leagueColor = xp >= 500 ? 'from-cyan-500 to-blue-600' : xp >= 250 ? 'from-amber-400 to-yellow-500' : 'from-slate-400 to-slate-500';

  const mockLeaderboard: LeaderboardUser[] = [
    { rank: 1, name: 'Ahmet Y. (Kıdemli Mimar)', discipline: 'architecture', xp: 620, streak: 12, avatar: '🏗️' },
    { rank: 2, name: 'Sena K. (Yazılım Müh.)', discipline: 'software', xp: 540, streak: 9, avatar: '💻' },
    { rank: 3, name: 'Siz (Sen)', discipline: 'Mühendis', xp: Math.max(xp, 280), streak, avatar: '👷', isCurrentUser: true },
    { rank: 4, name: 'Caner T. (Elektrik Müh.)', discipline: 'electrical', xp: 240, streak: 5, avatar: '⚡' },
    { rank: 5, name: 'Zeynep M. (Makine Müh.)', discipline: 'mechanical', xp: 190, streak: 4, avatar: '⚙️' },
    { rank: 6, name: 'Burak E. (İSG Uzmanı)', discipline: 'hse', xp: 150, streak: 3, avatar: '🛡️' },
    { rank: 7, name: 'Elif S. (Kimya Müh.)', discipline: 'chemical', xp: 110, streak: 2, avatar: '🧪' },
  ].sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, rank: i + 1 }));

  return (
    <div className="bg-[var(--surface)] border border-[var(--color-border-soft)] rounded-3xl p-6 shadow-xl space-y-6">
      {/* League Header */}
      <div className={`p-6 rounded-2xl bg-gradient-to-r ${leagueColor} text-white shadow-lg flex items-center justify-between`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-300 animate-bounce" />
            <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2.5 py-1 rounded-full">
              Haftalık Mühendis Ligi
            </span>
          </div>
          <h2 className="text-2xl font-black">{leagueName}</h2>
          <p className="text-xs opacity-90 font-medium">İlk 3 mühendis üst lige yükselir ve ekstra 100 💎 elmas kazanır!</p>
        </div>
        <div className="shrink-0 p-3 rounded-full bg-white/20 backdrop-blur-md">
          <Trophy className="h-10 w-10 text-amber-200" />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {mockLeaderboard.map((user) => {
          const isTop3 = user.rank <= 3;
          let rankBadge = <span className="font-bold text-sm text-[var(--color-muted-copy)]">#{user.rank}</span>;

          if (user.rank === 1) rankBadge = <Crown className="h-5 w-5 text-amber-400 fill-amber-400" />;
          if (user.rank === 2) rankBadge = <Award className="h-5 w-5 text-slate-300 fill-slate-300" />;
          if (user.rank === 3) rankBadge = <Award className="h-5 w-5 text-amber-600 fill-amber-600" />;

          return (
            <div
              key={user.name}
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                user.isCurrentUser
                  ? 'bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/20 font-bold'
                  : 'bg-[var(--background)] border-[var(--color-border-soft)] hover:border-[var(--color-primary)]/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 flex justify-center">{rankBadge}</div>
                <span className="text-xl">{user.avatar}</span>
                <div>
                  <p className={`text-sm font-bold ${user.isCurrentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--foreground)]'}`}>
                    {user.name}
                  </p>
                  <p className="text-[11px] text-[var(--color-muted-copy)] capitalize">{user.discipline}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                  <Flame className="h-3.5 w-3.5 fill-amber-500" />
                  <span>{user.streak}g</span>
                </div>
                <div className="font-black text-sm text-purple-600 dark:text-purple-400">
                  {user.xp} XP
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
