import { ADVANCED_LISTENING_MISSIONS } from './listening.data.advanced';
import { INTERMEDIATE_LISTENING_MISSIONS } from './listening.data.intermediate';
import { STARTER_LISTENING_MISSIONS } from './listening.starter.data';

export const LISTENING_MISSIONS = [
  ...STARTER_LISTENING_MISSIONS,
  ...INTERMEDIATE_LISTENING_MISSIONS,
  ...ADVANCED_LISTENING_MISSIONS,
];
