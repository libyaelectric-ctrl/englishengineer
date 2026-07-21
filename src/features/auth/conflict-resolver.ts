import { logger } from '@/shared/logger';

export interface ConflictInfo {
  key: string;
  localValue: unknown;
  remoteValue: unknown;
  localTimestamp: string | null;
  remoteTimestamp: string | null;
}

export type ConflictResolution = 'local' | 'remote' | 'skip';

export interface ConflictResolver {
  resolve: (conflict: ConflictInfo) => ConflictResolution;
}

const defaultResolver: ConflictResolver = {
  resolve: (conflict: ConflictInfo) => {
    logger.w(
      `[ConflictResolver] Conflict on "${conflict.key}": local=${conflict.localTimestamp}, remote=${conflict.remoteTimestamp}. Defaulting to remote.`
    );
    return 'remote';
  },
};

let activeResolver: ConflictResolver = defaultResolver;

export const setConflictResolver = (resolver: ConflictResolver): void => {
  activeResolver = resolver;
};

export const resolveConflict = (conflict: ConflictInfo): ConflictResolution => {
  return activeResolver.resolve(conflict);
};

export const createTimestampResolver = (): ConflictResolver => ({
  resolve: (conflict: ConflictInfo) => {
    if (!conflict.localTimestamp) return 'remote';
    if (!conflict.remoteTimestamp) return 'local';

    const localTime = new Date(conflict.localTimestamp).getTime();
    const remoteTime = new Date(conflict.remoteTimestamp).getTime();

    if (localTime > remoteTime) return 'local';
    if (remoteTime > localTime) return 'remote';
    return 'remote';
  },
});
