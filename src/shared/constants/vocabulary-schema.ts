/**
 * Vocabulary data schema — matches Final.xlsx `vocabulary_database` sheet.
 *
 * This is the canonical shape for vocabulary records imported from the
 * 13K-word Excel database. Use this type when reading/importing vocab data.
 */
import type { CefrLevel } from '../types/domain.types';
import type { EngineeringDiscipline, VocabularyDomain } from './engineering-disciplines';
// ---------------------------------------------------------------------------
// Vocabulary access helpers
// ---------------------------------------------------------------------------
import type { PackageTier } from './package-system';

// Raw record (Excel row shape)

export interface VocabularyRecord {
  id: string;
  term: string;
  normalizedTerm: string;
  /** Primary meaning in the interface language. */
  meaning: string;
  cefrLevel: CefrLevel;
  /** Core discipline domain — matches ENGINEERING_DISCIPLINES or 'general'/'engineering'. */
  domain: VocabularyDomain;
  contentDomain: string;
  lifeContext: string;
  register: string;
  primaryUseCase: string;
  category: string;
  termType: 'single_word' | 'two_word_term' | 'multiword_term' | 'acronym' | 'phrase';
  partOfSpeech: string;
  wordCount: number;
  definition: string;
  exampleSentence: string;
  /** Example translated to the interface language. */
  translatedExample: string;
  relatedTerms: string[];
  commonMistakes: string;
  grammarFits: string[];
  skillUse: string[];
  tags: string[];
  source: string;
  confidence: number;
  status: 'approved' | 'needs_review' | 'rejected';
  importTier: 'core' | 'technical' | 'professional' | 'extended';
  isCore: boolean;
  isTechnical: boolean;
  isProfessionalPhrase: boolean;
  isContractual: boolean;
  isDailySiteEnglish: boolean;
  isLifeWideEnglish: boolean;
  reviewReason: string | null;
  variantOf: string | null;
  grammarDomainAlias: string;
  qcRepairNotes: string;
  usagePriority: string | null;
  standardReference: string | null;
  commonCollocations: string | null;
}

// ---------------------------------------------------------------------------
// Localised vocabulary (what the UI actually uses)
// ---------------------------------------------------------------------------

export interface LocalisedVocabularyRecord {
  id: string;
  term: string;
  normalizedTerm: string;
  /** Translated meaning — value depends on user's interface language. */
  meaning: string;
  cefrLevel: CefrLevel;
  domain: VocabularyDomain;
  category: string;
  termType: string;
  partOfSpeech: string;
  definition: string;
  /** Example sentence in the user's interface language. */
  example: string;
  /** Original English example sentence. */
  englishExample: string;
  relatedTerms: string[];
  commonMistakes: string;
  grammarFits: string[];
  tags: string[];
  confidence: number;
  isCore: boolean;
  isTechnical: boolean;
}

// ---------------------------------------------------------------------------
// Multi-language support
// ---------------------------------------------------------------------------

/**
 * Maps an interface language code to the column name in the Excel database
 * that holds the translated meaning/example for that language.
 *
 * Currently only English (term) and Turkish (turkishMeaning) are populated.
 * As new language packs are added, extend this map.
 */
export const LANGUAGE_COLUMN_MAP: Record<string, { meaning: string; example: string }> = {
  en: { meaning: 'term', example: 'exampleSentence' },
  tr: { meaning: 'turkishMeaning', example: 'turkishExample' },
  // Future language columns (to be added when Excel is extended):
  // ar: { meaning: 'arabicMeaning', example: 'arabicExample' },
  // es: { meaning: 'spanishMeaning', example: 'spanishExample' },
  // it: { meaning: 'italianMeaning', example: 'italianExample' },
  // fr: { meaning: 'frenchMeaning', example: 'frenchExample' },
  // de: { meaning: 'germanMeaning', example: 'germanExample' },
  // pt: { meaning: 'portugueseMeaning', example: 'portugueseExample' },
  // ru: { meaning: 'russianMeaning', example: 'russianExample' },
  // zh: { meaning: 'chineseMeaning', example: 'chineseExample' },
  // ja: { meaning: 'japaneseMeaning', example: 'japaneseExample' },
  // ko: { meaning: 'koreanMeaning', example: 'koreanExample' },
};

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

/**
 * Returns the vocabulary domains a user can access given their discipline
 * and package tier.
 *
 * - Free tier: discipline-specific vocabulary only
 * - Pro/Project: discipline + cross-discipline (general, engineering)
 */
export function getAccessibleDomains(
  discipline: EngineeringDiscipline,
  tier: PackageTier
): VocabularyDomain[] {
  const domains: VocabularyDomain[] = [discipline];
  if (tier !== 'free') {
    domains.push('general', 'engineering');
  }
  return domains;
}

/**
 * Returns the CEFR range filter for a package tier.
 * Free users see A1-B1, Pro/Project see full A1-C2.
 */
export function getAccessibleCefrLevels(tier: PackageTier): CefrLevel[] {
  if (tier === 'free') {
    return ['A1', 'A2', 'B1'];
  }
  return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
}
