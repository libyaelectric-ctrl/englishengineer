class Logger {
  i(m: string, ...meta: unknown[]) {
    console.info(`%c[INFO] ${m}`, 'color: #3b82f6', ...meta);
  }
  e(m: string, ...meta: unknown[]) {
    console.error(`%c[ERROR] ${m}`, 'color: #ef4444', ...meta);
  }
  w(m: string, ...meta: unknown[]) {
    console.warn(`%c[WARN] ${m}`, 'color: #f59e0b', ...meta);
  }
}
export const logger = new Logger();
