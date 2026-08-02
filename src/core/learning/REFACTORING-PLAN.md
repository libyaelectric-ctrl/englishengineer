/**
 * Learning Store Refactoring Plan
 *
 * CURRENT STATE: useLearningStore is a "God Store" with 14+ state fields
 * and 4 action methods covering missions, achievements, XP, level, coins,
 * ELO, streaks, study sessions, score history, XP history, ELO history,
 * and 3 pool arrays.
 *
 * TARGET STATE: Split into 4 focused stores with clear responsibilities.
 *
 * MIGRATION STRATEGY:
 * 1. Create new stores alongside the existing one
 * 2. Add re-export compatibility layer in learning/index.ts
 * 3. Migrate consumers incrementally
 * 4. Remove old store once all consumers are migrated
 *
 * NEW STORES:
 *
 * 1. useLearningProgressStore (XP, level, coins, elo, streak)
 *    - State: xp, level, coins, elo, streak, lastActivityDate
 *    - Derived: level should be a selector (Math.floor(xp / XP_PER_LEVEL) + 1)
 *    - Actions: addXp, addCoins, updateElo, updateStreak
 *
 * 2. useMissionStore (missions array + start/complete)
 *    - State: missions
 *    - Actions: startMission, completeMission
 *    - Depends on: useLearningProgressStore (for XP/coin updates)
 *
 * 3. useLearningHistoryStore (studySessions, scoreHistory, xpHistory, eloHistory)
 *    - State: studySessions, scoreHistory, xpHistory, eloHistory
 *    - Actions: addSession, addScoreRecord, addXpRecord, addEloRecord
 *    - Constants: MAX_HISTORY_SIZE
 *
 * 4. useAchievementStore (achievements)
 *    - State: achievements
 *    - Actions: checkAndUnlock
 *    - Depends on: useLearningProgressStore, useMissionStore
 *
 * COMPATIBILITY LAYER:
 * - Re-export all stores from learning/index.ts
 * - Create a temporary useLearningStore that combines all 4 stores
 *   for backward compatibility during migration
 *
 * FILES TO MODIFY:
 * - src/core/learning/learning.progress.store.ts (NEW)
 * - src/core/learning/learning.mission.store.ts (NEW)
 * - src/core/learning/learning.history.store.ts (NEW)
 * - src/core/learning/achievement.store.ts (NEW)
 * - src/core/learning/learning.store.ts (REFACTOR to thin wrapper)
 * - src/core/learning/index.ts (UPDATE exports)
 * - All consumers of useLearningStore (UPDATE imports)
 */
