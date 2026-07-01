import { spawnSync } from 'node:child_process';

const [timeoutValue, ...npmArgs] = process.argv.slice(2);
const timeoutMs = Number.parseInt(timeoutValue ?? '', 10);
if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || npmArgs.length === 0) {
  throw new Error('Usage: node run-with-timeout.mjs <milliseconds> <npm args>');
}

const isWindows = process.platform === 'win32';
const executable = isWindows ? process.env.ComSpec || 'cmd.exe' : 'npm';
const args = isWindows ? ['/d', '/s', '/c', 'npm.cmd', ...npmArgs] : npmArgs;
const result = spawnSync(executable, args, {
  stdio: 'inherit',
  timeout: timeoutMs,
  killSignal: 'SIGTERM',
});

if (result.error) {
  if (result.error.code === 'ETIMEDOUT') {
    throw new Error(`Command exceeded ${timeoutMs}ms and was terminated.`);
  }
  throw result.error;
}

if (result.signal) {
  throw new Error(`Command ended by signal ${result.signal}.`);
}

if (result.status !== 0) {
  throw new Error(`Command failed with exit code ${result.status}.`);
}
