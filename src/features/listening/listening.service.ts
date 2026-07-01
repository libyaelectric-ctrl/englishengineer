import { storage } from '@/shared/storage';
import { LISTENING_MISSIONS } from './listening.data';
import {
  ListeningMission,
  ListeningState,
  ListeningSubmission,
  ListeningEvaluationResult,
  ListeningHistoryEntry,
  ListeningPlaybackSpeed,
} from './listening.types';
import { ListeningEvaluator } from './listening.evaluator';
import { useLearningStore } from '@/core/learning';
import { VocabularyService } from '@/features/vocabulary';

const STORAGE_KEY = 'engineeros_listening_state';

const DEFAULT_STATE: ListeningState = {
  completedMissions: {},
  lastSelectedMissionId: 'listening_a1_safe_room',
  history: [],
  favoriteMissionIds: [],
  resumePositions: {},
  replayCounts: {},
  listeningSecondsByMission: {},
  speedSamples: [],
  audioCompletedMissionIds: [],
};

export const ListeningService = {
  /**
   * Loads the listening state from localStorage.
   */
  getState(): ListeningState {
    const data = storage.get<ListeningState>(STORAGE_KEY);
    if (!data) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      ...data,
      completedMissions: data.completedMissions || {},
      history: data.history || [],
      favoriteMissionIds: data.favoriteMissionIds || [],
      resumePositions: data.resumePositions || {},
      replayCounts: data.replayCounts || {},
      listeningSecondsByMission: data.listeningSecondsByMission || {},
      speedSamples: data.speedSamples || [],
      audioCompletedMissionIds: data.audioCompletedMissionIds || [],
    };
  },

  /**
   * Saves the listening state to localStorage.
   */
  saveState(state: ListeningState): void {
    storage.set(STORAGE_KEY, state);
  },

  /**
   * Retrieves all available listening missions.
   */
  getMissions(): ListeningMission[] {
    return LISTENING_MISSIONS;
  },

  /**
   * Retrieves a specific listening mission by ID.
   */
  getMissionById(id: string): ListeningMission | undefined {
    return LISTENING_MISSIONS.find((m) => m.id === id);
  },

  /**
   * Evaluates a listening mission submission, updates history, best scores,
   * last selected mission, and synchronizes state with the global learning core.
   */
  submitSubmission(submission: ListeningSubmission): ListeningEvaluationResult {
    const mission = this.getMissionById(submission.missionId);
    if (!mission) {
      throw new Error(
        `Listening mission with ID "${submission.missionId}" not found.`
      );
    }

    // 1. Evaluate submission using rule-based evaluator
    const evaluation = ListeningEvaluator.evaluate(mission, submission);
    VocabularyService.addDiscoveredTerms([
      ...mission.keywords,
      ...mission.vocabulary.map((item) => item.term),
    ]);

    // 2. Load listening state
    const state = this.getState();

    // 3. Update best score per mission
    const prevBest = state.completedMissions[mission.id] || 0;
    const newBest = Math.max(prevBest, evaluation.finalScore);
    state.completedMissions[mission.id] = newBest;

    // 4. Update selected mission
    state.lastSelectedMissionId = mission.id;

    // 5. Append to listening history
    const historyEntry: ListeningHistoryEntry = {
      missionId: mission.id,
      timestamp: new Date().toISOString(),
      score: evaluation.finalScore,
      evaluation,
    };
    state.history = [historyEntry, ...state.history];

    // 6. Persist listening state
    this.saveState(state);

    // 7. Sync with global LearningStore to award XP, coins, and update ELO/achievements
    const learningStore = useLearningStore.getState();
    const globalMissionExists = learningStore.missions.some(
      (m) => m.id === mission.id
    );

    if (globalMissionExists) {
      // If the mission exists in the global store, submit it there to update progress
      learningStore.submitMissionResult(
        mission.id,
        evaluation.finalScore / 100,
        submission.timeSpentMinutes
      );
    } else {
      // Fallback: Complete it as generic practice
      learningStore.completeGenericPractice(
        'Listening',
        evaluation.finalScore,
        submission.timeSpentMinutes
      );
    }

    return evaluation;
  },

  /**
   * Update the last selected listening mission ID.
   */
  setLastSelectedMissionId(missionId: string): void {
    const state = this.getState();
    state.lastSelectedMissionId = missionId;
    this.saveState(state);
  },

  toggleFavoriteMission(missionId: string): ListeningState {
    const state = this.getState();
    const isFavorite = state.favoriteMissionIds.includes(missionId);
    state.favoriteMissionIds = isFavorite
      ? state.favoriteMissionIds.filter((id) => id !== missionId)
      : [...state.favoriteMissionIds, missionId];
    this.saveState(state);
    return state;
  },

  saveResumePosition(missionId: string, seconds: number): ListeningState {
    const state = this.getState();
    state.resumePositions = {
      ...state.resumePositions,
      [missionId]: Math.max(0, Math.floor(seconds)),
    };
    this.saveState(state);
    return state;
  },

  recordReplay(missionId: string): ListeningState {
    const state = this.getState();
    state.replayCounts = {
      ...state.replayCounts,
      [missionId]: (state.replayCounts[missionId] || 0) + 1,
    };
    this.saveState(state);
    return state;
  },

  recordListeningSecond(
    missionId: string,
    speed: ListeningPlaybackSpeed
  ): ListeningState {
    const state = this.getState();
    state.listeningSecondsByMission = {
      ...state.listeningSecondsByMission,
      [missionId]: (state.listeningSecondsByMission[missionId] || 0) + 1,
    };
    state.speedSamples = [...state.speedSamples.slice(-99), speed];
    this.saveState(state);
    return state;
  },

  markAudioCompleted(missionId: string): ListeningState {
    const state = this.getState();
    state.resumePositions = {
      ...state.resumePositions,
      [missionId]: 0,
    };
    state.audioCompletedMissionIds = state.audioCompletedMissionIds.includes(
      missionId
    )
      ? state.audioCompletedMissionIds
      : [...state.audioCompletedMissionIds, missionId];
    this.saveState(state);
    return state;
  },

  async cacheMissionAudio(
    mission: ListeningMission
  ): Promise<{ ok: boolean; message: string }> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return {
        ok: false,
        message: 'Audio cache is not available in this browser.',
      };
    }

    try {
      const cache = await caches.open('engineeros-listening-audio-v1');
      const response = await fetch(mission.audioUrl, { cache: 'reload' });
      if (!response.ok) {
        return {
          ok: false,
          message: `Audio asset could not be fetched for offline cache (${response.status}).`,
        };
      }
      await cache.put(mission.audioUrl, response.clone());
      return { ok: true, message: 'Audio cached for offline replay.' };
    } catch {
      return {
        ok: false,
        message:
          'Audio cache failed. The browser may be offline or storage may be unavailable.',
      };
    }
  },

  /**
   * Resets the listening-specific history and scores.
   */
  resetListeningState(): void {
    this.saveState(DEFAULT_STATE);
  },
};
