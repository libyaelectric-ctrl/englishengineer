import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

const requiredPaths = [
  'package-lock.json',
  'backend/package-lock.json',
  'backend/server.js',
  'supabase/migrations',
  '.env.example',
  'src/features/level-system/level-system.types.ts',
];

const missing = requiredPaths.filter((path) => !existsSync(resolve(path)));
const audioFiles = existsSync(resolve('public/audio'))
  ? readdirSync(resolve('public/audio')).filter((file) => file.endsWith('.wav'))
  : [];

const readJson = (path) => JSON.parse(readFileSync(resolve(path), 'utf8'));
const frontendPackage = readJson('package.json');
const backendPackage = readJson('backend/package.json');
const expectedVersion = '4.0.1';

if (
  frontendPackage.version !== expectedVersion ||
  backendPackage.version !== expectedVersion
) {
  missing.push('frontend and backend versions must both be ' + expectedVersion);
}

const backendEnv = readFileSync(resolve('backend/.env.example'), 'utf8');
if (!backendEnv.includes(`APP_VERSION=${expectedVersion}`)) {
  missing.push('backend/.env.example APP_VERSION must be 4.0.1');
}

// AST-based content count functions
const unwrapInitializer = (node) => {
  let init = node.initializer;
  while (init && ts.isAsExpression(init)) {
    init = init.expression;
  }
  return init;
};

const countArrayElements = (filePath, variableName) => {
  if (!existsSync(resolve(filePath))) return 0;
  const sourceCode = readFileSync(resolve(filePath), 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  let count = 0;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.text === variableName) {
      const init = unwrapInitializer(node);
      if (init && ts.isArrayLiteralExpression(init)) {
        count = init.elements.length;
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
  return count;
};

const getPhraseLibraryCount = (filePath) => {
  if (!existsSync(resolve(filePath))) return 0;
  const sourceCode = readFileSync(resolve(filePath), 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  let topicsCount = 0;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.text === 'PHRASE_TOPICS') {
      const init = unwrapInitializer(node);
      if (init && ts.isArrayLiteralExpression(init)) {
        topicsCount = init.elements.length;
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
  const expandedCount = topicsCount * 5;
  const baseCount = countArrayElements(
    'src/features/work-tools/work-tools.data.ts',
    'BASE_PHRASE_LIBRARY'
  );
  return baseCount + expandedCount;
};

const getMeetingPhrasebookCount = () => {
  const filePath = 'src/features/work-tools/quick-tools.expanded.data.ts';
  if (!existsSync(resolve(filePath))) return 0;
  const sourceCode = readFileSync(resolve(filePath), 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  let topicsCount = 0;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.text === 'MEETING_TOPICS') {
      const init = unwrapInitializer(node);
      if (init && ts.isArrayLiteralExpression(init)) {
        topicsCount = init.elements.length;
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
  const expandedCount = topicsCount * 15;
  const baseCount = countArrayElements(
    'src/features/work-tools/quick-tools.data.ts',
    'BASE_MEETING_PHRASES'
  );
  return baseCount + expandedCount;
};

const getSiteDictionaryCount = () => {
  const filePath = 'src/features/work-tools/quick-tools.expanded.data.ts';
  if (!existsSync(resolve(filePath))) return 0;
  const sourceCode = readFileSync(resolve(filePath), 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  let seedsCount = 0;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.text === 'TERM_PACKS') {
      const init = unwrapInitializer(node);
      if (init && ts.isObjectLiteralExpression(init)) {
        init.properties.forEach((prop) => {
          if (
            ts.isPropertyAssignment(prop) &&
            ts.isStringLiteral(prop.initializer)
          ) {
            seedsCount += prop.initializer.text.split(';').length;
          }
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
  const expandedCount = seedsCount;
  const baseCount = countArrayElements(
    'src/features/work-tools/quick-tools.data.ts',
    'BASE_SITE_DICTIONARY'
  );
  return baseCount + expandedCount;
};

const content = {
  engineeringTemplates:
    countArrayElements(
      'src/features/work-tools/work-tools.data.ts',
      'BASE_ENGINEERING_TEMPLATES'
    ) +
    countArrayElements(
      'src/features/work-tools/work-tools.expanded.data.ts',
      'ENGINEERING_SEEDS'
    ),
  emailTemplates:
    countArrayElements(
      'src/features/work-tools/work-tools.data.ts',
      'BASE_EMAIL_TEMPLATES'
    ) +
    countArrayElements(
      'src/features/work-tools/work-tools.expanded.data.ts',
      'EMAIL_SEEDS'
    ),
  phraseLibrary: getPhraseLibraryCount(
    'src/features/work-tools/work-tools.expanded.data.ts'
  ),
  meetingPhrasebook: getMeetingPhrasebookCount(),
  siteDictionary: getSiteDictionaryCount(),
  quickAIActions: countArrayElements(
    'src/features/work-tools/quick-tools.data.ts',
    'BASE_QUICK_AI_ACTIONS'
  ),
};

const minimums = {
  engineeringTemplates: 40,
  emailTemplates: 40,
  phraseLibrary: 100,
  meetingPhrasebook: 75,
  siteDictionary: 300,
  quickAIActions: 13,
};
for (const [key, minimum] of Object.entries(minimums)) {
  if (content[key] < minimum)
    missing.push(`${key} must be at least ${minimum}`);
}

const levelSource = readFileSync(
  resolve('src/features/level-system/level-system.types.ts'),
  'utf8'
);
if (!levelSource.includes("['A1', 'A2', 'B1', 'B2', 'C1', 'C2']")) {
  missing.push('CEFR level order must be A1, A2, B1, B2, C1, C2');
}

const currentDocs = ['README.md'];
for (const path of currentDocs) {
  if (!existsSync(resolve(path))) {
    missing.push(`${path} must exist`);
  }
}

if (missing.length > 0) {
  console.error('Release structure verification failed:');
  missing.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log('Release structure verified.');
console.log(`WAV assets: ${audioFiles.length}`);
console.log('Frontend lockfile: present');
console.log('Backend lockfile: present');
console.log('Supabase migrations: present');
console.log(`Version consistency: ${expectedVersion}`);
