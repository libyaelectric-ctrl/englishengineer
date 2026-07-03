import { spawnSync } from 'node:child_process';

const commands = [
  { label: 'npm run typecheck', npmArgs: ['run', 'typecheck'] },
  { label: 'npm run format:check', npmArgs: ['run', 'format:check'] },
  { label: 'npm run lint', npmArgs: ['run', 'lint'] },
  {
    label: 'npm run content:validate',
    npmArgs: ['run', 'content:validate'],
  },
  {
    label: 'direct frontend tests',
    executable: process.execPath,
    args: [
      './node_modules/vitest/vitest.mjs',
      'run',
      '--configLoader',
      'runner',
      '--reporter',
      'dot',
      '--exclude',
      'src/e2e/**',
    ],
    timeoutMs: 90_000,
  },
  {
    label: 'npm run verify:build-exit',
    npmArgs: ['run', 'verify:build-exit'],
  },
  { label: 'npm run e2e', npmArgs: ['run', 'e2e'] },
  { label: 'npm run backend:install', npmArgs: ['run', 'backend:install'] },
  { label: 'npm run backend:test', npmArgs: ['run', 'backend:test'] },
  { label: 'npm run verify:release', npmArgs: ['run', 'verify:release'] },
  { label: 'npm run verify:rls', npmArgs: ['run', 'verify:rls'] },
];

const isWindows = process.platform === 'win32';
const npmExecutable = isWindows ? process.env.ComSpec || 'cmd.exe' : 'npm';

for (const command of commands) {
  const startedAt = Date.now();
  console.log(`\n[quality:gate] START ${command.label}`);
  const executable = command.executable || npmExecutable;
  const args = command.npmArgs
    ? isWindows
      ? ['/d', '/s', '/c', 'npm.cmd', ...command.npmArgs]
      : command.npmArgs
    : command.args;
  const result = spawnSync(executable, args, {
    stdio: 'inherit',
    ...(command.timeoutMs
      ? { timeout: command.timeoutMs, killSignal: 'SIGTERM' }
      : {}),
  });

  if (result.error) {
    if (result.error.code === 'ETIMEDOUT') {
      throw new Error(
        `[quality:gate] ${command.label} exceeded ${command.timeoutMs}ms.`
      );
    }
    throw new Error(
      `[quality:gate] ${command.label} could not start: ${result.error.message}`
    );
  }
  if (result.signal) {
    throw new Error(
      `[quality:gate] ${command.label} ended by ${result.signal}.`
    );
  }
  if (result.status !== 0) {
    throw new Error(
      `[quality:gate] ${command.label} failed with exit code ${result.status}.`
    );
  }

  const durationSeconds = ((Date.now() - startedAt) / 1_000).toFixed(2);
  console.log(`[quality:gate] PASS ${command.label} (${durationSeconds}s)`);
}

console.log('\n[quality:gate] ALL COMMANDS PASSED');
