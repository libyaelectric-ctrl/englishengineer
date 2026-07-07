import type {
  LearningGoal,
  ProfessionId,
  UserLearningProfile,
} from './profile.types';

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
  { id: 'other', label: 'Other', preferredDomains: [] },
];

export const INDUSTRIES = [
  { id: 'hospital', label: 'Hospital' },
  { id: 'data-center', label: 'Data Center' },
  { id: 'oil-gas', label: 'Oil & Gas' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'residential', label: 'Residential' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'other', label: 'Other' },
] as const;

export const COMMUNICATION_GOALS = [
  { id: 'site-meetings', label: 'Site meetings' },
  { id: 'email-report-writing', label: 'Email and report writing' },
  { id: 'inspection-communication', label: 'Inspection communication' },
  { id: 'commissioning', label: 'Commissioning' },
  { id: 'management', label: 'Management' },
  { id: 'interview-career', label: 'Interview and career' },
] as const;

export const DAILY_DURATION_OPTIONS = [15, 30, 60, 90, 120, 150, 180];
export const DAILY_TASK_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

export const PROFESSIONAL_TRACKS = [
  { id: 'electrical', label: 'Electrical Engineering', available: true },
  { id: 'mechanical', label: 'Mechanical Engineering', available: false },
  { id: 'civil', label: 'Civil Engineering', available: false },
  { id: 'architecture', label: 'Architecture', available: false },
  { id: 'mep-coordination', label: 'MEP Coordination', available: false },
  { id: 'data-center', label: 'Data Center', available: false },
  { id: 'oil-gas', label: 'Oil & Gas', available: false },
  { id: 'qa-qc', label: 'QA/QC', available: false },
  { id: 'commissioning', label: 'Commissioning', available: false },
  { id: 'infrastructure', label: 'Infrastructure', available: false },
  {
    id: 'healthcare-hospital',
    label: 'Healthcare / Hospital',
    available: false,
  },
  { id: 'industrial', label: 'Industrial', available: false },
] as const;

export const ELECTRICAL_SUBDOMAINS = [
  { id: 'low-voltage', label: 'Low Voltage Systems' },
  { id: 'medium-voltage', label: 'Medium Voltage Systems' },
  { id: 'lighting', label: 'Lighting Systems' },
  { id: 'elv-low-current', label: 'ELV / Low Current Systems' },
  { id: 'fire-alarm', label: 'Fire Alarm Systems' },
  {
    id: 'emergency-power-generators',
    label: 'Emergency Power / Generators',
  },
  { id: 'ups', label: 'UPS Systems' },
  { id: 'data-center-electrical', label: 'Data Center Electrical' },
  { id: 'hospital-electrical', label: 'Hospital Electrical Systems' },
  { id: 'commissioning', label: 'Commissioning' },
  { id: 'qa-qc-electrical', label: 'QA/QC Electrical' },
  { id: 'testing-inspection', label: 'Testing & Inspection' },
  { id: 'site-coordination', label: 'Site Coordination' },
] as const;

export const EXPERIENCE_LEVELS = [
  { id: 'student', label: 'Student / Graduate' },
  { id: 'early-career', label: '0-3 years' },
  { id: 'experienced', label: '4-10 years' },
  { id: 'lead-manager', label: 'Lead / Manager' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const;

export const CAREER_GOALS = [
  'Lead site meetings with confidence',
  'Write clear technical reports and emails',
  'Handle consultant and client discussions',
  'Prepare for commissioning leadership',
  'Advance into an international project role',
] as const;

export const COUNTRIES = [
  'Türkiye',
  'Libya',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'United Kingdom',
  'United States',
  'Other',
] as const;

export const TIMEZONES = [
  'Europe/Istanbul',
  'Africa/Tripoli',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Qatar',
  'Europe/London',
  'America/New_York',
  'UTC',
] as const;

export const getPreferredDomains = (
  profile: Pick<UserLearningProfile, 'goals' | 'professionId'>
): string[] => {
  const goalDomains = LEARNING_GOALS.filter((goal) =>
    profile.goals.includes(goal.id)
  ).flatMap((goal) => goal.preferredDomains);
  const professionDomains =
    PROFESSIONS.find((profession) => profession.id === profile.professionId)
      ?.preferredDomains ?? [];
  return [...new Set([...professionDomains, ...goalDomains])];
};

export const getWeeklyStreakStatus = (
  practicedDates: string[],
  allowedMissedDays: number,
  now = new Date()
): { protected: boolean; missedDays: number; remainingTolerance: number } => {
  const practiced = new Set(practicedDates.map((date) => date.slice(0, 10)));
  const day = now.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  let missedDays = 0;
  for (let offset = daysSinceMonday; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - offset);
    if (!practiced.has(date.toISOString().slice(0, 10))) missedDays += 1;
  }
  return {
    protected: missedDays <= allowedMissedDays,
    missedDays,
    remainingTolerance: Math.max(0, allowedMissedDays - missedDays),
  };
};
