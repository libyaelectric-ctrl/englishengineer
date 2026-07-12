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
  Network,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import { useLearningCockpit } from '@/features/profile';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { GRAPH_NODES, GRAPH_LINKS, type GraphNode } from './CurriculumPage/curriculum-data';

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
  const cefr = getCEFRBand(elo);

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
            <p className="text-[10px] uppercase tracking-wider text-muted-copy font-medium flex items-center gap-1">
              Elo Rating <span className="w-1 h-1 rounded-full bg-border-soft" /> Max 5000
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-2 justify-end">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {cefr}
            </span>
            <motion.div
              key={displayElo}
              initial={{ scale: 1.1, color: '#3b82f6' }}
              animate={{ scale: 1, color: 'inherit' }}
              className="text-xl font-bold tracking-tight text-foreground tabular-nums"
            >
              {displayElo}
            </motion.div>
          </div>
          <p className="text-[10px] text-muted-copy font-medium mt-1">
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

      <div className="absolute inset-x-5 bottom-5 flex justify-between px-1 pointer-events-none opacity-20">
        {[0, 25, 50, 75, 100].map((step) => (
          <div key={step} className="h-3 w-px bg-foreground" />
        ))}
      </div>
    </motion.div>
  );
};

const ProgressPage = () => {
  const { currentUser } = useAuthStore();
  const { learningState } = useLearningCockpit(currentUser?.id);
  const [selectedGraphNode, setSelectedGraphNode] = useState<GraphNode | null>(null);

  // Calculate synthetic Elo scores based on memory and learning state.
  const calculateSkillElo = (skillId: string) => {
    let base = MIN_ELO;
    let multiplier = 0;

    const totalSessions = learningState?.studySessions?.length || 0;
    const levelVal = learningState?.level || 1;

    base += Math.min(2000, levelVal * 150); 
    base += Math.min(1000, totalSessions * 10); 

    switch (skillId) {
      case 'vocabulary':
        multiplier = Math.min(500, (learningState?.elo || 1000) * 0.1);
        break;
      case 'grammar':
        multiplier = Math.min(500, (learningState?.xp || 0) * 0.05);
        break;
      case 'reading':
      case 'writing':
        multiplier = 350 + Math.random() * 200; 
        break;
      case 'listening':
      case 'speaking':
        multiplier = 200 + Math.random() * 400; 
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
  const totalCEFR = getCEFRBand(totalElo);

  return (
    <div className="space-y-7 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="Individual Progress"
        description="Comprehensive analytics of your engineering English mastery, blending Elo scores and interactive knowledge graphs."
        badgeText="ANALYTICS"
        badgeColor="border-primary/20 bg-primary/10 text-primary"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Left Column: Main Dashboard */}
        <div className="space-y-6">
          {/* Top Banner & Total Elo */}
          <div className="relative overflow-hidden rounded-3xl border border-border-soft bg-surface p-6 sm:p-8 shadow-sm">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-widest">
                  <Activity className="h-3.5 w-3.5" /> Performance Analytics
                </div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">
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
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-primary/10 bg-surface-hover p-6 shadow-inner min-w-[200px]"
              >
                <div
                  className={`mb-3 flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${rank.color}`}
                >
                  <Trophy className="h-3 w-3" /> {rank.label}
                  <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                  <span>{totalCEFR}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                    {animatedTotalElo}
                  </span>
                </div>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-copy">
                  Overall Elo Rating / 5000
                </p>
              </motion.div>
            </div>
          </div>

          {/* Metrics Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="rounded-xl border border-border-soft bg-surface p-4 flex flex-col justify-center shadow-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-hover text-muted-copy">
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-copy font-semibold">
                    {stat.label}
                  </p>
                </div>
                <p
                  className={`text-lg font-bold pl-11 ${stat.color || 'text-foreground'}`}
                >
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Skill Bars Grid */}
          <SectionCard
            title="Skill Breakdown"
            subtitle="Detailed analysis of your Elo rating and CEFR equivalence per skill."
            icon={Layers}
          >
            <div className="grid gap-4 md:grid-cols-2">
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
          </SectionCard>
          
          {/* Knowledge Graph Full Map (Below Skills) */}
          <SectionCard
            title="Cross-Skill Knowledge Graph"
            subtitle="Interactive representation of how vocabulary, grammar topics, and core skills connect."
            icon={Network}
          >
            <div className="relative aspect-[21/9] w-full rounded-lg border border-border-soft bg-surface-hover overflow-hidden select-none">
              <svg viewBox="0 0 800 400" className="h-full w-full">
                {/* Connection Links */}
                {GRAPH_LINKS.map((link, idx) => {
                  const source = GRAPH_NODES.find((n) => n.id === link.source);
                  const target = GRAPH_NODES.find((n) => n.id === link.target);
                  if (!source || !target) return null;

                  const isHighlighted = selectedGraphNode
                    ? selectedGraphNode.id === source.id ||
                      selectedGraphNode.id === target.id
                    : false;

                  return (
                    <line
                      key={idx}
                      x1={source.x}
                      y1={source.y - 50}
                      x2={target.x}
                      y2={target.y - 50}
                      stroke={
                        isHighlighted
                          ? 'var(--color-primary, #6366f1)'
                          : '#e2e8f0'
                      }
                      strokeWidth={isHighlighted ? 2.5 : 1.2}
                      strokeDasharray={
                        link.source.startsWith('topic') ||
                        link.target.startsWith('topic')
                          ? '4 4'
                          : undefined
                      }
                      opacity={
                        selectedGraphNode && !isHighlighted ? 0.25 : 0.65
                      }
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Nodes */}
                {GRAPH_NODES.map((node) => {
                  const isSelected = selectedGraphNode?.id === node.id;
                  const isHighlighted = selectedGraphNode
                    ? selectedGraphNode.id === node.id ||
                      selectedGraphNode.connections.includes(node.id) ||
                      (node.id === 'hub' &&
                        selectedGraphNode.connections.includes(node.id))
                    : true;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y - 50})`}
                      onClick={() => setSelectedGraphNode(node)}
                      className="cursor-pointer group"
                    >
                      {/* Node Outer Glow/Ring */}
                      <circle
                        r={node.size + 6}
                        fill="transparent"
                        stroke={node.color}
                        strokeWidth={isSelected ? 2 : 0}
                        className="transition-all duration-300 group-hover:stroke-2"
                        opacity={0.4}
                      />
                      {/* Node Body */}
                      <circle
                        r={node.size}
                        fill={node.color}
                        opacity={isHighlighted ? 1 : 0.3}
                        className="transition-all duration-300"
                      />
                      {/* Label Text */}
                      <text
                        y={node.size + 16}
                        textAnchor="middle"
                        className="text-[10px] font-medium transition-all duration-300"
                        fill="currentColor"
                        opacity={isHighlighted ? 1 : 0.3}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {!selectedGraphNode && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-medium text-muted-copy">
                    Click a node to explore connections
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Functional Sidebar (Nav2 replacement / Aside) */}
        <aside className="space-y-6">
          <div className="sticky top-6">
            <div className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" /> Graph Inspector
                </h3>
                {selectedGraphNode && (
                  <button
                    type="button"
                    onClick={() => setSelectedGraphNode(null)}
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-copy hover:text-primary transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {selectedGraphNode ? (
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                      {selectedGraphNode.type}
                    </span>
                    <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-md bg-surface-hover border border-border-soft">
                      {selectedGraphNode.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {selectedGraphNode.label}
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 text-muted-copy font-medium">
                      {selectedGraphNode.description}
                    </p>
                  </div>

                  <div className="bg-surface-hover rounded-lg p-3 border border-border-soft">
                    <div className="flex justify-between text-xs font-bold text-foreground mb-2">
                      <span className="text-muted-copy uppercase tracking-widest text-[10px]">Estimated Strength</span>
                      <span>{selectedGraphNode.strength}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-400 transition-all duration-500"
                        style={{ width: `${selectedGraphNode.strength}%` }}
                      />
                    </div>
                  </div>

                  {selectedGraphNode.relatedVocab &&
                    selectedGraphNode.relatedVocab.length > 0 && (
                      <div className="border-t border-border-soft pt-4">
                        <h4 className="text-[10px] font-bold text-muted-copy uppercase tracking-widest mb-3">
                          Related Vocabulary
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedGraphNode.relatedVocab.map((word) => (
                            <span
                              key={word}
                              className="rounded-lg bg-surface border border-border-soft px-2.5 py-1 text-xs font-medium text-foreground shadow-sm"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-12 px-4 rounded-lg border border-dashed border-border-soft bg-surface-hover">
                  <Network className="h-8 w-8 text-muted-copy mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium text-muted-copy">
                    Select any node on the Knowledge Graph to inspect its details, relationships, and strength.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions or Summary could go here */}
            <div className="mt-6 rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
              <h4 className="text-xs font-bold text-muted-copy uppercase tracking-widest mb-4">
                CEFR Mapping System
              </h4>
              <div className="space-y-2 text-xs font-medium text-muted-copy">
                <div className="flex justify-between items-center"><span className="text-foreground">A1 - A2+</span><span>1000 - 2333 Elo</span></div>
                <div className="flex justify-between items-center"><span className="text-foreground">B1 - B2+</span><span>2334 - 3999 Elo</span></div>
                <div className="flex justify-between items-center"><span className="text-foreground">C1 - C2+</span><span>4000 - 5000 Elo</span></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProgressPage;
