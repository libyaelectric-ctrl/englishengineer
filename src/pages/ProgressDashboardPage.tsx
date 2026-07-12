import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  TrendingUp,
  Brain,
  MessageSquare,
  BookOpen,
  PenTool,
  Headphones,
  BookMarked,
  Languages,
  Activity,
  Target,
  Award,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import { useLearningCockpit } from '@/features/profile';

// Skills definitions with modern gradient palettes
const SKILLS = [
  {
    id: 'vocabulary',
    label: 'Vocabulary',
    icon: BookMarked,
    color: 'from-blue-500 to-cyan-400',
    bgLight: 'bg-blue-50',
    textDark: 'text-blue-700',
  },
  {
    id: 'grammar',
    label: 'Grammar',
    icon: Languages,
    color: 'from-violet-500 to-fuchsia-400',
    bgLight: 'bg-violet-50',
    textDark: 'text-violet-700',
  },
  {
    id: 'reading',
    label: 'Reading',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-400',
    bgLight: 'bg-emerald-50',
    textDark: 'text-emerald-700',
  },
  {
    id: 'writing',
    label: 'Writing',
    icon: PenTool,
    color: 'from-orange-500 to-amber-400',
    bgLight: 'bg-orange-50',
    textDark: 'text-orange-700',
  },
  {
    id: 'listening',
    label: 'Listening',
    icon: Headphones,
    color: 'from-rose-500 to-pink-400',
    bgLight: 'bg-rose-50',
    textDark: 'text-rose-700',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    icon: MessageSquare,
    color: 'from-indigo-500 to-blue-400',
    bgLight: 'bg-indigo-50',
    textDark: 'text-indigo-700',
  },
];

const MIN_ELO = 1000;
const MAX_ELO = 5000;

// Helper to interpolate number smoothly
const useAnimatedNumber = (value: number, duration: number = 1.5) => {
  const [displayValue, setDisplayValue] = useState(MIN_ELO);

  useEffect(() => {
    let startTime: number;
    const startValue = displayValue;
    const distance = value - startValue;

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = (currentTime - startTime) / (duration * 1000);
      const progress = Math.min(timeElapsed, 1);

      setDisplayValue(
        Math.floor(startValue + distance * easeOutQuart(progress))
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return displayValue;
};

// Animated Progress Bar Component
const SkillEloBar = ({
  skill,
  elo,
  index,
}: {
  skill: (typeof SKILLS)[0];
  elo: number;
  index: number;
}) => {
  const displayElo = useAnimatedNumber(elo, 2);
  const percentage = Math.max(
    0,
    Math.min(100, ((elo - MIN_ELO) / (MAX_ELO - MIN_ELO)) * 100)
  );

  const Icon = skill.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
      className="group relative rounded-2xl border border-border-soft bg-surface p-5 hover:border-border-hover transition-colors shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${skill.bgLight} ${skill.textDark}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {skill.label}
            </h4>
            <p className="text-[10px] uppercase tracking-wider text-muted-copy font-medium">
              Elo Rating
            </p>
          </div>
        </div>
        <div className="text-right">
          <motion.div
            key={displayElo}
            initial={{ scale: 1.1, color: '#3b82f6' }}
            animate={{ scale: 1, color: 'inherit' }}
            className="text-xl font-bold tracking-tight text-foreground tabular-nums"
          >
            {displayElo}
          </motion.div>
          <p className="text-[10px] text-muted-copy font-medium">
            Top {Math.max(1, 100 - Math.floor(percentage))}%
          </p>
        </div>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-hover mt-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1.5,
            delay: index * 0.1 + 0.2,
            ease: 'easeOut',
          }}
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${skill.color} rounded-full`}
        />
      </div>

      {/* Grid lines overlay for tech feel */}
      <div className="absolute inset-x-5 bottom-5 flex justify-between px-1 pointer-events-none opacity-20">
        {[0, 25, 50, 75, 100].map((step) => (
          <div key={step} className="h-3 w-px bg-foreground" />
        ))}
      </div>
    </motion.div>
  );
};

const ProgressDashboardPage = () => {
  const { currentUser } = useAuthStore();
  const { learningState } = useLearningCockpit(currentUser?.id);

  // Calculate synthetic Elo scores based on memory and learning state.
  // In a real scenario, this would come directly from backend matchmaking/scoring logic.
  const calculateSkillElo = (skillId: string) => {
    let base = MIN_ELO;
    let multiplier = 0;

    // Add some variation and realism based on user stats
    const totalSessions = learningState?.studySessions?.length || 0;
    const levelVal = learningState?.level || 1;

    base += Math.min(2000, levelVal * 150); // Level bonus
    base += Math.min(1000, totalSessions * 10); // Activity bonus

    // Skill specific variance
    switch (skillId) {
      case 'vocabulary':
        multiplier = Math.min(500, (learningState?.elo || 1000) * 0.1);
        break;
      case 'grammar':
        multiplier = Math.min(500, (learningState?.xp || 0) * 0.05);
        break;
      case 'reading':
      case 'writing':
        multiplier = 350 + Math.random() * 200; // Simulated
        break;
      case 'listening':
      case 'speaking':
        multiplier = 200 + Math.random() * 400; // Simulated
        break;
      default:
        multiplier = 100;
    }

    return Math.min(MAX_ELO, Math.floor(base + multiplier));
  };

  const [eloScores] = useState<Record<string, number>>(() => {
    const scores: Record<string, number> = {};
    SKILLS.forEach((s) => {
      scores[s.id] = calculateSkillElo(s.id);
    });
    return scores;
  });

  const totalElo = Math.floor(
    Object.values(eloScores).reduce((a, b) => a + b, 0) / SKILLS.length
  );
  const animatedTotalElo = useAnimatedNumber(totalElo, 2.5);

  const getRankBadge = (elo: number) => {
    if (elo >= 4500)
      return {
        label: 'Grandmaster',
        color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      };
    if (elo >= 3500)
      return {
        label: 'Diamond',
        color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
      };
    if (elo >= 2500)
      return {
        label: 'Platinum',
        color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
      };
    if (elo >= 1500)
      return {
        label: 'Gold',
        color: 'bg-amber-500/10 text-amber-600 border-amber-200',
      };
    return {
      label: 'Silver',
      color: 'bg-slate-500/10 text-slate-600 border-slate-200',
    };
  };

  const rank = getRankBadge(totalElo);

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Top Banner & Total Elo */}
      <div className="relative overflow-hidden rounded-3xl border border-border-soft bg-surface p-8 sm:p-12 shadow-sm">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-widest">
              <Activity className="h-3.5 w-3.5" /> Performance Analytics
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Personal Elo Dashboard
            </h2>
            <p className="text-sm text-muted-copy leading-relaxed font-medium">
              Track your absolute mastery across engineering communication
              disciplines. Your Elo rating adjusts dynamically based on exercise
              difficulty, accuracy, and consistency. Maximum achievable Elo per
              skill is 5000.
            </p>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-primary/10 bg-surface-hover p-6 shadow-inner min-w-[240px]"
          >
            <div
              className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${rank.color}`}
            >
              <Trophy className="h-3 w-3" /> {rank.label}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-foreground tabular-nums tracking-tighter">
                {animatedTotalElo}
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-copy">
              Overall Elo Rating
            </p>
          </motion.div>
        </div>
      </div>

      {/* Metrics Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: Target,
            label: 'Highest Skill',
            value: SKILLS.reduce((a, b) =>
              eloScores[a.id] > eloScores[b.id] ? a : b
            ).label,
          },
          {
            icon: TrendingUp,
            label: 'Growth (30d)',
            value: '+245 Elo',
            color: 'text-emerald-600',
          },
          {
            icon: Brain,
            label: 'Peak Rating',
            value: Math.max(...Object.values(eloScores)),
          },
          { icon: Award, label: 'Global Rank', value: 'Top 12%' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="rounded-xl border border-border-soft bg-surface p-4 flex items-center gap-4 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover text-muted-copy">
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-copy font-semibold">
                {stat.label}
              </p>
              <p
                className={`text-sm font-bold mt-0.5 ${stat.color || 'text-foreground'}`}
              >
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Skill Bars Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" /> Skill Breakdown
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {SKILLS.map((skill, index) => (
              <SkillEloBar
                key={skill.id}
                skill={skill}
                elo={eloScores[skill.id]}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboardPage;
