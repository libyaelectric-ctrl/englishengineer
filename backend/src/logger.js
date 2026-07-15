const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] ?? 1;

const formatJSON = (level, message, meta = {}) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
    pid: process.pid,
    env: process.env.NODE_ENV || 'development',
  });
};

export const logger = {
  debug: (msg, meta) => {
    if (currentLevel <= 0) console.debug(formatJSON('debug', msg, meta));
  },
  info: (msg, meta) => {
    if (currentLevel <= 1) console.info(formatJSON('info', msg, meta));
  },
  warn: (msg, meta) => {
    if (currentLevel <= 2) console.warn(formatJSON('warn', msg, meta));
  },
  error: (msg, meta, err) => {
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
