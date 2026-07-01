import type {
  SpeakingEvaluationResult,
  SpeakingMission,
  SpeakingRoleplayCategory,
} from './speaking.types';

export const SPEAKING_MVP_MODE = 'Written Roleplay' as const;
export const SPEAKING_MVP_REQUIRES_MICROPHONE = false;

export const getSpeakingRoleplayCategory = (
  mission: SpeakingMission
): SpeakingRoleplayCategory => {
  if (mission.id === 'speaking_a1_site_introduction') return 'Daily';
  if (
    [
      'progress_meeting',
      'consultant_discussion',
      'client_presentation',
    ].includes(mission.scenarioType)
  ) {
    return 'Work';
  }
  return 'Engineering';
};

export const getSpeakingHistoryDetails = (
  evaluation: SpeakingEvaluationResult
): Pick<
  import('./speaking.types').SpeakingHistoryEntry,
  'errorType' | 'progressNote' | 'roleplayMode'
> => {
  const lowestDimension = [
    ['Grammar', evaluation.grammarScore],
    ['Vocabulary', evaluation.technicalVocabularyScore],
    [
      'Speaking Response',
      Math.min(evaluation.fluencyScore, evaluation.clarityScore),
    ],
  ] as const;
  const [errorType] = [...lowestDimension].sort(
    (left, right) => left[1] - right[1]
  )[0];

  return {
    roleplayMode: SPEAKING_MVP_MODE,
    errorType: evaluation.finalScore >= 85 ? null : errorType,
    progressNote:
      evaluation.finalScore >= 85
        ? 'Strong written roleplay response. Continue with controlled stretch practice.'
        : evaluation.finalScore >= 60
          ? 'Maintain the current level and improve the lowest response dimension.'
          : 'Repeat a shorter current-level roleplay and review the logged response issue.',
  };
};
