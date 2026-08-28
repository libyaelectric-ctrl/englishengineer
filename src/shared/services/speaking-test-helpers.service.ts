/**
 * Test helper — re-exports speaking constants for integration tests.
 *
 * The decisions-61-70.test.ts imports from this path. It aggregates
 * symbols that are otherwise scattered across speaking core modules.
 */
export {
  SPEAKING_MVP_MODE,
  SPEAKING_MVP_REQUIRES_MICROPHONE,
  getSpeakingHistoryDetails,
  getSpeakingRoleplayCategory,
} from '@/shared/services/speaking-mvp.helpers';

export { SPEAKING_MISSIONS } from '@/features/speaking/core/speaking.data';
