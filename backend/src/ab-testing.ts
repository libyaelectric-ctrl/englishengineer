interface ABTestConfig {
  name: string;
  variants: Record<string, number>;
}

const tests = new Map<string, ABTestConfig>();

export function defineABTest(name: string, variants: Record<string, number>) {
  const total = Object.values(variants).reduce((a, b) => a + b, 0);
  const normalized: Record<string, number> = {};
  let acc = 0;
  for (const [key, weight] of Object.entries(variants)) {
    acc += weight / total;
    normalized[key] = acc;
  }
  tests.set(name, { name, variants: normalized });
}

export function getVariant(userId: string, testName: string): string {
  const test = tests.get(testName);
  if (!test) return 'control';
  const hash = hashUserId(userId + testName);
  for (const [variant, threshold] of Object.entries(test.variants)) {
    if (hash <= threshold) return variant;
  }
  return 'control';
}

function hashUserId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 10000) / 10000;
}

defineABTest('lesson_order', { control: 50, spaced_repetition_first: 50 });
defineABTest('pricing_display', { monthly: 50, yearly_promo: 50 });
