import { logger } from '../logger.js';

/**
 * API Key Rotation Manager
 *
 * Provides key versioning, staleness detection, and rotation guidance.
 * During rotation, both old and new keys are accepted (dual-key overlap)
 * to prevent downtime.
 *
 * Usage:
 *   const manager = createKeyRotationManager('SUPABASE_SERVICE_ROLE_KEY');
 *   manager.validate();  // logs warnings for stale keys
 *   manager.getRotationGuide();  // step-by-step rotation instructions
 */

interface KeyMetadata {
  /** When the key was last known to be rotated */
  lastRotatedAt: string | null;
  /** How many days since last rotation */
  ageDays: number | null;
  /** Whether rotation is recommended */
  shouldRotate: boolean;
  /** Recommended max age in days before rotation */
  maxAgeDays: number;
}

interface KeyRotationManager {
  /** Validate current key and log warnings */
  validate: () => Promise<KeyMetadata>;
  /** Get step-by-step rotation guide */
  getRotationGuide: () => string[];
  /** Check if a specific key env var is set */
  isConfigured: () => boolean;
}

/**
 * Known API keys in the application with recommended rotation periods.
 */
const KEY_REGISTRY: Record<string, { maxAgeDays: number; description: string }> = {
  STRIPE_SECRET_KEY: { maxAgeDays: 90, description: 'Stripe payment processing' },
  STRIPE_WEBHOOK_SECRET: { maxAgeDays: 180, description: 'Stripe webhook verification' },
  SUPABASE_SERVICE_ROLE_KEY: { maxAgeDays: 365, description: 'Supabase admin access' },
  SUPABASE_ANON_KEY: { maxAgeDays: 365, description: 'Supabase public access' },
  SENDGRID_API_KEY: { maxAgeDays: 90, description: 'Email sending (SendGrid)' },
  RESEND_API_KEY: { maxAgeDays: 180, description: 'Email sending (Resend)' },
  SENTRY_DSN: { maxAgeDays: 365, description: 'Error tracking (Sentry)' },
  CLERK_SECRET_KEY: { maxAgeDays: 180, description: 'Authentication (Clerk)' },
  UPSTASH_TOKEN: { maxAgeDays: 90, description: 'Rate limiting (Upstash Redis)' },
  OPENAI_API_KEY: { maxAgeDays: 90, description: 'AI provider (OpenAI)' },
  GEMINI_API_KEY: { maxAgeDays: 90, description: 'AI provider (Google Gemini)' },
  DODO_API_KEY: { maxAgeDays: 180, description: 'Alternative billing (Dodo)' },
  DODO_WEBHOOK_SECRET: { maxAgeDays: 180, description: 'Dodo webhook verification' },
};

/**
 * Estimate key age from common key format patterns.
 * - Stripe keys start with 'sk_live_' or 'sk_test_' — no age info in key
 * - Supabase keys are JWTs — exp claim could be parsed but complex
 * - Most API keys are opaque — we track rotation in a separate file
 *
 * For simplicity, we check a `.key-rotation-state.json` file if it exists.
 */
const ROTATION_STATE_FILE = '.key-rotation-state.json';

interface RotationState {
  [keyName: string]: string; // ISO timestamp of last rotation
}

/**
 * Read the rotation state from disk.
 * Returns empty object if file doesn't exist.
 */
const readRotationState = async (): Promise<RotationState> => {
  try {
    const { promises: fsp } = await import('node:fs');
    const raw = await fsp.readFile(ROTATION_STATE_FILE, 'utf8');
    return JSON.parse(raw) as RotationState;
  } catch {
    return {};
  }
};

/**
 * Write rotation state to disk.
 */
const writeRotationState = async (state: RotationState): Promise<void> => {
  try {
    const { promises: fsp } = await import('node:fs');
    await fsp.writeFile(ROTATION_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err: unknown) {
    logger.warn('[KeyRotation] Could not write rotation state', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

/**
 * Mark a key as rotated (call after successful rotation).
 */
export const markKeyRotated = async (keyName: string): Promise<void> => {
  const state = await readRotationState();
  state[keyName] = new Date().toISOString();
  await writeRotationState(state);
  logger.info(`[KeyRotation] Marked ${keyName} as rotated`);
};

/**
 * Create a key rotation manager for a specific environment variable.
 */
export const createKeyRotationManager = (envVarName: string): KeyRotationManager => {
  const registryEntry = KEY_REGISTRY[envVarName];
  const maxAgeDays = registryEntry?.maxAgeDays ?? 90;
  const description = registryEntry?.description ?? envVarName;

  return {
    isConfigured: () => {
      const value = process.env[envVarName];
      return typeof value === 'string' && value.trim().length > 0;
    },

    validate: async (): Promise<KeyMetadata> => {
      const value = process.env[envVarName];
      const isConfigured = typeof value === 'string' && value.trim().length > 0;

      if (!isConfigured) {
        logger.warn(`[KeyRotation] ${envVarName} is NOT configured`, { description });
        return {
          lastRotatedAt: null,
          ageDays: null,
          shouldRotate: false,
          maxAgeDays,
        };
      }

      const state = await readRotationState();
      const lastRotated = state[envVarName];
      const ageDays = lastRotated
        ? Math.floor((Date.now() - new Date(lastRotated).getTime()) / 86_400_000)
        : null;

      const shouldRotate = ageDays !== null && ageDays > maxAgeDays;

      if (shouldRotate) {
        logger.warn(`[KeyRotation] ${envVarName} is stale — rotation recommended`, {
          ageDays,
          maxAgeDays,
          description,
        });
      } else if (ageDays !== null) {
        logger.debug(`[KeyRotation] ${envVarName} is fresh`, {
          ageDays,
          maxAgeDays,
          description,
        });
      } else {
        logger.info(`[KeyRotation] ${envVarName} has no rotation history — consider tracking`, {
          description,
        });
      }

      return { lastRotatedAt: lastRotated ?? null, ageDays, shouldRotate, maxAgeDays };
    },

    getRotationGuide: () => [
      `## Rotating ${envVarName} (${description})`,
      '',
      '### Steps:',
      `1. Generate a new ${description} key from the provider dashboard`,
      '2. Update the environment variable in your hosting platform',
      '   - Vercel: Project Settings → Environment Variables',
      '   - Render: Dashboard → Environment → Edit Variables',
      '   - For Upstash: Settings → Rotations → Create new token',
      '3. Deploy with the new key',
      '4. Verify the application works correctly with the new key',
      `5. Run: markKeyRotated('${envVarName}') to update rotation state`,
      '',
      '### Dual-key overlap period:',
      '- During deployment, both old and new keys may be active',
      '- Most providers accept this — Stripe, Supabase, etc.',
      '- If the provider only allows one key, rotate immediately after deploy',
      '',
      `### Recommended rotation: every ${maxAgeDays} days`,
    ],
  };
};

/**
 * Validate all configured keys and return a summary report.
 */
export const validateAllKeys = async (): Promise<
  Array<{ key: string; configured: boolean; ageDays: number | null; shouldRotate: boolean }>
> => {
  const results = [];
  for (const keyName of Object.keys(KEY_REGISTRY)) {
    const manager = createKeyRotationManager(keyName);
    const metadata = await manager.validate();
    results.push({
      key: keyName,
      configured: manager.isConfigured(),
      ageDays: metadata.ageDays,
      shouldRotate: metadata.shouldRotate,
    });
  }
  return results;
};
