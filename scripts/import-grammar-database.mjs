import path from 'node:path';
import {
  CEFR_LEVELS,
  assertValidLevels,
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
  'data/import/EngineerOS_Grammar_Database_Final.xlsx'
);
const canonicalDir = path.join(root, 'data/canonical/grammar');
const seedDir = path.join(root, 'src/data/grammar/by-level');
const requiredColumns = [
  'id',
  'cefrLevel',
  'grammarCategory',
  'ruleType',
  'importTier',
  'ruleTitle',
  'structure',
  'turkishExplanation',
  'engineeringUseCase',
  'suitableSkills',
  'canGenerateTaskTypes',
  'domainFit',
  'linkedVocabularyTags',
  'status',
  'confidence',
  'ruleCefrLevel',
];

const { headers, records: sourceRecords } = await readDatabaseSheet(
  input,
  'grammar_database'
);
requireColumns(headers, requiredColumns, 'Grammar database');

const rules = sourceRecords.map((row) => ({
  id: text(row.id),
  title: text(row.ruleTitle),
  cefrLevel: text(row.cefrLevel),
  ruleCefrLevel: text(row.ruleCefrLevel),
  grammarCategory: text(row.grammarCategory),
  ruleType: text(row.ruleType),
  importTier: text(row.importTier),
  ruleTitle: text(row.ruleTitle),
  definition: text(row.structure),
  explanation: text(row.engineeringUseCase),
  structure: text(row.structure),
  coreStructure: text(row.coreStructure),
  examplePattern: text(row.examplePattern),
  languageFunction: text(row.languageFunction),
  progressionFamily: text(row.progressionFamily),
  turkishExplanation: text(row.turkishExplanation),
  engineeringUseCase: text(row.engineeringUseCase),
  examples: [
    {
      english: text(row.example1English),
      turkish: text(row.example1Turkish),
    },
    {
      english: text(row.example2English),
      turkish: text(row.example2Turkish),
    },
    {
      english: text(row.example3English),
      turkish: text(row.example3Turkish),
    },
  ].filter((example) => example.english.length > 0),
  badExampleEnglish: text(row.badExampleEnglish),
  badExampleTurkishExplanation: text(row.badExampleTurkishExplanation),
  correctedExampleEnglish: text(row.correctedExampleEnglish),
  mistakeType: text(row.mistakeType),
  commonMistakes: text(row.commonMistakes),
  skillUse: list(row.suitableSkills),
  linkedVocabularyTags: list(row.linkedVocabularyTags),
  grammarFits: list(row.grammarFits),
  difficulty: number(row.difficulty),
  prerequisites: unique([
    ...list(row.prerequisiteRules),
    ...list(row.grammarPrerequisiteRules),
    ...list(row.professionalPrerequisiteRules),
  ]).filter((item) => item.toLowerCase() !== 'none'),
  canGenerateTaskTypes: list(row.canGenerateTaskTypes),
  domainFit: list(row.domainFit),
  taskPromptTemplate: text(row.taskPromptTemplate),
  minimumUserOutput: text(row.minimumUserOutput),
  masteryCriteria: text(row.masteryCriteria),
  exampleCefrLevel: text(row.exampleCefrLevel),
  status: text(row.status),
  confidence: number(row.confidence),
  cefrConfidence: number(row.cefrConfidence),
  exampleQualityScore: number(row.exampleQualityScore),
  engineeringRelevanceScore: number(row.engineeringRelevanceScore),
  taskGenerationScore: number(row.taskGenerationScore),
  importReadinessScore: number(row.importReadinessScore),
  notes: text(row.notes),
}));

assertValidLevels(rules, 'Grammar database');
const duplicateIds = duplicateValues(rules, 'id');
const missingRequired = rules.filter(
  (rule) => !rule.id || !rule.title || !rule.structure || !rule.status
);
const report = {
  generatedAt: new Date().toISOString(),
  source: path.relative(root, input).replaceAll('\\', '/'),
  recordCount: rules.length,
  duplicateIds,
  missingRequiredCount: missingRequired.length,
  cefrDistribution: distribution(rules, 'cefrLevel'),
  statusDistribution: distribution(rules, 'status'),
  passed: duplicateIds.length === 0 && missingRequired.length === 0,
};

await writeJson(
  path.join(canonicalDir, 'grammar-rules.normalized.json'),
  rules
);
await writeJson(
  path.join(canonicalDir, 'grammar-validation-report.json'),
  report
);
await writeJson(path.join(canonicalDir, 'grammar-taxonomy.json'), {
  cefrLevels: CEFR_LEVELS,
  categories: unique(rules.map((rule) => rule.grammarCategory)),
  ruleTypes: unique(rules.map((rule) => rule.ruleType)),
  importTiers: unique(rules.map((rule) => rule.importTier)),
  skills: unique(rules.flatMap((rule) => rule.skillUse)),
  taskTypes: unique(rules.flatMap((rule) => rule.canGenerateTaskTypes)),
  domains: unique(rules.flatMap((rule) => rule.domainFit)),
});

for (const level of CEFR_LEVELS) {
  await writeSeedFile({
    filePath: path.join(seedDir, `${level.toLowerCase()}.seed.ts`),
    typeImport: '@/features/grammar/grammar.types',
    typeName: 'GrammarRule',
    exportName: `${level}_GRAMMAR_RULES`,
    records: rules.filter((rule) => rule.cefrLevel === level),
  });
}

if (!report.passed) {
  throw new Error(
    `Grammar import failed: ${duplicateIds.length} duplicate IDs, ${missingRequired.length} incomplete records.`
  );
}
console.log(
  `Grammar import complete: ${rules.length} rules (${JSON.stringify(report.cefrDistribution)}).`
);
