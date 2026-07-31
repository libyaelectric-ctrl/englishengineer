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

const formatJSON = (level: string, message: string, meta: LogMeta = {}): string => {
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
  /**
   * Short aliases for info/warn/error. Several call sites across the
   * codebase (job-processor.ts, request-logger.ts, prompt-version.ts,
   * route-handler.ts) call logger.i()/logger.w()/logger.e() -- these did
   * not previously exist on the logger object at all, which meant those
   * call sites would throw `TypeError: logger.i is not a function` (etc.)
   * at runtime the first time they executed. Adding real aliases here
   * fixes the crash without having to touch every call site.
   */
  i: (msg: string, meta?: LogMeta) => void;
  w: (msg: string, meta?: LogMeta) => void;
  e: (msg: string, meta?: LogMeta, err?: Error) => void;
}

export const logger: Logger = {
  debug: (msg: string, meta?: LogMeta) => {
    if (currentLevel <= 0) console.debug(formatJSON('debug', msg, meta)); // eslint-disable-line no-console
  },
  info: (msg: string, meta?: LogMeta) => {
    if (currentLevel <= 1) console.info(formatJSON('info', msg, meta)); // eslint-disable-line no-console
  },
  warn: (msg: string, meta?: LogMeta) => {
    if (currentLevel <= 2) console.warn(formatJSON('warn', msg, meta)); // eslint-disable-line no-console
  },
  error: (msg: string, meta?: LogMeta, err?: Error) => {
    if (currentLevel <= 3) {
      const entry = formatJSON('error', msg, meta);
      if (err?.stack) {
        console.error(entry, err.stack); // eslint-disable-line no-console
      } else {
        console.error(entry); // eslint-disable-line no-console
      }
    }
  },
  i(msg: string, meta?: LogMeta) {
    this.info(msg, meta);
  },
  w(msg: string, meta?: LogMeta) {
    this.warn(msg, meta);
  },
  e(msg: string, meta?: LogMeta, err?: Error) {
    this.error(msg, meta, err);
  },
};
