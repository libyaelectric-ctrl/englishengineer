import type { LearningGoal, ProfessionId, UserLearningProfile } from '@/shared/types/domain.types';

export const LEARNING_GOALS: Array<{
  id: LearningGoal;
  label: string;
  preferredDomains: string[];
}> = [
  { id: 'daily', label: 'Daily', preferredDomains: ['general-english'] },
  {
    id: 'work',
    label: 'Work',
    preferredDomains: ['professional-communication'],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    preferredDomains: ['construction-site', 'electrical', 'mechanical'],
  },
  { id: 'travel', label: 'Travel', preferredDomains: ['travel'] },
  {
    id: 'management',
    label: 'Management',
    preferredDomains: ['project-management', 'professional-communication'],
  },
];

export const PROFESSIONS: Array<{
  id: ProfessionId;
  label: string;
  preferredDomains: string[];
}> = [
  {
    id: 'electrical-engineer',
    label: 'Electrical Engineer',
    preferredDomains: ['electrical'],
  },
  {
    id: 'mechanical-engineer',
    label: 'Mechanical Engineer',
    preferredDomains: ['mechanical'],
  },
  {
    id: 'civil-engineer',
    label: 'Civil Engineer',
    preferredDomains: ['civil-engineering'],
  },
  { id: 'architect', label: 'Architect', preferredDomains: ['architecture'] },
  {
    id: 'mep-engineer',
    label: 'MEP Engineer',
    preferredDomains: ['electrical', 'mechanical'],
  },
  {
    id: 'qa-qc-engineer',
    label: 'QA/QC Engineer',
    preferredDomains: ['qa-qc'],
  },
  {
    id: 'commissioning-engineer',
    label: 'Commissioning Engineer',
    preferredDomains: ['commissioning'],
  },
  {
    id: 'project-engineer',
    label: 'Project Engineer',
    preferredDomains: ['project-management', 'construction-site'],
  },
  {
    id: 'project-manager',
    label: 'Project Manager',
    preferredDomains: ['project-management'],
  },
  {
    id: 'construction-manager',
    label: 'Construction Manager',
    preferredDomains: ['construction-site'],
  },
  {
    id: 'site-supervisor',
    label: 'Site Supervisor',
    preferredDomains: ['construction-site'],
  },
];

export const getPreferredDomains = (
  profile: Pick<UserLearningProfile, 'goals' | 'professionId' | 'discipline'>
): string[] => {
  if (profile.discipline) {
    return [profile.discipline, 'general', 'engineering'];
  }
  const professionDomains =
    PROFESSIONS.find((profession) => profession.id === profile.professionId)?.preferredDomains ?? [];
  return [...new Set([...professionDomains, 'general', 'engineering'])];
};