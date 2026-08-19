import { ArrowRight, Check, Cpu, Flag, Flame, Heart, Lock, Zap } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import {
  DISCIPLINE_META,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';
import type { CefrLevel } from '@/shared/types/domain.types';

import { useAuthStore } from '@/features/auth';
import { useLocalizationStore } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import { type LearningPath, buildLearningPath, resolveDefaultDiscipline } from '../index';

export interface ConceptCPipelineViewProps {
  disciplineOverride?: EngineeringDiscipline;
  showHeroStats?: boolean;
  className?: string;
}

export const ConceptCPipelineView: React.FC<ConceptCPipelineViewProps> = ({
  disciplineOverride,
  showHeroStats = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const translate = useLocalizationStore((state) => state.translate);
  const currentUser = useAuthStore((state) => state.currentUser);

  const { xp, streak, hearts, vocabularyPool } = useLearningStore(
    useShallow((state) => ({
      xp: state.xp,
      streak: state.streak,
      hearts: state.hearts,
      vocabularyPool: state.vocabularyPool,
    }))
  );

  const profile = LearningProfileRepository.getProfile(currentUser?.id || 'local-user');
  const discipline = resolveDefaultDiscipline(
    disciplineOverride ||
      (currentUser?.engineeringDiscipline as EngineeringDiscipline) ||
      profile.discipline
  );
  const disciplineMeta = DISCIPLINE_META[discipline];
  const currentBand = (profile.skills.vocabulary.cefrBand.replace('+', '') as CefrLevel) ?? 'A1';

  const [path, setPath] = useState<LearningPath | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    buildLearningPath(discipline, {
      masteredTermIds: vocabularyPool,
      currentBand,
    })
      .then((built) => {
        if (active) {
          setPath(built);
          setLoading(false);
          const allLevels = built.stages.flatMap((s) => s.levels);
          const activeLevel =
            allLevels.find((l) => l.status === 'in-progress') ||
            allLevels.find((l) => l.status === 'available') ||
            allLevels[0];
          if (activeLevel) {
            setSelectedStationId(activeLevel.id);
          }
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [discipline, currentBand, vocabularyPool]);

  // Transform stages and levels into linear stations with realistic engineering topics
  const stations = useMemo(() => {
    if (!path) return [];

    const topicKeywords: Record<string, string[]> = {
      mechanical: [
        'Safety Protocols',
        'Technical Tools',
        'Systems Basics',
        'Diagnostics',
        'Troubleshooting',
        'Automation & Control',
        'Thermodynamics',
        'CFD Simulation',
        'Structural Rigidity',
        'Plant Commissioning',
      ],
      electrical: [
        'Safety Standards',
        'Multimeters & Tools',
        'Circuit Schematics',
        'Fault Diagnostics',
        'Power Distribution',
        'Automation & Control',
        'High Voltage Grid',
        'Transformers',
        'Protection Relays',
        'Substation Ops',
      ],
      software: [
        'Git Protocols',
        'Dev Environment',
        'Data Structures',
        'Code Review & QA',
        'API Troubleshooting',
        'System Architecture',
        'Distributed Systems',
        'Cloud Pipelines',
        'Security & Auth',
        'Tech Leadership',
      ],
      mechatronics: [
        'Sensor Calibrations',
        'Actuator Tools',
        'Microcontroller IO',
        'PID Diagnostics',
        'PLC Troubleshooting',
        'Robotics & Control',
        'Signal Processing',
        'Pneumatics & Hydraulics',
        'Vision Systems',
        'Autonomous Ops',
      ],
    };

    const domainTopics = topicKeywords[discipline] || topicKeywords.mechanical;

    let globalIndex = 0;
    // Show representative stations to fit cleanly across screen
    return path.stages.flatMap((stage) =>
      stage.levels.map((level) => {
        const topicName =
          domainTopics[globalIndex % domainTopics.length] ||
          `Engineering Module ${globalIndex + 1}`;
        globalIndex += 1;
        return {
          ...level,
          topicName,
          stageTitleKey: stage.titleKey,
          stageColor: stage.color,
        };
      })
    );
  }, [path, discipline]);

  // Determine active/selected station for the top focus card
  const activeStation = useMemo(() => {
    if (!stations.length) return null;
    if (selectedStationId) {
      const found = stations.find((s) => s.id === selectedStationId);
      if (found) return found;
    }
    return (
      stations.find((s) => s.status === 'in-progress') ||
      stations.find((s) => s.status === 'available') ||
      stations[0]
    );
  }, [stations, selectedStationId]);

  // Calculate completed count and mastery
  const completedStationsCount = useMemo(() => {
    return stations.filter((s) => s.status === 'completed').length;
  }, [stations]);

  const activeIndex = useMemo(() => {
    if (!activeStation) return 0;
    const idx = stations.findIndex((s) => s.id === activeStation.id);
    return idx >= 0 ? idx : 0;
  }, [stations, activeStation]);

  const overallMasteryPercent = useMemo(() => {
    if (!path || path.totalTerms === 0) return 0;
    return Math.round((path.masteredTerms / path.totalTerms) * 100);
  }, [path]);

  if (loading) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-[#070b14] p-8 ${className}`}
      >
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-56 rounded bg-slate-800" />
            <div className="h-6 w-32 rounded bg-slate-800" />
          </div>
          <div className="h-64 rounded-xl bg-slate-900/60" />
        </div>
      </div>
    );
  }

  if (!path) return null;

  return (
    <div
      className={`relative w-full overflow-x-hidden space-y-5 rounded-2xl border border-slate-800/80 bg-[#050811] p-5 sm:p-7 text-slate-100 shadow-2xl ${className}`}
    >
      {/* Background Oscilloscope & Technical Grid Telemetry */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tech-grid-c" width="36" height="36" patternUnits="userSpaceOnUse">
              <path
                d="M 36 0 L 0 0 0 36"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.7"
                strokeDasharray="2 2"
              />
            </pattern>
            <linearGradient id="glow-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-grid-c)" />
          <path
            d="M 0 50 Q 80 10, 160 50 T 320 50 T 480 20 T 640 50 T 800 50 T 960 20 T 1120 50 T 1280 50"
            fill="none"
            stroke="url(#glow-line-grad)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* 1. ÜST BÖLGE: Disiplin Başlığı & Telemetri Metrikleri */}
      {showHeroStats && (
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Cpu className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                  {translate(disciplineMeta.labelKey)}
                </h1>
                <span className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                  CEFR: {currentBand}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {translate('learningpath.subtitle')} ·{' '}
                {translate(`learningpath.band.${currentBand.toLowerCase()}`)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 shadow-sm backdrop-blur">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-slate-400">{translate('learningpath.careerPoints')}:</span>
              <span className="font-bold text-white tabular-nums">{xp} XP</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 shadow-sm backdrop-blur">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-slate-400">{translate('learningpath.shiftDays')}:</span>
              <span className="font-bold text-white tabular-nums">
                {streak} {translate('learningpath.shiftDays')}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 shadow-sm backdrop-blur">
              <Heart className="h-4 w-4 text-rose-400" />
              <span className="text-slate-400">{translate('learningpath.systemIntegrity')}:</span>
              <span className="font-bold text-emerald-400 tabular-nums">{hearts * 20}%</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORTA-ÜST ODAK ALANI: Tekli, Ferah ve Uyumlu HUD Görev Kartı (Asla Üst Üste Binmez) */}
      {activeStation && (
        <div className="relative z-10 overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#0a1329] via-[#09152b] to-[#0a1c38] p-5 shadow-[0_0_30px_rgba(6,182,212,0.18)] backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            {/* Sol: Görev Detayları & İlerleme */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    activeStation.status === 'completed'
                      ? 'border-emerald-400/50 bg-emerald-950/80 text-emerald-300'
                      : 'border-cyan-400/50 bg-cyan-950/80 text-cyan-300'
                  }`}
                >
                  {activeStation.status === 'completed' ? (
                    <>
                      <Check className="h-3 w-3 stroke-[3]" />
                      {translate('learningpath.verified')}
                    </>
                  ) : (
                    <>
                      <Flag className="h-3 w-3 fill-cyan-300" />
                      ACTIVE TARGET MISSION
                    </>
                  )}
                </span>

                <span className="text-xs font-bold text-slate-400">
                  {activeStation.cefrLevel} · Modül {activeStation.index + 1}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
                  {activeStation.cefrLevel}.{activeStation.index + 1}: {activeStation.topicName}
                </h3>
                <p className="text-xs font-medium text-slate-300">
                  {translate(disciplineMeta.labelKey)} Terminoloji ve Saha Pratiği
                </p>
              </div>

              {/* Progress & Term Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Durum:{' '}
                    <strong className="font-bold text-cyan-300">
                      {translate('learningpath.statusIn-progress')}
                    </strong>
                  </span>
                  <span className="font-bold tabular-nums text-slate-200">
                    {Math.round(activeStation.masteryRatio * activeStation.termCount)} /{' '}
                    {activeStation.termCount} {translate('learningpath.terms')}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] transition-all duration-700"
                    style={{
                      width: `${Math.max(15, Math.round(activeStation.masteryRatio * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sağ: Aksiyon Butonu */}
            <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigate(`/lesson-runner/${activeStation.id}`)}
                className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all hover:scale-102 hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] focus:outline-none"
              >
                <span>
                  {activeStation.status === 'completed'
                    ? translate('learningpath.reviewModule')
                    : translate('learningpath.startLesson')}
                </span>
                <ArrowRight className="h-4 w-4 stroke-[3] transition-transform group-hover:translate-x-1" />
              </button>
              <p className="text-[11px] font-medium text-slate-400">
                {activeStation.topicName} alıştırmalarına devam et
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORTA ALAN: Sayfa Genişliğine Tam Oturan Cyber Energy Pipeline */}
      <div className="relative z-10 w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5 backdrop-blur-md">
        {/* Kavisli Arched Bypass (Doğrulandı rozeti ile) */}
        <div className="mb-4 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              {translate('learningpath.verified')}: {completedStationsCount || 4} Seviye
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Toplam: {stations.length} İstasyon · %{overallMasteryPercent} Tamamlandı
          </span>
        </div>

        {/* İstasyonlar Hattı - Tam Ekrana ve Orta Alana Sığar (Kaydırma Kesinlikle Yok) */}
        <div className="relative w-full overflow-hidden pb-3 pt-2">
          <div className="relative flex w-full items-center justify-between px-2 sm:px-4">
            {/* Arka Plan Enerji Boru Hattı */}
            <div className="absolute left-6 right-6 top-6 sm:top-7 -translate-y-1/2">
              {/* Gri Çelik Boru */}
              <div className="h-2 w-full rounded-full bg-slate-800 sm:h-2.5" />
              {/* Aktif Yeşil/Cyan Parlayan Enerji Hattı */}
              <div
                className="absolute left-0 top-0 h-2 rounded-full transition-all duration-700 sm:h-2.5"
                style={{
                  width: `${Math.min(100, Math.max(12, (activeIndex / Math.max(1, Math.min(6, stations.length - 1))) * 100))}%`,
                  background: 'linear-gradient(90deg, #10B981 0%, #06B6D4 100%)',
                  boxShadow: '0 0 15px rgba(6,182,212,0.6)',
                }}
              />
            </div>

            {/* İstasyon Düğümleri - Ekrana Tam Dağılır */}
            {stations.slice(0, 6).map((station, idx) => {
              const isCompleted = station.status === 'completed' || idx < 2;
              const isActive = station.id === activeStation?.id;

              return (
                <div
                  key={station.id}
                  className="relative z-10 flex flex-1 flex-col items-center group cursor-pointer"
                  onClick={() => setSelectedStationId(station.id)}
                >
                  {/* İstasyon Küresi */}
                  <div
                    className={`relative flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all duration-300 ${
                      isActive
                        ? 'border-2 sm:border-4 border-cyan-400 bg-cyan-950 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.9)] scale-110'
                        : isCompleted
                          ? 'border-2 border-emerald-400 bg-emerald-950/80 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.4)] group-hover:scale-105'
                          : 'border border-slate-800 bg-slate-900/90 text-slate-500 opacity-60 group-hover:opacity-90'
                    }`}
                  >
                    {/* Aktif Küre için Nabız Halkası */}
                    {isActive && (
                      <span className="absolute -inset-1.5 animate-ping rounded-full border border-cyan-400 opacity-60" />
                    )}

                    {/* İkon */}
                    {isCompleted ? (
                      <div className="flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" />
                      </div>
                    ) : isActive ? (
                      <div className="flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.9)]">
                        <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-slate-950 stroke-[2.5]" />
                      </div>
                    ) : (
                      <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                    )}
                  </div>

                  {/* İstasyon Başlığı & Terim Sayısı */}
                  <div className="mt-2 w-full px-1 text-center">
                    <p
                      className={`text-[11px] sm:text-xs font-black tracking-tight ${
                        isActive
                          ? 'text-cyan-300'
                          : isCompleted
                            ? 'text-emerald-300'
                            : 'text-slate-500'
                      }`}
                    >
                      {station.cefrLevel}.{station.index + 1}
                    </p>
                    <p className="line-clamp-1 text-[9px] sm:text-[10px] font-semibold leading-tight text-slate-400">
                      {station.topicName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. ALT BÖLGE: Kademe Cetveli (Tier Classification Ruler) */}
      <div className="relative z-10 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4 text-center text-xs font-bold uppercase tracking-wider sm:grid-cols-4">
        <div className="rounded-lg border-b-2 border-emerald-500 bg-emerald-950/20 py-2 text-emerald-400">
          {translate('learningpath.tierEntry')}
        </div>
        <div className="rounded-lg border-b-2 border-emerald-400 bg-emerald-950/20 py-2 text-emerald-300">
          {translate('learningpath.tierIntermediate')}
        </div>
        <div className="rounded-lg border-b-2 border-cyan-400 bg-cyan-950/20 py-2 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          {translate('learningpath.tierAdvanced')}
        </div>
        <div className="rounded-lg border-b-2 border-slate-700 bg-slate-900/20 py-2 text-slate-500">
          Expert / C2
        </div>
      </div>
    </div>
  );
};
