export const clock = {
  /**
   * Returns current high-precision epoch timestamp in milliseconds.
   */
  now(): number {
    return Date.now();
  },

  /**
   * Returns current high-precision ISO 8601 timestamp string.
   */
  iso(): string {
    return new Date().toISOString();
  },

  /**
   * Returns a standard Date instance for the current time.
   */
  date(): Date {
    return new Date();
  },
};
