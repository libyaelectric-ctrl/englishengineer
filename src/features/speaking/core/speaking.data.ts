import { CORE_SPEAKING_MISSIONS as CORE } from '@/shared/data/speaking/speaking.data';
import { STARTER_SPEAKING_MISSIONS as STARTER } from './speaking.starter.data';
import type { SpeakingMission } from '@/shared/types/speaking.types';

export const SPEAKING_MISSIONS: SpeakingMission[] = [
  ...STARTER,
  ...CORE,
];