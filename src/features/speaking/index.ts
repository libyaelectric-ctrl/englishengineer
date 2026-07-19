export {
  type SpeakingTargetTerm,
  type SpeakingMission,
  type SpeakingSubmission,
  type SpeakingRoleplayCategory,
  type SpeakingEvaluationResult,
  type SpeakingHistoryEntry,
  type SpeakingState,
} from './speaking.types';

export { SPEAKING_MISSIONS } from './speaking.data';

export {
  normalizeSpeechText,
  countWords,
  countSentences,
  countFillerWords,
  type WordsPerMinuteResult,
  calculateWordsPerMinute,
  keywordMatchRatio,
  formatSpeakingDifficulty,
} from './speaking.helpers';

export { SpeakingEvaluator } from './speaking.evaluator';

export { SpeakingService } from './speaking.service';

export { useSpeakingStore } from './speaking.store';

export {
  SPEAKING_MVP_MODE,
  SPEAKING_MVP_REQUIRES_MICROPHONE,
  getSpeakingRoleplayCategory,
  getSpeakingHistoryDetails,
} from './speaking-mvp';

export {
  type PhonemeAnalysis,
  type PronunciationScoreResult,
  PronunciationScorer,
} from './pronunciation-scorer';

export {
  type PhonemeDetail,
  type PronunciationFeedback,
  type PronunciationMap,
  PronunciationFeedbackEngine,
} from './pronunciation-feedback';
