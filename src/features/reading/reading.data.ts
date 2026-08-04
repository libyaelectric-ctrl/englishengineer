import { ARCHITECTURE_READING_MISSIONS } from './reading.architecture.data';
import { BUILDING_SYSTEMS_READING_MISSIONS } from './reading.building-systems.data';
import { ELECTRICAL_READING_MISSIONS } from './reading.electrical.data';
import { MEP_READING_MISSIONS } from './reading.mep.data';
import { QAQC_READING_MISSIONS } from './reading.qaqc.data';
import { STARTER_READING_MISSIONS } from './reading.starter.data';
import { ReadingMission } from './reading.types';

const CORE_READING_MISSIONS: ReadingMission[] = [
  ...ELECTRICAL_READING_MISSIONS,
  ...BUILDING_SYSTEMS_READING_MISSIONS,
  ...MEP_READING_MISSIONS,
  ...QAQC_READING_MISSIONS,
  ...ARCHITECTURE_READING_MISSIONS,
];

export const READING_MISSIONS: ReadingMission[] = [
  ...STARTER_READING_MISSIONS,
  ...CORE_READING_MISSIONS,
];
