import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

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
  missing.push(
    'frontend and backend versions must both be ' + expectedVersion
  );
}

const backendEnv = readFileSync(resolve('backend/.env.example'), 'utf8');
if (!backendEnv.includes(`APP_VERSION=${expectedVersion}`)) {
  missing.push('backend/.env.example APP_VERSION must be 4.0.1');
}

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

const currentDocs = [
  'README.md',
];
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
