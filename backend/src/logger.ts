interface LogMeta {
  [key: string]: unknown;
}

const LOG_LEVELS: Record<string, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};
const currentLevel: number = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] ?? 1;

const formatJSON = (
  level: string,
  message: string,
  meta: LogMeta = {}
): string => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
    pid: process.pid,
    env: process.env.NODE_ENV || 'development',
  });
};

export interface Logger {
  debug: (msg: string, meta?: LogMeta) => void;
  info: (msg: string, meta?: LogMeta) => void;
  warn: (msg: string, meta?: LogMeta) => void;
  error: (msg: string, meta?: LogMeta, err?: Error) => void;
}

export const logger: Logger = {
  debug: (msg: string, meta?: LogMeta) => {
    if (currentLevel <= 0) console.debug(formatJSON('debug', msg, meta));
  },
  info: (msg: string, meta?: LogMeta) => {
    if (currentLevel <= 1) console.info(formatJSON('info', msg, meta));
  },
  warn: (msg: string, meta?: LogMeta) => {
    if (currentLevel <= 2) console.warn(formatJSON('warn', msg, meta));
  },
  error: (msg: string, meta?: LogMeta, err?: Error) => {
    if (currentLevel <= 3) {
      const entry = formatJSON('error', msg, meta);
      if (err?.stack) {
        console.error(entry, err.stack);
      } else {
        console.error(entry);
      }
    }
  },
};
