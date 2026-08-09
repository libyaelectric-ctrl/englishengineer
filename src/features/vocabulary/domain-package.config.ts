import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

export type DomainKey = EngineeringDiscipline | 'general' | 'engineering';

export interface DomainPackageInfo {
  label: string;
  icon: string;
  description: string;
}

export const DOMAIN_PACKAGE_MAP: {
  readonly base: readonly string[];
  readonly branches: Record<EngineeringDiscipline, DomainPackageInfo>;
} = {
  base: ['general', 'engineering'],
  branches: {
    architecture: {
      label: 'Architecture',
      icon: 'landmark',
      description: 'Building design, structures, and urban planning.',
    },
    chemical: {
      label: 'Chemical Eng.',
      icon: 'flask',
      description: 'Process design, reactions, and plant operations.',
    },
    civil: {
      label: 'Civil Eng.',
      icon: 'building',
      description: 'Infrastructure, structures, and construction management.',
    },
    electrical: {
      label: 'Electrical Eng.',
      icon: 'zap',
      description: 'Power systems, circuits, and industrial controls.',
    },
    electronics: {
      label: 'Electronics Eng.',
      icon: 'cpu',
      description: 'Circuit design, embedded systems, and signal processing.',
    },
    hse: {
      label: 'HSE',
      icon: 'shield-check',
      description: 'Health, safety, and environmental management.',
    },
    industrial: {
      label: 'Industrial Eng.',
      icon: 'factory',
      description: 'Production systems, logistics, and process optimization.',
    },
    mechanical: {
      label: 'Mechanical Eng.',
      icon: 'settings',
      description: 'Mechanical design, thermodynamics, and manufacturing.',
    },
    mechatronics: {
      label: 'Mechatronics',
      icon: 'bot',
      description: 'Robotics, automation, and control systems.',
    },
    software: {
      label: 'Software Eng.',
      icon: 'monitor',
      description: 'Software development, architecture, and DevOps.',
    },
  },
} as const;

export const BRANCH_LABELS: Record<EngineeringDiscipline, string> = Object.fromEntries(
  Object.entries(DOMAIN_PACKAGE_MAP.branches).map(([k, v]) => [k, v.label])
) as Record<EngineeringDiscipline, string>;

export const BRANCH_ICONS: Record<EngineeringDiscipline, string> = Object.fromEntries(
  Object.entries(DOMAIN_PACKAGE_MAP.branches).map(([k, v]) => [k, v.icon])
) as Record<EngineeringDiscipline, string>;

export const ALL_DOMAINS: DomainKey[] = [
  'general',
  'engineering',
  ...(Object.keys(DOMAIN_PACKAGE_MAP.branches) as EngineeringDiscipline[]),
];
