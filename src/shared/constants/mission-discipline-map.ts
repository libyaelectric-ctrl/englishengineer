/**
 * Maps free-text mission discipline labels to canonical discipline IDs.
 * Used by reading/writing/listening/speaking services to filter missions by user discipline.
 */
import {
  CrossDisciplineDomain,
  EngineeringDiscipline,
  VocabularyDomain,
} from './engineering-disciplines';

type MissionDisciplineValue = EngineeringDiscipline | CrossDisciplineDomain;

const MISSION_DISCIPLINE_MAP: Record<string, MissionDisciplineValue> = {
  // Electrical
  'Electrical Engineering': 'electrical',
  Electrical: 'electrical',
  electrical: 'electrical',

  // Civil
  'Civil Engineering': 'civil',
  Civil: 'civil',
  civil: 'civil',
  'Construction Safety': 'hse',
  Construction: 'civil',

  // Mechanical
  'Mechanical Engineering': 'mechanical',
  Mechanical: 'mechanical',
  mechanical: 'mechanical',
  HVAC: 'mechanical',
  Plumbing: 'mechanical',

  // HSE
  HSE: 'hse',
  hse: 'hse',
  Safety: 'hse',
  'Site Safety': 'hse',
  'Health Safety Environment': 'hse',

  // Architecture
  Architecture: 'architecture',
  architecture: 'architecture',
  'Building Systems': 'architecture',

  // Chemical
  'Chemical Engineering': 'chemical',
  chemical: 'chemical',
  'Process Engineering': 'chemical',

  // Electronics
  Electronics: 'electronics',
  electronics: 'electronics',
  'Embedded Systems': 'electronics',
  Instrumentation: 'electronics',

  // Industrial
  'Industrial Engineering': 'industrial',
  industrial: 'industrial',
  'Quality Assurance': 'industrial',
  'Quality Control': 'industrial',
  'QA/QC': 'industrial',
  Commissioning: 'industrial',
  QAQC: 'industrial',

  // Mechatronics
  Mechatronics: 'mechatronics',
  mechatronics: 'mechatronics',
  Automation: 'mechatronics',
  Robotics: 'mechatronics',

  // Software
  'Software Engineering': 'software',
  software: 'software',
  IT: 'software',
  Cloud: 'software',

  // Cross-discipline
  'Field Engineering': 'general',
  'Design Compliance': 'engineering',
  'Client Delivery': 'general',
  MEP: 'engineering',
  General: 'general',
  general: 'general',
  engineering: 'engineering',
};

const CROSS_DISCIPLINE_SET: ReadonlySet<CrossDisciplineDomain> = new Set([
  'general',
  'engineering',
]);

/**
 * Maps a free-text mission discipline label to a canonical VocabularyDomain.
 * Returns 'general' if no mapping found (missions shown to all disciplines).
 */
export function mapMissionDiscipline(missionDiscipline: string | undefined): VocabularyDomain {
  if (!missionDiscipline) return 'general';
  return MISSION_DISCIPLINE_MAP[missionDiscipline] ?? 'general';
}

/**
 * Checks if a mission is compatible with the user's discipline.
 * Compatible means: mission discipline matches user discipline,
 * OR mission belongs to cross-discipline domains (general/engineering).
 */
export function isMissionCompatible(
  missionDiscipline: string | undefined,
  userDiscipline: EngineeringDiscipline
): boolean {
  const mapped = mapMissionDiscipline(missionDiscipline);

  // Cross-discipline missions are always shown
  if (CROSS_DISCIPLINE_SET.has(mapped as CrossDisciplineDomain)) return true;

  // Direct match
  return mapped === userDiscipline;
}

/**
 * Filters an array of missions by user discipline.
 * Returns missions compatible with the user's discipline.
 */
export function filterMissionsByDiscipline<T extends { discipline?: string }>(
  missions: T[],
  userDiscipline: EngineeringDiscipline
): T[] {
  return missions.filter((m) => isMissionCompatible(m.discipline, userDiscipline));
}
