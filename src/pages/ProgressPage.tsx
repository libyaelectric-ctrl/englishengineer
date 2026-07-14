import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Brain,
  MessageSquare,
  BookOpen,
  PenTool,
  Headphones,
  BookMarked,
  Languages,
  Target,
  Layers,
  Network,
  Zap,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import { useLearningCockpit } from '@/features/profile';
import { useLearningStore } from '@/core/learning';
import { GRAPH_NODES, GRAPH_LINKS, type GraphNode } from './CurriculumPage/curriculum-data';

const SKILLS = [
  { id: 'vocabulary', label: 'Vocabulary', icon: BookMarked, color: 'from-blue-500 to-cyan-400', bgLight: 'bg-blue-50', textDark: 'text-blue-700' },
  { id: 'grammar', label: 'Grammar', icon: Languages, color: 'from-violet-500 to-fuchsia-400', bgLight: 'bg-violet-50', textDark: 'text-violet-700' },
  { id: 'reading', label: 'Reading', icon: BookOpen, color: 'from-emerald-500 to-teal-400', bgLight: 'bg-emerald-50', textDark: 'text-emerald-700' },
  { id: 'writing', label: 'Writing', icon: PenTool, color: 'from-orange-500 to-amber-400', bgLight: 'bg-orange-50', textDark: 'text-orange-700' },
  { id: 'listening', label: 'Listening', icon: Headphones, color: 'from-rose-500 to-pink-400', bgLight: 'bg-rose-50', textDark: 'text-rose-700' },
  { id: 'speaking', label: 'Speaking', icon: MessageSquare, color: 'from-indigo-500 to-blue-400', bgLight: 'bg-indigo-50', textDark: 'text-indigo-700' },
];

const CEFR_LEVELS = ['A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+', 'C2', 'C2+'];
const MIN_ELO = 1000;
const MAX_ELO = 5000;

const getCEFRBand = (elo: number) => {
  if (elo < 1333) return 'A1';
  if (elo < 1666) return 'A1+';
  if (elo < 2000) return 'A2';
  if (elo < 2333) return 'A2+';
  if (elo < 2666) return 'B1';
  if (elo < 3000) return 'B1+';
  if (elo < 3333) return 'B2';
  if (elo < 3666) return 'B2+';
  if (elo < 4000) return 'C1';
  if (elo < 4333) return 'C1+';
  if (elo < 4666) return 'C2';
  return 'C2+';
};

const getCEFRIndex = (cefr: string) => CEFR_LEVELS.indexOf(cefr);

const useAnimatedNumber = (value: number, duration: number = 1.5) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let startTime: number;
    const startValue = displayValue;
    const distance = value - startValue;
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = (currentTime - startTime) / (duration * 1000);
      const progress = Math.min(timeElapsed, 1);
      setDisplayValue(Math.floor(startValue + distance * easeOutQuart(progress)));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayValue(value);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return displayValue;
};

const SkillCard = ({ skill, elo, index }: { skill: (typeof SKILLS)[0]; elo: number; index: number }) => {
  const displayElo = useAnimatedNumber(elo, 2);
  const percentage = Math.min(100, (elo / MAX_ELO) * 100);
  const cefr = getCEFRBand(elo);
  const Icon = skill.icon;
  const cefrIdx = getCEFRIndex(cefr);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group rounded-xl border border-border-soft bg-surface p-4 hover:shadow-lg hover:border-border-hover transition-all shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${skill.bgLight} ${skill.textDark}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{skill.label}</h4>
            <p className="text-[10px] text-muted-copy font-medium mt-0.5 uppercase tracking-wider">{cefr}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-foreground tabular-nums">{displayElo}</div>
        </div>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-hover">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, delay: index * 0.08 + 0.2, ease: 'easeOut' }}
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${skill.color} rounded-full`}
        />
      </div>
      <div className="flex gap-0.5 mt-2">
        {CEFR_LEVELS.map((level, i) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= cefrIdx ? `bg-gradient-to-r ${skill.color}` : 'bg-surface-hover'
            }`}
            title={level}
          />
        ))}
      </div>
    </motion.div>
  );
};

const ProgressPage = () => {
  const { currentUser } = useAuthStore();
  const { learningState } = useLearningCockpit(currentUser?.id);
  const vocabularyPool = useLearningStore((state) => state.vocabularyPool) ?? [];
  const grammarPool = useLearningStore((state) => state.grammarPool) ?? [];
  const [selectedGraphNode, setSelectedGraphNode] = useState<GraphNode | null>(null);

  const calculateSkillElo = (_skillId: string) => {
    // Use the actual stored elo as base, not a calculated one
    const storedElo = learningState?.elo || MIN_ELO;
    return Math.min(MAX_ELO, Math.max(MIN_ELO, storedElo));
  };

  const [eloScores] = useState<Record<string, number>>(() => {
    const scores: Record<string, number> = {};
    SKILLS.forEach((s) => { scores[s.id] = calculateSkillElo(s.id); });
    return scores;
  });

  const totalElo = Math.floor(Object.values(eloScores).reduce((a, b) => a + b, 0) / SKILLS.length);
  const animatedTotalElo = useAnimatedNumber(totalElo, 2.5);
  const totalPercentage = Math.min(100, (totalElo / MAX_ELO) * 100);
  const totalCEFR = getCEFRBand(totalElo);
  const totalCEFRIdx = getCEFRIndex(totalCEFR);

  const highestSkill = useMemo(() => SKILLS.reduce((best, s) => eloScores[s.id] > eloScores[best.id] ? s : best), [eloScores]);
  const lowestSkill = useMemo(() => SKILLS.reduce((worst, s) => eloScores[s.id] < eloScores[worst.id] ? s : worst), [eloScores]);

  const getRank = (elo: number) => {
    if (elo >= 4500) return { label: 'Grandmaster', icon: '👑', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    if (elo >= 3500) return { label: 'Diamond', icon: '💎', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' };
    if (elo >= 2500) return { label: 'Platinum', icon: '🏆', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    if (elo >= 1500) return { label: 'Gold', icon: '🥇', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'Silver', icon: '🥈', color: 'text-slate-600 bg-slate-50 border-slate-200' };
  };

  const rank = getRank(totalElo);
  const nextCEFR = CEFR_LEVELS[Math.min(totalCEFRIdx + 1, CEFR_LEVELS.length - 1)];
  const eloForNext = Math.floor(((totalCEFRIdx + 1) / CEFR_LEVELS.length) * (MAX_ELO - MIN_ELO) + MIN_ELO);
  const eloNeeded = Math.max(0, eloForNext - totalElo);

  return (
    <div className="animate-in fade-in duration-300 pb-8">
      {/* Fixed Header - clean, no extra border */}
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Individual Progress</h1>
            <p className="text-xs text-muted-copy">CEFR band, Elo rating, and skill breakdown.</p>
          </div>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-widest">Analytics</span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        {/* Left Column */}
        <div className="space-y-5 min-w-0">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-surface p-5 shadow-sm">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-5">
              <div className="relative flex-shrink-0">
                <svg className="w-32 h-32 -rotate-90">
                  <circle cx="64" cy="64" r="56" className="stroke-border-soft fill-none" strokeWidth="5" />
                  <motion.circle
                    cx="64" cy="64" r="56"
                    className="stroke-primary fill-none"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 56}
                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - totalPercentage / 100) }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-foreground tabular-nums">{animatedTotalElo}</span>
                  <span className="text-[10px] text-muted-copy font-bold uppercase">/ 5000</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${rank.color}`}>
                    {rank.icon} {rank.label}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border-soft bg-background px-2 py-0.5 text-xs font-bold text-foreground">
                    CEFR {totalCEFR}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1">Mastery Level</h2>
                <p className="text-xs text-muted-copy leading-relaxed">
                  {eloNeeded > 0
                    ? `${eloNeeded} more Elo to reach ${nextCEFR}. Keep practicing!`
                    : `Highest CEFR band reached. Maintain your excellence!`}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-copy">{totalCEFR}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((totalElo - (totalCEFRIdx * 333 + MIN_ELO)) / 333) * 100)}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-400"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-copy">{nextCEFR}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {[
              { icon: Target, label: 'Avg Elo', value: totalElo, color: 'text-primary' },
              { icon: TrendingUp, label: 'Best', value: highestSkill.label, color: 'text-emerald-600' },
              { icon: Zap, label: 'Peak', value: Math.max(...Object.values(eloScores)), color: 'text-amber-600' },
              { icon: Clock, label: 'Sessions', value: learningState?.studySessions?.length || 0, color: 'text-rose-600' },
              { icon: Layers, label: 'Knowledge Pool', value: vocabularyPool.length + grammarPool.length, color: 'text-indigo-600' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="rounded-xl border border-border-soft bg-surface p-3 shadow-sm"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <stat.icon className="h-3 w-3 text-muted-copy" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-copy font-semibold">{stat.label}</span>
                </div>
                <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Knowledge Graph */}
          <div className="rounded-2xl border border-border-soft bg-surface shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Knowledge Graph</h3>
              </div>
              <p className="text-[11px] text-muted-copy mt-0.5">Click nodes to explore connections.</p>
            </div>
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-surface-hover select-none">
              <svg viewBox="0 0 800 500" className="h-full w-full">
                {GRAPH_LINKS.map((link, idx) => {
                  const source = GRAPH_NODES.find((n) => n.id === link.source);
                  const target = GRAPH_NODES.find((n) => n.id === link.target);
                  if (!source || !target) return null;
                  const isHighlighted = selectedGraphNode
                    ? selectedGraphNode.id === source.id || selectedGraphNode.id === target.id
                    : false;
                  return (
                    <line
                      key={idx}
                      x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                      stroke={isHighlighted ? 'var(--color-primary, #6366f1)' : '#e2e8f0'}
                      strokeWidth={isHighlighted ? 2.5 : 1.2}
                      strokeDasharray={link.source.startsWith('topic') || link.target.startsWith('topic') ? '4 4' : undefined}
                      opacity={selectedGraphNode && !isHighlighted ? 0.2 : 0.6}
                      className="transition-all duration-300"
                    />
                  );
                })}
                {GRAPH_NODES.map((node) => {
                  const isSelected = selectedGraphNode?.id === node.id;
                  const isHighlighted = selectedGraphNode
                    ? selectedGraphNode.id === node.id || selectedGraphNode.connections.includes(node.id)
                    : true;
                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`} onClick={() => setSelectedGraphNode(node)} className="cursor-pointer">
                      <circle r={node.size + 6} fill="transparent" stroke={node.color} strokeWidth={isSelected ? 2 : 0} opacity={0.4} className="transition-all duration-300" />
                      <circle r={node.size} fill={node.color} opacity={isHighlighted ? 1 : 0.25} className="transition-all duration-300" />
                      <text y={node.size + 14} textAnchor="middle" className="text-[10px] font-medium" fill="currentColor" opacity={isHighlighted ? 1 : 0.25}>
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {!selectedGraphNode && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-muted-copy animate-pulse">Click a node to explore</p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly XP Chart */}
          <div className="rounded-2xl border border-border-soft bg-surface shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Weekly XP</h3>
              </div>
              <p className="text-[11px] text-muted-copy mt-0.5">Last 7 days experience points.</p>
            </div>
            <div className="p-4">
              {(() => {
                const xpHistory = learningState?.xpHistory || [];
                const now = new Date();
                const days = Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(now);
                  d.setDate(d.getDate() - (6 - i));
                  return d.toISOString().split('T')[0];
                });
                const xpByDay = days.map((date) =>
                  xpHistory.filter((e) => e.date === date).reduce((sum, e) => sum + e.amount, 0)
                );
                const maxXP = Math.max(...xpByDay, 1);
                const barWidth = 40;
                const gap = 16;
                const chartHeight = 120;
                const labelY = chartHeight + 16;
                return (
                  <svg viewBox={`0 0 ${7 * (barWidth + gap) + gap} ${labelY + 16}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                    {xpByDay.map((xp, i) => {
                      const x = gap + i * (barWidth + gap);
                      const barH = (xp / maxXP) * chartHeight;
                      const y = chartHeight - barH;
                      return (
                        <g key={i}>
                          <rect
                            x={x} y={y} width={barWidth} height={Math.max(barH, 2)}
                            rx={4} className="fill-primary"
                            opacity={xp > 0 ? 0.85 : 0.15}
                          />
                          {xp > 0 && (
                            <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" className="text-[9px] font-bold" fill="currentColor">
                              {xp}
                            </text>
                          )}
                          <text x={x + barWidth / 2} y={labelY} textAnchor="middle" className="text-[8px] font-medium" fill="currentColor" opacity={0.6}>
                            {new Date(days[i] + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' })}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Nav2 style */}
        <aside className="relative">
          <div className="xl:sticky xl:top-16 space-y-0 border border-border-soft bg-surface rounded-xl shadow-sm overflow-hidden">
            {/* Skill Progress */}
            <div className="px-4 pt-3 pb-2 border-b border-border-soft">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-copy flex items-center gap-1.5">
                <Layers className="h-3 w-3" /> Skill Progress
              </h3>
            </div>
            <div className="p-3 space-y-2">
              {SKILLS.map((skill, index) => (
                <SkillCard key={skill.id} skill={skill} elo={eloScores[skill.id]} index={index} />
              ))}
            </div>

            {/* Summary */}
            <div className="px-4 pt-3 pb-2 border-t border-border-soft">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-copy flex items-center gap-1.5">
                <Brain className="h-3 w-3" /> Summary
              </h3>
            </div>
            <div className="px-4 pb-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-copy">Strongest</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <highestSkill.icon className="h-3 w-3 text-emerald-500" /> {highestSkill.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-copy">Weakest</span>
                <span className="font-bold text-rose-500 flex items-center gap-1">
                  <lowestSkill.icon className="h-3 w-3 text-rose-500" /> {lowestSkill.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-copy">CEFR</span>
                <span className="font-bold text-foreground">{totalCEFR}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-copy">Rank</span>
                <span className="font-bold text-foreground">{rank.icon} {rank.label}</span>
              </div>
            </div>

            {/* Node Inspector */}
            <div className="px-4 pt-3 pb-2 border-t border-border-soft">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-copy flex items-center gap-1.5">
                  <Network className="h-3 w-3" /> Inspector
                </h3>
                {selectedGraphNode && (
                  <button onClick={() => setSelectedGraphNode(null)} className="text-[10px] font-bold uppercase text-muted-copy hover:text-primary transition-colors">
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="px-4 pb-4">
              {selectedGraphNode ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">{selectedGraphNode.type}</span>
                    <span className="text-[10px] font-semibold text-foreground px-1.5 py-0.5 rounded bg-surface-hover border border-border-soft">{selectedGraphNode.status}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{selectedGraphNode.label}</h4>
                    <p className="mt-0.5 text-[11px] text-muted-copy leading-4">{selectedGraphNode.description}</p>
                  </div>
                  <div className="bg-surface-hover rounded-lg p-2.5 border border-border-soft">
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-muted-copy uppercase">Strength</span>
                      <span className="text-foreground">{selectedGraphNode.strength}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-400" style={{ width: `${selectedGraphNode.strength}%` }} />
                    </div>
                  </div>
                  {selectedGraphNode.relatedVocab && selectedGraphNode.relatedVocab.length > 0 && (
                    <div className="border-t border-border-soft pt-2">
                      <h4 className="text-[10px] font-bold text-muted-copy uppercase mb-1.5">Related Words</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedGraphNode.relatedVocab.map((word) => (
                          <span key={word} className="rounded bg-surface border border-border-soft px-1.5 py-0.5 text-[10px] font-medium text-foreground">{word}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-5 rounded-lg border border-dashed border-border-soft">
                  <Network className="h-5 w-5 text-muted-copy mx-auto mb-1.5 opacity-40" />
                  <p className="text-[11px] text-muted-copy">Select a node on the graph</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProgressPage;
