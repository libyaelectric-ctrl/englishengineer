export {
  type SpeakingTargetTerm,
  type SpeakingMission,
  type SpeakingSubmission,
  type SpeakingRoleplayCategory,
  type SpeakingEvaluationResult,
  type SpeakingHistoryEntry,
  type SpeakingState,
} from './core/speaking.types';

export { SPEAKING_MISSIONS } from './core/speaking.data';

export {
  normalizeSpeechText,
  countWords,
  countSentences,
  countFillerWords,
  type WordsPerMinuteResult,
  calculateWordsPerMinute,
  keywordMatchRatio,
  formatSpeakingDifficulty,
} from './core/speaking.helpers';

export { SpeakingEvaluator } from './core/speaking.evaluator';

export { SpeakingService } from './core/speaking.service';

export { useSpeakingStore } from './core/speaking.store';

export {
  SPEAKING_MVP_MODE,
  SPEAKING_MVP_REQUIRES_MICROPHONE,
  getSpeakingRoleplayCategory,
  getSpeakingHistoryDetails,
} from './core/speaking-mvp';

export {
  type PhonemeAnalysis,
  type PronunciationScoreResult,
  PronunciationScorer,
} from './pronunciation/pronunciation-scorer';

export {
  type PhonemeDetail,
  type PronunciationFeedback,
  type PronunciationMap,
  PronunciationFeedbackEngine,
} from './pronunciation/pronunciation-feedback';
