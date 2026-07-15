type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const ENV_LEVEL = ((): LogLevel => {
  const meta = import.meta as { env?: Record<string, string | undefined> };
  const raw = meta.env?.VITE_LOG_LEVEL;
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw;
  const isProd = meta.env?.VITE_ENVIRONMENT_MODE === 'production';
  return isProd ? 'warn' : 'debug';
})();

const MIN_LEVEL = LOG_LEVELS[ENV_LEVEL];

const formatEntry = (entry: LogEntry): string => {
  const base = `[${entry.level.toUpperCase()}]`;
  const ctx = entry.context ? ` [${entry.context}]` : '';
  return `${base}${ctx} ${entry.message}`;
};

const shouldLog = (level: LogLevel): boolean => LOG_LEVELS[level] >= MIN_LEVEL;

class Logger {
  i(m: string, ...meta: unknown[]) {
    if (!shouldLog('info')) return;
    const entry: LogEntry = { level: 'info', message: m, timestamp: new Date().toISOString() };
    console.info(`%c${formatEntry(entry)}`, 'color: #3b82f6', ...meta);
  }

  e(m: string, ...meta: unknown[]) {
    if (!shouldLog('error')) return;
    const entry: LogEntry = { level: 'error', message: m, timestamp: new Date().toISOString() };
    console.error(`%c${formatEntry(entry)}`, 'color: #ef4444', ...meta);
  }

  w(m: string, ...meta: unknown[]) {
    if (!shouldLog('warn')) return;
    const entry: LogEntry = { level: 'warn', message: m, timestamp: new Date().toISOString() };
    console.warn(`%c${formatEntry(entry)}`, 'color: #f59e0b', ...meta);
  }

  d(m: string, ...meta: unknown[]) {
    if (!shouldLog('debug')) return;
    const entry: LogEntry = { level: 'debug', message: m, timestamp: new Date().toISOString() };
    console.debug(`%c${formatEntry(entry)}`, 'color: #8b5cf6', ...meta);
  }

  child(context: string): ChildLogger {
    return new ChildLogger(context);
  }
}

class ChildLogger {
  constructor(private readonly context: string) {}

  i(m: string, ...meta: unknown[]) {
    logger.i(`[${this.context}] ${m}`, ...meta);
  }
  e(m: string, ...meta: unknown[]) {
    logger.e(`[${this.context}] ${m}`, ...meta);
  }
  w(m: string, ...meta: unknown[]) {
    logger.w(`[${this.context}] ${m}`, ...meta);
  }
  d(m: string, ...meta: unknown[]) {
    logger.d(`[${this.context}] ${m}`, ...meta);
  }
}

export const logger = new Logger();
