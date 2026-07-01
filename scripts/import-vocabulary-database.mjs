import path from 'node:path';
import {
  CEFR_LEVELS,
  assertValidLevels,
  boolean,
  distribution,
  duplicateValues,
  list,
  number,
  readDatabaseSheet,
  requireColumns,
  text,
  unique,
  writeJson,
  writeSeedFile,
} from './learning-database-utils.mjs';

const root = process.cwd();
const input = path.join(
  root,
  'data/import/EngineerOS_Vocabulary_Database_Final.xlsx'
);
const canonicalDir = path.join(root, 'data/canonical/vocabulary');
const seedDir = path.join(root, 'src/data/vocabulary/by-level');
const requiredColumns = [
  'id',
  'term',
  'normalizedTerm',
  'turkishMeaning',
  'cefrLevel',
  'domain',
  'contentDomain',
  'lifeContext',
  'register',
  'primaryUseCase',
  'partOfSpeech',
  'definition',
  'exampleSentence',
  'grammarFits',
  'skillUse',
  'importTier',
  'variantOf',
  'grammarDomainAlias',
  'status',
];

const { headers, records: sourceRecords } = await readDatabaseSheet(
  input,
  'vocabulary_database'
);
requireColumns(headers, requiredColumns, 'Vocabulary database');

const terms = sourceRecords.map((row) => ({
  id: text(row.id),
  term: text(row.term),
  normalizedTerm: text(row.normalizedTerm).toLowerCase(),
  turkishMeaning: text(row.turkishMeaning),
  cefrLevel: text(row.cefrLevel),
  domain: text(row.domain),
  contentDomain: text(row.contentDomain),
  lifeContext: text(row.lifeContext),
  register: text(row.register),
  primaryUseCase: text(row.primaryUseCase),
  category: text(row.category),
  termType: text(row.termType),
  partOfSpeech: text(row.partOfSpeech),
  wordCount: number(row.wordCount),
  definition: text(row.definition),
  exampleSentence: text(row.exampleSentence),
  turkishExample: text(row.turkishExample),
  relatedTerms: list(row.relatedTerms),
  commonMistakes: text(row.commonMistakes),
  grammarFits: list(row.grammarFits),
  skillUse: list(row.skillUse),
  tags: list(row.tags),
  source: text(row.source),
  confidence: number(row.confidence),
  status: text(row.status),
  importTier: text(row.importTier),
  isCore: boolean(row.isCore),
  isTechnical: boolean(row.isTechnical),
  isProfessionalPhrase: boolean(row.isProfessionalPhrase),
  isContractual: boolean(row.isContractual),
  isDailySiteEnglish: boolean(row.isDailySiteEnglish),
  isLifeWideEnglish: boolean(row.isLifeWideEnglish),
  reviewReason: text(row.reviewReason),
  variantOf: text(row.variantOf),
  grammarDomainAlias: text(row.grammarDomainAlias),
  qcRepairNotes: text(row.qcRepairNotes),
}));

assertValidLevels(terms, 'Vocabulary database');
const duplicateIds = duplicateValues(terms, 'id');
const duplicateNormalizedTerms = duplicateValues(terms, 'normalizedTerm');
const missingRequired = terms.filter(
  (term) =>
    !term.id ||
    !term.term ||
    !term.normalizedTerm ||
    !term.definition ||
    !term.status
);
const report = {
  generatedAt: new Date().toISOString(),
  source: path.relative(root, input).replaceAll('\\', '/'),
  recordCount: terms.length,
  duplicateIds,
  duplicateNormalizedTerms,
  missingRequiredCount: missingRequired.length,
  cefrDistribution: distribution(terms, 'cefrLevel'),
  statusDistribution: distribution(terms, 'status'),
  passed:
    duplicateIds.length === 0 &&
    duplicateNormalizedTerms.length === 0 &&
    missingRequired.length === 0,
};

await writeJson(path.join(canonicalDir, 'vocabulary.normalized.json'), terms);
await writeJson(
  path.join(canonicalDir, 'vocabulary-validation-report.json'),
  report
);
await writeJson(path.join(canonicalDir, 'vocabulary-taxonomy.json'), {
  cefrLevels: CEFR_LEVELS,
  domains: unique(terms.map((term) => term.domain)),
  contentDomains: unique(terms.map((term) => term.contentDomain)),
  lifeContexts: unique(terms.map((term) => term.lifeContext)),
  registers: unique(terms.map((term) => term.register)),
  primaryUseCases: unique(terms.map((term) => term.primaryUseCase)),
  partsOfSpeech: unique(terms.map((term) => term.partOfSpeech)),
  grammarFits: unique(terms.flatMap((term) => term.grammarFits)),
  skills: unique(terms.flatMap((term) => term.skillUse)),
  tags: unique(terms.flatMap((term) => term.tags)),
});

for (const level of CEFR_LEVELS) {
  await writeSeedFile({
    filePath: path.join(seedDir, `${level.toLowerCase()}.seed.ts`),
    typeImport: '@/features/vocabulary/vocabulary.types',
    typeName: 'VocabularyTerm',
    exportName: `${level}_VOCABULARY_TERMS`,
    records: terms.filter((term) => term.cefrLevel === level),
  });
}

if (!report.passed) {
  throw new Error(
    `Vocabulary import failed: ${duplicateIds.length} duplicate IDs, ${duplicateNormalizedTerms.length} duplicate normalized terms, ${missingRequired.length} incomplete records.`
  );
}
console.log(
  `Vocabulary import complete: ${terms.length} terms (${JSON.stringify(report.cefrDistribution)}).`
);
