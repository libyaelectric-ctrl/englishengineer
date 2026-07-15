import { ReactNode } from 'react';

export interface SidebarStat {
  label: string;
  value: string | number;
  color?: string;
}

export interface SidebarProgress {
  label: string;
  value: number;
  max: number;
  color?: string;
  showPercent?: boolean;
}

export interface SidebarAction {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'warning';
}

export interface SidebarConfig {
  skill: string;
  pathLabel: string;
  pathDescription: string;
  currentLevel?: string;
  totalItems?: number;
  stats?: SidebarStat[];
  progressBars?: SidebarProgress[];
  actions?: SidebarAction[];
  tabs?: { label: string; active?: boolean; badge?: string | number; onClick?: () => void }[];
  custom?: ReactNode;
}
