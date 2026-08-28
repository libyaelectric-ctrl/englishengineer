import { CORE_SPEAKING_MISSIONS as CORE } from '@/shared/data/speaking/speaking.data';
import type { SpeakingMission } from '@/shared/types/speaking.types';

import { STARTER_SPEAKING_MISSIONS as STARTER } from './speaking.starter.data';

export const SPEAKING_MISSIONS: SpeakingMission[] = [...STARTER, ...CORE];
