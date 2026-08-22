import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  Cpu,
  Flame,
  Languages,
  Mic2,
  PenTool,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

import React from 'react';

import { Link } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';

import { useAuthStore } from '@/features/auth';
import { LearningTaskEngine } from '@/features/learning-orchestrator';
import { useLearningCockpit } from '@/features/profile';

export const ProgressNextStepsTab: React.FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { profile, memory, missions } = useLearningCockpit(currentUser?.id);

  const xp = useLearningStore((s) => s.xp);
  const streak = useLearningStore((s) => s.streak);
  const weakestSkill = LearningTaskEngine.getWeakestSkill(profile);

  const skillLinks = [
    {
      name: 'Vocabulary',
      icon: BookOpen,
      href: '/vocabulary',
      desc: 'Expand terminology for technical specifications',
      band: profile?.skills?.vocabulary?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'vocabulary',
    },
    {
      name: 'Grammar',
      icon: Languages,
      href: '/grammar',
      desc: 'Master technical sentence structures and passive voice',
      band: profile?.skills?.grammar?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'grammar',
    },
    {
      name: 'Reading',
      icon: BookOpen,
      href: '/reading',
      desc: 'Practice technical reports and site blueprints',
      band: profile?.skills?.reading?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'reading',
    },
    {
      name: 'Writing',
      icon: PenTool,
      href: '/writing',
      desc: 'Draft formal engineering emails and RFIs',
      band: profile?.skills?.writing?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'writing',
    },
    {
      name: 'Speaking',
      icon: Mic2,
      href: '/speaking',
      desc: 'AI-assisted technical pronunciation and standups',
      band: profile?.skills?.speaking?.cefrBand ?? 'A1',
      isWeak: weakestSkill === 'speaking',
    },
    {
      name: 'Placement Test',
      icon: Compass,
      href: '/placement',
      desc: 'Calibrate your CEFR band with automated assessment',
      band: 'Benchmark',
      isWeak: false,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Priority Focus Hero */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-primary/30 bg-surface p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-[4px] bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary border border-primary/20">
                Recommended Focus Area
              </span>
              {weakestSkill && (
                <StatusBadge label={`Focus: ${weakestSkill.toUpperCase()}`} tone="warning" />
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Accelerate Your Engineering Path
            </h2>
            <p className="text-xs sm:text-sm text-muted-copy max-w-xl">
              Based on your continuous performance telemetry, focusing on{' '}
              <strong className="text-foreground capitalize">{weakestSkill}</strong> will yield the
              highest CEFR level progression.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/curriculum/today"
              className="inline-flex items-center gap-2 rounded-[var(--radius-card)] bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/90 transition-all shadow-md"
            >
              <Calendar className="h-4 w-4" /> Today's Mission
            </Link>
            <Link
              to="/learning-path"
              className="inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-border-soft bg-surface px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all"
            >
              <Trophy className="h-4 w-4 text-primary" /> Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* Gamification & Momentum Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
              Total XP
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{xp} XP</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
          <div className="flex items-center gap-2 text-amber-500">
            <Flame className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
              Streak
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{streak} Days</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <Target className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
              Active Missions
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{missions.length}</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
          <div className="flex items-center gap-2 text-cyan-500">
            <Cpu className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
              Reviews Due
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">
            {typeof memory?.dueToday === 'number' ? memory.dueToday : 0}
          </p>
        </div>
      </div>

      {/* Action Plan Modules */}
      <SectionCard
        title="Targeted Skill Modules"
        subtitle="Direct practice modules calibrated to your engineering discipline"
        icon={Sparkles}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillLinks.map((skill) => {
            const Icon = skill.icon;
            return (
              <Link
                key={skill.name}
                to={skill.href}
                className={`group relative flex flex-col justify-between rounded-[var(--radius-card)] border p-5 transition-all duration-150 hover:shadow-md ${
                  skill.isWeak
                    ? 'border-primary/40 bg-primary/5 hover:border-primary'
                    : 'border-border-soft bg-surface hover:border-border-hover hover:bg-surface-hover'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-[4px] bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {skill.name}
                      </h3>
                    </div>
                    <span className="rounded-[4px] border border-border-soft bg-surface px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
                      {skill.band}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-muted-copy leading-relaxed">{skill.desc}</p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-border-soft/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Start Exercise
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-copy transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};
