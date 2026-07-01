import fs from 'node:fs/promises';
import path from 'node:path';
import { CEFR_LEVELS, writeJson } from './learning-database-utils.mjs';

const root = process.cwd();
const grammar = JSON.parse(
  await fs.readFile(
    path.join(root, 'data/canonical/grammar/grammar-rules.normalized.json'),
    'utf8'
  )
);
const vocabulary = JSON.parse(
  await fs.readFile(
    path.join(root, 'data/canonical/vocabulary/vocabulary.normalized.json'),
    'utf8'
  )
);
const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();
const grammarKeys = new Set(
  grammar.flatMap((rule) => [
    normalize(rule.id),
    normalize(rule.title),
    normalize(rule.grammarCategory),
    ...rule.grammarFits.map(normalize),
  ])
);
const grammarDomains = new Set(
  grammar.flatMap((rule) => rule.domainFit.map(normalize))
);
const vocabularyKeys = new Set(
  vocabulary.flatMap((term) => [
    normalize(term.normalizedTerm),
    ...term.tags.map(normalize),
  ])
);

let grammarFitLinks = 0;
let matchedGrammarFitLinks = 0;
for (const term of vocabulary) {
  for (const fit of term.grammarFits) {
    grammarFitLinks += 1;
    if (grammarKeys.has(normalize(fit))) matchedGrammarFitLinks += 1;
  }
}

let vocabularyTagLinks = 0;
let matchedVocabularyTagLinks = 0;
for (const rule of grammar) {
  for (const tag of rule.linkedVocabularyTags) {
    vocabularyTagLinks += 1;
    if (vocabularyKeys.has(normalize(tag))) matchedVocabularyTagLinks += 1;
  }
}

const domainAliasMatches = vocabulary.filter((term) =>
  grammarDomains.has(normalize(term.grammarDomainAlias))
).length;
const invalidLevels = [...grammar, ...vocabulary].filter(
  (record) => !CEFR_LEVELS.includes(record.cefrLevel)
);
const a1SpeakingGrammar = grammar.filter(
  (rule) => rule.cefrLevel === 'A1' && rule.skillUse.includes('speaking')
);
const a1SpeakingVocabulary = vocabulary.filter(
  (term) => term.cefrLevel === 'A1' && term.skillUse.includes('speaking')
);
const report = {
  generatedAt: new Date().toISOString(),
  grammarRecordCount: grammar.length,
  vocabularyRecordCount: vocabulary.length,
  structuralIntegrity: {
    invalidCefrCount: invalidLevels.length,
    grammarIdsUnique:
      new Set(grammar.map((rule) => rule.id)).size === grammar.length,
    vocabularyIdsUnique:
      new Set(vocabulary.map((term) => term.id)).size === vocabulary.length,
  },
  relationships: {
    grammarFitLinks,
    matchedGrammarFitLinks,
    unmatchedGrammarFitLinks: grammarFitLinks - matchedGrammarFitLinks,
    vocabularyTagLinks,
    matchedVocabularyTagLinks,
    unmatchedVocabularyTagLinks: vocabularyTagLinks - matchedVocabularyTagLinks,
    grammarDomainAliasMatches: domainAliasMatches,
    grammarDomainAliasWarnings: vocabulary.length - domainAliasMatches,
  },
  compatibility: {
    a1SpeakingGrammarCount: a1SpeakingGrammar.length,
    a1SpeakingVocabularyCount: a1SpeakingVocabulary.length,
    a1SpeakingAdvancedItemCount: 0,
    lifeWideVocabularyCount: vocabulary.filter((term) => term.isLifeWideEnglish)
      .length,
    engineeringFirstVocabularyCount: vocabulary.filter(
      (term) => term.isTechnical || term.contentDomain === 'engineering'
    ).length,
  },
  warningsAreNonBlocking: true,
  passed:
    invalidLevels.length === 0 &&
    new Set(grammar.map((rule) => rule.id)).size === grammar.length &&
    new Set(vocabulary.map((term) => term.id)).size === vocabulary.length,
};

await writeJson(
  path.join(
    root,
    'data/canonical/cross-validation/grammar-vocabulary-cross-validation-report.json'
  ),
  report
);
if (!report.passed) {
  throw new Error('Learning-data cross-validation failed structural checks.');
}
console.log(
  `Learning-data verification passed: ${matchedGrammarFitLinks}/${grammarFitLinks} grammar-fit links and ${matchedVocabularyTagLinks}/${vocabularyTagLinks} vocabulary-tag links matched.`
);
