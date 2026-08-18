export type PromptSource = 'file' | 'db' | 'none';

export interface PromptVersionUsage {
  key: string;
  bundledVersion: string | null;
  servedVersion: string | null;
  servedSource: PromptSource | null;
  servedCount: number;
  databaseServerCount: number;
  /** Served version differs from the bundled file version or came from the DB (drift risk). */
  mismatchCount: number;
  lastRecordedAt: string;
}

const state = new Map<string, PromptVersionUsage>();

const createUsage = (key: string, bundledVersion: string | null): PromptVersionUsage => ({
  key,
  bundledVersion,
  servedVersion: null,
  servedSource: null,
  servedCount: 0,
  databaseServerCount: 0,
  mismatchCount: 0,
  lastRecordedAt: new Date().toISOString(),
});

/**
 * Records which prompt instruction version/source actually served a structured
 * AI call. Lets operators detect when the bundled prompt file has drifted from
 * what requests are being served (e.g. the database holds an older copy).
 */
export const recordPromptVersionUsage = (
  key: string,
  servedVersion: string | null,
  servedSource: PromptSource | null,
  bundledVersion: string | null
): void => {
  const usage = state.get(key) ?? createUsage(key, bundledVersion);

  usage.servedVersion = servedVersion;
  usage.servedSource = servedSource;
  usage.servedCount += 1;
  usage.lastRecordedAt = new Date().toISOString();

  if (servedSource === 'db') {
    usage.databaseServerCount += 1;
    usage.mismatchCount += 1;
  } else if (servedVersion && usage.bundledVersion && servedVersion !== usage.bundledVersion) {
    usage.mismatchCount += 1;
  }

  state.set(key, usage);
};

export const getPromptVersionTelemetry = (): PromptVersionUsage[] =>
  Array.from(state.values()).map((usage) => ({
    ...usage,
    key: usage.key,
  }));

export const resetPromptVersionTelemetry = (): void => {
  state.clear();
};
