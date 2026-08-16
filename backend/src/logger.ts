import winston from 'winston';

interface LogMeta {
  [key: string]: unknown;
}

const _LOG_LEVELS: Record<string, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Create Winston logger with structured JSON format
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false,
});

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

// Helper to format log messages with metadata
const _formatLogMessage = (level: string, message: string, meta: LogMeta = {}): object => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  ...meta,
  pid: process.pid,
  env: process.env.NODE_ENV || 'development',
});

export const logger: Logger = {
  debug: (msg: string, meta?: LogMeta) => {
    winstonLogger.debug(msg, meta);
  },
  info: (msg: string, meta?: LogMeta) => {
    winstonLogger.info(msg, meta);
  },
  warn: (msg: string, meta?: LogMeta) => {
    winstonLogger.warn(msg, meta);
  },
  error: (msg: string, meta?: LogMeta, err?: Error) => {
    const logData: LogMeta = { ...meta };
    if (err) {
      logData.error = err.message;
      logData.stack = err.stack;
    }
    winstonLogger.error(msg, logData);
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

export default winstonLogger;
