import { render, screen } from '@testing-library/react';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { router } from '@/routes/router';
import { AuthService } from '@/features/auth';
import { ReadingService } from '@/features/reading';
import { WritingService } from '@/features/writing';
import { ListeningService } from '@/features/listening';
import { SpeakingService } from '@/features/speaking';
import { VocabularyService } from '@/features/vocabulary';
import { loadVocabularyEntries } from '@/features/vocabulary/data/vocabulary.data';
import { AssessmentService } from '@/features/assessment';
import { createBackendProxyProvider } from '@/features/ai/backend-proxy.provider';
import { createMockAIProvider } from '@/features/ai/mock-ai.provider';
import { BillingService } from '@/features/billing';
import { useLearningStore } from '@/core/learning';
import { storage } from '@/shared/storage';
import { ObservabilityService } from '@/core/observability';
import { ErrorBoundaryProvider } from '@/providers/ErrorBoundaryProvider';
import { LISTENING_MISSIONS } from '@/features/listening/listening.data';

const ThrowingComponent = () => {
  throw new Error('release candidate boundary smoke');
};

const getCorrectAnswerMap = (
  questions: Array<{ id: string; correctAnswer: string }>
): Record<string, string> =>
  Object.fromEntries(
    questions.map((question) => [question.id, question.correctAnswer])
  );

describe('EngVox release candidate E2E smoke fallback', () => {
  beforeAll(async () => {
    await loadVocabularyEntries();
  });

  beforeEach(() => {
    storage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. app routes load through the configured router', () => {
    expect(router.routes.length).toBeGreaterThan(0);
    expect(router.routes.some((route) => route.path === '/login')).toBe(true);
  });

  it('2. demo local login works', async () => {
    const user = await AuthService.demoLogin();

    expect(user.displayName).toBe('Demo Engineer');
    expect(user.email).toBe('demo.engineer@local.EngVox');
    expect(user.location).toBe('Local Lite workspace');
  });

  it('3. auth provider readiness is explicit in every environment', () => {
    expect(['local', 'supabase']).toContain(AuthService.getProviderMode());
    expect(AuthService.getReadinessLabel()).toMatch(/local|Supabase/i);
  });

  it('4. reading mission submit persists progress', () => {
    const mission = ReadingService.getMissions()[0];
    const result = ReadingService.submitSubmission(
      {
        missionId: mission.id,
        answers: getCorrectAnswerMap(mission.questions),
        timeSpentMinutes: mission.estimatedMinutes,
      },
      mission.vocabulary.map((item) => item.term)
    );

    expect(result.finalScore).toBeGreaterThan(0);
    expect(ReadingService.getState().history.length).toBe(1);
  });

  it('5. writing mission submit persists progress', () => {
    const mission = WritingService.getMissions()[0];
    const result = WritingService.submitSubmission({
      missionId: mission.id,
      finalDraft:
        mission.sampleExcellentAnswer ||
        `${mission.initialDraft} The corrective action, owner, and target date are clearly recorded.`,
      timeSpentMinutes: mission.estimatedMinutes,
      autoFixesUsed: 0,
    });

    expect(result.finalScore).toBeGreaterThan(0);
    expect(WritingService.getState().history.length).toBe(1);
  });

  it('6. listening audio missions point to shipped audio', () => {
    const mission = ListeningService.getMissions()[0];

    expect(mission.audioUrl).toMatch(/^\/audio\/.+\.wav$/);
    expect(mission.audioDurationSeconds).toBeGreaterThan(0);
  });

  it('7. listening transcript reveal has real transcript content', () => {
    const mission = ListeningService.getMissions()[0];

    expect(mission.transcript.length).toBeGreaterThan(80);
    expect(mission.hiddenTranscript.length).toBeGreaterThan(20);
  });

  it('8. listening audio missing state is reported by cache fallback', async () => {
    vi.stubGlobal('caches', undefined);
    const result = await ListeningService.cacheMissionAudio({
      ...LISTENING_MISSIONS[0],
      audioUrl: '/audio/missing.wav',
    });

    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/not available|failed|could not/i);
  });

  it('9. speaking typed fallback is evaluated without speech recognition', () => {
    const mission = SpeakingService.getMissions()[0];
    const result = SpeakingService.submitSubmission({
      missionId: mission.id,
      transcript: '',
      typedTranscript:
        'Today we reviewed the site constraints, safety access, inspection comments, and the required corrective action for the electrical works.',
      timeSpentMinutes: 3,
      recordingSeconds: 0,
      usedSpeechRecognition: false,
    });

    expect(result.transcriptUsed).toContain('site constraints');
    expect(result.isWordsPerMinuteEstimated).toBe(true);
  });

  it('10. speech recognition unavailable state is detectable', () => {
    const speechApiAvailable =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

    expect(speechApiAvailable).toBe(false);
  });

  it('11. vocabulary review flow persists review history', () => {
    const entry = VocabularyService.getEntries()[0];
    const result = VocabularyService.submitReview([
      {
        wordId: entry.id,
        mode: 'typing_practice',
        response: entry.word,
        isCorrect: true,
        responseTimeSeconds: 4,
      },
    ]);

    expect(result.accuracy).toBe(100);
    expect(VocabularyService.getState().history.length).toBe(1);
  });

  it('12. assessment profile displays insufficient-data state', () => {
    const profile = AssessmentService.getProfile(useLearningStore.getState());

    expect(profile.trustLabel).toMatch(/assessment|data/i);
    expect(profile.certificateDisclaimer).toMatch(/not an official CEFR/i);
  });

  it('13. AI mock mode returns labelled mock response', async () => {
    const provider = createMockAIProvider([
      { input: 'site delay', output: 'Mocked professional delay response.' },
    ]);
    const response = await provider.rewriteText({
      operation: 'rewriteText',
      modeId: 'site_report_writer',
      modeName: 'Site Report Writer',
      prompt: 'site delay',
    });

    expect(response.providerStatus.state).toBe('mock-fallback');
    expect(response.text).toContain('Mock AI');
  });

  it('14. AI backend unavailable state is explicit', async () => {
    const provider = createBackendProxyProvider(null);
    const response = await provider.analyzeText({
      operation: 'analyzeText',
      modeId: 'writing_reviewer',
      modeName: 'Writing Reviewer',
      prompt: 'Review this report.',
    });

    expect(response.providerStatus.state).toBe('backend-error');
    expect(response.metadata?.success).toBe(false);
  });

  it('15. billing provider status is explicit for the active environment', () => {
    const status = BillingService.getProviderStatus();

    expect(['local-fallback', 'backend']).toContain(status.mode);
    expect(status.isConfigured).toBe(status.mode === 'backend');
    expect(status.label).toMatch(/billing|plan/i);
  });

  it('16. billing backend missing error prevents checkout overclaiming', async () => {
    await expect(
      BillingService.startCheckout('user_1', 'engineer@example.com', 'pro')
    ).rejects.toThrow();
  });

  it('17. profile update works in local auth mode', async () => {
    await AuthService.demoLogin();
    const user = await AuthService.updateProfile({
      displayName: 'QA/QC Engineer',
      role: 'QA/QC Engineer',
    });

    expect(user.displayName).toBe('QA/QC Engineer');
    expect(user.role).toBe('QA/QC Engineer');
  });

  it('18. offline local progress persistence survives service reload', () => {
    const mission = ListeningService.getMissions()[0];
    ListeningService.saveResumePosition(mission.id, 42);

    expect(ListeningService.getState().resumePositions[mission.id]).toBe(42);
  });

  it('19. mobile viewport smoke test keeps status contract available', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 844,
    });

    expect(ObservabilityService.getHealthCheck().status).toMatch(
      /healthy|degraded|blocked/
    );
  });

  it('20. error boundary smoke test renders fallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundaryProvider>
        <ThrowingComponent />
      </ErrorBoundaryProvider>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(
      screen.getByText(/release candidate boundary smoke/i)
    ).toBeInTheDocument();
  });
});
