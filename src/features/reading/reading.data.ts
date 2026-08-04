import { ARCHITECTURE_READING_MISSIONS } from './reading.architecture.data';
import { BUILDING_SYSTEMS_READING_MISSIONS } from './reading.building-systems.data';
import { CHEMICAL_READING_MISSIONS } from './reading.chemical.data';
import { CIVIL_READING_MISSIONS } from './reading.civil.data';
import { ELECTRICAL_READING_MISSIONS } from './reading.electrical.data';
import { ELECTRONICS_READING_MISSIONS } from './reading.electronics.data';
import { HSE_READING_MISSIONS } from './reading.hse.data';
import { INDUSTRIAL_READING_MISSIONS } from './reading.industrial.data';
import { MECHANICAL_READING_MISSIONS } from './reading.mechanical.data';
import { MECHATRONICS_READING_MISSIONS } from './reading.mechatronics.data';
import { MEP_READING_MISSIONS } from './reading.mep.data';
import { QAQC_READING_MISSIONS } from './reading.qaqc.data';
import { SOFTWARE_READING_MISSIONS } from './reading.software.data';
import { STARTER_READING_MISSIONS } from './reading.starter.data';
import { ReadingMission } from './reading.types';

const CORE_READING_MISSIONS: ReadingMission[] = [
  ...ELECTRICAL_READING_MISSIONS,
  ...BUILDING_SYSTEMS_READING_MISSIONS,
  ...MEP_READING_MISSIONS,
  ...QAQC_READING_MISSIONS,
  ...ARCHITECTURE_READING_MISSIONS,
  ...CHEMICAL_READING_MISSIONS,
  ...CIVIL_READING_MISSIONS,
  ...ELECTRONICS_READING_MISSIONS,
  ...HSE_READING_MISSIONS,
  ...INDUSTRIAL_READING_MISSIONS,
  ...MECHANICAL_READING_MISSIONS,
  ...MECHATRONICS_READING_MISSIONS,
  ...SOFTWARE_READING_MISSIONS,
];

export const READING_MISSIONS: ReadingMission[] = [
  ...STARTER_READING_MISSIONS,
  ...CORE_READING_MISSIONS,
];
