import { ArrowRight, Check, Flag, Lock, LucideIcon, Zap } from 'lucide-react';

import React, { useMemo } from 'react';

import { useLocalizationStore } from '@/features/localization';
import { interpolate } from '@/features/localization/interpolate';

export interface PipelineStation {
  id: string;
  levelBadge: string; // e.g. "A1.1", "G1", "SDS-01"
  title: string;
  subtitle?: string;
  status: 'completed' | 'in-progress' | 'available' | 'locked';
  progressRatio?: number; // 0 to 1
  totalItems?: number;
  completedItems?: number;
  actionLabel?: string;
  onAction?: () => void;
  metadata?: Record<string, string | number>;
}

export interface UniversalCyberPipelineProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  icon?: LucideIcon;
  stations: PipelineStation[];
  activeStationId?: string | null;
  onSelectStation: (id: string) => void;
  tierLabels?: [string, string, string, string];
  metrics?: Array<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color?: string;
  }>;
  className?: string;
}

export const UniversalCyberPipeline: React.FC<UniversalCyberPipelineProps> = ({
  title,
  subtitle,
  badgeText,
  icon: HeaderIcon,
  stations,
  activeStationId,
  onSelectStation,
  tierLabels,
  metrics = [],
  className = '',
}) => {
  const translate = useLocalizationStore((s) => s.translate);
  const resolvedTierLabels: [string, string, string, string] = tierLabels ?? [
    translate('pipeline.tier.foundation'),
    translate('pipeline.tier.operational'),
    translate('pipeline.tier.technical'),
    translate('pipeline.tier.contractual'),
  ];

  const activeStation = useMemo(() => {
    if (!stations.length) return null;
    if (activeStationId) {
      const found = stations.find((s) => s.id === activeStationId);
      if (found) return found;
    }
    return (
      stations.find((s) => s.status === 'in-progress') ||
      stations.find((s) => s.status === 'available') ||
      stations[0]
    );
  }, [stations, activeStationId]);

  const activeIndex = useMemo(() => {
    if (!activeStation) return 0;
    const idx = stations.findIndex((s) => s.id === activeStation.id);
    return idx >= 0 ? idx : 0;
  }, [stations, activeStation]);

  const completedCount = useMemo(() => {
    return stations.filter((s) => s.status === 'completed').length;
  }, [stations]);

  const overallPercent = useMemo(() => {
    if (!stations.length) return 0;
    return Math.round((completedCount / stations.length) * 100);
  }, [stations, completedCount]);

  if (!stations.length) return null;

  return (
    <div
      className={`relative w-full overflow-x-hidden space-y-5 rounded-2xl border border-slate-800/80 bg-[#050811] p-5 sm:p-7 text-slate-100 shadow-2xl ${className}`}
    >
      {/* Background Oscilloscope & Technical Grid Telemetry */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="univ-grid-c" width="36" height="36" patternUnits="userSpaceOnUse">
              <path
                d="M 36 0 L 0 0 0 36"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.7"
                strokeDasharray="2 2"
              />
            </pattern>
            <linearGradient id="univ-glow-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#univ-grid-c)" />
          <path
            d="M 0 50 Q 80 10, 160 50 T 320 50 T 480 20 T 640 50 T 800 50 T 960 20 T 1120 50 T 1280 50"
            fill="none"
            stroke="url(#univ-glow-line)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* 1. ÜST BÖLGE: Başlık & Metrikler */}
      {(title || metrics.length > 0) && (
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            {HeaderIcon && (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <HeaderIcon className="h-6 w-6 animate-pulse" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5">
                {title && (
                  <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                    {title}
                  </h2>
                )}
                {badgeText && (
                  <span className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                    {badgeText}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>

          {metrics.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              {metrics.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 shadow-sm backdrop-blur"
                >
                  {m.icon}
                  <span className="text-slate-400">{m.label}:</span>
                  <span className={`font-bold text-white tabular-nums ${m.color || ''}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ORTA-ÜST ODAK ALANI: HUD Görev / Modül Kartı */}
      {activeStation && (
        <div className="relative z-10 overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#0a1329] via-[#09152b] to-[#0a1c38] p-5 shadow-[0_0_30px_rgba(6,182,212,0.18)] backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            {/* Sol: Detaylar & İlerleme */}
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
                      {translate('pipeline.verifiedCompleted')}
                    </>
                  ) : (
                    <>
                      <Flag className="h-3 w-3 fill-cyan-300" />
                      {translate('pipeline.activeTarget')}
                    </>
                  )}
                </span>

                <span className="text-xs font-bold text-slate-400">{activeStation.levelBadge}</span>
              </div>

              <div>
                <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
                  {activeStation.levelBadge}: {activeStation.title}
                </h3>
                {activeStation.subtitle && (
                  <p className="text-xs font-medium text-slate-300">{activeStation.subtitle}</p>
                )}
              </div>

              {/* Progress & Items */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {translate('pipeline.statusLabel')}{' '}
                    <strong className="font-bold text-cyan-300">
                      {activeStation.status === 'completed'
                        ? translate('pipeline.statusCompleted')
                        : translate('pipeline.statusInProgress')}
                    </strong>
                  </span>
                  {activeStation.totalItems !== undefined && (
                    <span className="font-bold tabular-nums text-slate-200">
                      {activeStation.completedItems ?? 0} / {activeStation.totalItems}{' '}
                      {translate('pipeline.itemsUnit')}
                    </span>
                  )}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] transition-all duration-700"
                    style={{
                      width: `${Math.max(
                        15,
                        Math.round(
                          (activeStation.progressRatio ??
                            (activeStation.status === 'completed' ? 1 : 0.4)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sağ: Aksiyon Butonu */}
            {activeStation.onAction && (
              <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={activeStation.onAction}
                  className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all hover:scale-102 hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] focus:outline-none"
                >
                  <span>
                    {activeStation.actionLabel ||
                      (activeStation.status === 'completed'
                        ? translate('pipeline.reviewModule')
                        : translate('pipeline.startExercise'))}
                  </span>
                  <ArrowRight className="h-4 w-4 stroke-[3] transition-transform group-hover:translate-x-1" />
                </button>
                <p className="text-[11px] font-medium text-slate-400">
                  {interpolate(translate('pipeline.continuePractice'), {
                    title: activeStation.title,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ORTA ALAN: Cyber Energy Pipeline */}
      <div className="relative z-10 w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5 backdrop-blur-md">
        {/* İlerleme Özeti */}
        <div className="mb-4 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              {interpolate(translate('pipeline.verifiedStations'), { count: completedCount })}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {interpolate(translate('pipeline.stationsSummary'), {
              count: stations.length,
              percent: overallPercent,
            })}
          </span>
        </div>

        {/* İstasyonlar Hattı - Ekrana Tam Dağılır (Sıfır Scrollbar) */}
        <div className="relative w-full overflow-hidden pb-3 pt-2">
          <div className="relative flex w-full items-center justify-between px-2 sm:px-4">
            {/* Arka Plan Enerji Boru Hattı */}
            <div className="absolute left-6 right-6 top-6 sm:top-7 -translate-y-1/2">
              <div className="h-2 w-full rounded-full bg-slate-800 sm:h-2.5" />
              <div
                className="absolute left-0 top-0 h-2 rounded-full transition-all duration-700 sm:h-2.5"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      12,
                      (activeIndex / Math.max(1, Math.min(stations.length - 1, 6))) * 100
                    )
                  )}%`,
                  background: 'linear-gradient(90deg, #10B981 0%, #06B6D4 100%)',
                  boxShadow: '0 0 15px rgba(6,182,212,0.6)',
                }}
              />
            </div>

            {/* İstasyon Düğümleri */}
            {stations.slice(0, 6).map((station) => {
              const isCompleted = station.status === 'completed';
              const isActive = station.id === activeStation?.id;

              return (
                <div
                  key={station.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${station.levelBadge}: ${station.title}`}
                  className="relative z-10 flex flex-1 flex-col items-center group cursor-pointer"
                  onClick={() => onSelectStation(station.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectStation(station.id);
                    }
                  }}
                >
                  <div
                    className={`relative flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all duration-300 ${
                      isActive
                        ? 'border-2 sm:border-4 border-cyan-400 bg-cyan-950 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.9)] scale-110'
                        : isCompleted
                          ? 'border-2 border-emerald-400 bg-emerald-950/80 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.4)] group-hover:scale-105'
                          : 'border border-slate-800 bg-slate-900/90 text-slate-500 opacity-60 group-hover:opacity-90'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -inset-1.5 animate-ping rounded-full border border-cyan-400 opacity-60" />
                    )}

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
                      {station.levelBadge}
                    </p>
                    <p className="line-clamp-1 text-[9px] sm:text-[10px] font-semibold leading-tight text-slate-400">
                      {station.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. ALT BÖLGE: Kademe Cetveli */}
      <div className="relative z-10 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4 text-center text-xs font-bold uppercase tracking-wider sm:grid-cols-4">
        <div className="rounded-lg border-b-2 border-emerald-500 bg-emerald-950/20 py-2 text-emerald-400">
          {resolvedTierLabels[0]}
        </div>
        <div className="rounded-lg border-b-2 border-emerald-400 bg-emerald-950/20 py-2 text-emerald-300">
          {resolvedTierLabels[1]}
        </div>
        <div className="rounded-lg border-b-2 border-cyan-400 bg-cyan-950/20 py-2 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          {resolvedTierLabels[2]}
        </div>
        <div className="rounded-lg border-b-2 border-slate-700 bg-slate-900/20 py-2 text-slate-500">
          {resolvedTierLabels[3]}
        </div>
      </div>
    </div>
  );
};
