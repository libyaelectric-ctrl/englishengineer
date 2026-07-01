import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const requiredPaths = [
  'package-lock.json',
  'backend/package-lock.json',
  'backend/server.js',
  'public/audio',
  'supabase/migrations',
  '.env.example',
  'scripts/content-manifest.json',
  'src/features/level-system/level-system.types.ts',
  'EngineerOS_v4_0_1_Final_Polish_Content_Level_UI_Report.md',
  'EngineerOS_v4_0_1_Real_Level_Gating_Test_Stability_Report.md',
  'EngineerOS_v4_0_1_Vocabulary_Search_External_Lookup_Report.md',
  'EngineerOS_v4_0_1_Vocabulary_Memory_Review_Report.md',
  'EngineerOS_v4_0_1_Level_Gating_Vocabulary_Final_Report.md',
  'EngineerOS_v4_0_1_P0_Security_Billing_Hardening_Report.md',
  'EngineerOS_v4_0_1_Test_Exit_Level_Gap_Report.md',
  'EngineerOS_v4_0_1_Final_Gate_Fix_Report.md',
  'EngineerOS_v4_0_1_Backend_Three_Fixes_Repair_Report.md',
  'EngineerOS_v4_0_1_Final_Release_Gate_Lock_Report.md',
  'EngineerOS_v4_0_1_Final_Quality_Gate_Chain_Report.md',
  'SECURITY_HARDENING_NOTES.md',
];

const missing = requiredPaths.filter((path) => !existsSync(resolve(path)));
const audioFiles = existsSync(resolve('public/audio'))
  ? readdirSync(resolve('public/audio')).filter((file) => file.endsWith('.wav'))
  : [];

if (audioFiles.length !== 13) {
  missing.push(
    `public/audio expected 13 WAV files, found ${audioFiles.length}`
  );
}

const readJson = (path) => JSON.parse(readFileSync(resolve(path), 'utf8'));
const frontendPackage = readJson('package.json');
const backendPackage = readJson('backend/package.json');
const metadata = readJson('metadata.json');
const content = readJson('scripts/content-manifest.json');
const expectedVersion = '4.0.1';

if (
  frontendPackage.version !== expectedVersion ||
  backendPackage.version !== expectedVersion ||
  content.version !== expectedVersion ||
  !metadata.description.includes(`v${expectedVersion}`)
) {
  missing.push(
    'frontend, backend, metadata and content versions must all be 4.0.1'
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
  'RELEASE_CHECKLIST.md',
  'PRODUCTION_READINESS_REPORT.md',
  'DEPLOYMENT_GUIDE.md',
  'BACKEND_AI.md',
  'STRIPE.md',
  'SUPABASE.md',
  'TESTING.md',
  'LISTENING_ENGINE.md',
];
for (const path of currentDocs) {
  if (!readFileSync(resolve(path), 'utf8').includes('4.0.1')) {
    missing.push(`${path} must identify v4.0.1`);
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
console.log(
  `Content counts: templates ${content.engineeringTemplates}, emails ${content.emailTemplates}, phrases ${content.phraseLibrary}, meeting ${content.meetingPhrasebook}, dictionary ${content.siteDictionary}, Quick AI ${content.quickAIActions}`
);
