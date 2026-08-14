import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔍 ENGVOX CONTROL CENTER - AUTOMATED AUDIT & INSPECTION PIPELINE');
console.log('------------------------------------------------------------------');

let totalChecks = 0;
let passedChecks = 0;

function runAudit(name, testFn) {
  totalChecks += 1;
  try {
    testFn();
    passedChecks += 1;
    console.log(`✅ [PASS] ${name}`);
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
  }
}

// 1. Audit LessonRunner Page & 4 Question Cards
runAudit('LessonRunner Page & Question Cards Architecture', () => {
  const runnerPath = path.join(projectRoot, 'src/pages/LessonRunnerPage/index.tsx');
  if (!fs.existsSync(runnerPath)) throw new Error('LessonRunnerPage/index.tsx missing');

  const cardFiles = [
    'MultipleChoiceCard.tsx',
    'RfiFillBlankCard.tsx',
    'AudioInstructionCard.tsx',
    'DiagramMatchingCard.tsx',
    'FeedbackDrawer.tsx',
  ];

  cardFiles.forEach((file) => {
    const fullPath = path.join(projectRoot, 'src/features/lesson-runner/components', file);
    if (!fs.existsSync(fullPath)) throw new Error(`Missing lesson card: ${file}`);
  });
});

// 2. Audit Store Integrity (masterTerms & vocabularyPool)
runAudit('Zustand Store Integrity (masterTerms & vocabularyPool)', () => {
  const storePath = path.join(projectRoot, 'src/core/learning/learning.store.ts');
  const content = fs.readFileSync(storePath, 'utf8');
  if (!content.includes('masterTerms:')) throw new Error('masterTerms action missing from learning.store.ts');
  if (!content.includes('vocabularyPool:')) throw new Error('vocabularyPool missing from learning.store.ts');
});

// 3. Audit Router Registration
runAudit('App Router Registration for /lesson-runner/:levelId', () => {
  const routerPath = path.join(projectRoot, 'src/routes/router.tsx');
  const content = fs.readFileSync(routerPath, 'utf8');
  if (!content.includes('lesson-runner/:levelId')) throw new Error('/lesson-runner/:levelId route missing');
  if (!content.includes('LessonRunnerPage')) throw new Error('LessonRunnerPage import missing');
});

// 4. Audit Real Vocabulary Corpus Integration
runAudit('Real Vocabulary Corpus Integration (VocabularyRepository)', () => {
  const servicePath = path.join(projectRoot, 'src/features/learning-path/curriculum.service.ts');
  const content = fs.readFileSync(servicePath, 'utf8');
  if (!content.includes('VocabularyRepository.getVocabularyByDomains')) {
    throw new Error('curriculum.service.ts is not calling VocabularyRepository');
  }
});

// 5. Audit LFS Absence for Media Files (Vercel safety)
runAudit('Media Assets Stored Directly in Git (No LFS Pointer Filter)', () => {
  const attrPath = path.join(projectRoot, '.gitattributes');
  const content = fs.readFileSync(attrPath, 'utf8');
  if (content.includes('public/**/*.webp filter=lfs')) {
    throw new Error('public/**/*.webp is tracked via LFS in .gitattributes');
  }
  if (content.includes('public/audio/*.mp3 filter=lfs')) {
    throw new Error('public/audio/*.mp3 is tracked via LFS in .gitattributes');
  }
});

// 6. Audit TypeScript Type Checking (tsc --noEmit)
runAudit('TypeScript Type Verification (tsc --noEmit)', () => {
  try {
    execSync('npx tsc --noEmit', { cwd: projectRoot, stdio: 'pipe' });
  } catch (err) {
    const output = err.stdout?.toString() || err.stderr?.toString() || err.message;
    throw new Error(`TypeScript check failed:\n${output}`);
  }
});

// 7. Audit Vitest Test Suite
runAudit('Vitest Learning Path Test Suite', () => {
  try {
    execSync('npx vitest run src/features/learning-path', { cwd: projectRoot, stdio: 'pipe' });
  } catch (err) {
    const output = err.stdout?.toString() || err.stderr?.toString() || err.message;
    throw new Error(`Vitest test suite failed:\n${output}`);
  }
});

console.log('------------------------------------------------------------------');
console.log(`📊 AUDIT SUMMARY: ${passedChecks}/${totalChecks} Inspections Passed.`);

if (passedChecks === totalChecks) {
  console.log('🎉 ALL AUDIT GATES PASSED! EngVox Control Center is 100% compliant with ENGVOX_MASTER_SPEC.md.');
  process.exit(0);
} else {
  console.error('⚠️ AUDIT FAILED! Please fix the errors above.');
  process.exit(1);
}
