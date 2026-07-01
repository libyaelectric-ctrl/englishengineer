import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

const sourcePath = resolve(
  'src/features/content-library/content-library.data.ts'
);
const source = readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: sourcePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`;
const content = await import(moduleUrl);

const listening = content.PROFESSIONAL_LISTENING_LESSONS;
const roleplay = content.PROFESSIONAL_ROLEPLAY_SCENARIOS;
const writing = content.PROFESSIONAL_WRITING_TASKS;
const errors = [];
const validLevels = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const validStatuses = new Set([
  'script_ready',
  'audio_missing',
  'audio_verified',
]);

const requireText = (item, field, collection) => {
  if (typeof item[field] !== 'string' || item[field].trim().length === 0) {
    errors.push(`${collection}:${item.id || 'unknown'} missing ${field}`);
  }
};

const requireArray = (item, field, collection) => {
  if (!Array.isArray(item[field]) || item[field].length === 0) {
    errors.push(`${collection}:${item.id || 'unknown'} requires ${field}`);
  }
};

if (!Array.isArray(listening) || listening.length < 30) {
  errors.push('Listening content must contain at least 30 lessons.');
}
if (!Array.isArray(roleplay) || roleplay.length < 30) {
  errors.push('Roleplay content must contain at least 30 scenarios.');
}
if (!Array.isArray(writing) || writing.length < 30) {
  errors.push('Writing content must contain at least 30 tasks.');
}

const allItems = [
  ...(listening || []).map((item) => ({ ...item, collection: 'listening' })),
  ...(roleplay || []).map((item) => ({ ...item, collection: 'roleplay' })),
  ...(writing || []).map((item) => ({ ...item, collection: 'writing' })),
];
const ids = new Set();
for (const item of allItems) {
  requireText(item, 'id', item.collection);
  requireText(item, 'title', item.collection);
  if (ids.has(item.id)) errors.push(`Duplicate content id: ${item.id}`);
  ids.add(item.id);
}

for (const item of listening || []) {
  requireText(item, 'domain', 'listening');
  requireText(item, 'scenario', 'listening');
  requireText(item, 'transcript', 'listening');
  requireArray(item, 'vocabularyTargets', 'listening');
  requireArray(item, 'comprehensionQuestions', 'listening');
  requireArray(item, 'answerKey', 'listening');
  if (!validLevels.has(item.cefrLevel)) {
    errors.push(`listening:${item.id} has invalid CEFR level`);
  }
  if (!validStatuses.has(item.status)) {
    errors.push(`listening:${item.id} has invalid status`);
  }
  if (item.status === 'audio_verified' && !item.audioUrl) {
    errors.push(`listening:${item.id} claims verified audio without a file`);
  }
}

for (const item of roleplay || []) {
  ['role', 'situation', 'userTask', 'expectedResponseStyle'].forEach((field) =>
    requireText(item, field, 'roleplay')
  );
  ['evaluationRubric', 'commonMistakes', 'vocabularyTargets'].forEach((field) =>
    requireArray(item, field, 'roleplay')
  );
  if (!validLevels.has(item.level)) {
    errors.push(`roleplay:${item.id} has invalid CEFR level`);
  }
}

for (const item of writing || []) {
  ['scenario', 'userTask', 'targetFormat'].forEach((field) =>
    requireText(item, field, 'writing')
  );
  ['rubric', 'commonMistakes', 'vocabularyTargets'].forEach((field) =>
    requireArray(item, field, 'writing')
  );
  if (!validLevels.has(item.level)) {
    errors.push(`writing:${item.id} has invalid CEFR level`);
  }
}

if (errors.length > 0) {
  console.error('Content validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(
    `Content validation passed: ${listening.length} listening, ${roleplay.length} roleplay, ${writing.length} writing definitions.`
  );
}
