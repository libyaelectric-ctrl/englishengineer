import { DEFAULT_MISSIONS } from '../learning.missions.data';
import type { Mission } from '../learning.types';

export interface MissionState {
  missions: Mission[];
}

export const createInitialMissionState = (): MissionState => ({
  missions: DEFAULT_MISSIONS,
});

export const activateMission = (missions: Mission[], missionId: string): Mission[] =>
  missions.map((mission) =>
    mission.id === missionId ? { ...mission, status: 'active' as const } : mission
  );

export const completeMission = (
  missions: Mission[],
  missionId: string,
  completedAt: string,
  score: number
): Mission[] =>
  missions.map((mission) =>
    mission.id === missionId
      ? { ...mission, status: 'completed' as const, completedAt, score }
      : mission
  );
