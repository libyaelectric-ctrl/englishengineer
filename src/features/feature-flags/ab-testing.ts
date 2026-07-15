import { FEATURE_FLAGS } from '@/config/feature-flags.config';

interface ABTest {
  id: string;
  flag: string;
  variants: string[];
  weights?: number[];
}

interface ABAssignment {
  testId: string;
  variant: string;
  userId: string;
}

const STORAGE_KEY = 'ab_assignments';

const getStoredAssignments = (): Record<string, ABAssignment> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const storeAssignment = (assignment: ABAssignment): void => {
  const stored = getStoredAssignments();
  stored[assignment.testId] = assignment;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const assignVariant = (
  test: ABTest,
  userId: string
): string => {
  const stored = getStoredAssignments();
  if (stored[test.id]) return stored[test.id].variant;

  const weights = test.weights || test.variants.map(() => 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const hash = hashString(`${test.id}:${userId}`) % totalWeight;

  let cumulative = 0;
  for (let i = 0; i < test.variants.length; i++) {
    cumulative += weights[i];
    if (hash < cumulative) {
      const assignment = { testId: test.id, variant: test.variants[i], userId };
      storeAssignment(assignment);
      return test.variants[i];
    }
  }

  return test.variants[0];
};

export const isVariant = (testId: string, variant: string): boolean => {
  const stored = getStoredAssignments();
  return stored[testId]?.variant === variant;
};

export const getFeatureVariant = (
  flagKey: string,
  userId: string
): string | null => {
  const flag = FEATURE_FLAGS[flagKey];
  if (!flag || !flag.enabled) return null;

  return assignVariant(
    { id: flagKey, flag: flagKey, variants: ['control', 'treatment'] },
    userId
  );
};
