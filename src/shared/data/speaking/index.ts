import { STARTER_SPEAKING_MISSIONS } from './speaking.starter.data';
import { CORE_SPEAKING_MISSIONS } from './speaking.data';
import type { SpeakingMission } from '@/shared/types/speaking.types';

export const SPEAKING_MISSIONS: SpeakingMission[] = [
  ...STARTER_SPEAKING_MISSIONS,
  ...CORE_SPEAKING_MISSIONS,
];