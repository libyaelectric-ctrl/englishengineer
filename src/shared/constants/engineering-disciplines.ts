/**
 * Central engineering discipline definitions.
 *
 * The 10 core disciplines + 2 cross-discipline domains (general, engineering)
 * matching the Final.xlsx vocabulary database.
 */

export const ENGINEERING_DISCIPLINES = [
  'architecture',
  'chemical',
  'civil',
  'electrical',
  'electronics',
  'hse',
  'industrial',
  'mechanical',
  'mechatronics',
  'software',
] as const;

export type EngineeringDiscipline = (typeof ENGINEERING_DISCIPLINES)[number];

/** Cross-discipline vocabulary domains available to all disciplines. */
export const CROSS_DISCIPLINE_DOMAINS = ['general', 'engineering'] as const;
export type CrossDisciplineDomain = (typeof CROSS_DISCIPLINE_DOMAINS)[number];

/** Cross-discipline pool sizes (from the canonical corpus). Included in every discipline total. */
export const CROSS_DOMAIN_WORD_COUNTS: Record<CrossDisciplineDomain, number> = {
  general: 2327,
  engineering: 1104,
};

/** General + Engineering core vocabulary shared by all disciplines. */
export const CORE_VOCABULARY_WORD_COUNT =
  CROSS_DOMAIN_WORD_COUNTS.general + CROSS_DOMAIN_WORD_COUNTS.engineering;

/** All vocabulary domains (core + cross-discipline). */
export type VocabularyDomain = EngineeringDiscipline | CrossDisciplineDomain;

export interface DisciplineMeta {
  id: EngineeringDiscipline;
  labelKey: string; // i18n key — e.g. "discipline.electrical"
  icon: string; // Lucide icon name
  descriptionKey: string; // i18n key
  wordCount: number; // from Final.xlsx domain_distribution
}

/**
 * Canonical discipline metadata.
 * Labels are English fallbacks; actual UI text comes from i18n.
 */
export const DISCIPLINE_META: Record<EngineeringDiscipline, DisciplineMeta> = {
  architecture: {
    id: 'architecture',
    labelKey: 'discipline.architecture',
    icon: 'Building2',
    descriptionKey: 'discipline.architecture.desc',
    wordCount: 937,
  },
  chemical: {
    id: 'chemical',
    labelKey: 'discipline.chemical',
    icon: 'FlaskConical',
    descriptionKey: 'discipline.chemical.desc',
    wordCount: 924,
  },
  civil: {
    id: 'civil',
    labelKey: 'discipline.civil',
    icon: 'HardHat',
    descriptionKey: 'discipline.civil.desc',
    wordCount: 935,
  },
  electrical: {
    id: 'electrical',
    labelKey: 'discipline.electrical',
    icon: 'Zap',
    descriptionKey: 'discipline.electrical.desc',
    wordCount: 1492,
  },
  electronics: {
    id: 'electronics',
    labelKey: 'discipline.electronics',
    icon: 'Cpu',
    descriptionKey: 'discipline.electronics.desc',
    wordCount: 1037,
  },
  hse: {
    id: 'hse',
    labelKey: 'discipline.hse',
    icon: 'ShieldCheck',
    descriptionKey: 'discipline.hse.desc',
    wordCount: 1017,
  },
  industrial: {
    id: 'industrial',
    labelKey: 'discipline.industrial',
    icon: 'Factory',
    descriptionKey: 'discipline.industrial.desc',
    wordCount: 1002,
  },
  mechanical: {
    id: 'mechanical',
    labelKey: 'discipline.mechanical',
    icon: 'Wrench',
    descriptionKey: 'discipline.mechanical.desc',
    wordCount: 1109,
  },
  mechatronics: {
    id: 'mechatronics',
    labelKey: 'discipline.mechatronics',
    icon: 'Bot',
    descriptionKey: 'discipline.mechatronics.desc',
    wordCount: 930,
  },
  software: {
    id: 'software',
    labelKey: 'discipline.software',
    icon: 'Code2',
    descriptionKey: 'discipline.software.desc',
    wordCount: 1385,
  },
};
