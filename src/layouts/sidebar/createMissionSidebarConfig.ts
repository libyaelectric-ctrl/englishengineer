import type { SidebarConfig } from './sidebar.config';
import type { SIDEBAR_SKILL_COPY } from '@/features/localization/translations/rightsidebar.translations';

type SkillCopy = (typeof SIDEBAR_SKILL_COPY)['en'];

/**
 * Factory that builds a SidebarConfig for mission-based skills
 * (Writing, Listening, Speaking) — they all share the same structure:
 * remaining stat, duration/recording stat, and a single progress bar.
 */
export function createMissionSidebarConfig({
  skill,
  pathLabel,
  pathDescription,
  done,
  total,
  secondStatLabel,
  secondStatValue,
  copy,
}: {
  skill: string;
  pathLabel: string;
  pathDescription: string;
  done: number;
  total: number;
  secondStatLabel: string;
  secondStatValue: string;
  copy: SkillCopy;
}): SidebarConfig {
  const remaining = total - done;

  return {
    skill,
    pathLabel,
    pathDescription,
    currentLevel: `${done}/${total} Missions`,
    totalItems: total,
    stats: [
      {
        label: 'Remaining',
        value: `${remaining} missions`,
        color: remaining > 0 ? 'text-amber-500' : 'text-green-500',
      },
      { label: secondStatLabel, value: secondStatValue, color: 'text-cyan-500' },
    ],
    progressBars: [
      { label: copy.progress, value: done, max: total, showPercent: true, color: 'primary' },
    ],
    actions: [],
  };
}
